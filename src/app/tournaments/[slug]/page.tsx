import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate, getStatusLabel, getStatusColor } from "@/lib/utils";
import { getSportLabel } from "@/config/sports";
import { getThemeConfig } from "@/config/themes";

export const revalidate = 0;

export default async function TournamentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const tournament = await prisma.tournament.findUnique({
    where: { slug },
    include: {
      _count: { select: { teams: true, groups: true } },
    },
  });

  if (!tournament || tournament.status === "DRAFT") notFound();

  const theme = getThemeConfig(tournament.theme);

  return (
    <div className={`min-h-screen bg-[rgb(var(--color-background))] ${theme.className}`}
      style={{
        "--color-primary": hexToRgb(theme.colors.primary),
        "--color-background": hexToRgb(theme.colors.background),
        "--color-surface": hexToRgb(theme.colors.surface),
        "--color-border": hexToRgb(theme.colors.border),
        "--color-text": hexToRgb(theme.colors.text),
        "--color-text-muted": hexToRgb(theme.colors.textMuted),
      } as React.CSSProperties}
    >
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm no-print">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-slate-500">
          <Link href="/" className="hover:text-blue-600 transition-colors">← Turnamen</Link>
          <span>/</span>
          <span className="text-slate-800 font-medium truncate">{tournament.name}</span>
        </div>
      </header>

      {/* Hero banner */}
      <div
        className="tournament-hero py-12 px-4 text-white"
        style={{ background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.accent} 180%)` }}
      >
        <div className="relative max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <span className="text-6xl drop-shadow-lg">{theme.emoji}</span>
            <div>
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="text-sm bg-white/20 backdrop-blur-sm rounded-full px-3 py-0.5 font-medium">
                  {getSportLabel(tournament.sport)}
                </span>
                <span className="text-sm bg-white/20 backdrop-blur-sm rounded-full px-3 py-0.5 font-medium">
                  {theme.label}
                </span>
                <span className="text-sm bg-white/20 backdrop-blur-sm rounded-full px-3 py-0.5 font-medium">
                  {getStatusLabel(tournament.status)}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black drop-shadow">{tournament.name}</h1>
              {tournament.organizerName && (
                <p className="text-white/80 mt-1">Penyelenggara: {tournament.organizerName}</p>
              )}
            </div>
          </div>

          {/* Info row */}
          <div className="mt-6 flex flex-wrap gap-6 text-sm text-white/90">
            {tournament.startDate && (
              <div>
                <span className="text-white/60">Mulai:</span>{" "}
                <span className="font-medium">{formatDate(tournament.startDate)}</span>
              </div>
            )}
            {tournament.endDate && (
              <div>
                <span className="text-white/60">Selesai:</span>{" "}
                <span className="font-medium">{formatDate(tournament.endDate)}</span>
              </div>
            )}
            {tournament.venue && (
              <div>
                <span className="text-white/60">Lokasi:</span>{" "}
                <span className="font-medium">{tournament.venue}</span>
              </div>
            )}
            <div>
              <span className="text-white/60">Tim:</span>{" "}
              <span className="font-medium">{tournament._count.teams} tim</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="bg-white border-b border-slate-200 no-print">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="flex gap-1">
            {[
              { href: `/tournaments/${slug}`, label: "Overview", active: true },
              { href: `/tournaments/${slug}/groups`, label: "Fase Grup" },
              { href: `/tournaments/${slug}/bracket`, label: "Bagan Knockout" },
            ].map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                  tab.active
                    ? "text-red-700 border-red-600"
                    : "text-slate-600 hover:text-slate-900 border-transparent hover:border-slate-300"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {tournament.description && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
            <h2 className="font-semibold text-slate-900 mb-2">Tentang Turnamen</h2>
            <p className="text-slate-600 whitespace-pre-line">{tournament.description}</p>
          </div>
        )}

        {/* Quick links */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Link
            href={`/tournaments/${slug}/groups`}
            className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">📊</span>
              <h3 className="font-semibold text-slate-900">Fase Grup</h3>
            </div>
            <p className="text-sm text-slate-500">
              Lihat klasemen, jadwal, dan hasil pertandingan fase grup
            </p>
          </Link>

          <Link
            href={`/tournaments/${slug}/bracket`}
            className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🏆</span>
              <h3 className="font-semibold text-slate-900">Bagan Knockout</h3>
            </div>
            <p className="text-sm text-slate-500">
              Lihat bagan dan hasil pertandingan fase gugur
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "0 0 0";
  return `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}`;
}
