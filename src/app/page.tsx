import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";
import { getSportLabel, SPORTS } from "@/config/sports";
import { getThemeConfig, THEMES } from "@/config/themes";

export const revalidate = 0;

// ─── Mini bracket preview (product screenshot look) ──────────────────────────
function MiniMatch({ a, b, sa, sb, win }: { a: string; b: string; sa?: number; sb?: number; win?: 1 | 2 }) {
  return (
    <div className="mini-match">
      <div className={`mini-row ${win === 1 ? "win" : "text-slate-700"}`}>
        <span className="truncate">{a}</span>
        {sa !== undefined && <span>{sa}</span>}
      </div>
      <div className={`mini-row ${win === 2 ? "win" : "text-slate-700"}`}>
        <span className="truncate">{b}</span>
        {sb !== undefined && <span>{sb}</span>}
      </div>
    </div>
  );
}

const FEATURES = [
  { icon: "🏆", color: "bg-red-50 text-red-600", title: "Grup + Knockout", desc: "Fase grup round-robin otomatis, lalu babak gugur sampai juara." },
  { icon: "🏐", color: "bg-blue-50 text-blue-600", title: "Banyak Olahraga", desc: "Voli, sepak bola, futsal, basket, badminton, tenis meja." },
  { icon: "🎨", color: "bg-amber-50 text-amber-600", title: "Tema Acara", desc: "17 Agustus, Lebaran, Sporty, atau Modern — tinggal pilih." },
  { icon: "🖨️", color: "bg-emerald-50 text-emerald-600", title: "Print & PDF", desc: "Cetak bagan jadi poster atau simpan PDF dari browser." },
];

const STEPS = [
  { n: "1", icon: "📝", title: "Buat Turnamen", desc: "Isi nama acara, pilih cabang olahraga dan tema." },
  { n: "2", icon: "👥", title: "Tambah Tim", desc: "Masukkan daftar tim peserta pertandingan." },
  { n: "3", icon: "⚡", title: "Generate Bagan", desc: "Sistem menyusun grup, jadwal & bagan otomatis." },
  { n: "4", icon: "🏅", title: "Input Skor", desc: "Isi hasil laga — pemenang maju otomatis sampai juara." },
];

const STATS = [
  { value: "6", label: "Cabang Olahraga" },
  { value: "4", label: "Tema Acara" },
  { value: "∞", label: "Jumlah Tim" },
  { value: "100%", label: "Otomatis" },
];

const TESTIMONIALS = [
  { name: "Pak Budi", role: "Panitia 17-an RT 05", text: "Bikin bagan voli kampung jadi gampang banget. Tinggal input tim, langsung jadi poster buat ditempel." },
  { name: "Mbak Sari", role: "Karang Taruna", text: "Skor otomatis update klasemen, pemenang langsung maju ke babak berikutnya. Nggak perlu hitung manual lagi." },
  { name: "Coach Andi", role: "Turnamen Futsal", text: "Tampilan bagannya rapi dan bisa di-print. Peserta jadi gampang lihat jadwal dan lawannya." },
];

const FAQS = [
  { q: "Apakah gratis?", a: "Ya, aplikasi ini bisa dipakai untuk membuat bagan turnamen tanpa biaya." },
  { q: "Berapa jumlah tim maksimal?", a: "Tidak ada batas. Sistem otomatis menangani jumlah tim ganjil dengan sistem bye." },
  { q: "Apakah bisa dicetak?", a: "Bisa. Setiap bagan punya tombol Print / PDF untuk dicetak jadi poster." },
  { q: "Siapa yang bisa mengedit?", a: "Hanya admin yang login yang bisa membuat & mengedit. Pengunjung umum hanya melihat." },
];

