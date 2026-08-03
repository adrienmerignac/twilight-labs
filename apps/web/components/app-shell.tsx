"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";

type NavigationItem = {
  href: string;
  label: string;
  icon: string;
};

type NavigationGroup = {
  label: string;
  items: NavigationItem[];
};

const navigationGroups: NavigationGroup[] = [
  {
    label: "Workspace",
    items: [
      { href: "/", label: "Dashboard", icon: "⌂" },
      { href: "/import", label: "Import", icon: "↓" },
      { href: "/characters", label: "Characters", icon: "◇" },
      { href: "/players", label: "Players", icon: "◉" },
      { href: "/identity", label: "Game identity", icon: "◎" },
    ],
  },
  {
    label: "Analysis",
    items: [
      { href: "/progress", label: "Progress", icon: "↗" },
      { href: "/compare", label: "Compare", icon: "⇄" },
      { href: "/insights", label: "Insights", icon: "✦" },
      { href: "/quality", label: "Data quality", icon: "✓" },
    ],
  },
  {
    label: "Research",
    items: [
      { href: "/diagnostics", label: "Diagnostics", icon: "⌁" },
      { href: "/research", label: "Research", icon: "◌" },
      { href: "/data", label: "Data", icon: "□" },
    ],
  },
];

const mobileNavigation = navigationGroups.flatMap(
  (group) => group.items,
);

const isActiveRoute = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname.startsWith(href);

function NavigationLink({
  item,
  pathname,
  compact = false,
}: {
  item: NavigationItem;
  pathname: string;
  compact?: boolean;
}) {
  const active = isActiveRoute(pathname, item.href);

  return (
    <Link
      href={item.href}
      title={compact ? item.label : undefined}
      className={[
        "group flex items-center rounded-xl text-sm font-medium transition",
        compact
          ? "h-11 justify-center px-0"
          : "gap-3 px-3 py-2.5",
        active
          ? "bg-white text-black shadow-sm"
          : "text-zinc-400 hover:bg-white/5 hover:text-white",
      ].join(" ")}
    >
      <span
        className={[
          "grid size-7 shrink-0 place-items-center rounded-lg text-base",
          active
            ? "bg-zinc-100 text-zinc-950"
            : "text-zinc-500 group-hover:text-white",
        ].join(" ")}
      >
        {item.icon}
      </span>

      {!compact && <span className="truncate">{item.label}</span>}
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#18181b]">
      <aside
        className={[
          "fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-white/10 bg-[#0d0d11] text-white transition-[width] duration-200 lg:flex",
          collapsed ? "w-20" : "w-72",
        ].join(" ")}
      >
        <div
          className={[
            "flex h-20 items-center border-b border-white/10",
            collapsed ? "justify-center px-3" : "justify-between px-5",
          ].join(" ")}
        >
          <Link
            href="/"
            className="flex min-w-0 items-center gap-3"
            title={collapsed ? "Twilight Labs" : undefined}
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-violet-500 font-black">
              TL
            </span>

            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate font-bold tracking-tight">
                  Twilight Labs
                </p>
                <p className="truncate text-xs text-zinc-500">
                  Data over opinions
                </p>
              </div>
            )}
          </Link>

          {!collapsed && (
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              className="grid size-9 place-items-center rounded-xl text-zinc-500 transition hover:bg-white/5 hover:text-white"
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
            >
              ‹
            </button>
          )}
        </div>

        {collapsed && (
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            className="mx-auto mt-3 grid size-9 place-items-center rounded-xl text-zinc-500 transition hover:bg-white/5 hover:text-white"
            aria-label="Expand sidebar"
            title="Expand sidebar"
          >
            ›
          </button>
        )}

        <div className="sidebar-scroll min-h-0 flex-1 overflow-y-auto px-3 py-5">
          <nav className="flex flex-col gap-6">
            {navigationGroups.map((group) => (
              <section key={group.label}>
                {!collapsed && (
                  <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">
                    {group.label}
                  </p>
                )}

                <div className="flex flex-col gap-1">
                  {group.items.map((item) => (
                    <NavigationLink
                      key={item.href}
                      item={item}
                      pathname={pathname}
                      compact={collapsed}
                    />
                  ))}
                </div>
              </section>
            ))}
          </nav>
        </div>

        <div className="border-t border-white/10 p-3">
          {collapsed ? (
            <div
              className="mx-auto grid size-11 place-items-center rounded-2xl border border-white/10 bg-white/5 text-xs font-black text-violet-400"
              title="Early Alpha"
            >
              α
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-400">
                Early Alpha
              </p>

              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Recommendations remain disabled until the underlying formulas
                are validated.
              </p>
            </div>
          )}
        </div>
      </aside>

      <header
        className={[
          "sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200 bg-white/85 px-5 backdrop-blur transition-[margin] duration-200 lg:px-8",
          collapsed ? "lg:ml-20" : "lg:ml-72",
        ].join(" ")}
      >
        <Link href="/" className="font-bold lg:hidden">
          Twilight Labs
        </Link>

        <p className="hidden text-sm text-zinc-500 lg:block">
          Research and theorycrafting platform
        </p>

        <span className="rounded-full bg-violet-100 px-3 py-1.5 text-xs font-semibold text-violet-700">
          Ragnarok: Twilight Global
        </span>
      </header>

      <div
        className={[
          "transition-[margin] duration-200",
          collapsed ? "lg:ml-20" : "lg:ml-72",
        ].join(" ")}
      >
        <nav className="flex gap-2 overflow-x-auto border-b border-zinc-200 bg-white px-4 py-3 lg:hidden">
          {mobileNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium",
                isActiveRoute(pathname, item.href)
                  ? "bg-black text-white"
                  : "text-zinc-600",
              ].join(" ")}
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
