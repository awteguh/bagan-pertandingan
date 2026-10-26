// Round-robin fixture generator
// Uses the "circle" algorithm for scheduling round-robin tournaments

export interface RRFixture {
  homeTeamId: string;
  awayTeamId: string;
  matchDay: number;
}

/**
 * Generate all round-robin fixtures for a list of team IDs.
 * Each pair plays exactly once (single round-robin).
 * Uses the circle method to balance home/away distribution.
 */
export function generateRoundRobinFixtures(teamIds: string[]): RRFixture[] {
  const fixtures: RRFixture[] = [];
  const teams = [...teamIds];

  // Add a "bye" if odd number of teams
  if (teams.length % 2 !== 0) {
    teams.push("BYE");
  }

  const n = teams.length;
  const rounds = n - 1;
  const half = n / 2;

  for (let round = 0; round < rounds; round++) {
    for (let i = 0; i < half; i++) {
      const home = teams[i];
      const away = teams[n - 1 - i];

      // Skip BYE matches
      if (home !== "BYE" && away !== "BYE") {
        // Alternate home/away for balance
        if (round % 2 === 0) {
          fixtures.push({ homeTeamId: home, awayTeamId: away, matchDay: round + 1 });
        } else {
          fixtures.push({ homeTeamId: away, awayTeamId: home, matchDay: round + 1 });
        }
      }
    }

    // Rotate teams (keeping first team fixed)
    const last = teams.splice(n - 1, 1)[0];
    teams.splice(1, 0, last);
  }

  return fixtures;
}
