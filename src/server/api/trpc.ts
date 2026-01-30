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

  const { data: { user: authUser } } = await supabase.auth.getUser();

  let session: Session = { user: null };

  if (authUser) {
    const profile = await prisma.user.findUnique({
      where: { authId: authUser.id },
      select: { id: true, email: true, name: true, role: true },
    });

    if (profile) {
      session = { user: profile };
    }
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

  if (!["super_admin", "marketing_manager"].includes(user.role)) {
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
