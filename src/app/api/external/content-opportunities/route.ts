import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const contentOpportunitySchema = z.object({
  submitterName: z.string().min(1),
  submitterEmail: z.string().email(),
  submitterTeam: z.enum(["sales", "nurse"]),
  patientRef: z.string().optional(),
  consentStatus: z.enum(["pending", "obtained", "declined"]).default("pending"),
  type: z.enum(["testimonial", "before_after", "success_story", "educational"]),
  description: z.string().min(10),
  urgency: z.enum(["urgent", "normal", "low"]).default("normal"),
  attachments: z.array(z.string()).optional(),
  externalSystemRef: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = contentOpportunitySchema.parse(body);

    const opportunity = await prisma.contentOpportunity.create({
      data: {
        ...data,
        attachments: data.attachments ? JSON.stringify(data.attachments) : null,
      },
    });

    // Notify marketing managers
    const managers = await prisma.user.findMany({
      where: { role: "marketing_manager", isActive: true },
      select: { id: true },
    });

    await prisma.userAlert.createMany({
      data: managers.map((m) => ({
        userId: m.id,
        type: "content_opportunity",
        title: "New Content Opportunity",
        message: `${data.type} submission from ${data.submitterTeam} team`,
        link: `/inbox/opportunities/${opportunity.id}`,
      })),
    });

    return NextResponse.json({
      opportunityId: opportunity.id,
      status: "received",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating content opportunity:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
