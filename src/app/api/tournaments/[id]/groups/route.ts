import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateRoundRobinFixtures } from "@/lib/bracket-engine/round-robin";

// POST /api/tournaments/[id]/groups
// Generates groups, assigns teams, and creates round-robin fixtures
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: { teams: { orderBy: { seeding: "asc" } } },
    });

    if (!tournament) {
      return NextResponse.json({ error: "Turnamen tidak ditemukan" }, { status: 404 });
    }

    const teams = tournament.teams;
    const { teamsPerGroup } = tournament;
    const groupCount = Math.ceil(teams.length / teamsPerGroup);

    if (teams.length < 2) {
      return NextResponse.json(
        { error: "Minimal 2 tim diperlukan" },
        { status: 400 }
      );
    }

    // Delete existing groups and matches
    await prisma.group.deleteMany({ where: { tournamentId: id } });

    // Shuffle teams for random draw (serpentine seeding)
    const shuffled = [...teams].sort(() => Math.random() - 0.5);

    // Create groups and assign teams (serpentine: A1,B1,C1... B2,A2,C2...)
    const groupNames = ["A", "B", "C", "D", "E", "F", "G", "H"];

    await prisma.$transaction(async (tx) => {
      const groups = await Promise.all(
        Array.from({ length: groupCount }, (_, i) =>
          tx.group.create({
            data: {
              tournamentId: id,
              name: `Grup ${groupNames[i] ?? String.fromCharCode(65 + i)}`,
              order: i,
            },
          })
        )
      );

      // Assign teams to groups (serpentine distribution)
      for (let i = 0; i < shuffled.length; i++) {
        const groupIdx = i % groupCount;
        await tx.groupTeam.create({
          data: {
            groupId: groups[groupIdx].id,
            teamId: shuffled[i].id,
            order: Math.floor(i / groupCount),
          },
        });
      }

      // Generate round-robin fixtures per group
      for (const group of groups) {
        const groupTeams = shuffled.filter(
          (_, i) => i % groupCount === groups.indexOf(group)
        );
        const teamIds = groupTeams.map((t) => t.id);
        const fixtures = generateRoundRobinFixtures(teamIds);

        for (const fixture of fixtures) {
          await tx.groupMatch.create({
            data: {
              groupId: group.id,
              homeTeamId: fixture.homeTeamId,
              awayTeamId: fixture.awayTeamId,
              matchDay: fixture.matchDay,
              status: "SCHEDULED",
            },
          });
        }
      }
    });

    // Update tournament status
    await prisma.tournament.update({
      where: { id },
      data: { status: "GROUP_STAGE" },
    });

    const groups = await prisma.group.findMany({
      where: { tournamentId: id },
      orderBy: { order: "asc" },
      include: {
        groupTeams: { include: { team: true } },
        matches: { include: { homeTeam: true, awayTeam: true } },
      },
    });

    return NextResponse.json(groups, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal generate grup" }, { status: 500 });
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const groups = await prisma.group.findMany({
    where: { tournamentId: id },
    orderBy: { order: "asc" },
    include: {
      groupTeams: { include: { team: true }, orderBy: { order: "asc" } },
      matches: {
        include: { homeTeam: true, awayTeam: true },
        orderBy: [{ matchDay: "asc" }, { createdAt: "asc" }],
      },
    },
  });
  return NextResponse.json(groups);
}
