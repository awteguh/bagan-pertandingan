"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="text-sm text-slate-500 hover:text-blue-600 transition-colors no-print"
    >
      🖨️ Print / PDF
    </button>
  );
}
