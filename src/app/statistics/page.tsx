"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { apiGet } from "@/api";

type Statistics = {
  total: number;
  byCategory: { name: string; total: number }[];
  byStatus: { key: "pending" | "approved" | "rejected"; name: string; total: number }[];
  byMonth: { month: string; total: number }[];
  bySite: { url: string; total: number; users: number; categories: string; lastReport: string }[];
  byCountry: { country: string; total: number }[];
  countries: string[];
};

const statusColor = { pending: "#f59e0b", approved: "#22c55e", rejected: "#ef4444" };

const countryColors = [
  "#0ea5e9",
  "#22c55e",
  "#f59e0b",
  "#a855f7",
  "#ef4444",
  "#14b8a6",
  "#f97316",
  "#6366f1",
];

const fieldClass =
  "rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-black outline-none focus:border-accent-dark focus:ring-2 focus:ring-accent/30";

export default function StatisticsPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [category, setCategory] = useState("");
  const [country, setCountry] = useState("");
  const [data, setData] = useState<Statistics | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      const params = new URLSearchParams();
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      if (category) params.set("category", category);
      if (country) params.set("country", country);
      const query = params.toString();

      try {
        const result = await apiGet<Statistics>(`/admin/statistics${query ? `?${query}` : ""}`);
        if (!active) return;
        setData(result);
        setError("");
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : "Error al cargar las estadísticas");
      }
    }

    load();
    const timer = setInterval(load, 15000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [from, to, category, country]);

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
            Cargando estadísticas...
          </>
        )}
      </div>
    );
  }

  const { total, byCategory, byStatus, byMonth, bySite, byCountry, countries } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Estadísticas</h1>
          <p className="mt-1 text-sm text-muted">{total} reportes en el periodo</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div>
            <label htmlFor="from" className="mb-1 block text-xs text-muted">
              Desde
            </label>
            <input
              id="from"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="to" className="mb-1 block text-xs text-muted">
              Hasta
            </label>
            <input
              id="to"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="category" className="mb-1 block text-xs text-muted">
              Categoría
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={fieldClass}
            >
              <option value="">Todas</option>
              {byCategory.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="country" className="mb-1 block text-xs text-muted">
              País
            </label>
            <select
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className={fieldClass}
            >
              <option value="">Todos</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Tendencia por mes */}
        <div className="rounded-2xl bg-white p-5">
          <h2 className="mb-4 font-semibold text-black">Tendencia de reportes</h2>
          <div className="h-64">
            {byMonth.length === 0 ? (
              <p className="flex h-full items-center justify-center text-sm text-gray-500">
                Sin datos en este periodo
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={byMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="total"
                    name="Reportes"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Reportes por estado */}
        <div className="rounded-2xl bg-white p-5">
          <h2 className="mb-4 font-semibold text-black">Reportes por estado</h2>
          <div className="h-64">
            {total === 0 ? (
              <p className="flex h-full items-center justify-center text-sm text-gray-500">
                Sin datos en este periodo
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byStatus}
                    dataKey="total"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={85}
                  >
                    {byStatus.map((s) => (
                      <Cell key={s.key} fill={statusColor[s.key]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Reportes por país */}
        <div className="rounded-2xl bg-white p-5 lg:col-span-2">
          <h2 className="mb-4 font-semibold text-black">Reportes por país</h2>
          <div className="h-64">
            {byCountry.length === 0 ? (
              <p className="flex h-full items-center justify-center text-sm text-gray-500">
                Sin datos en este periodo
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byCountry}
                    dataKey="total"
                    nameKey="country"
                    innerRadius={50}
                    outerRadius={85}
                  >
                    {byCountry.map((c, i) => (
                      <Cell key={c.country} fill={countryColors[i % countryColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Reportes por categoría */}
        <div className="rounded-2xl bg-white p-5 lg:col-span-2">
          <h2 className="mb-4 font-semibold text-black">Reportes por categoría</h2>
          <div className="h-64">
            {byCategory.length === 0 ? (
              <p className="flex h-full items-center justify-center text-sm text-gray-500">
                Sin datos en este periodo
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byCategory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <Tooltip />
                  <Bar dataKey="total" name="Reportes" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Tablas resumen */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="overflow-hidden rounded-2xl bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {byCategory.map((c) => (
                <tr key={c.name} className="border-b border-slate-100">
                  <td className="px-4 py-3 text-black">{c.name}</td>
                  <td className="px-4 py-3 text-right font-semibold text-black">{c.total}</td>
                </tr>
              ))}
              {byCategory.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-4 py-8 text-center text-gray-500">
                    Sin datos en este periodo
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {byStatus.map((s) => (
                <tr key={s.key} className="border-b border-slate-100">
                  <td className="px-4 py-3 text-black">{s.name}</td>
                  <td className="px-4 py-3 text-right font-semibold text-black">{s.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">País</th>
                <th className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {byCountry.map((c) => (
                <tr key={c.country} className="border-b border-slate-100">
                  <td className="px-4 py-3 text-black">{c.country}</td>
                  <td className="px-4 py-3 text-right font-semibold text-black">{c.total}</td>
                </tr>
              ))}
              {byCountry.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-4 py-8 text-center text-gray-500">
                    Sin datos en este periodo
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sitios reportados */}
      <div className="overflow-hidden rounded-2xl bg-white">
        <div className="px-4 pt-4">
          <h2 className="font-semibold text-black">Sitios reportados</h2>
          <p className="text-sm text-gray-500">
            {category ? `Categoría: ${category}` : "Todas las categorías"}
            {country ? ` · País: ${country}` : ""} · los más repetidos primero
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="mt-3 w-full text-left text-sm">
            <thead className="border-y border-slate-200 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Sitio</th>
                <th className="px-4 py-3">Categorías</th>
                <th className="px-4 py-3 text-right">Reportes</th>
                <th className="px-4 py-3 text-right">Usuarios</th>
                <th className="px-4 py-3">Último</th>
              </tr>
            </thead>
            <tbody>
              {bySite.map((s) => (
                <tr key={s.url} className="border-b border-slate-100">
                  <td className="max-w-[260px] truncate px-4 py-3 font-semibold text-black">
                    {s.url}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{s.categories}</td>
                  <td className="px-4 py-3 text-right font-semibold text-black">{s.total}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{s.users}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-600">{s.lastReport}</td>
                </tr>
              ))}
              {bySite.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    Sin sitios en este periodo
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}