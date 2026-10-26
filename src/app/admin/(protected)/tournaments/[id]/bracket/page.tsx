import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getThemeConfig } from "@/config/themes";
import AdminBracketView from "@/components/admin/AdminBracketView";

export default async function AdminBracketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: {
      knockoutMatches: {
        orderBy: [{ round: "desc" }, { position: "asc" }],
        include: { team1: true, team2: true, winner: true },
      },
    },
  });

  if (!tournament) notFound();

  const theme = getThemeConfig(tournament.theme);

  return (
    <div>
      <div className="p-6 pb-0">
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
          <Link href="/admin/tournaments" className="hover:text-blue-600">Turnamen</Link>
          <span>/</span>
          <Link href={`/admin/tournaments/${id}`} className="hover:text-blue-600">{tournament.name}</Link>
          <span>/</span>
          <span>Bracket</span>
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-1">Bagan Knockout</h1>
        <p className="text-slate-500 text-sm mb-6">
          Klik tombol ✏️ pada setiap pertandingan untuk input skor. Winner otomatis maju ke babak berikutnya.
        </p>
      </div>

      <div className="px-6 pb-6 overflow-x-auto">
        {tournament.knockoutMatches.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <div className="text-4xl mb-3">🏆</div>
            <p>Bracket belum di-generate</p>
            <Link
              href={`/admin/tournaments/${id}`}
              className="text-blue-600 hover:underline text-sm mt-2 inline-block"
            >
              Generate bracket dari halaman detail →
            </Link>
          </div>
        ) : (
          <AdminBracketView
            tournamentId={id}
            matches={tournament.knockoutMatches.map((m) => ({
              id: m.id,
              round: m.round,
              roundName: m.roundName,
              position: m.position,
              team1: m.team1 ? { id: m.team1.id, name: m.team1.name } : null,
              team2: m.team2 ? { id: m.team2.id, name: m.team2.name } : null,
              team1Score: m.team1Score,
              team2Score: m.team2Score,
              winnerId: m.winnerId,
              isBye: m.isBye,
              status: m.status as "PENDING" | "SCHEDULED" | "COMPLETED" | "CANCELLED",
              scheduledAt: m.scheduledAt?.toISOString() ?? null,
              venue: m.venue,
            }))}
            primaryColor={theme.colors.primary}
          />
        )}
      </div>
    </div>
  );
}
