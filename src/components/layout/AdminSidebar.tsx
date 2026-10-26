"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "🏠", exact: true },
  { href: "/admin/tournaments", label: "Turnamen", icon: "🏆" },
  { href: "/", label: "Lihat Website", icon: "🌐", external: true },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      {/* Mobile top bar (hidden on desktop) */}
      <header className="lg:hidden fixed top-0 inset-x-0 h-14 z-30 bg-white border-b border-slate-200 flex items-center gap-3 px-4">
        <button
          onClick={() => setOpen(true)}
          aria-label="Buka menu"
          className="p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100"
        >
          <span className="block text-xl leading-none">☰</span>
        </button>
        <span className="text-lg">🏆</span>
        <p className="text-sm font-bold text-slate-900">Bagan App</p>
      </header>

      {/* Backdrop when drawer is open on mobile */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/40"
          aria-hidden="true"
        />
      )}

      {/* Sidebar / drawer */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-56 bg-white border-r border-slate-200 flex flex-col shrink-0 min-h-screen transform transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏆</span>
            <div>
              <p className="text-sm font-bold text-slate-900">Bagan App</p>
              <p className="text-xs text-slate-400">Admin Panel</p>
            </div>
          </div>
          {/* Close button (mobile only) */}
          <button
            onClick={() => setOpen(false)}
            aria-label="Tutup menu"
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <span className="block text-lg leading-none">✕</span>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            if (item.external) {
              return (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={close}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors"
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                  <span className="ml-auto text-xs text-slate-300">↗</span>
                </a>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sign out */}
        <div className="p-3 border-t border-slate-100">
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <span>🚪</span>
            <span>Keluar</span>
          </button>
        </div>
      </aside>
    </>
  );
}
