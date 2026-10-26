import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { computeStandings } from "@/lib/bracket-engine/standings";

export default async function AdminGroupsPage({
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
          groupTeams: { include: { team: true } },
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
          <span>Grup</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900">Fase Grup</h1>
          <Link
            href={`/admin/tournaments/${id}/scores`}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            ⚽ Input Skor
          </Link>
        </div>
      </div>

      {tournament.groups.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 py-12 text-center text-slate-400">
          <p>Grup belum di-generate</p>
          <Link href={`/admin/tournaments/${id}`} className="text-blue-600 hover:underline text-sm mt-2 inline-block">
            Generate grup dari halaman detail →
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
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
            const completedMatches = group.matches.filter((m) => m.status === "COMPLETED").length;
            const totalMatches = group.matches.length;

            return (
              <div key={group.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="font-bold text-slate-900">{group.name}</h2>
                  <span className="text-xs text-slate-400">
                    {completedMatches}/{totalMatches} pertandingan selesai
                  </span>
                </div>

                {/* Standings */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-50 bg-slate-50">
                        <th className="text-left px-4 py-2 text-slate-400 font-medium">#</th>
                        <th className="text-left px-4 py-2 text-slate-400 font-medium">Tim</th>
                        <th className="text-center px-3 py-2 text-slate-400 font-medium">M</th>
                        <th className="text-center px-3 py-2 text-slate-400 font-medium">W</th>
                        <th className="text-center px-3 py-2 text-slate-400 font-medium">D</th>
                        <th className="text-center px-3 py-2 text-slate-400 font-medium">L</th>
                        <th className="text-center px-3 py-2 text-slate-400 font-medium">SG</th>
                        <th className="text-center px-3 py-2 text-slate-900 font-bold">Poin</th>
                      </tr>
                    </thead>
                    <tbody>
                      {standings.map((row, idx) => (
                        <tr key={row.teamId} className={`border-b border-slate-50 ${idx < tournament.qualifyPerGroup ? "bg-green-50/30" : ""}`}>
                          <td className="px-4 py-2 text-slate-400">{row.position}</td>
                          <td className="px-4 py-2 font-medium text-slate-900">{row.teamName}
                            {idx < tournament.qualifyPerGroup && (
                              <span className="ml-2 text-xs text-green-600">↑ Lolos</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-center text-slate-600">{row.played}</td>
                          <td className="px-3 py-2 text-center text-slate-600">{row.won}</td>
                          <td className="px-3 py-2 text-center text-slate-600">{row.drawn}</td>
                          <td className="px-3 py-2 text-center text-slate-600">{row.lost}</td>
                          <td className="px-3 py-2 text-center text-slate-600">
                            {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                          </td>
                          <td className="px-3 py-2 text-center font-bold text-slate-900">{row.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
