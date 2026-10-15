"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileWarning,
  Users,
  Bell,
  Tags,
  BarChart3,
  KeyRound,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { hasToken, logoutAdmin } from "@/api";

const navItems = [
  { label: "Inicio", href: "/dashboard", icon: LayoutDashboard },
  { label: "Reportes", href: "/reports", icon: FileWarning },
  { label: "Usuarios", href: "/users", icon: Users },
  { label: "Notificaciones", href: "/notifications", icon: Bell },
  { label: "Categorías", href: "/categories", icon: Tags },
  { label: "Estadísticas", href: "/statistics", icon: BarChart3 },
  { label: "Invitaciones", href: "/invitations", icon: KeyRound },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState(false);

  const isPublic = pathname === "/login" || pathname === "/register";

  useEffect(() => {
    if (isPublic) return;
    if (!hasToken()) {
      router.replace("/login");
      return;
    }
    setChecked(true);
  }, [isPublic, router, pathname]);

  function handleLogout() {
    logoutAdmin();
    setChecked(false);
    router.replace("/login");
  }

  if (isPublic) {
    return <>{children}</>;
  }

  if (!checked) {
    return null;
  }

  return (
    <div className="min-h-screen">
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/5 bg-navy-dark text-white transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <Image
              src="/logoNet.jpg"
              alt="NetShield"
              width={56}
              height={56}
              className="h-14 w-14 rounded-xl object-cover"
            />
            <span className="text-xl font-extrabold tracking-wide">
              <span className="text-white">NET</span>
              <span className="text-brand-yellow">SHIELD</span>
            </span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-muted lg:hidden"
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  active
                    ? "bg-accent text-navy"
                    : "text-slate-300 hover:bg-navy-light hover:text-white"
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-navy-light hover:text-white"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-white/10 bg-navy px-4 sm:px-8">
          <button
            onClick={() => setOpen(true)}
            className="rounded-lg p-2 text-white hover:bg-white/10 lg:hidden"
            aria-label="Abrir menú"
          >
            <Menu size={20} />
          </button>

          <div className="ml-auto flex items-center gap-4">
            <Link
              href="/notifications"
              className="relative rounded-lg p-2 text-muted hover:bg-white/10 hover:text-white"
              aria-label="Notificaciones"
            >
              <Bell size={20} />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent" />
            </Link>

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-bold text-navy">
                A
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-semibold text-white">Administrador</p>
                <p className="text-xs text-muted">Panel NetShield</p>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}