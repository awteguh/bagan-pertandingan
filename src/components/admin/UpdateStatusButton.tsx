"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  tournamentId: string;
  currentStatus: string;
}

export default function UpdateStatusButton({ tournamentId, currentStatus }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const nextStatus: Record<string, string> = {
    DRAFT: "GROUP_STAGE",
    GROUP_STAGE: "KNOCKOUT",
    KNOCKOUT: "COMPLETED",
  };

  const next = nextStatus[currentStatus];
  if (!next) return null;

  const labels: Record<string, string> = {
    GROUP_STAGE: "Mulai Fase Grup",
    KNOCKOUT: "Mulai Knockout",
    COMPLETED: "Selesaikan Turnamen",
  };

  const handleUpdate = async () => {
    if (!confirm(`Ubah status ke "${labels[next]}"?`)) return;
    setLoading(true);
    try {
      await fetch(`/api/tournaments/${tournamentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleUpdate}
      disabled={loading}
      className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
    >
      {loading ? "..." : labels[next]}
    </button>
  );
}
