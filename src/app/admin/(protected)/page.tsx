import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const [totalTournaments, activeTournaments, completedTournaments, totalTeams] =
    await Promise.all([
      prisma.tournament.count(),
      prisma.tournament.count({ where: { status: { in: ["GROUP_STAGE", "KNOCKOUT"] } } }),
      prisma.tournament.count({ where: { status: "COMPLETED" } }),
      prisma.team.count(),
    ]);

  const recentTournaments = await prisma.tournament.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { _count: { select: { teams: true } } },
  });

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Selamat datang di Admin Panel Bagan Pertandingan</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Turnamen", value: totalTournaments, icon: "🏆", color: "blue" },
          { label: "Sedang Berjalan", value: activeTournaments, icon: "▶️", color: "green" },
          { label: "Selesai", value: completedTournaments, icon: "✅", color: "slate" },
          { label: "Total Tim", value: totalTeams, icon: "👥", color: "purple" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{stat.icon}</span>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <Link
          href="/admin/tournaments/new"
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-5 flex items-center gap-4 transition-colors"
        >
          <span className="text-3xl">➕</span>
          <div>
            <p className="font-semibold">Buat Turnamen Baru</p>
            <p className="text-sm text-blue-200">Setup turnamen, tim, dan jadwal</p>
          </div>
        </Link>
        <Link
          href="/admin/tournaments"
          className="bg-white hover:bg-slate-50 border border-slate-200 rounded-xl p-5 flex items-center gap-4 transition-colors"
        >
          <span className="text-3xl">📋</span>
          <div>
            <p className="font-semibold text-slate-900">Lihat Semua Turnamen</p>
            <p className="text-sm text-slate-500">Kelola turnamen yang ada</p>
          </div>
        </Link>
      </div>

      {/* Recent tournaments */}
      {recentTournaments.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Turnamen Terbaru</h2>
          </div>
          <div className="divide-y divide-slate-50">
            {recentTournaments.map((t) => (
              <div key={t.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 text-sm">{t.name}</p>
                  <p className="text-xs text-slate-400">{t._count.teams} tim · {t.sport}</p>
                </div>
                <Link
                  href={`/admin/tournaments/${t.id}`}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Kelola →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
