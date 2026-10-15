"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileWarning,
  Clock,
  CheckCircle2,
  XCircle,
  Users,
  Bell,
  Tags,
  BarChart3,
  ArrowUpRight,
  ArrowRightCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { apiGet } from "@/api";
import { formatDate } from "@/data";
import StatusBadge from "@/components/StatusBadge";

type DashboardData = {
  admin: { name: string; email: string };
  totals: { reports: number; pending: number; approved: number; rejected: number; users: number };
  unreadNotifications: number;
  byMonth: { month: string; total: number }[];
  byCategory: { name: string; total: number }[];
  recent: {
    id: string;
    url: string;
    category: string;
    status: "pending" | "approved" | "rejected";
    date: string;
  }[];
};

const REFRESH_MS = 15000;

const statusIcon = {
  pending: { icon: Clock, color: "text-amber-500" },
  approved: { icon: CheckCircle2, color: "text-green-500" },
  rejected: { icon: XCircle, color: "text-red-500" },
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const result = await apiGet<DashboardData>("/admin/dashboard");
        if (!active) return;
        setData(result);
        setError("");
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : "Error al cargar los datos");
      }
    }

    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  if (!data) {
    return (
      <div className="flex items-center gap-2 text-white">
        {error ? (
          <>
            <AlertCircle size={18} className="text-red-400" />
            {error}
          </>
        ) : (
          <>
            <Loader2 size={18} className="animate-spin" />
            Cargando inicio...
          </>
        )}
      </div>
    );
  }

  const { admin, totals, unreadNotifications, byMonth, byCategory, recent } = data;

  const stats = [
    { label: "Total de reportes", value: totals.reports, icon: FileWarning },
    { label: "Pendientes", value: totals.pending, icon: Clock },
    { label: "Aprobados", value: totals.approved, icon: CheckCircle2 },
    { label: "Rechazados", value: totals.rejected, icon: XCircle },
    { label: "Usuarios", value: totals.users, icon: Users },
  ];

  const quickAccess = [
    { title: "Reportes", subtitle: `${totals.pending} por revisar`, href: "/reports", icon: FileWarning },
    { title: "Usuarios", subtitle: `${totals.users} registrados`, href: "/users", icon: Users },
    { title: "Notificaciones", subtitle: `${unreadNotifications} sin leer`, href: "/notifications", icon: Bell },
    { title: "Categorías", subtitle: "Administrar", href: "/categories", icon: Tags },
    { title: "Estadísticas", subtitle: "Ver tendencias", href: "/statistics", icon: BarChart3 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Hola, {admin.name}</h1>
          <p className="mt-1 text-sm text-muted">Inicio · Resumen general de NetShield</p>
        </div>
        {error && (
          <span className="flex items-center gap-1.5 rounded-full bg-red-500/15 px-3 py-1 text-xs font-semibold text-red-300">
            <AlertCircle size={14} />
            Sin conexión, mostrando últimos datos
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl bg-white p-4">
            <Icon size={22} className="text-accent-dark" />
            <p className="mt-3 text-3xl font-bold text-black">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="mb-3 text-base font-semibold text-white">Acceso rápido</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {quickAccess.map(({ title, subtitle, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="rounded-2xl bg-white p-4 transition hover:ring-2 hover:ring-accent"
            >
              <Icon size={24} className="text-accent-dark" />
              <p className="mt-2.5 font-semibold text-black">{title}</p>
              <p className="text-sm text-gray-500">{subtitle}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-5">
          <h2 className="mb-4 font-semibold text-black">Reportes a lo largo del tiempo</h2>
          <div className="h-64">
            {byMonth.length === 0 ? (
              <p className="flex h-full items-center justify-center text-sm text-gray-500">
                Aún no hay reportes
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={byMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <Tooltip />
                  <Line type="monotone" dataKey="total" name="Reportes" stroke="#0ea5e9" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5">
          <h2 className="mb-4 font-semibold text-black">Reportes por categoría</h2>
          <div className="h-64">
            {byCategory.length === 0 ? (
              <p className="flex h-full items-center justify-center text-sm text-gray-500">
                Aún no hay reportes
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byCategory} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <Tooltip />
                  <Bar dataKey="total" name="Reportes" fill="#0ea5e9" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Reportes recientes</h2>
          <Link href="/reports" className="flex items-center gap-1 text-sm font-semibold text-accent">
            Ver todos
            <ArrowRightCircle size={16} />
          </Link>
        </div>

        <div className="space-y-2.5">
          {recent.length === 0 && (
            <p className="rounded-2xl bg-white p-4 text-sm text-gray-500">No hay reportes recientes.</p>
          )}
          {recent.map((report) => {
            const { icon: Icon, color } = statusIcon[report.status];
            return (
              <Link
                key={report.id}
                href="/reports"
                className="flex items-center gap-3 rounded-2xl bg-white p-3.5"
              >
                <Icon size={22} className={color} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-black">{report.url}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <StatusBadge status={report.status} />
                    <span className="text-xs text-gray-500">
                      {report.category} · {formatDate(report.date)}
                    </span>
                  </div>
                </div>
                <ArrowUpRight size={18} className="text-gray-400" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}