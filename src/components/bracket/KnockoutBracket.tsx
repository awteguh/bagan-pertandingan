"use client";

import type { BracketMatchData } from "@/types";
import BracketMatch from "./BracketMatch";

interface Props {
  matches: BracketMatchData[];
  primaryColor?: string;
  isAdmin?: boolean;
  onScoreUpdate?: (matchId: string, team1Score: number, team2Score: number) => void;
}

export default function KnockoutBracket({
  matches,
  primaryColor = "#dc2626",
  isAdmin = false,
  onScoreUpdate,
}: Props) {
  // Group matches by round (descending = earliest rounds first, Final last)
  const rounds = [...new Set(matches.map((m) => m.round))].sort((a, b) => b - a);

  if (rounds.length === 0) return null;

  // Determine champion from the Final (round === 1)
  const final = matches.find((m) => m.round === 1);
  const champion =
    final && final.status === "COMPLETED"
      ? final.winnerId === final.team1?.id
        ? final.team1
        : final.winnerId === final.team2?.id
        ? final.team2
        : null
      : null;

  return (
    <div className="flex items-stretch gap-6 overflow-x-auto pb-6 px-2" style={{ minWidth: "max-content" }}>
      {rounds.map((round, roundIdx) => {
        const roundMatches = matches
          .filter((m) => m.round === round)
          .sort((a, b) => a.position - b.position);

        // vertical gap grows each round so matches align with the midpoint of the previous pair
        const gap = roundIdx === 0 ? 20 : Math.pow(2, roundIdx) * 48 + (Math.pow(2, roundIdx) - 1) * 10;

        return (
          <div key={round} className="flex flex-col items-center">
            {/* Round header */}
            <div
              className="text-center text-[11px] font-black uppercase tracking-[0.15em] py-2 px-5 mb-5 w-[180px] rounded-full text-white shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, rgba(0,0,0,0.25) 180%)`,
                boxShadow: `0 4px 14px ${primaryColor}66`,
              }}
            >
              {roundMatches[0]?.roundName ?? `Babak ${round}`}
            </div>

            {/* Matches column */}
            <div className="flex flex-col justify-around flex-1" style={{ gap: `${gap}px` }}>
              {roundMatches.map((match) => (
                <div key={match.id} className="relative flex items-center">
                  <BracketMatch
                    match={match}
                    primaryColor={primaryColor}
                    isAdmin={isAdmin}
                    onScoreUpdate={onScoreUpdate}
                  />

                  {/* Connector line out to the right (toward next round) */}
                  {round > 1 && (
                    <div className="absolute left-full top-1/2 bracket-h-line" style={{ width: "24px" }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Champion box */}
      <div className="flex flex-col items-center justify-center pl-2">
        <div className="text-center text-[11px] font-black uppercase tracking-[0.15em] py-2 px-5 mb-5 w-[160px] rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-amber-950 shadow-lg">
          Juara
        </div>
        <div className="champion-box">
          <div className="text-3xl mb-1">👑</div>
          {champion ? (
            <div className="text-white font-black text-base leading-tight drop-shadow">
              {champion.name}
            </div>
          ) : (
            <div className="text-amber-100/70 font-semibold text-sm italic">Belum ada</div>
          )}
          <div className="text-amber-100 text-[10px] font-bold uppercase tracking-widest mt-1">
            🏆 Champion
          </div>
        </div>
      </div>
    </div>
  );
}
