"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SPORTS } from "@/config/sports";
import { THEMES } from "@/config/themes";

export default function NewTournamentPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    sport: "volleyball",
    theme: "default",
    teamsPerGroup: 4,
    qualifyPerGroup: 2,
    thirdPlaceMatch: false,
    startDate: "",
    endDate: "",
    venue: "",
    description: "",
    organizerName: "",
  });

  const set = (field: string, value: unknown) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          startDate: form.startDate || null,
          endDate: form.endDate || null,
          venue: form.venue || null,
          description: form.description || null,
          organizerName: form.organizerName || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal membuat turnamen");
      }

      const tournament = await res.json();
      router.push(`/admin/tournaments/${tournament.id}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Buat Turnamen Baru</h1>
        <div className="flex items-center gap-2 mt-3">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  s <= step ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-400"
                }`}
              >
                {s}
              </div>
              {s < 3 && <div className={`w-8 h-0.5 ${s < step ? "bg-blue-600" : "bg-slate-200"}`} />}
            </div>
          ))}
          <span className="text-xs text-slate-400 ml-2">
            {step === 1 ? "Info Dasar" : step === 2 ? "Olahraga & Tema" : "Konfigurasi Grup"}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        {/* Step 1: Basic info */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-slate-900">Informasi Dasar</h2>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nama Turnamen *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="contoh: Turnamen Voli Agustusan 2025"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Penyelenggara</label>
              <input
                type="text"
                value={form.organizerName}
                onChange={(e) => set("organizerName", e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="contoh: Karang Taruna RT 05"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Mulai</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => set("startDate", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Selesai</label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => set("endDate", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Lokasi / Venue</label>
              <input
                type="text"
                value={form.venue}
                onChange={(e) => set("venue", e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="contoh: Lapangan Voli RW 03"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi (opsional)</label>
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Deskripsi singkat turnamen..."
              />
            </div>
          </div>
        )}

        {/* Step 2: Sport & Theme */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-semibold text-slate-900 mb-3">Cabang Olahraga</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SPORTS.map((sport) => (
                  <button
                    key={sport.value}
                    onClick={() => set("sport", sport.value)}
                    className={`px-3 py-3 rounded-lg border text-sm font-medium transition-all ${
                      form.sport === sport.value
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {sport.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-semibold text-slate-900 mb-3">Tema Tampilan</h2>
              <div className="grid grid-cols-2 gap-3">
                {THEMES.map((theme) => (
                  <button
                    key={theme.value}
                    onClick={() => set("theme", theme.value)}
                    className={`px-4 py-4 rounded-xl border-2 text-left transition-all ${
                      form.theme === theme.value
                        ? "border-blue-500 shadow-md"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{theme.emoji}</span>
                      <span className="font-semibold text-sm text-slate-900">{theme.label}</span>
                    </div>
                    <p className="text-xs text-slate-500">{theme.description}</p>
                    <div
                      className="mt-2 h-2 rounded-full"
                      style={{ backgroundColor: theme.colors.primary }}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Group config */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="font-semibold text-slate-900">Konfigurasi Grup</h2>
            <p className="text-sm text-slate-500">
              Atur berapa tim per grup dan berapa tim yang lolos ke fase knockout.
              Tim dapat ditambahkan setelah turnamen dibuat.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Jumlah Tim per Grup
                </label>
                <select
                  value={form.teamsPerGroup}
                  onChange={(e) => {
                    const v = parseInt(e.target.value);
                    set("teamsPerGroup", v);
                    if (form.qualifyPerGroup >= v) set("qualifyPerGroup", v - 1);
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <option key={n} value={n}>{n} tim</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tim Lolos per Grup
                </label>
                <select
                  value={form.qualifyPerGroup}
                  onChange={(e) => set("qualifyPerGroup", parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from({ length: form.teamsPerGroup - 1 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>Top {n}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="thirdPlace"
                checked={form.thirdPlaceMatch}
                onChange={(e) => set("thirdPlaceMatch", e.target.checked)}
                className="rounded"
              />
              <label htmlFor="thirdPlace" className="text-sm text-slate-700">
                Tambahkan pertandingan perebutan juara 3
              </label>
            </div>

            {/* Summary */}
            <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-600 space-y-1">
              <p className="font-medium text-slate-900">Ringkasan:</p>
              <p>• {form.teamsPerGroup} tim per grup, top {form.qualifyPerGroup} lolos</p>
              <p>• Format: Fase Grup → Knockout (sistem gugur)</p>
              {form.thirdPlaceMatch && <p>• Ada pertandingan perebutan juara 3</p>}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 1}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 disabled:opacity-30"
          >
            ← Kembali
          </button>

          {step < 3 ? (
            <button
              onClick={() => {
                if (step === 1 && !form.name.trim()) {
                  setError("Nama turnamen wajib diisi");
                  return;
                }
                setError("");
                setStep((s) => s + 1);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
            >
              Lanjut →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors disabled:opacity-60"
            >
              {loading ? "Membuat..." : "✅ Buat Turnamen"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
