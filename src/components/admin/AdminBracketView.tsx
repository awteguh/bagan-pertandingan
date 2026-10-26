"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import KnockoutBracket from "@/components/bracket/KnockoutBracket";
import type { BracketMatchData } from "@/types";

interface Props {
  tournamentId: string;
  matches: BracketMatchData[];
  primaryColor: string;
}

export default function AdminBracketView({ tournamentId, matches: initialMatches, primaryColor }: Props) {
  const router = useRouter();
  const [matches, setMatches] = useState(initialMatches);

  const handleScoreUpdate = async (matchId: string, team1Score: number, team2Score: number) => {
    const res = await fetch(`/api/tournaments/${tournamentId}/knockout/${matchId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ team1Score, team2Score }),
    });

    if (!res.ok) {
      alert("Gagal menyimpan skor");
      return;
    }

    const updated = await res.json();

    // Update local state
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id === matchId) {
          return {
            ...m,
            team1Score: updated.team1Score,
            team2Score: updated.team2Score,
            winnerId: updated.winnerId,
            status: updated.status,
          };
        }
        // Update next match if winner advanced
        if (m.id === updated.nextMatchId) {
          if (updated.nextMatchPos === 1) {
            return { ...m, team1: updated.winner };
          } else {
            return { ...m, team2: updated.winner };
          }
        }
        return m;
      })
    );

    router.refresh();
  };

  return (
    <KnockoutBracket
      matches={matches}
      primaryColor={primaryColor}
      isAdmin
      onScoreUpdate={handleScoreUpdate}
    />
  );
}
