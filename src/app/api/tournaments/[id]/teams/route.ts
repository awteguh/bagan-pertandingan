import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const teamSchema = z.object({
  name: z.string().min(1).max(80),
  logoUrl: z.string().optional().nullable(),
  seeding: z.number().int().optional().nullable(),
});

const bulkSchema = z.object({
  teams: z.array(teamSchema),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const teams = await prisma.team.findMany({
    where: { tournamentId: id },
    orderBy: { seeding: "asc" },
  });
  return NextResponse.json(teams);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const body = await request.json();

    // Support both single and bulk create
    if (Array.isArray(body)) {
      const { teams } = bulkSchema.parse({ teams: body });
      const created = await prisma.$transaction(
        teams.map((t, i) =>
          prisma.team.create({
            data: { ...t, tournamentId: id, seeding: t.seeding ?? i + 1 },
          })
        )
      );
      return NextResponse.json(created, { status: 201 });
    } else {
      const data = teamSchema.parse(body);
      const count = await prisma.team.count({ where: { tournamentId: id } });
      const team = await prisma.team.create({
        data: { ...data, tournamentId: id, seeding: data.seeding ?? count + 1 },
      });
      return NextResponse.json(team, { status: 201 });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Gagal menambah tim" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  // Delete all teams for this tournament
  await prisma.team.deleteMany({ where: { tournamentId: id } });
  return NextResponse.json({ message: "Semua tim dihapus" });
}
