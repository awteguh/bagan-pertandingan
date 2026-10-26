import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  logoUrl: z.string().optional().nullable(),
  seeding: z.number().int().optional().nullable(),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; teamId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { teamId } = await params;
  const body = await request.json();
  const data = updateSchema.parse(body);

  const team = await prisma.team.update({ where: { id: teamId }, data });
  return NextResponse.json(team);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; teamId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { teamId } = await params;
  await prisma.team.delete({ where: { id: teamId } });
  return NextResponse.json({ message: "Tim dihapus" });
}