export default async function HomePage() {
  const tournaments = await prisma.tournament.findMany({
    where: { status: { not: "DRAFT" } },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { teams: true } } },
  });

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* ─── Promo bar ──────────────────────────────────────── */}
      <div className="bg-red-700 text-white text-xs sm:text-sm text-center py-2 px-4 font-medium">
        🎁 Gratis — buat bagan turnamen tanpa batas.{" "}
        <Link href="/admin" className="underline underline-offset-2 font-bold hover:text-amber-200">
          Mulai sekarang →
        </Link>
      </div>

      {/* ─── Sticky nav ─────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid place-items-center h-9 w-9 rounded-xl bg-red-600 text-white text-lg shadow-sm">🏆</span>
            <span className="font-black tracking-tight text-lg">Bagan<span className="text-red-600">Pro</span></span>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <a href="#fitur" className="hover:text-red-600 transition-colors">Fitur</a>
            <a href="#preview" className="hover:text-red-600 transition-colors">Preview</a>
            <a href="#cara-kerja" className="hover:text-red-600 transition-colors">Cara Kerja</a>
            <a href="#tema" className="hover:text-red-600 transition-colors">Tema</a>
            <a href="#turnamen" className="hover:text-red-600 transition-colors">Turnamen</a>
          </nav>
          <Link href="/admin" className="text-sm font-semibold bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full transition-colors shadow-sm">
            Admin
          </Link>
        </div>
      </header>

      {/* ─── Hero ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-red-50/40">
        <div className="blob bg-red-300" style={{ width: 420, height: 420, top: -120, right: -80 }} />
        <div className="blob bg-amber-200" style={{ width: 360, height: 360, bottom: -140, left: -100 }} />

        <div className="relative max-w-6xl mx-auto px-4 py-16 sm:py-24 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: copy */}
          <div>
            <span className="inline-flex items-center gap-2 bg-white border border-red-100 shadow-sm text-xs font-bold px-3 py-1.5 rounded-full text-slate-600">
              <span className="text-amber-500">★★★★★</span> Dipakai panitia turnamen se-kampung
            </span>
            <h1 className="mt-5 text-4xl sm:text-6xl font-black leading-[1.05]">
              Bagan Turnamen <span className="text-red-600">Profesional</span>, Tanpa Ribet.
            </h1>
            <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
              Atur tim, jadwal, dan skor — sistem otomatis menyusun fase grup sampai babak final,
              lengkap dengan poster siap cetak. Cocok untuk acara 17 Agustus, Lebaran, atau olahraga apa pun.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#turnamen" className="bg-red-600 text-white font-bold px-7 py-3.5 rounded-full shadow-lg shadow-red-600/30 hover:bg-red-700 hover:-translate-y-0.5 transition-all">
                Lihat Turnamen
              </a>
              <Link href="/admin" className="bg-white border border-slate-200 text-slate-700 font-bold px-7 py-3.5 rounded-full hover:border-red-300 hover:text-red-600 transition-all">
                Mulai Buat →
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-10 grid grid-cols-4 gap-3 max-w-md">
              {STATS.map((s) => (
                <div key={s.label}>
                  <div className="text-2xl sm:text-3xl font-black text-red-600">{s.value}</div>
                  <div className="text-[11px] text-slate-500 leading-tight mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: bracket preview "screenshot" */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-tr from-red-600/20 to-amber-400/20 rounded-[2rem] blur-2xl" />
            <div
              className="relative rounded-3xl p-6 shadow-2xl animate-float"
              style={{ background: "linear-gradient(160deg,#0f1724 0%,#1a2744 45%,#0d1520 100%)" }}
            >
              <div className="text-center text-amber-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                🏐 Bagan Final · Liga Kampung
              </div>
              <div className="flex items-center justify-center gap-3">
                {/* Semifinals */}
                <div className="flex flex-col gap-5">
                  <MiniMatch a="GARUDA" b="ELANG" sa={3} sb={1} win={1} />
                  <MiniMatch a="MACAN" b="RAJAWALI" sa={2} sb={3} win={2} />
                </div>
                <div className="bracket-h-line w-5" />
                {/* Final */}
                <div className="flex flex-col">
                  <div className="text-[9px] text-white/50 font-bold text-center mb-1 uppercase">Final</div>
                  <MiniMatch a="GARUDA" b="RAJAWALI" sa={3} sb={2} win={1} />
                </div>
                <div className="bracket-h-line w-5" />
                {/* Champion */}
                <div className="text-center">
                  <div className="text-2xl">👑</div>
                  <div
                    className="mt-1 rounded-lg px-3 py-2 text-white text-xs font-black shadow-lg"
                    style={{ background: "linear-gradient(135deg,#b45309 0%,#d97706 50%,#fbbf24 100%)" }}
                  >
                    GARUDA
                  </div>
                  <div className="text-amber-400 text-[8px] font-bold uppercase tracking-widest mt-1">Juara</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust strip */}
        <div className="relative border-t border-slate-100 bg-white/60 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm font-medium text-slate-500">
            <span>✅ Jadwal otomatis</span>
            <span>✅ Klasemen real-time</span>
            <span>✅ Bye untuk tim ganjil</span>
            <span>✅ Poster siap cetak</span>
          </div>
        </div>
      </section>

      {/* ─── Fitur ──────────────────────────────────────────── */}
      <section id="fitur" className="max-w-6xl mx-auto px-4 py-16 sm:py-24">
        <div className="text-center mb-12">
          <p className="text-red-600 font-bold text-sm uppercase tracking-widest">Fitur</p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-black">Semua yang kamu butuhkan</h2>
          <p className="mt-3 text-slate-500 max-w-xl mx-auto">Dari pengundian grup hingga poster juara, semuanya dalam satu tempat.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border border-slate-200 p-6 hover:border-red-200 hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className={`grid place-items-center h-14 w-14 rounded-2xl text-3xl mb-4 ${f.color}`}>{f.icon}</div>
              <h3 className="font-bold text-lg">{f.title}</h3>
              <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Preview showcase ───────────────────────────────── */}
      <section id="preview" className="bg-slate-900 relative overflow-hidden">
        <div className="blob bg-red-600" style={{ width: 400, height: 400, top: -100, left: -60, opacity: 0.25 }} />
        <div className="relative max-w-6xl mx-auto px-4 py-16 sm:py-24 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-amber-400 font-bold text-sm uppercase tracking-widest">Preview</p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-black text-white leading-tight">
              Hasil bagan yang <span className="text-gradient-gold">bikin pangling</span>
            </h2>
            <p className="mt-4 text-slate-300 leading-relaxed">
              Setiap turnamen tampil bergaya poster stadion — latar gelap elegan, kotak tim yang jelas,
              garis penghubung antar babak, dan kotak JUARA emas dengan mahkota.
            </p>
            <ul className="mt-6 space-y-3 text-slate-200">
              <li className="flex gap-3"><span className="text-amber-400">★</span> Pemenang di-highlight emas otomatis</li>
              <li className="flex gap-3"><span className="text-amber-400">★</span> Header tiap babak berwarna</li>
              <li className="flex gap-3"><span className="text-amber-400">★</span> Siap di-print atau export PDF</li>
            </ul>
            <a href="#turnamen" className="inline-block mt-8 bg-amber-400 text-amber-950 font-bold px-6 py-3 rounded-full hover:bg-amber-300 transition-colors">
              Lihat contoh langsung →
            </a>
          </div>

          {/* Big bracket preview */}
          <div className="rounded-3xl p-6 shadow-2xl" style={{ background: "linear-gradient(160deg,#111827 0%,#1e293b 100%)", boxShadow: "0 25px 60px rgba(0,0,0,0.5)" }}>
            <div className="flex items-center justify-center gap-3">
              <div className="flex flex-col gap-4">
                <MiniMatch a="BLISUK" b="QUEEN" sa={3} sb={0} win={1} />
                <MiniMatch a="GUCCI" b="YAKULT" sa={1} sb={3} win={2} />
                <MiniMatch a="REMAKO" b="MANDALA" sa={3} sb={2} win={1} />
                <MiniMatch a="AKBAR" b="MENGANTI" sa={0} sb={3} win={2} />
              </div>
              <div className="bracket-h-line w-4" />
              <div className="flex flex-col gap-16">
                <MiniMatch a="BLISUK" b="YAKULT" sa={3} sb={1} win={1} />
                <MiniMatch a="REMAKO" b="MENGANTI" sa={2} sb={3} win={2} />
              </div>
              <div className="bracket-h-line w-4" />
              <div className="flex flex-col justify-center">
                <MiniMatch a="BLISUK" b="MENGANTI" sa={3} sb={2} win={1} />
              </div>
              <div className="bracket-h-line w-4" />
              <div className="text-center">
                <div className="text-2xl">👑</div>
                <div className="mt-1 rounded-lg px-3 py-2 text-white text-xs font-black shadow-lg" style={{ background: "linear-gradient(135deg,#b45309,#fbbf24)" }}>
                  BLISUK
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Cara Kerja ─────────────────────────────────────── */}
      <section id="cara-kerja" className="max-w-6xl mx-auto px-4 py-16 sm:py-24">
        <div className="text-center mb-12">
          <p className="text-red-600 font-bold text-sm uppercase tracking-widest">Cara Kerja</p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-black">Empat langkah mudah</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <div key={s.n} className="relative text-center sm:text-left">
              <div className="flex items-center gap-3 justify-center sm:justify-start">
                <div className="relative grid place-items-center h-14 w-14 rounded-2xl bg-red-600 text-white text-2xl shadow-lg shadow-red-600/30 shrink-0">
                  {s.icon}
                  <span className="absolute -top-2 -right-2 grid place-items-center h-6 w-6 rounded-full bg-amber-400 text-amber-950 text-xs font-black">{s.n}</span>
                </div>
              </div>
              <h3 className="mt-4 font-bold text-lg">{s.title}</h3>
              <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Tema ───────────────────────────────────────────── */}
      <section id="tema" className="bg-slate-50 border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24">
          <div className="text-center mb-12">
            <p className="text-red-600 font-bold text-sm uppercase tracking-widest">Tema</p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-black">Sesuaikan dengan acaramu</h2>
            <p className="mt-3 text-slate-500 max-w-xl mx-auto">Pilih salah satu tema — warna otomatis diterapkan ke seluruh halaman turnamen.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {THEMES.map((t) => (
              <div key={t.value} className="rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
                <div className="h-24 grid place-items-center text-4xl" style={{ background: `linear-gradient(135deg, ${t.colors.primary} 0%, ${t.colors.accent} 160%)` }}>
                  {t.emoji}
                </div>
                <div className="p-4">
                  <h3 className="font-bold">{t.label}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{t.description}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Sport chips */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
            <span className="text-sm text-slate-500 font-medium mr-1">Cabang olahraga:</span>
            {SPORTS.map((s) => (
              <span key={s.value} className="text-xs font-semibold bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-full">
                {s.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Turnamen Aktif ─────────────────────────────────── */}
      <section id="turnamen" className="max-w-6xl mx-auto px-4 py-16 sm:py-24">
        <div className="text-center mb-12">
          <p className="text-red-600 font-bold text-sm uppercase tracking-widest">Turnamen</p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-black">Turnamen Aktif</h2>
          <p className="mt-3 text-slate-500">Klik salah satu untuk melihat klasemen dan bagan.</p>
        </div>

        {tournaments.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
            <div className="text-5xl mb-4">🏅</div>
            <p className="text-lg font-bold text-slate-700">Belum ada turnamen</p>
            <p className="text-sm mt-1 text-slate-500">
              Buka <Link href="/admin" className="text-red-600 font-semibold hover:underline">Admin Panel</Link> untuk membuat turnamen pertamamu.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tournaments.map((t) => {
              const theme = getThemeConfig(t.theme);
              return (
                <Link key={t.id} href={`/tournaments/${t.slug}`} className="sport-card group">
                  <div className="relative h-28 flex items-center justify-center overflow-hidden" style={{ background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.accent} 160%)` }}>
                    <span className="text-5xl opacity-90 drop-shadow-lg group-hover:scale-110 transition-transform">{theme.emoji}</span>
                    <span className={`absolute top-2.5 right-2.5 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusColor(t.status)}`}>
                      {getStatusLabel(t.status)}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-black leading-tight mb-3 group-hover:text-red-700 transition-colors">{t.name}</h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">{getSportLabel(t.sport)}</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">{theme.label}</span>
                    </div>
                    <div className="text-xs text-slate-500 space-y-1.5 border-t border-slate-100 pt-3">
                      <div className="flex justify-between"><span>Jumlah Tim</span><span className="font-bold text-slate-700">{t._count.teams} tim</span></div>
                      {t.startDate && <div className="flex justify-between"><span>Mulai</span><span className="font-medium text-slate-700">{formatDate(t.startDate)}</span></div>}
                      {t.venue && <div className="flex justify-between"><span>Lokasi</span><span className="font-medium text-slate-700 truncate max-w-[140px]">{t.venue}</span></div>}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ─── Testimoni ──────────────────────────────────────── */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24">
          <div className="text-center mb-12">
            <p className="text-red-600 font-bold text-sm uppercase tracking-widest">Testimoni</p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-black">Kata mereka</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="text-amber-400 text-sm">★★★★★</div>
                <p className="mt-3 text-slate-600 text-sm leading-relaxed">“{t.text}”</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="grid place-items-center h-10 w-10 rounded-full bg-red-100 text-red-700 font-black">{t.name.charAt(0)}</div>
                  <div>
                    <div className="font-bold text-sm">{t.name}</div>
                    <div className="text-xs text-slate-400">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 py-16 sm:py-24">
        <div className="text-center mb-12">
          <p className="text-red-600 font-bold text-sm uppercase tracking-widest">FAQ</p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-black">Pertanyaan umum</h2>
        </div>
        <div className="space-y-3">
          {FAQS.map((f) => (
            <details key={f.q} className="group rounded-xl border border-slate-200 bg-white px-5 py-4 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between cursor-pointer font-bold text-slate-800">
                {f.q}
                <span className="text-red-600 text-xl transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm text-slate-500 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ─── CTA band ───────────────────────────────────────── */}
      <section className="relative overflow-hidden tournament-hero text-white">
        <div className="relative max-w-4xl mx-auto px-4 py-20 text-center">
          <h2 className="text-3xl sm:text-5xl font-black">Siap bikin turnamenmu sendiri?</h2>
          <p className="mt-4 text-red-50/90 text-lg">Masuk ke panel admin dan susun bagan dalam beberapa menit.</p>
          <Link href="/admin" className="inline-block mt-8 bg-white text-red-700 font-bold px-8 py-4 rounded-full shadow-xl hover:-translate-y-0.5 transition-all">
            Buka Admin Panel →
          </Link>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────── */}
      <footer className="bg-slate-900 text-slate-400">
        <div className="max-w-6xl mx-auto px-4 py-12 grid sm:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <span className="grid place-items-center h-9 w-9 rounded-xl bg-red-600 text-white">🏆</span>
              <span className="font-black text-white text-lg">Bagan<span className="text-red-500">Pro</span></span>
            </div>
            <p className="text-sm leading-relaxed">Generator bagan pertandingan cup sistem. Fase grup & knockout otomatis, siap cetak.</p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-3 text-sm">Navigasi</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#fitur" className="hover:text-white">Fitur</a></li>
              <li><a href="#cara-kerja" className="hover:text-white">Cara Kerja</a></li>
              <li><a href="#tema" className="hover:text-white">Tema</a></li>
              <li><a href="#turnamen" className="hover:text-white">Turnamen</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-3 text-sm">Mulai</h4>
            <Link href="/admin" className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-colors">
              Admin Panel →
            </Link>
          </div>
        </div>
        <div className="border-t border-white/10">
          <p className="max-w-6xl mx-auto px-4 py-5 text-center text-xs">© {new Date().getFullYear()} BaganPro · Generator bagan cup sistem</p>
        </div>
      </footer>

      {/* ─── Floating CTA ───────────────────────────────────── */}
      <Link
        href="/admin"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-3.5 rounded-full shadow-xl shadow-red-600/40 hover:-translate-y-0.5 transition-all"
      >
        <span className="text-lg">⚡</span> Buat Bagan
      </Link>
    </div>
  );
}
