"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Team {
  id: string;
  name: string;
  seeding: number | null;
}

interface Props {
  tournamentId: string;
  initialTeams: Team[];
  isLocked?: boolean;
}

export default function TeamManager({ tournamentId, initialTeams, isLocked }: Props) {
  const router = useRouter();
  const [teams, setTeams] = useState(initialTeams);
  const [newName, setNewName] = useState("");
  const [bulkNames, setBulkNames] = useState("");
  const [showBulk, setShowBulk] = useState(false);
  const [loading, setLoading] = useState(false);

  const addTeam = async () => {
    if (!newName.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (res.ok) {
        const team = await res.json();
        setTeams((prev) => [...prev, team]);
        setNewName("");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  const addBulkTeams = async () => {
    const names = bulkNames.split("\n").map((n) => n.trim()).filter(Boolean);
    if (names.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(names.map((name) => ({ name }))),
      });
      if (res.ok) {
        const newTeams = await res.json();
        setTeams((prev) => [...prev, ...newTeams]);
        setBulkNames("");
        setShowBulk(false);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteTeam = async (teamId: string, teamName: string) => {
    if (!confirm(`Hapus tim "${teamName}"?`)) return;
    const res = await fetch(`/api/tournaments/${tournamentId}/teams/${teamId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setTeams((prev) => prev.filter((t) => t.id !== teamId));
      router.refresh();
    }
  };

  const deleteAll = async () => {
    if (!confirm(`Hapus semua ${teams.length} tim?`)) return;
    const res = await fetch(`/api/tournaments/${tournamentId}/teams`, {
      method: "DELETE",
    });
    if (res.ok) {
      setTeams([]);
      router.refresh();
    }
  };

  return (
    <div className="space-y-4">
      {/* Current teams */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">
            Daftar Tim ({teams.length})
          </h2>
          {teams.length > 0 && !isLocked && (
            <button onClick={deleteAll} className="text-xs text-red-400 hover:text-red-600">
              Hapus Semua
            </button>
          )}
        </div>

        {teams.length === 0 ? (
          <div className="px-5 py-8 text-center text-slate-400 text-sm">
            Belum ada tim. Tambahkan tim di bawah.
          </div>
        ) : (
          <ul className="divide-y divide-slate-50">
            {teams.map((team, idx) => (
              <li key={team.id} className="px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-slate-300 text-sm w-6">{idx + 1}</span>
                  <span className="text-slate-900 font-medium">{team.name}</span>
                </div>
                {!isLocked && (
                  <button
                    onClick={() => deleteTeam(team.id, team.name)}
                    className="text-slate-300 hover:text-red-500 transition-colors text-xs"
                  >
                    ✕
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add form */}
      {!isLocked && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Tambah Tim</h2>

          {!showBulk ? (
            <div>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTeam()}
                  placeholder="Nama tim..."
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={addTeam}
                  disabled={loading || !newName.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
                >
                  + Tambah
                </button>
              </div>
              <button
                onClick={() => setShowBulk(true)}
                className="text-sm text-slate-400 hover:text-blue-600 transition-colors"
              >
                Atau tambah banyak sekaligus →
              </button>
            </div>
          ) : (
            <div>
              <textarea
                value={bulkNames}
                onChange={(e) => setBulkNames(e.target.value)}
                placeholder={"Satu nama tim per baris:\nTim Garuda\nTim Macan\nTim Harimau"}
                rows={6}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-3 font-mono"
              />
              <div className="flex gap-2">
                <button
                  onClick={addBulkTeams}
                  disabled={loading || !bulkNames.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
                >
                  {loading ? "Menambah..." : `+ Tambah ${bulkNames.split("\n").filter((n) => n.trim()).length} Tim`}
                </button>
                <button
                  onClick={() => setShowBulk(false)}
                  className="text-sm text-slate-500 hover:text-slate-700 px-3 py-2"
                >
                  Batal
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {isLocked && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
          ⚠️ Tim tidak bisa diubah setelah fase grup di-generate.
        </div>
      )}
    </div>
  );
}
