import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.tournament.deleteMany({ where: { slug: "demo-voli" } });

  const t = await prisma.tournament.create({
    data: {
      slug: "demo-voli",
      name: "Liga Pordes Ibu-Ibu 2026",
      sport: "volleyball",
      theme: "agustus",
      status: "KNOCKOUT",
      venue: "Lapangan Bola Voli Karangmangun RT 01/10",
      startDate: new Date("2026-10-11"),
      organizerName: "Karang Taruna Desa",
    },
  });

  const names = ["BLISUK", "QUEEN", "WAHYU CS", "GUCCI", "YAKULT", "REMAKO", "MANDALA SAKTI", "AKBAR NET"];
  const teams = [];
  for (const name of names) {
    teams.push(await prisma.team.create({ data: { name, tournamentId: t.id } }));
  }

  // Final (round 1)
  const final = await prisma.knockoutMatch.create({
    data: { tournamentId: t.id, round: 1, roundName: "Final", position: 0, status: "PENDING" },
  });
  // Semi-finals (round 2) -> final
  const semi1 = await prisma.knockoutMatch.create({
    data: { tournamentId: t.id, round: 2, roundName: "Semi-Final", position: 0, status: "COMPLETED",
      team1Id: teams[0].id, team2Id: teams[1].id, team1Score: 3, team2Score: 1, winnerId: teams[0].id,
      nextMatchId: final.id, nextMatchPos: 1 },
  });
  const semi2 = await prisma.knockoutMatch.create({
    data: { tournamentId: t.id, round: 2, roundName: "Semi-Final", position: 1, status: "COMPLETED",
      team1Id: teams[2].id, team2Id: teams[3].id, team1Score: 2, team2Score: 3, winnerId: teams[3].id,
      nextMatchId: final.id, nextMatchPos: 2 },
  });
  // Final result: team0 vs team3 -> team0 champion
  await prisma.knockoutMatch.update({
    where: { id: final.id },
    data: { team1Id: teams[0].id, team2Id: teams[3].id, team1Score: 3, team2Score: 2, winnerId: teams[0].id, status: "COMPLETED" },
  });
  // Quarter-finals (round 4) -> semis
  const qfData = [
    { pos: 0, a: 0, b: 4, as: 3, bs: 0, w: 0, next: semi1.id, np: 1 },
    { pos: 1, a: 1, b: 5, as: 3, bs: 2, w: 1, next: semi1.id, np: 2 },
    { pos: 2, a: 2, b: 6, as: 3, bs: 1, w: 2, next: semi2.id, np: 1 },
    { pos: 3, a: 3, b: 7, as: 3, bs: 2, w: 3, next: semi2.id, np: 2 },
  ];
  for (const q of qfData) {
    await prisma.knockoutMatch.create({
      data: { tournamentId: t.id, round: 4, roundName: "Perempat Final", position: q.pos, status: "COMPLETED",
        team1Id: teams[q.a].id, team2Id: teams[q.b].id, team1Score: q.as, team2Score: q.bs, winnerId: teams[q.w].id,
        nextMatchId: q.next, nextMatchPos: q.np },
    });
  }

  console.log("Demo tournament created: /tournaments/demo-voli/bracket");
}

main().finally(() => prisma.$disconnect());
