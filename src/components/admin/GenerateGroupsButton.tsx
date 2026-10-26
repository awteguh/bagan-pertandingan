"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  tournamentId: string;
}

export default function GenerateGroupsButton({ tournamentId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!confirm("Generate grup secara acak? Jadwal pertandingan akan dibuat otomatis.")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/groups`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Gagal generate grup");
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleGenerate}
      disabled={loading}
      className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
    >
      {loading ? "Generating..." : "🎲 Generate Grup & Jadwal"}
    </button>
  );
}
