import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getThemeConfig } from "@/config/themes";
import { getSportLabel } from "@/config/sports";
import { formatDate } from "@/lib/utils";
import KnockoutBracket from "@/components/bracket/KnockoutBracket";
import PrintButton from "@/components/print/PrintButton";

export const revalidate = 0;

export default async function BracketPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const tournament = await prisma.tournament.findUnique({
    where: { slug },
    include: {
      knockoutMatches: {
        orderBy: [{ round: "desc" }, { position: "asc" }],
        include: { team1: true, team2: true, winner: true },
      },
    },
  });

  if (!tournament || tournament.status === "DRAFT") notFound();

  const theme = getThemeConfig(tournament.theme);

  return (
    <div className="bracket-page">
      {/* Top nav bar */}
      <header className="bg-black/30 backdrop-blur-sm border-b border-white/10 no-print">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Link href="/" className="hover:text-white">← Turnamen</Link>
            <span className="text-slate-600">/</span>
            <Link href={`/tournaments/${slug}`} className="hover:text-white">
              {tournament.name}
            </Link>
          </div>
          <PrintButton />
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-black/20 border-b border-white/10 no-print">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="flex gap-1">
            {[
              { href: `/tournaments/${slug}`, label: "Overview" },
              { href: `/tournaments/${slug}/groups`, label: "Fase Grup" },
              { href: `/tournaments/${slug}/bracket`, label: "Bagan Knockout", active: true },
            ].map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                  tab.active
                    ? "text-white border-amber-400"
                    : "text-slate-400 hover:text-white border-transparent hover:border-white/30"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Poster header */}
      <div className="px-4 pt-8 pb-6 text-center">
        <div className="inline-flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-[0.3em] mb-3">
          <span>🏐</span>
          <span>Bagan Pertandingan</span>
          <span>🏐</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-gradient-gold leading-tight px-2">
          {tournament.name.toUpperCase()}
        </h1>
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 mt-4 text-sm text-slate-300">
          <span className="inline-flex items-center gap-1.5">
            <span className="text-amber-400">🏆</span>
            {getSportLabel(tournament.sport)}
          </span>
          {tournament.startDate && (
            <span className="inline-flex items-center gap-1.5">
              <span className="text-amber-400">📅</span>
              {formatDate(tournament.startDate)}
            </span>
          )}
          {tournament.venue && (
            <span className="inline-flex items-center gap-1.5">
              <span className="text-amber-400">📍</span>
              {tournament.venue}
            </span>
          )}
        </div>
        <div className="mx-auto mt-5 h-1 w-32 rounded-full bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
      </div>

      <main className="px-4 pb-12 max-w-full overflow-x-auto">
        {tournament.knockoutMatches.length === 0 ? (
          <div className="text-center py-16 text-slate-400 max-w-6xl mx-auto">
            <div className="text-5xl mb-3">🏆</div>
            <p className="text-slate-300">Bagan knockout belum di-generate</p>
            <p className="text-sm mt-1 text-slate-500">Fase grup harus selesai terlebih dahulu</p>
          </div>
        ) : (
          <div className="max-w-full flex justify-center">
            <KnockoutBracket
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
                scheduledAt: m.scheduledAt?.toISOString(),
                venue: m.venue,
              }))}
              primaryColor={theme.colors.primary}
            />
          </div>
        )}
      </main>
    </div>
  );
}
