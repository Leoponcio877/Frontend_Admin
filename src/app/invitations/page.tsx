"use client";

import { useEffect, useState } from "react";
import { Mail, Plus, Loader2, AlertCircle, Copy, Check } from "lucide-react";
import { apiGet, apiPost } from "@/api";

type Invitation = {
  id: number;
  status: "active" | "used" | "expired";
  createdBy: string | null;
  usedBy: string | null;
  createdAt: string;
  expiresAt: string;
};

const statusStyles: Record<Invitation["status"], { label: string; className: string }> = {
  active:  { label: "Activa",   className: "bg-green-500/15 text-green-300" },
  used:    { label: "Usada",    className: "bg-sky-500/15 text-sky-300" },
  expired: { label: "Expirada", className: "bg-red-500/15 text-red-300" },
};

export default function InvitationsPage() {
  const [items, setItems] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [days, setDays] = useState(7);
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState<{ code: string; expiresAt: string } | null>(null);
  const [copied, setCopied] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await apiGet<Invitation[]>("/admin/invitations");
      setItems(data);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar invitaciones");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate() {
    setCreating(true);
    try {
      const res = await apiPost<{ code: string; expiresAt: string }>(
        "/admin/invitations",
        { days },
      );
      setCreated(res);
      setShowCreate(false);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo crear la invitación");
    } finally {
      setCreating(false);
    }
  }

  async function copyCode() {
    if (!created) return;
    await navigator.clipboard.writeText(created.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Invitaciones</h1>
          <p className="mt-1 text-sm text-muted">
            Genera códigos para dar de alta a nuevos administradores
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark"
        >
          <Plus size={16} />
          Generar invitación
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-500/15 px-3 py-2 text-sm text-red-300">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-white">
          <Loader2 size={18} className="animate-spin" />
          Cargando invitaciones...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center">
          <Mail size={40} className="mx-auto text-accent-dark" />
          <p className="mt-4 font-semibold text-black">Aún no has creado invitaciones</p>
          <p className="mt-1 text-sm text-gray-500">
            Genera un código para dar de alta a un nuevo administrador.
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark"
          >
            <Plus size={16} />
            Crear la primera invitación
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Creada por</th>
                <th className="px-4 py-3 font-medium">Usada por</th>
                <th className="px-4 py-3 font-medium">Creada</th>
                <th className="px-4 py-3 font-medium">Expira</th>
              </tr>
            </thead>
            <tbody>
              {items.map((inv) => {
                const s = statusStyles[inv.status];
                return (
                  <tr key={inv.id} className="border-t border-gray-100 text-black">
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${s.className}`}>
                        {s.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">{inv.createdBy ?? "—"}</td>
                    <td className="px-4 py-3">{inv.usedBy ?? "—"}</td>
                    <td className="px-4 py-3">{inv.createdAt}</td>
                    <td className="px-4 py-3">{inv.expiresAt}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: crear invitación */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6">
            <h2 className="text-lg font-bold text-black">Nueva invitación</h2>
            <p className="mt-1 text-sm text-gray-500">
              El código solo se mostrará una vez. Cópialo y compártelo con la persona que quieres invitar.
            </p>

            <label className="mt-5 block text-sm font-medium text-black">
              Válida por
            </label>
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-black"
            >
              <option value={1}>1 día</option>
              <option value={3}>3 días</option>
              <option value={7}>7 días</option>
              <option value={14}>14 días</option>
              <option value={30}>30 días</option>
            </select>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowCreate(false)}
                className="rounded-full px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-60"
              >
                {creating && <Loader2 size={16} className="animate-spin" />}
                Generar código
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: mostrar código creado */}
      {created && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
              <AlertCircle size={24} className="text-amber-600" />
            </div>
            <h2 className="mt-3 text-lg font-bold text-black">Copia este código ahora</h2>
            <p className="mt-1 text-sm text-gray-500">
              Solo se muestra una vez. Si lo pierdes, tendrás que generar uno nuevo.
            </p>

            <div className="mt-5 rounded-xl bg-gray-50 px-4 py-4">
              <p className="break-all font-mono text-lg font-bold tracking-wider text-black">
                {created.code}
              </p>
            </div>

            <button
              onClick={copyCode}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "¡Copiado!" : "Copiar código"}
            </button>

            <p className="mt-4 text-xs text-gray-500">
              Expira el {created.expiresAt} · Un solo uso
            </p>

            <button
              onClick={() => setCreated(null)}
              className="mt-5 w-full rounded-full px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}