"use client";

import { useState } from "react";
import type { BracketMatchData } from "@/types";

interface Props {
  match: BracketMatchData;
  primaryColor?: string;
  isAdmin?: boolean;
  onScoreUpdate?: (matchId: string, team1Score: number, team2Score: number) => void;
}

export default function BracketMatch({ match, primaryColor = "#dc2626", isAdmin, onScoreUpdate }: Props) {
  const [editing, setEditing] = useState(false);
  const [s1, setS1] = useState(match.team1Score?.toString() ?? "");
  const [s2, setS2] = useState(match.team2Score?.toString() ?? "");

  const isCompleted = match.status === "COMPLETED";
  const isPending = match.status === "PENDING";
  const team1Wins = isCompleted && match.winnerId === match.team1?.id;
  const team2Wins = isCompleted && match.winnerId === match.team2?.id;

  const handleSave = () => {
    if (onScoreUpdate && s1 !== "" && s2 !== "") {
      onScoreUpdate(match.id, parseInt(s1), parseInt(s2));
      setEditing(false);
    }
  };

  if (match.isBye && match.round > 1) {
    return (
      <div className="match-box" style={{ opacity: 0.85 }}>
        <div className="match-box-team winner">
          <span className="text-sm font-semibold text-slate-700 truncate">
            {match.team1?.name ?? match.team2?.name ?? "BYE"}
          </span>
          <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">
            BYE
          </span>
        </div>
      </div>
    );
  }

  const renderTeam = (
    team: { id: string; name: string } | null | undefined,
    score: number | null | undefined,
    wins: boolean,
    which: 1 | 2
  ) => (
    <div className={`match-box-team ${wins ? "winner" : ""}`}>
      <div className="flex items-center gap-1.5 min-w-0">
        {wins && <span className="text-amber-500 text-xs shrink-0">★</span>}
        <span
          className={`text-sm truncate ${
            wins
              ? "font-bold text-amber-900"
              : team
              ? "font-medium text-slate-800"
              : "text-slate-300 italic"
          }`}
        >
          {team?.name ?? "TBD"}
        </span>
      </div>

      {isAdmin && editing ? (
        <input
          type="number"
          min="0"
          value={which === 1 ? s1 : s2}
          onChange={(e) => (which === 1 ? setS1(e.target.value) : setS2(e.target.value))}
          className="w-9 text-center text-sm border border-slate-300 rounded px-0.5 py-0.5 shrink-0"
        />
      ) : (
        <span
          className={`text-sm font-bold min-w-[22px] text-center shrink-0 ${
            wins ? "text-amber-700" : "text-slate-500"
          }`}
        >
          {isCompleted ? (which === 1 ? match.team1Score : match.team2Score) ?? "-" : ""}
        </span>
      )}
    </div>
  );

  return (
    <div className="match-box" style={{ opacity: isPending ? 0.5 : 1 }}>
      {renderTeam(match.team1, match.team1Score, team1Wins, 1)}
      {renderTeam(match.team2, match.team2Score, team2Wins, 2)}

      {isAdmin && match.team1 && match.team2 && !isPending && (
        <div className="px-2 py-1.5 bg-slate-50 border-t border-slate-100 flex justify-end gap-1">
          {editing ? (
            <>
              <button
                onClick={handleSave}
                className="text-xs px-2 py-0.5 rounded text-white font-medium"
                style={{ backgroundColor: primaryColor }}
              >
                Simpan
              </button>
              <button
                onClick={() => setEditing(false)}
                className="text-xs px-2 py-0.5 rounded text-slate-500 hover:bg-slate-200"
              >
                Batal
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="text-xs text-slate-400 hover:text-slate-700 px-2 py-0.5 rounded hover:bg-slate-100"
            >
              ✏️ Skor
            </button>
          )}
        </div>
      )}
    </div>
  );
}
