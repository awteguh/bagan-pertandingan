// ─── Shared TypeScript types ────────────────────────────────────────────────

export type TournamentStatus = "DRAFT" | "GROUP_STAGE" | "KNOCKOUT" | "COMPLETED";
export type MatchStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED";
export type KnockoutMatchStatus = "PENDING" | "SCHEDULED" | "COMPLETED" | "CANCELLED";
export type Sport = "volleyball" | "football" | "basketball" | "badminton" | "futsal" | "table_tennis";
export type Theme = "default" | "agustus" | "lebaran" | "olahraga";

export interface StandingRow {
  teamId: string;
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  position: number;
}

export interface BracketMatchData {
  id: string;
  round: number;
  roundName: string;
  position: number;
  team1?: { id: string; name: string } | null;
  team2?: { id: string; name: string } | null;
  team1Score?: number | null;
  team2Score?: number | null;
  winnerId?: string | null;
  isBye: boolean;
  status: KnockoutMatchStatus;
  scheduledAt?: Date | string | null;
  venue?: string | null;
  nextMatchId?: string | null;
  nextMatchPos?: number | null;
}

export interface BracketRoundData {
  round: number;
  roundName: string;
  matches: BracketMatchData[];
}
