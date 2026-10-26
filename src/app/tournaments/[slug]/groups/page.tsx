import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { computeStandings } from "@/lib/bracket-engine/standings";
import { getThemeConfig } from "@/config/themes";
import { formatDateTime } from "@/lib/utils";
import PrintButton from "@/components/print/PrintButton";

export const revalidate = 0;

export default async function GroupsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const tournament = await prisma.tournament.findUnique({
    where: { slug },
    include: {
      groups: {
        orderBy: { order: "asc" },
        include: {
          groupTeams: { include: { team: true }, orderBy: { order: "asc" } },
          matches: {
            include: { homeTeam: true, awayTeam: true },
            orderBy: [{ matchDay: "asc" }, { createdAt: "asc" }],
          },
        },
      },
    },
  });

  if (!tournament || tournament.status === "DRAFT") notFound();

  const theme = getThemeConfig(tournament.theme);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm no-print">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link href="/" className="hover:text-blue-600">← Turnamen</Link>
            <span>/</span>
            <Link href={`/tournaments/${slug}`} className="hover:text-blue-600">
              {tournament.name}
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-medium">Fase Grup</span>
          </div>
          <PrintButton />
        </div>
      </header>

      {/* Tournament title strip */}
      <div
        className="py-6 px-4 text-white no-print"
        style={{ background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.accent} 170%)` }}
      >
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <span className="text-3xl">{theme.emoji}</span>
          <div>
            <p className="text-xs uppercase tracking-widest text-white/70 font-bold">Fase Grup</p>
            <h1 className="text-xl font-black">{tournament.name}</h1>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 no-print">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="flex gap-1">
            {[
              { href: `/tournaments/${slug}`, label: "Overview" },
              { href: `/tournaments/${slug}/groups`, label: "Fase Grup", active: true },
              { href: `/tournaments/${slug}/bracket`, label: "Bagan Knockout" },
            ].map((tab) => (
              <Link key={tab.href} href={tab.href}
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
        {tournament.groups.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <div className="text-4xl mb-3">📋</div>
            <p>Fase grup belum di-generate</p>
          </div>
        ) : (
          <div className="space-y-10">
            {tournament.groups.map((group) => {
              const teams = group.groupTeams.map((gt) => ({
                id: gt.team.id,
                name: gt.team.name,
              }));
              const matches = group.matches.map((m) => ({
                homeTeamId: m.homeTeamId,
                awayTeamId: m.awayTeamId,
                homeScore: m.homeScore,
                awayScore: m.awayScore,
                status: m.status,
              }));
              const standings = computeStandings(teams, matches);

              return (
                <div key={group.id}>
                  <div className="flex items-center gap-2 mb-4">
                    <span
                      className="inline-flex items-center justify-center h-8 px-4 rounded-full text-white font-black text-sm shadow"
                      style={{ background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.accent} 170%)` }}
                    >
                      {group.name}
                    </span>
                  </div>

                  {/* Standings table */}
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-4">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-100 bg-slate-50">
                            <th className="text-left px-4 py-3 text-slate-500 font-medium w-8">#</th>
                            <th className="text-left px-4 py-3 text-slate-500 font-medium">Tim</th>
                            <th className="text-center px-3 py-3 text-slate-500 font-medium">M</th>
                            <th className="text-center px-3 py-3 text-slate-500 font-medium">M</th>
                            <th className="text-center px-3 py-3 text-slate-500 font-medium">S</th>
                            <th className="text-center px-3 py-3 text-slate-500 font-medium">K</th>
                            <th className="text-center px-3 py-3 text-slate-500 font-medium">GM</th>
                            <th className="text-center px-3 py-3 text-slate-500 font-medium">GK</th>
                            <th className="text-center px-3 py-3 text-slate-500 font-medium">SG</th>
                            <th className="text-center px-3 py-3 text-slate-900 font-bold">Poin</th>
                          </tr>
                        </thead>
                        <tbody>
                          {standings.map((row, idx) => (
                            <tr
                              key={row.teamId}
                              className={`border-b border-slate-50 ${idx < tournament.qualifyPerGroup ? "bg-green-50/40" : ""}`}
                            >
                              <td className="px-4 py-3 text-slate-400 font-medium">{row.position}</td>
                              <td className="px-4 py-3">
                                <span className="font-semibold text-slate-900">{row.teamName}</span>
                                {idx < tournament.qualifyPerGroup && (
                                  <span className="ml-2 text-xs text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">
                                    Lolos
                                  </span>
                                )}
                              </td>
                              <td className="px-3 py-3 text-center text-slate-600">{row.played}</td>
                              <td className="px-3 py-3 text-center text-slate-600">{row.won}</td>
                              <td className="px-3 py-3 text-center text-slate-600">{row.drawn}</td>
                              <td className="px-3 py-3 text-center text-slate-600">{row.lost}</td>
                              <td className="px-3 py-3 text-center text-slate-600">{row.goalsFor}</td>
                              <td className="px-3 py-3 text-center text-slate-600">{row.goalsAgainst}</td>
                              <td className="px-3 py-3 text-center text-slate-600">
                                {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                              </td>
                              <td className="px-3 py-3 text-center font-bold text-slate-900">{row.points}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-xs text-slate-400 px-4 py-2">
                      M=Main, M=Menang, S=Seri, K=Kalah, GM=Gol Masuk, GK=Gol Kemasukan, SG=Selisih Gol
                    </p>
                  </div>

                  {/* Fixtures */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Jadwal & Hasil</h3>
                    {group.matches.map((match) => (
                      <div
                        key={match.id}
                        className={`bg-white rounded-lg border px-4 py-3 flex items-center gap-4 ${
                          match.status === "COMPLETED" ? "border-slate-200" : "border-dashed border-slate-200"
                        }`}
                      >
                        {/* Match day badge */}
                        <span className="text-xs text-slate-400 w-16 shrink-0">Pekan {match.matchDay}</span>

                        {/* Home team */}
                        <div className="flex-1 text-right">
                          <span className={`font-medium text-sm ${
                            match.status === "COMPLETED" && match.homeScore! > match.awayScore!
                              ? "text-green-700 font-bold"
                              : "text-slate-800"
                          }`}>
                            {match.homeTeam.name}
                          </span>
                        </div>

                        {/* Score */}
                        <div className="w-20 text-center">
                          {match.status === "COMPLETED" ? (
                            <span className="font-bold text-slate-900 text-lg">
                              {match.homeScore} – {match.awayScore}
                            </span>
                          ) : (
                            <span className="text-slate-300 font-mono text-sm">
                              {match.scheduledAt ? formatDateTime(match.scheduledAt) : "vs"}
                            </span>
                          )}
                        </div>

                        {/* Away team */}
                        <div className="flex-1">
                          <span className={`font-medium text-sm ${
                            match.status === "COMPLETED" && match.awayScore! > match.homeScore!
                              ? "text-green-700 font-bold"
                              : "text-slate-800"
                          }`}>
                            {match.awayTeam.name}
                          </span>
                        </div>

                        {/* Venue */}
                        {match.venue && (
                          <span className="text-xs text-slate-400 shrink-0 hidden sm:block">
                            📍 {match.venue}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
