import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(3).max(100),
  sport: z.string().min(1),
  theme: z.string().default("default"),
  teamsPerGroup: z.number().int().min(2).max(8).default(4),
  qualifyPerGroup: z.number().int().min(1).max(4).default(2),
  thirdPlaceMatch: z.boolean().default(false),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  venue: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  organizerName: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const tournaments = await prisma.tournament.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { teams: true } },
      },
    });
    return NextResponse.json(tournaments);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = createSchema.parse(body);

    // Generate unique slug
    let slug = slugify(data.name);
    const existing = await prisma.tournament.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const tournament = await prisma.tournament.create({
      data: {
        ...data,
        slug,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });

    return NextResponse.json(tournament, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Gagal membuat turnamen" }, { status: 500 });
  }
}
