"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navigation = [
  { href: "/", label: "Dashboard", icon: "⌂" },
  { href: "/import", label: "Import", icon: "↓" },
  { href: "/characters", label: "Characters", icon: "◇" },
  { href: "/compare", label: "Compare", icon: "⇄" },
  { href: "/data", label: "Data", icon: "□" },
  { href: "/diagnostics", label: "Diagnostics", icon: "⌁" },
  { href: "/research", label: "Research", icon: "◌" },
];

const isActiveRoute = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname.startsWith(href);

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#18181b]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-white/10 bg-[#0d0d11] px-4 py-6 text-white lg:flex">
        <Link href="/" className="flex items-center gap-3 px-3">
          <span className="grid size-10 place-items-center rounded-xl bg-violet-500 font-black">
            TL
          </span>

          <div>
            <p className="font-bold tracking-tight">Twilight Labs</p>
            <p className="text-xs text-zinc-500">Data over opinions</p>
          </div>
        </Link>

        <nav className="mt-10 flex flex-col gap-1">
          {navigation.map((item) => {
            const active = isActiveRoute(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-white text-black shadow-sm"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="grid size-7 place-items-center text-base">
                  {item.icon}
                </span>

                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-400">
            Early Alpha
          </p>

          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Recommendations remain disabled until the underlying formulas are validated.
          </p>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200 bg-white/85 px-5 backdrop-blur lg:ml-64 lg:px-8">
        <Link href="/" className="font-bold lg:hidden">
          Twilight Labs
        </Link>

        <p className="hidden text-sm text-zinc-500 lg:block">
          Research and theorycrafting platform
        </p>

        <div className="flex items-center gap-3">
          <span className="rounded-full bg-violet-100 px-3 py-1.5 text-xs font-semibold text-violet-700">
            Ragnarok: Twilight Global
          </span>
        </div>
      </header>

      <div className="lg:ml-64">
        <nav className="flex gap-2 overflow-x-auto border-b border-zinc-200 bg-white px-4 py-3 lg:hidden">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${
                isActiveRoute(pathname, item.href)
                  ? "bg-black text-white"
                  : "text-zinc-600"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {children}
      </div>
    </div>
  );
}
