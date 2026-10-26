import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  homeScore: z.number().int().min(0).optional().nullable(),
  awayScore: z.number().int().min(0).optional().nullable(),
  status: z.enum(["SCHEDULED", "COMPLETED", "CANCELLED"]).optional(),
  scheduledAt: z.string().optional().nullable(),
  venue: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; matchId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { matchId } = await params;

  try {
    const body = await request.json();
    const data = updateSchema.parse(body);

    // Auto-set status to COMPLETED if both scores are provided
    let status = data.status;
    if (
      data.homeScore !== undefined &&
      data.homeScore !== null &&
      data.awayScore !== undefined &&
      data.awayScore !== null &&
      !status
    ) {
      status = "COMPLETED";
    }

    const match = await prisma.groupMatch.update({
      where: { id: matchId },
      data: {
        ...data,
        status,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
      },
      include: { homeTeam: true, awayTeam: true },
    });

    return NextResponse.json(match);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Gagal update skor" }, { status: 500 });
  }
}
