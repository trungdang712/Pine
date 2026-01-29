import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface Session {
  user: User | null;
}

export const createTRPCContext = async (opts: { headers: Headers }) => {
  const supabase = await createClient();

  // Log cookies for debugging (only cookie names, not values)
  const cookieHeader = opts.headers.get('cookie');
  const cookieNames = cookieHeader
    ? cookieHeader.split(';').map(c => c.trim().split('=')[0]).filter(n => n.startsWith('sb-'))
    : [];
  console.log('[TRPC Context] Supabase cookies present:', cookieNames.length > 0 ? cookieNames : 'none');

  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

  if (authError) {
    console.log('[TRPC Context] Auth error:', authError.message);
  }

  let session: Session = { user: null };

  if (authUser) {
    console.log('[TRPC Context] Auth user found:', authUser.id.substring(0, 8) + '...');
    const profile = await prisma.user.findUnique({
      where: { authId: authUser.id },
      select: { id: true, email: true, name: true, role: true },
    });

    if (profile) {
      console.log('[TRPC Context] Profile found:', profile.email);
      session = { user: profile };
    } else {
      console.log('[TRPC Context] No profile found for authId:', authUser.id.substring(0, 8) + '...');
    }
  } else {
    console.log('[TRPC Context] No auth user - session will be null');
  }

  return {
    supabase,
    prisma,
    session,
    ...opts,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createCallerFactory = t.createCallerFactory;
export const createTRPCRouter = t.router;

const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();
  const result = await next();
  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms`);
  return result;
});

export const publicProcedure = t.procedure.use(timingMiddleware);

const enforceUserIsAuthed = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      session: ctx.session as Session & { user: NonNullable<Session["user"]> },
    },
  });
});

export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(enforceUserIsAuthed);

const enforceUserIsAdmin = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const user = ctx.session.user;

  if (!["super_admin", "admin", "marketing_manager"].includes(user.role)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }

  return next({
    ctx: {
      session: ctx.session as Session & { user: NonNullable<Session["user"]> },
    },
  });
});

export const adminProcedure = t.procedure
  .use(timingMiddleware)
  .use(enforceUserIsAdmin);
