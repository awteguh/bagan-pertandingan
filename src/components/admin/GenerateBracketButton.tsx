"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  tournamentId: string;
}

export default function GenerateBracketButton({ tournamentId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!confirm("Generate bracket knockout dari hasil klasemen grup? Pastikan semua skor fase grup sudah diisi.")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/knockout`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Gagal generate bracket");
        return;
      }
      router.push(`/admin/tournaments/${tournamentId}/bracket`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleGenerate}
      disabled={loading}
      className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
    >
      {loading ? "Generating..." : "🏆 Generate Bracket Knockout"}
    </button>
  );
}
