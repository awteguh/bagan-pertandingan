import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import TeamManager from "@/components/admin/TeamManager";

export default async function AdminTeamsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: { teams: { orderBy: { seeding: "asc" } } },
  });

  if (!tournament) notFound();

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
          <Link href="/admin/tournaments" className="hover:text-blue-600">Turnamen</Link>
          <span>/</span>
          <Link href={`/admin/tournaments/${id}`} className="hover:text-blue-600">{tournament.name}</Link>
          <span>/</span>
          <span>Tim</span>
        </div>
        <h1 className="text-xl font-bold text-slate-900">Kelola Tim</h1>
        <p className="text-slate-500 text-sm mt-1">
          Tambah, edit, atau hapus tim. Minimal 2 tim diperlukan untuk generate grup.
        </p>
      </div>

      <TeamManager
        tournamentId={id}
        initialTeams={tournament.teams.map((t) => ({
          id: t.id,
          name: t.name,
          seeding: t.seeding,
        }))}
        isLocked={tournament.status !== "DRAFT"}
      />
    </div>
  );
}
