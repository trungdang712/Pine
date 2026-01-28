import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const teamRatingsSchema = z.object({
  raterTeam: z.enum(["sales", "accounting", "customer_service", "medical"]),
  raterName: z.string().min(1),
  raterEmail: z.string().email(),
  period: z.string().regex(/^\d{4}-\d{2}$/),
  ratings: z.array(
    z.object({
      marketingUserId: z.string(),
      overallScore: z.number().min(1).max(5),
      categoryScores: z
        .object({
          responsiveness: z.number().min(1).max(5).optional(),
          quality: z.number().min(1).max(5).optional(),
          collaboration: z.number().min(1).max(5).optional(),
          communication: z.number().min(1).max(5).optional(),
        })
        .optional(),
      feedback: z.string().optional(),
    })
  ),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = teamRatingsSchema.parse(body);

    const results = await Promise.all(
      data.ratings.map(async (rating) => {
        // Check if user exists
        const user = await prisma.user.findUnique({
          where: { id: rating.marketingUserId },
        });

        if (!user) {
          return { marketingUserId: rating.marketingUserId, status: "user_not_found" };
        }

        // Check if rating already exists for this period
        const existing = await prisma.crossTeamRating.findFirst({
          where: {
            marketingUserId: rating.marketingUserId,
            period: data.period,
            raterTeam: data.raterTeam,
            raterEmail: data.raterEmail,
          },
        });

        if (existing) {
          // Update existing
          await prisma.crossTeamRating.update({
            where: { id: existing.id },
            data: {
              overallScore: rating.overallScore,
              categoryScores: rating.categoryScores
                ? JSON.stringify(rating.categoryScores)
                : null,
              feedback: rating.feedback,
            },
          });
          return { marketingUserId: rating.marketingUserId, status: "updated" };
        }

        // Create new
        await prisma.crossTeamRating.create({
          data: {
            marketingUserId: rating.marketingUserId,
            period: data.period,
            raterTeam: data.raterTeam,
            raterName: data.raterName,
            raterEmail: data.raterEmail,
            overallScore: rating.overallScore,
            categoryScores: rating.categoryScores
              ? JSON.stringify(rating.categoryScores)
              : null,
            feedback: rating.feedback,
          },
        });

        return { marketingUserId: rating.marketingUserId, status: "created" };
      })
    );

    return NextResponse.json({ results });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error processing team ratings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
