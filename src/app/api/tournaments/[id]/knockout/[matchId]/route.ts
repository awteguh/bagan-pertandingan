import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  team1Score: z.number().int().min(0).optional().nullable(),
  team2Score: z.number().int().min(0).optional().nullable(),
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

    const match = await prisma.knockoutMatch.findUnique({ where: { id: matchId } });
    if (!match) return NextResponse.json({ error: "Match tidak ditemukan" }, { status: 404 });

    const team1Score = data.team1Score ?? match.team1Score;
    const team2Score = data.team2Score ?? match.team2Score;

    let winnerId = match.winnerId;
    let status: string = match.status;

    // Determine winner if both scores available
    if (team1Score !== null && team2Score !== null && team1Score !== undefined && team2Score !== undefined) {
      if (team1Score > team2Score) {
        winnerId = match.team1Id;
      } else if (team2Score > team1Score) {
        winnerId = match.team2Id;
      }
      // Draw not handled here (can add penalty shootout later)
      status = "COMPLETED";
    }

    const updated = await prisma.knockoutMatch.update({
      where: { id: matchId },
      data: {
        ...data,
        winnerId,
        status,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
      },
      include: { team1: true, team2: true, winner: true },
    });

    // Auto-advance winner to next match
    if (winnerId && match.nextMatchId) {
      const updateData =
        match.nextMatchPos === 1
          ? { team1Id: winnerId }
          : { team2Id: winnerId };

      // Check if next match now has both teams → set to SCHEDULED
      const nextMatch = await prisma.knockoutMatch.findUnique({
        where: { id: match.nextMatchId },
      });

      if (nextMatch) {
        const updatedNextTeam1 = match.nextMatchPos === 1 ? winnerId : nextMatch.team1Id;
        const updatedNextTeam2 = match.nextMatchPos === 2 ? winnerId : nextMatch.team2Id;
        const nextStatus =
          updatedNextTeam1 && updatedNextTeam2 ? "SCHEDULED" : nextMatch.status;

        await prisma.knockoutMatch.update({
          where: { id: match.nextMatchId },
          data: {
            ...updateData,
            status: nextStatus,
          },
        });
      }
    }

    // Check if this is the final → update tournament status
    if (match.round === 1 && status === "COMPLETED") {
      await prisma.tournament.update({
        where: { id: (await params).id },
        data: { status: "COMPLETED" },
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Gagal update skor" }, { status: 500 });
  }
}
