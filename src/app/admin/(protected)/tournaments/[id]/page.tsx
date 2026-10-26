import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getStatusLabel, getStatusColor, formatDate } from "@/lib/utils";
import { getSportLabel } from "@/config/sports";
import { getThemeConfig } from "@/config/themes";
import GenerateGroupsButton from "@/components/admin/GenerateGroupsButton";
import GenerateBracketButton from "@/components/admin/GenerateBracketButton";
import UpdateStatusButton from "@/components/admin/UpdateStatusButton";

export default async function AdminTournamentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: {
      _count: {
        select: { teams: true, groups: true, knockoutMatches: true },
      },
      teams: { orderBy: { seeding: "asc" } },
    },
  });

  if (!tournament) notFound();

  const theme = getThemeConfig(tournament.theme);
  const canGenerateGroups = tournament._count.teams >= 2 && tournament.status === "DRAFT";
  const canGenerateBracket = tournament.status === "GROUP_STAGE";

  const tabs = [
    { href: `/admin/tournaments/${id}`, label: "Overview" },
    { href: `/admin/tournaments/${id}/teams`, label: `Tim (${tournament._count.teams})` },
    { href: `/admin/tournaments/${id}/groups`, label: "Grup" },
    { href: `/admin/tournaments/${id}/scores`, label: "Input Skor" },
    { href: `/admin/tournaments/${id}/bracket`, label: "Bracket" },
  ];

  return (
    <div>
      {/* Page header */}
      <div className="p-6 pb-0">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
              <Link href="/admin/tournaments" className="hover:text-blue-600">Turnamen</Link>
              <span>/</span>
              <span>{tournament.name}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <span>{theme.emoji}</span>
              {tournament.name}
            </h1>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs ${getStatusColor(tournament.status)}`}>
                {getStatusLabel(tournament.status)}
              </span>
              <span className="inline-flex px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600">
                {getSportLabel(tournament.sport)}
              </span>
              <span className="inline-flex px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600">
                {theme.label}
              </span>
            </div>
          </div>

          {tournament.status !== "DRAFT" && (
            <Link
              href={`/tournaments/${tournament.slug}`}
              target="_blank"
              className="text-sm text-blue-600 hover:underline shrink-0"
            >
              Lihat Publik ↗
            </Link>
          )}
        </div>

        {/* Tabs */}
        <nav className="flex gap-1 border-b border-slate-200 overflow-x-auto">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 border-b-2 border-transparent hover:border-slate-300 transition-all whitespace-nowrap"
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="p-6 max-w-4xl">
        {/* Info cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Tim", value: tournament._count.teams, icon: "👥" },
            { label: "Grup", value: tournament._count.groups, icon: "📊" },
            {
              label: "Mulai",
              value: tournament.startDate ? formatDate(tournament.startDate) : "-",
              icon: "📅",
            },
            { label: "Lokasi", value: tournament.venue ?? "-", icon: "📍" },
          ].map((card) => (
            <div key={card.label} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-1">
                <span>{card.icon}</span>
                <span className="text-xs text-slate-500">{card.label}</span>
              </div>
              <p className="font-semibold text-slate-900 text-sm truncate">{card.value}</p>
            </div>
          ))}
        </div>

        {/* Actions based on status */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
          <h2 className="font-semibold text-slate-900 mb-4">Aksi Turnamen</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/admin/tournaments/${id}/teams`}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              👥 Kelola Tim
            </Link>

            {canGenerateGroups && (
              <GenerateGroupsButton tournamentId={id} />
            )}

            {tournament.status === "GROUP_STAGE" && (
              <>
                <Link
                  href={`/admin/tournaments/${id}/groups`}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  📊 Kelola Grup
                </Link>
                <Link
                  href={`/admin/tournaments/${id}/scores`}
                  className="bg-orange-50 hover:bg-orange-100 text-orange-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  ⚽ Input Skor Grup
                </Link>
                {canGenerateBracket && (
                  <GenerateBracketButton tournamentId={id} />
                )}
              </>
            )}

            {tournament.status === "KNOCKOUT" && (
              <>
                <Link
                  href={`/admin/tournaments/${id}/bracket`}
                  className="bg-purple-50 hover:bg-purple-100 text-purple-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  🏆 Kelola Bracket
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Team list preview */}
        {tournament.teams.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">
                Tim ({tournament.teams.length})
              </h2>
              <Link
                href={`/admin/tournaments/${id}/teams`}
                className="text-xs text-blue-600 hover:underline"
              >
                Kelola →
              </Link>
            </div>
            <div className="p-4 flex flex-wrap gap-2">
              {tournament.teams.map((team) => (
                <span
                  key={team.id}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700"
                >
                  {team.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
