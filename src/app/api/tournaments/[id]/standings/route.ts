import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeStandings } from "@/lib/bracket-engine/standings";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const groups = await prisma.group.findMany({
      where: { tournamentId: id },
      orderBy: { order: "asc" },
      include: {
        groupTeams: { include: { team: true } },
        matches: {
          include: { homeTeam: true, awayTeam: true },
        },
      },
    });

    const result = groups.map((group) => {
      const teams = group.groupTeams.map((gt) => ({
        id: gt.team.id,
        name: gt.team.name,
      }));

      const matches = group.matches.map((m) => ({
        homeTeamId: m.homeTeamId,
        awayTeamId: m.awayTeamId,
        homeScore: m.homeScore,
        awayScore: m.awayScore,
        status: m.status,
      }));

      return {
        groupId: group.id,
        groupName: group.name,
        standings: computeStandings(teams, matches),
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal mengambil klasemen" }, { status: 500 });
  }
}
