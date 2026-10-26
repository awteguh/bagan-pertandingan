import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeStandings } from "@/lib/bracket-engine/standings";
import { generateKnockoutStructure } from "@/lib/bracket-engine/knockout";
import type { QualifiedTeam } from "@/lib/bracket-engine/knockout";

// POST: Generate knockout bracket from group standings
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        groups: {
          orderBy: { order: "asc" },
          include: {
            groupTeams: { include: { team: true } },
            matches: true,
          },
        },
      },
    });

    if (!tournament) {
      return NextResponse.json({ error: "Turnamen tidak ditemukan" }, { status: 404 });
    }

    const { qualifyPerGroup } = tournament;

    // Compute standings for each group and collect qualified teams
    const qualifiedTeams: QualifiedTeam[] = [];

    for (const group of tournament.groups) {
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

      const standings = computeStandings(teams, matches);

      // Take top-N qualified teams from this group
      for (let pos = 0; pos < qualifyPerGroup; pos++) {
        if (standings[pos]) {
          qualifiedTeams.push({
            teamId: standings[pos].teamId,
            teamName: standings[pos].teamName,
            groupName: group.name,
            groupPosition: pos + 1,
          });
        }
      }
    }

    if (qualifiedTeams.length < 2) {
      return NextResponse.json(
        { error: "Minimal 2 tim lolos diperlukan" },
        { status: 400 }
      );
    }

    // Generate bracket structure
    const structure = generateKnockoutStructure(qualifiedTeams);

    // Get first round number (highest round value)
    const firstRound = Math.max(...structure.map((m) => m.round));

    // Delete existing knockout matches
    await prisma.knockoutMatch.deleteMany({ where: { tournamentId: id } });

    // Create knockout matches in DB (first round gets teams assigned)
    await prisma.$transaction(async (tx) => {
      // Create all matches
      const createdMatches: { id: string; round: number; position: number }[] = [];

      for (const template of structure.sort((a, b) => b.round - a.round)) {
        const extTemplate = template as typeof template & {
          _team1?: QualifiedTeam | null;
          _team2?: QualifiedTeam | null;
        };

        const match = await tx.knockoutMatch.create({
          data: {
            tournamentId: id,
            round: template.round,
            roundName: template.roundName,
            position: template.position,
            isBye: template.isBye,
            status: template.round === firstRound ? "SCHEDULED" : "PENDING",
            team1Id: extTemplate._team1?.teamId ?? null,
            team2Id: extTemplate._team2?.teamId ?? null,
          },
        });

        // Auto-advance bye matches
        if (template.isBye) {
          const winnerTeamId = extTemplate._team1?.teamId ?? extTemplate._team2?.teamId;
          if (winnerTeamId) {
            await tx.knockoutMatch.update({
              where: { id: match.id },
              data: { winnerId: winnerTeamId, status: "COMPLETED" },
            });
          }
        }

        createdMatches.push({ id: match.id, round: template.round, position: template.position });
      }

      // Link nextMatchId: for each round, each match's winner goes to the next round
      const rounds = [...new Set(createdMatches.map((m) => m.round))].sort((a, b) => a - b);

      for (let ri = 0; ri < rounds.length - 1; ri++) {
        const currentRound = rounds[ri];
        const nextRound = rounds[ri + 1];

        const currentMatches = createdMatches.filter((m) => m.round === currentRound);
        const nextMatches = createdMatches.filter((m) => m.round === nextRound);

        for (let i = 0; i < currentMatches.length; i++) {
          const nextMatchIdx = Math.floor(i / 2);
          const nextMatchPos = (i % 2) + 1;
          const nextMatch = nextMatches[nextMatchIdx];
          if (!nextMatch) continue;

          await tx.knockoutMatch.update({
            where: { id: currentMatches[i].id },
            data: { nextMatchId: nextMatch.id, nextMatchPos },
          });

          // If this is a bye match, advance winner to next match
          const thisMatch = await tx.knockoutMatch.findUnique({ where: { id: currentMatches[i].id } });
          if (thisMatch?.winnerId && nextMatch) {
            const updateData =
              nextMatchPos === 1
                ? { team1Id: thisMatch.winnerId }
                : { team2Id: thisMatch.winnerId };
            await tx.knockoutMatch.update({
              where: { id: nextMatch.id },
              data: { ...updateData, status: "SCHEDULED" },
            });
          }
        }
      }
    });

    // Update tournament status
    await prisma.tournament.update({
      where: { id },
      data: { status: "KNOCKOUT" },
    });

    const matches = await prisma.knockoutMatch.findMany({
      where: { tournamentId: id },
      orderBy: [{ round: "desc" }, { position: "asc" }],
      include: { team1: true, team2: true, winner: true },
    });

    return NextResponse.json(matches, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal generate bracket" }, { status: 500 });
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const matches = await prisma.knockoutMatch.findMany({
    where: { tournamentId: id },
    orderBy: [{ round: "desc" }, { position: "asc" }],
    include: { team1: true, team2: true, winner: true },
  });
  return NextResponse.json(matches);
}
