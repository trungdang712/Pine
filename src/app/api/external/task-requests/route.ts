import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const taskRequestSchema = z.object({
  requesterTeam: z.enum(["sales", "accounting", "customer_service", "medical"]),
  requesterName: z.string().min(1),
  requesterEmail: z.string().email(),
  requestType: z.enum(["design", "content", "video", "other"]),
  title: z.string().min(1),
  description: z.string().min(10),
  urgency: z.enum(["urgent", "normal", "low"]).default("normal"),
  deadline: z.string().datetime().optional(),
  attachments: z.array(z.string()).optional(),
  externalRef: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = taskRequestSchema.parse(body);

    const taskRequest = await prisma.taskRequest.create({
      data: {
        ...data,
        deadline: data.deadline ? new Date(data.deadline) : null,
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
        type: "task_request",
        title: "New Task Request",
        message: `${data.requestType} request from ${data.requesterTeam}: ${data.title}`,
        link: `/inbox/requests/${taskRequest.id}`,
      })),
    });

    return NextResponse.json({
      requestId: taskRequest.id,
      status: "received",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating task request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
