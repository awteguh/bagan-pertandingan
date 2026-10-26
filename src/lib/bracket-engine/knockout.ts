// Knockout bracket generator
// Builds a single-elimination bracket structure

export interface QualifiedTeam {
  teamId: string;
  teamName: string;
  groupName: string;
  groupPosition: number; // 1st, 2nd, etc. in their group
}

export interface KnockoutMatchTemplate {
  round: number;        // 1=Final, 2=Semi, 4=Quarter, 8=R16, etc.
  roundName: string;
  position: number;     // 0-indexed within the round
  team1Seed?: number;   // seeding slot
  team2Seed?: number;
  nextMatchId?: string; // filled after creation
  nextMatchPos?: number; // 1 or 2
  isBye: boolean;
}

/**
 * Round names in Indonesian based on total teams
 */
export function getRoundName(round: number, totalTeams: number): string {
  if (round === 1) return "Final";
  if (round === 2) return "Semi-Final";
  if (round === 4) {
    if (totalTeams <= 8) return "Perempat Final";
    return "Perempat Final";
  }
  if (round === 8) return "Babak 16 Besar";
  if (round === 16) return "Babak 32 Besar";
  return `Babak ${round}`;
}

/**
 * Get the smallest power of 2 that is >= n
 */
export function nextPowerOf2(n: number): number {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

/**
 * Generate knockout bracket structure for N qualified teams.
 * Returns rounds from earliest to latest (R16 → QF → SF → F).
 * Teams are seeded: 1st group A, 1st group B, ..., 2nd group A, ...
 */
export function generateKnockoutStructure(
  qualifiedTeams: QualifiedTeam[]
): KnockoutMatchTemplate[] {
  const n = qualifiedTeams.length;
  if (n < 2) return [];

  const bracketSize = nextPowerOf2(n);

  // Create seeded slots: alternate group positions for cross-group matchups
  // e.g., 4 groups with top 2: seeds = [A1,B1,C1,D1,A2,B2,C2,D2]
  // Seeding: group winners don't meet until final if possible
  const seeds: (QualifiedTeam | null)[] = [...qualifiedTeams];

  // Pad with nulls for byes
  while (seeds.length < bracketSize) {
    seeds.push(null);
  }

  const matches: KnockoutMatchTemplate[] = [];
  // round value = number of matches at that point; first round has
  // bracketSize/2 matches, halving each round down to the final (1).
  const firstRound = bracketSize / 2;

  // Generate all rounds
  let currentRound = firstRound;

  // Track matches by their round and position for nextMatchId linking
  const matchGrid: Record<number, KnockoutMatchTemplate[]> = {};

  while (currentRound >= 1) {
    const matchCount = currentRound; // matches in this round
    const roundMatches: KnockoutMatchTemplate[] = [];

    for (let pos = 0; pos < matchCount; pos++) {
      const isBye =
        currentRound === firstRound &&
        (seeds[pos * 2] === null || seeds[pos * 2 + 1] === null);

      roundMatches.push({
        round: currentRound,
        roundName: getRoundName(currentRound, n),
        position: pos,
        isBye,
        team1Seed: currentRound === firstRound ? pos * 2 : undefined,
        team2Seed: currentRound === firstRound ? pos * 2 + 1 : undefined,
      });
    }

    matchGrid[currentRound] = roundMatches;
    matches.push(...roundMatches);
    currentRound = Math.floor(currentRound / 2);
  }

  // Link next match references
  for (const [roundStr, roundMatches] of Object.entries(matchGrid)) {
    const round = parseInt(roundStr);
    const nextRound = Math.floor(round / 2);
    if (nextRound < 1) continue;

    const nextRoundMatches = matchGrid[nextRound];
    if (!nextRoundMatches) continue;

    for (let i = 0; i < roundMatches.length; i++) {
      const nextMatchPos = Math.floor(i / 2);
      const isTeam1 = i % 2 === 0; // even → team1 slot, odd → team2 slot

      roundMatches[i].nextMatchId = `placeholder_${nextRound}_${nextMatchPos}`;
      roundMatches[i].nextMatchPos = isTeam1 ? 1 : 2;
    }
  }

  // Attach qualified teams to first round based on seeding
  // We return the structure + the seeding; actual team assignment done in API
  return matches.map((m) => {
    if (m.round !== firstRound) return m;
    return {
      ...m,
      _team1: m.team1Seed !== undefined ? seeds[m.team1Seed] : null,
      _team2: m.team2Seed !== undefined ? seeds[m.team2Seed] : null,
    } as KnockoutMatchTemplate & { _team1?: QualifiedTeam | null; _team2?: QualifiedTeam | null };
  });
}

/**
 * Add a third-place match to an existing bracket
 */
export function addThirdPlaceMatch(): KnockoutMatchTemplate {
  return {
    round: 0, // special: 0 = third place
    roundName: "Perebutan Juara 3",
    position: 0,
    isBye: false,
  };
}
