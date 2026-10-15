"use client";

import { useCallback, useEffect, useState, FormEvent } from "react";
import { Plus, Pencil, Trash2, Tag, AlertCircle, Loader2 } from "lucide-react";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/api";
import Modal from "@/components/Modal";

type CategoryRow = { id: number; name: string };

const fieldClass =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-black outline-none focus:border-accent-dark focus:ring-2 focus:ring-accent/30";

export default function CategoriesPage() {
  const [list, setList] = useState<CategoryRow[] | null>(null);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryRow | null>(null);
  const [deleting, setDeleting] = useState<CategoryRow | null>(null);
  const [name, setName] = useState("");
  const [formError, setFormError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setList(await apiGet<CategoryRow[]>("/categories"));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar las categorías");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setName("");
    setFormError("");
    setFormOpen(true);
  }

  function openEdit(category: CategoryRow) {
    setEditing(category);
    setName(category.name);
    setFormError("");
    setFormOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const value = name.trim();
    if (!value) {
      setFormError("Escribe el nombre de la categoría");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await apiPatch(`/admin/categories/${editing.id}`, { name: value });
      } else {
        await apiPost("/admin/categories", { name: value });
      }
      setFormOpen(false);
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "No se pudo guardar");
    }
    setSaving(false);
  }

  async function confirmDelete() {
    if (!deleting) return;
    setSaving(true);
    setDeleteError("");
    try {
      await apiDelete(`/admin/categories/${deleting.id}`);
      setDeleting(null);
      await load();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "No se pudo eliminar");
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
            Cargando categorías...
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Categorías</h1>
          <p className="mt-1 text-sm text-muted">Tipos de fraude disponibles en la app</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-navy hover:bg-accent-dark"
        >
          <Plus size={18} />
          Nueva categoría
        </button>
      </div>

      <div className="space-y-2.5">
        {list.length === 0 && (
          <p className="rounded-2xl bg-white p-4 text-sm text-gray-500">Aún no hay categorías.</p>
        )}
        {list.map((c) => (
          <div key={c.id} className="flex items-center gap-3 rounded-2xl bg-white p-4">
            <Tag size={22} className="shrink-0 text-accent-dark" />
            <p className="min-w-0 flex-1 truncate font-semibold text-black">{c.name}</p>
            <button
              onClick={() => openEdit(c)}
              className="rounded-lg p-2 text-gray-500 hover:bg-slate-100"
              aria-label="Editar"
            >
              <Pencil size={18} />
            </button>
            <button
              onClick={() => {
                setDeleteError("");
                setDeleting(c);
              }}
              className="rounded-lg p-2 text-red-500 hover:bg-red-50"
              aria-label="Eliminar"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      {formOpen && (
        <Modal title={editing ? "Editar categoría" : "Nueva categoría"} onClose={() => setFormOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-700">
                Nombre
              </label>
              <input
                id="name"
                value={name}
                maxLength={100}
                onChange={(e) => {
                  setName(e.target.value);
                  setFormError("");
                }}
                placeholder="Ej. Phishing"
                className={fieldClass}
              />
              {formError && <p className="mt-1 text-xs text-red-600">{formError}</p>}
            </div>
            <button
              type="submit"
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-semibold text-navy hover:bg-accent-dark disabled:opacity-60"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              {editing ? "Guardar cambios" : "Crear categoría"}
            </button>
          </form>
        </Modal>
      )}

      {deleting && (
        <Modal title="Eliminar categoría" onClose={() => setDeleting(null)}>
          <p className="text-sm text-gray-600">
            ¿Seguro que quieres eliminar <span className="font-semibold text-black">{deleting.name}</span>? Esta
            acción no se puede deshacer.
          </p>
          {deleteError && (
            <p className="mt-3 flex items-center gap-1 text-xs text-red-600">
              <AlertCircle size={14} />
              {deleteError}
            </p>
          )}
          <div className="mt-5 flex gap-3">
            <button
              onClick={() => setDeleting(null)}
              className="flex-1 rounded-xl border border-slate-300 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              onClick={confirmDelete}
              disabled={saving}
              className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
            >
              Eliminar
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}