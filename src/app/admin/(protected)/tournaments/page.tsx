import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";
import { getSportLabel } from "@/config/sports";
import { getThemeConfig } from "@/config/themes";
import DeleteTournamentButton from "@/components/admin/DeleteTournamentButton";

export default async function AdminTournamentsPage() {
  const tournaments = await prisma.tournament.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { teams: true, groups: true } } },
  });

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Turnamen</h1>
          <p className="text-slate-500 text-sm mt-1">{tournaments.length} turnamen</p>
        </div>
        <Link
          href="/admin/tournaments/new"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Buat Turnamen
        </Link>
      </div>

      {tournaments.length === 0 ? (
        <div className="text-center py-20 text-slate-400 bg-white rounded-xl border border-slate-200">
          <div className="text-4xl mb-3">🏆</div>
          <p>Belum ada turnamen</p>
          <Link href="/admin/tournaments/new" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
            Buat turnamen pertama →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Turnamen</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium hidden sm:table-cell">Olahraga</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium hidden md:table-cell">Status</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium hidden md:table-cell">Tim</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium hidden lg:table-cell">Dibuat</th>
                <th className="text-right px-4 py-3 text-slate-500 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tournaments.map((t) => {
                const theme = getThemeConfig(t.theme);
                return (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span>{theme.emoji}</span>
                        <div>
                          <p className="font-medium text-slate-900">{t.name}</p>
                          <p className="text-xs text-slate-400 sm:hidden">
                            {getSportLabel(t.sport)} · {t._count.teams} tim
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-slate-600">
                      {getSportLabel(t.sport)}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs ${getStatusColor(t.status)}`}>
                        {getStatusLabel(t.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-slate-600">
                      {t._count.teams}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-slate-400 text-xs">
                      {formatDate(t.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/tournaments/${t.id}`}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Kelola
                        </Link>
                        {t.status !== "DRAFT" && (
                          <Link
                            href={`/tournaments/${t.slug}`}
                            target="_blank"
                            className="text-xs text-slate-400 hover:text-slate-600"
                          >
                            Lihat ↗
                          </Link>
                        )}
                        <DeleteTournamentButton id={t.id} name={t.name} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
