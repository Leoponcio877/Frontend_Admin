"use client";

import { useCallback, useEffect, useState, ChangeEvent } from "react";
import { Search, CheckCircle2, XCircle, AlertCircle, Loader2, ImageOff } from "lucide-react";
import { API_URL, apiGet, apiPatch } from "@/api";
import { formatDate } from "@/data";
import StatusBadge from "@/components/StatusBadge";
import Modal from "@/components/Modal";

type Status = "pending" | "approved" | "rejected";

type ReportRow = {
  id: number;
  url: string;
  category: string;
  user: string;
  date: string;
  status: Status;
};

type ReportDetail = ReportRow & {
  description: string;
  observations: string;
  evidence: { id: number; url: string }[];
  related: { id: number; user: string; date: string; status: Status }[];
};

const PAGE_SIZE = 8;

const fieldClass =
  "rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-black outline-none focus:border-accent-dark focus:ring-2 focus:ring-accent/30";

export default function ReportsPage() {
  const [list, setList] = useState<ReportRow[] | null>(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<ReportDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [actionError, setActionError] = useState("");
  const [saving, setSaving] = useState(false);

  const loadList = useCallback(async () => {
    try {
      setList(await apiGet<ReportRow[]>("/admin/reports"));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar los reportes");
    }
  }, []);

  useEffect(() => {
    loadList();
    const timer = setInterval(loadList, 15000);
    return () => clearInterval(timer);
  }, [loadList]);

  function onFilter(setter: (value: string) => void) {
    return (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setter(e.target.value);
      setPage(1);
    };
  }

  async function openReport(id: number) {
    setDetail(null);
    setActionError("");
    setDetailLoading(true);
    try {
      const data = await apiGet<ReportDetail>(`/admin/reports/${id}`);
      setDetail(data);
      setNotes(data.observations);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Error al cargar el reporte");
    }
    setDetailLoading(false);
  }

  function closeModal() {
    setDetail(null);
    setDetailLoading(false);
    setActionError("");
  }

  async function decide(newStatus: "approved" | "rejected") {
    if (!detail) return;
    if (newStatus === "rejected" && !notes.trim()) {
      setActionError("Escribe una observación para rechazar el reporte");
      return;
    }
    setSaving(true);
    setActionError("");
    try {
      await apiPatch(`/admin/reports/${detail.id}/status`, {
        status: newStatus,
        observations: notes.trim(),
      });
      closeModal();
      await loadList();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "No se pudo actualizar el reporte");
    }
    setSaving(false);
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
            Cargando reportes...
          </>
        )}
      </div>
    );
  }

  const categories = Array.from(new Set(list.map((r) => r.category))).sort();
  const text = search.toLowerCase();
  const filtered = list.filter(
    (r) =>
      (!text ||
        r.url.toLowerCase().includes(text) ||
        String(r.id).includes(text) ||
        r.user.toLowerCase().includes(text)) &&
      (!category || r.category === category) &&
      (!status || r.status === status) &&
      (!from || r.date >= from)
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const modalOpen = detailLoading || detail !== null || actionError !== "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Reportes</h1>
        <p className="mt-1 text-sm text-muted">Revisa y administra los reportes recibidos</p>
      </div>

      <div className="rounded-2xl bg-white p-4">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={onFilter(setSearch)}
              placeholder="Buscar por ID, URL o usuario"
              className={`${fieldClass} w-full pl-9`}
            />
          </div>
          <select value={category} onChange={onFilter(setCategory)} className={fieldClass}>
            <option value="">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select value={status} onChange={onFilter(setStatus)} className={fieldClass}>
            <option value="">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="approved">Aprobado</option>
            <option value="rejected">Rechazado</option>
          </select>
          <input type="date" value={from} onChange={onFilter(setFrom)} className={fieldClass} />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">URL</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => openReport(r.id)}
                  className="cursor-pointer border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-4 py-3 font-semibold text-black">#{r.id}</td>
                  <td className="max-w-[220px] truncate px-4 py-3 text-black">{r.url}</td>
                  <td className="px-4 py-3 text-gray-600">{r.category}</td>
                  <td className="px-4 py-3 text-gray-600">{r.user}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-600">{formatDate(r.date)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                    {list.length === 0 ? "Aún no hay reportes" : "No se encontraron reportes"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 text-sm text-gray-600">
          <span>
            {filtered.length} reportes · Página {current} de {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(current - 1)}
              disabled={current === 1}
              className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage(current + 1)}
              disabled={current === totalPages}
              className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {modalOpen && (
        <Modal title={detail ? `Reporte #${detail.id}` : "Reporte"} onClose={closeModal} large>
          {detailLoading && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Loader2 size={16} className="animate-spin" />
              Cargando...
            </div>
          )}

          {detail && (
            <div className="space-y-5">
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-gray-500">URL</p>
                  <p className="break-all font-semibold text-black">{detail.url}</p>
                </div>
                <div>
                  <p className="text-gray-500">Estado</p>
                  <StatusBadge status={detail.status} />
                </div>
                <div>
                  <p className="text-gray-500">Categoría</p>
                  <p className="font-semibold text-black">{detail.category}</p>
                </div>
                <div>
                  <p className="text-gray-500">Usuario</p>
                  <p className="font-semibold text-black">{detail.user}</p>
                </div>
                <div>
                  <p className="text-gray-500">Fecha</p>
                  <p className="font-semibold text-black">{formatDate(detail.date)}</p>
                </div>
              </div>

              <div>
                <p className="mb-1 text-sm text-gray-500">Descripción</p>
                <p className="rounded-xl bg-slate-50 p-3 text-sm text-black">{detail.description}</p>
              </div>

              <div>
                <p className="mb-2 text-sm text-gray-500">Evidencias ({detail.evidence.length})</p>
                {detail.evidence.length === 0 ? (
                  <p className="flex items-center gap-2 text-sm text-gray-500">
                    <ImageOff size={16} />
                    Este reporte no tiene evidencias.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {detail.evidence.map((ev) => (
                      <a key={ev.id} href={`${API_URL}${ev.url}`} target="_blank" rel="noreferrer">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`${API_URL}${ev.url}`}
                          alt={`Evidencia ${ev.id}`}
                          className="aspect-video w-full rounded-xl bg-slate-100 object-cover"
                        />
                      </a>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <p className="mb-2 text-sm text-gray-500">Otros reportes de este sitio</p>
                {detail.related.length === 0 ? (
                  <p className="text-sm text-gray-500">No hay otros reportes de este sitio.</p>
                ) : (
                  <ul className="space-y-2">
                    {detail.related.map((r) => (
                      <li
                        key={r.id}
                        className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm"
                      >
                        <span className="text-black">
                          #{r.id} · {r.user} · {formatDate(r.date)}
                        </span>
                        <StatusBadge status={r.status} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <label htmlFor="notes" className="mb-1 block text-sm text-gray-500">
                  Observaciones
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  value={notes}
                  onChange={(e) => {
                    setNotes(e.target.value);
                    setActionError("");
                  }}
                  maxLength={1000}
                  placeholder="Motivo de la decisión (obligatorio al rechazar)"
                  className={`${fieldClass} w-full resize-none`}
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => decide("approved")}
                  disabled={saving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-semibold text-navy hover:bg-accent-dark disabled:opacity-60"
                >
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                  Aprobar
                </button>
                <button
                  onClick={() => decide("rejected")}
                  disabled={saving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-300 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
                >
                  <XCircle size={18} />
                  Rechazar
                </button>
              </div>
            </div>
          )}

          {actionError && (
            <p className="mt-3 flex items-center gap-1 text-xs text-red-600">
              <AlertCircle size={14} />
              {actionError}
            </p>
          )}
        </Modal>
      )}
    </div>
  );
}