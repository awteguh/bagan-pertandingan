import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ScoreInputSection from "@/components/admin/ScoreInputSection";

export default async function AdminScoresPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: {
      groups: {
        orderBy: { order: "asc" },
        include: {
          matches: {
            include: { homeTeam: true, awayTeam: true },
            orderBy: [{ matchDay: "asc" }, { createdAt: "asc" }],
          },
        },
      },
    },
  });

  if (!tournament) notFound();

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
          <Link href="/admin/tournaments" className="hover:text-blue-600">Turnamen</Link>
          <span>/</span>
          <Link href={`/admin/tournaments/${id}`} className="hover:text-blue-600">{tournament.name}</Link>
          <span>/</span>
          <span>Input Skor</span>
        </div>
        <h1 className="text-xl font-bold text-slate-900">Input Skor Fase Grup</h1>
        <p className="text-slate-500 text-sm mt-1">
          Masukkan hasil skor pertandingan. Klasemen akan otomatis diperbarui.
        </p>
      </div>

      {tournament.groups.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 py-12 text-center text-slate-400">
          <div className="text-3xl mb-3">📋</div>
          <p>Grup belum di-generate</p>
          <Link href={`/admin/tournaments/${id}`} className="text-blue-600 hover:underline text-sm mt-2 inline-block">
            Kembali ke detail turnamen →
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {tournament.groups.map((group) => (
            <ScoreInputSection
              key={group.id}
              group={{
                id: group.id,
                name: group.name,
                matches: group.matches.map((m) => ({
                  id: m.id,
                  homeTeam: { id: m.homeTeam.id, name: m.homeTeam.name },
                  awayTeam: { id: m.awayTeam.id, name: m.awayTeam.name },
                  homeScore: m.homeScore,
                  awayScore: m.awayScore,
                  status: m.status,
                  matchDay: m.matchDay,
                  scheduledAt: m.scheduledAt?.toISOString() ?? null,
                  venue: m.venue,
                })),
              }}
              tournamentId={id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
