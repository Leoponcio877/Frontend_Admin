"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BellRing, Bell, Check, AlertCircle, Loader2, ArrowUpRight } from "lucide-react";
import { apiGet, apiPatch } from "@/api";
import { formatDate } from "@/data";

type NotificationRow = {
  id: number;
  reportId: number;
  message: string;
  date: string;
  read: boolean;
};

export default function NotificationsPage() {
  const router = useRouter();
  const [list, setList] = useState<NotificationRow[] | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setList(await apiGet<NotificationRow[]>("/admin/notifications"));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar las notificaciones");
    }
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, 15000);
    return () => clearInterval(timer);
  }, [load]);

  async function markAsRead(id: number) {
    try {
      await apiPatch(`/admin/notifications/${id}/read`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo marcar como leída");
    }
  }

  async function handleClick(n: NotificationRow) {
    // Marca como leída si no lo está (sin bloquear la navegación)
    if (!n.read) {
      apiPatch(`/admin/notifications/${n.id}/read`).catch(() => {});
    }
    // Navega al detalle del reporte
    router.push(`/reports/${n.reportId}`);
  }

  if (!list) {
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
            Cargando notificaciones...
          </>
        )}
      </div>
    );
  }

  const unread = list.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Notificaciones</h1>
        <p className="mt-1 text-sm text-muted">
          {unread === 0 ? "No tienes notificaciones sin leer" : `${unread} sin leer`}
        </p>
      </div>

      {error && (
        <p className="flex items-center gap-1.5 text-xs text-red-300">
          <AlertCircle size={14} />
          {error}
        </p>
      )}

      <div className="space-y-2.5">
        {list.length === 0 && (
          <p className="rounded-2xl bg-white p-4 text-sm text-gray-500">
            Aún no hay notificaciones.
          </p>
        )}
        {list.map((n) => (
          <div
            key={n.id}
            onClick={() => handleClick(n)}
            className={`flex cursor-pointer items-center gap-3 rounded-2xl bg-white p-4 transition hover:bg-gray-50 ${
              n.read ? "opacity-70" : "border-l-4 border-accent-dark"
            }`}
          >
            {n.read ? (
              <Bell size={22} className="shrink-0 text-gray-400" />
            ) : (
              <BellRing size={22} className="shrink-0 text-accent-dark" />
            )}
            <div className="min-w-0 flex-1">
              <p className={`break-all text-sm text-black ${n.read ? "" : "font-semibold"}`}>
                {n.message}
              </p>
              <p className="text-xs text-gray-500">{formatDate(n.date)}</p>
            </div>
            <ArrowUpRight size={18} className="shrink-0 text-gray-400" />
            {!n.read && (
              <button
                onClick={(e) => {
                  e.stopPropagation(); // evita que se dispare el onClick de la fila
                  markAsRead(n.id);
                }}
                className="flex shrink-0 items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Check size={14} />
                Marcar como leída
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}