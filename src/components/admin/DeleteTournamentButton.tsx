"use client";

import { useRouter } from "next/navigation";

interface Props {
  id: string;
  name: string;
}

export default function DeleteTournamentButton({ id, name }: Props) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Hapus turnamen "${name}"? Semua data akan hilang.`)) return;

    const res = await fetch(`/api/tournaments/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
    } else {
      alert("Gagal menghapus turnamen");
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="text-xs text-red-400 hover:text-red-600 hover:underline"
    >
      Hapus
    </button>
  );
}
