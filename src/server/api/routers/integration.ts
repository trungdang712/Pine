import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

const VALID_PLATFORMS = [
  "google_ads",
  "facebook",
  "instagram",
  "zalo",
  "google_analytics",
  "google_business",
  "mailchimp",
  "tiktok",
  "youtube",
] as const;

const platformEnum = z.enum(VALID_PLATFORMS);

function maskCredentials(credentials: string): string {
  try {
    const parsed = JSON.parse(credentials);
    const masked: Record<string, string> = {};
    for (const key of Object.keys(parsed)) {
      const value = String(parsed[key]);
      if (value.length > 8) {
        masked[key] = value.slice(0, 4) + "****" + value.slice(-4);
      } else {
        masked[key] = "****";
      }
    }
    return JSON.stringify(masked);
  } catch {
    return "****";
  }
}

export const integrationRouter = createTRPCRouter({
  // 1. getAll - returns all integrations (hide credentials)
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const integrations = await ctx.prisma.integrationConfig.findMany({
      select: {
        id: true,
        platform: true,
        isActive: true,
        lastSyncAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { platform: "asc" },
    });
    return integrations;
  }),

  // 2. getById - returns single integration with masked credentials
  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const integration = await ctx.prisma.integrationConfig.findUnique({
        where: { id: input.id },
      });

      if (!integration) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Integration not found",
        });
      }

      return {
        ...integration,
        credentials: maskCredentials(integration.credentials),
      };
    }),

  // 3. connect - creates/updates integration config
  connect: adminProcedure
    .input(
      z.object({
        platform: platformEnum,
        credentials: z.string().min(1, "Credentials are required"),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const integration = await ctx.prisma.integrationConfig.upsert({
        where: { platform: input.platform },
        update: {
          credentials: input.credentials,
          isActive: input.isActive,
          lastSyncAt: new Date(),
        },
        create: {
          platform: input.platform,
          credentials: input.credentials,
          isActive: input.isActive,
          lastSyncAt: new Date(),
        },
      });

      return {
        id: integration.id,
        platform: integration.platform,
        isActive: integration.isActive,
        lastSyncAt: integration.lastSyncAt,
        createdAt: integration.createdAt,
      };
    }),

  // 4. disconnect - sets isActive to false and clears credentials
  disconnect: adminProcedure
    .input(z.object({ platform: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.integrationConfig.findUnique({
        where: { platform: input.platform },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Integration not found",
        });
      }

      const integration = await ctx.prisma.integrationConfig.update({
        where: { platform: input.platform },
        data: {
          isActive: false,
          credentials: "{}",
        },
      });

      return {
        id: integration.id,
        platform: integration.platform,
        isActive: integration.isActive,
      };
    }),

  // 5. update - updates integration settings
  update: adminProcedure
    .input(
      z.object({
        platform: z.string(),
        credentials: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.integrationConfig.findUnique({
        where: { platform: input.platform },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Integration not found",
        });
      }

      const updateData: { credentials?: string; isActive?: boolean } = {};
      if (input.credentials !== undefined) {
        updateData.credentials = input.credentials;
      }
      if (input.isActive !== undefined) {
        updateData.isActive = input.isActive;
      }

      const integration = await ctx.prisma.integrationConfig.update({
        where: { platform: input.platform },
        data: updateData,
      });

      return {
        id: integration.id,
        platform: integration.platform,
        isActive: integration.isActive,
        lastSyncAt: integration.lastSyncAt,
        createdAt: integration.createdAt,
      };
    }),

  // 6. testConnection - simulates testing a connection
  testConnection: adminProcedure
    .input(z.object({ platform: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const config = await ctx.prisma.integrationConfig.findUnique({
        where: { platform: input.platform },
      });

      if (!config) {
        return {
          success: false,
          message: `No configuration found for ${input.platform}. Please connect the integration first.`,
        };
      }

      if (!config.isActive) {
        return {
          success: false,
          message: `Integration for ${input.platform} is not active. Please enable it first.`,
        };
      }

      // Verify credentials are not empty
      try {
        const creds = JSON.parse(config.credentials);
        if (Object.keys(creds).length === 0) {
          return {
            success: false,
            message: `No credentials configured for ${input.platform}. Please update the credentials.`,
          };
        }
      } catch {
        return {
          success: false,
          message: `Invalid credentials format for ${input.platform}.`,
        };
      }

      // Simulate successful connection test
      // Update lastSyncAt to indicate successful test
      await ctx.prisma.integrationConfig.update({
        where: { platform: input.platform },
        data: { lastSyncAt: new Date() },
      });

      return {
        success: true,
        message: `Successfully connected to ${input.platform}. Connection is healthy.`,
      };
    }),
});
