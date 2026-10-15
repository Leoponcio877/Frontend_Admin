"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, UserCheck, UserX, AlertCircle, Loader2 } from "lucide-react";
import { apiGet, apiPatch } from "@/api";
import { formatDate } from "@/data";
import StatusBadge from "@/components/StatusBadge";
import Modal from "@/components/Modal";

type UserRow = {
  id: number;
  name: string;
  email: string;
  registeredAt: string;
  active: boolean;
  reports: number;
};

type UserDetail = {
  id: number;
  name: string;
  email: string;
  registeredAt: string;
  active: boolean;
  reports: {
    id: string;
    url: string;
    category: string;
    status: "pending" | "approved" | "rejected";
    date: string;
  }[];
};

const fieldClass =
  "rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-black outline-none focus:border-accent-dark focus:ring-2 focus:ring-accent/30";

export default function UsersPage() {
  const [list, setList] = useState<UserRow[] | null>(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [saving, setSaving] = useState(false);

  const loadList = useCallback(async () => {
    try {
      setList(await apiGet<UserRow[]>("/admin/users"));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar los usuarios");
    }
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  async function openUser(id: number) {
    setDetail(null);
    setActionError("");
    setDetailLoading(true);
    try {
      setDetail(await apiGet<UserDetail>(`/admin/users/${id}`));
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Error al cargar el usuario");
    }
    setDetailLoading(false);
  }

  function closeModal() {
    setDetail(null);
    setDetailLoading(false);
    setActionError("");
  }

  async function toggleActive() {
    if (!detail) return;
    setSaving(true);
    setActionError("");
    try {
      await apiPatch(`/admin/users/${detail.id}/status`, { active: !detail.active });
      setDetail({ ...detail, active: !detail.active });
      await loadList();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "No se pudo actualizar la cuenta");
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
            Cargando usuarios...
          </>
        )}
      </div>
    );
  }

  const text = search.toLowerCase();
  const filtered = list.filter(
    (u) =>
      (!text || u.name.toLowerCase().includes(text) || u.email.toLowerCase().includes(text)) &&
      (!status || (status === "active") === u.active)
  );

  const modalOpen = detailLoading || detail !== null || actionError !== "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Usuarios</h1>
        <p className="mt-1 text-sm text-muted">Administra las cuentas registradas en la app</p>
      </div>

      <div className="rounded-2xl bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o correo"
              className={`${fieldClass} w-full pl-9`}
            />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={fieldClass}>
            <option value="">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Correo</th>
                <th className="px-4 py-3">Registro</th>
                <th className="px-4 py-3">Reportes</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr
                  key={u.id}
                  onClick={() => openUser(u.id)}
                  className="cursor-pointer border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-4 py-3 font-semibold text-black">{u.name}</td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-600">{formatDate(u.registeredAt)}</td>
                  <td className="px-4 py-3 text-gray-600">{u.reports}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={u.active ? "active" : "inactive"} />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
                    {list.length === 0 ? "Aún no hay usuarios registrados" : "No se encontraron usuarios"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <Modal title="Detalle del usuario" onClose={closeModal} large>
          {detailLoading && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Loader2 size={16} className="animate-spin" />
              Cargando...
            </div>
          )}

          {detail && (
            <div className="space-y-4 text-sm">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-gray-500">Nombre</p>
                  <p className="font-semibold text-black">{detail.name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Correo</p>
                  <p className="break-all font-semibold text-black">{detail.email}</p>
                </div>
                <div>
                  <p className="text-gray-500">Fecha de registro</p>
                  <p className="font-semibold text-black">{formatDate(detail.registeredAt)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Estado</p>
                  <StatusBadge status={detail.active ? "active" : "inactive"} />
                </div>
              </div>

              <div>
                <p className="mb-2 text-gray-500">Reportes enviados ({detail.reports.length})</p>
                {detail.reports.length === 0 ? (
                  <p className="text-gray-500">Este usuario aún no ha enviado reportes.</p>
                ) : (
                  <ul className="space-y-2">
                    {detail.reports.map((r) => (
                      <li
                        key={r.id}
                        className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2"
                      >
                        <span className="min-w-0 truncate text-black">
                          {r.url} · {r.category} · {formatDate(r.date)}
                        </span>
                        <StatusBadge status={r.status} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <button
                onClick={toggleActive}
                disabled={saving}
                className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 font-semibold disabled:opacity-60 ${
                  detail.active
                    ? "border border-red-300 text-red-600 hover:bg-red-50"
                    : "bg-accent text-navy hover:bg-accent-dark"
                }`}
              >
                {saving ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : detail.active ? (
                  <UserX size={18} />
                ) : (
                  <UserCheck size={18} />
                )}
                {detail.active ? "Desactivar cuenta" : "Activar cuenta"}
              </button>
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