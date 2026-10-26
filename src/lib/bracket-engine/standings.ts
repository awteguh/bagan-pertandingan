// Compute group standings from match results

import type { StandingRow } from "@/types";

export interface MatchResult {
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
}

export interface TeamInfo {
  id: string;
  name: string;
}

/**
 * Calculate standings for a group based on completed match results.
 * Sorting: Points → Goal Difference → Goals For → Team Name (alphabetical)
 */
export function computeStandings(
  teams: TeamInfo[],
  matches: MatchResult[]
): StandingRow[] {
  const rows: Record<string, StandingRow> = {};

  // Initialize all teams
  for (const team of teams) {
    rows[team.id] = {
      teamId: team.id,
      teamName: team.name,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      position: 0,
    };
  }

  // Process completed matches
  for (const match of matches) {
    if (
      match.status !== "COMPLETED" ||
      match.homeScore === null ||
      match.awayScore === null
    ) {
      continue;
    }

    const home = rows[match.homeTeamId];
    const away = rows[match.awayTeamId];

    if (!home || !away) continue;

    const hg = match.homeScore;
    const ag = match.awayScore;

    home.played++;
    away.played++;
    home.goalsFor += hg;
    home.goalsAgainst += ag;
    away.goalsFor += ag;
    away.goalsAgainst += hg;

    if (hg > ag) {
      // Home wins
      home.won++;
      home.points += 3;
      away.lost++;
    } else if (hg < ag) {
      // Away wins
      away.won++;
      away.points += 3;
      home.lost++;
    } else {
      // Draw
      home.drawn++;
      home.points++;
      away.drawn++;
      away.points++;
    }

    home.goalDifference = home.goalsFor - home.goalsAgainst;
    away.goalDifference = away.goalsFor - away.goalsAgainst;
  }

  // Sort and assign positions
  const sorted = Object.values(rows).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.teamName.localeCompare(b.teamName);
  });

  return sorted.map((row, idx) => ({ ...row, position: idx + 1 }));
}
