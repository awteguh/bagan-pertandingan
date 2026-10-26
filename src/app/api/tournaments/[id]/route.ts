import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  sport: z.string().optional(),
  theme: z.string().optional(),
  status: z.enum(["DRAFT", "GROUP_STAGE", "KNOCKOUT", "COMPLETED"]).optional(),
  teamsPerGroup: z.number().int().min(2).max(8).optional(),
  qualifyPerGroup: z.number().int().min(1).max(4).optional(),
  thirdPlaceMatch: z.boolean().optional(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  venue: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  organizerName: z.string().optional().nullable(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        teams: { orderBy: { seeding: "asc" } },
        groups: {
          orderBy: { order: "asc" },
          include: {
            groupTeams: { include: { team: true } },
            matches: {
              include: { homeTeam: true, awayTeam: true },
              orderBy: [{ matchDay: "asc" }, { createdAt: "asc" }],
            },
          },
        },
        knockoutMatches: {
          orderBy: [{ round: "desc" }, { position: "asc" }],
          include: { team1: true, team2: true, winner: true },
        },
      },
    });

    if (!tournament) {
      return NextResponse.json({ error: "Turnamen tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(tournament);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const body = await request.json();
    const data = updateSchema.parse(body);

    const tournament = await prisma.tournament.update({
      where: { id },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    });

    return NextResponse.json(tournament);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Gagal update turnamen" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    await prisma.tournament.delete({ where: { id } });
    return NextResponse.json({ message: "Turnamen dihapus" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal hapus turnamen" }, { status: 500 });
  }
}
