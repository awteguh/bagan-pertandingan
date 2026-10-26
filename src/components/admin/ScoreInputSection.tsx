"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Match {
  id: string;
  homeTeam: { id: string; name: string };
  awayTeam: { id: string; name: string };
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  matchDay: number;
  scheduledAt: string | null;
  venue: string | null;
}

interface Group {
  id: string;
  name: string;
  matches: Match[];
}

interface Props {
  group: Group;
  tournamentId: string;
}

export default function ScoreInputSection({ group, tournamentId }: Props) {
  const router = useRouter();
  const [scores, setScores] = useState<Record<string, { h: string; a: string }>>(() => {
    const init: Record<string, { h: string; a: string }> = {};
    for (const m of group.matches) {
      init[m.id] = {
        h: m.homeScore?.toString() ?? "",
        a: m.awayScore?.toString() ?? "",
      };
    }
    return init;
  });
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<Set<string>>(new Set());

  const saveScore = async (matchId: string) => {
    const s = scores[matchId];
    if (s.h === "" || s.a === "") return;
    setSaving(matchId);

    try {
      const res = await fetch(
        `/api/tournaments/${tournamentId}/group-matches/${matchId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            homeScore: parseInt(s.h),
            awayScore: parseInt(s.a),
            status: "COMPLETED",
          }),
        }
      );

      if (res.ok) {
        setSaved((prev) => new Set([...prev, matchId]));
        setTimeout(() => {
          setSaved((prev) => {
            const next = new Set(prev);
            next.delete(matchId);
            return next;
          });
        }, 2000);
        router.refresh();
      }
    } finally {
      setSaving(null);
    }
  };

  // Group matches by matchDay
  const matchDays = [...new Set(group.matches.map((m) => m.matchDay))].sort();

  return (
    <div>
      <h2 className="text-lg font-bold text-slate-900 mb-3">{group.name}</h2>

      <div className="space-y-3">
        {matchDays.map((day) => (
          <div key={day}>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-2">
              Pekan {day}
            </p>
            <div className="space-y-2">
              {group.matches
                .filter((m) => m.matchDay === day)
                .map((match) => {
                  const s = scores[match.id];
                  const isSaving = saving === match.id;
                  const isSaved = saved.has(match.id);
                  const isCompleted = match.status === "COMPLETED";

                  return (
                    <div
                      key={match.id}
                      className={`bg-white rounded-lg border px-4 py-3 flex items-center gap-3 ${
                        isCompleted ? "border-slate-200" : "border-dashed border-slate-300"
                      }`}
                    >
                      {/* Home team */}
                      <span className="flex-1 text-right text-sm font-medium text-slate-800">
                        {match.homeTeam.name}
                      </span>

                      {/* Score inputs */}
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="0"
                          value={s.h}
                          onChange={(e) =>
                            setScores((prev) => ({
                              ...prev,
                              [match.id]: { ...prev[match.id], h: e.target.value },
                            }))
                          }
                          className="w-12 text-center border border-slate-300 rounded-lg px-1 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-slate-400 font-bold">–</span>
                        <input
                          type="number"
                          min="0"
                          value={s.a}
                          onChange={(e) =>
                            setScores((prev) => ({
                              ...prev,
                              [match.id]: { ...prev[match.id], a: e.target.value },
                            }))
                          }
                          className="w-12 text-center border border-slate-300 rounded-lg px-1 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Away team */}
                      <span className="flex-1 text-sm font-medium text-slate-800">
                        {match.awayTeam.name}
                      </span>

                      {/* Save button */}
                      <button
                        onClick={() => saveScore(match.id)}
                        disabled={isSaving || s.h === "" || s.a === ""}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all disabled:opacity-50 min-w-[64px] ${
                          isSaved
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                      >
                        {isSaving ? "..." : isSaved ? "✓ Saved" : "Simpan"}
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
