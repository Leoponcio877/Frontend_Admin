"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  ExternalLink,
  Image as ImageIcon,
} from "lucide-react";
import { API_URL, apiGet, apiPatch } from "@/api";
import { formatDate } from "@/data";
import StatusBadge from "@/components/StatusBadge";

type Evidence = { id: number; url: string };

type RelatedReport = {
  id: number;
  user: string;
  status: "pending" | "approved" | "rejected";
  date: string;
};

type ReportDetail = {
  id: number;
  url: string;
  category: string;
  user: string;
  status: "pending" | "approved" | "rejected";
  description: string;
  observations: string;
  date: string;
  evidence: Evidence[];
  related: RelatedReport[];
};

export default function ReportDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [observations, setObservations] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGet<ReportDetail>(`/admin/reports/${params.id}`);
      setReport(data);
      setObservations(data.observations ?? "");
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar el reporte");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  async function setStatus(status: "approved" | "rejected") {
    if (status === "rejected" && !observations.trim()) {
      setError("Escribe una observación para rechazar el reporte");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await apiPatch(`/admin/reports/${params.id}/status`, {
        status,
        observations: observations.trim() || undefined,
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo actualizar el estado");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading && !report) {
    return (
      <div className="flex items-center gap-2 text-white">
        <Loader2 size={18} className="animate-spin" />
        Cargando reporte...
      </div>
    );
  }

  if (!report) {
    return (
      <div className="space-y-4">
        <Link
          href="/reports"
          className="inline-flex items-center gap-1 text-sm text-accent hover:underline"
        >
          <ArrowLeft size={16} />
          Volver a reportes
        </Link>
        <div className="flex items-center gap-2 rounded-xl bg-red-500/15 px-4 py-3 text-sm text-red-300">
          <AlertCircle size={16} />
          {error || "Reporte no encontrado"}
        </div>
      </div>
    );
  }

  const isOpen = report.status === "pending";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link
            href="/reports"
            className="mb-2 inline-flex items-center gap-1 text-sm text-accent hover:underline"
          >
            <ArrowLeft size={16} />
            Volver a reportes
          </Link>
          <h1 className="text-2xl font-bold text-white">Reporte #{report.id}</h1>
          <p className="mt-1 text-sm text-muted">
            {report.category} · {report.user} · {formatDate(report.date)}
          </p>
        </div>
        <StatusBadge status={report.status} />
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-500/15 px-3 py-2 text-sm text-red-300">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Info del sitio */}
      <div className="rounded-2xl bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Sitio reportado
        </h2>
        <a
          href={`https://${report.url}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 break-all text-lg font-semibold text-accent-dark hover:underline"
        >
          {report.url}
          <ExternalLink size={16} />
        </a>

        <h3 className="mb-2 mt-5 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Descripción
        </h3>
        <p className="text-sm text-black">{report.description}</p>
      </div>

      {/* Evidencias */}
      <div className="rounded-2xl bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Evidencias ({report.evidence.length})
        </h2>
        {report.evidence.length === 0 ? (
          <p className="flex items-center gap-2 text-sm text-gray-500">
            <ImageIcon size={16} />
            Este reporte no tiene evidencias.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {report.evidence.map((ev) => (
              <a
                key={ev.id}
                href={`${API_URL}${ev.url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-50 transition hover:ring-2 hover:ring-accent"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${API_URL}${ev.url}`}
                  alt={`Evidencia ${ev.id}`}
                  className="h-full w-full object-cover"
                />
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Reportes relacionados */}
      {report.related.length > 0 && (
        <div className="rounded-2xl bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Otros reportes de este sitio ({report.related.length})
          </h2>
          <div className="space-y-2">
            {report.related.map((rel) => (
              <Link
                key={rel.id}
                href={`/reports/${rel.id}`}
                className="flex items-center gap-3 rounded-xl border border-gray-100 px-3 py-2 transition hover:bg-gray-50"
              >
                <StatusBadge status={rel.status} />
                <span className="text-sm text-black">#{rel.id}</span>
                <span className="text-sm text-gray-500">por {rel.user}</span>
                <span className="ml-auto text-xs text-gray-400">
                  {formatDate(rel.date)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Aprobar / Rechazar */}
      <div className="rounded-2xl bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Observaciones internas
        </h2>
        <p className="mb-3 text-xs text-gray-500">
          Este texto nunca se muestra al usuario que reportó. Obligatorio al rechazar.
        </p>
        <textarea
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
          placeholder="Escribe una observación interna..."
          rows={3}
          disabled={!isOpen}
          className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm text-black outline-none focus:border-accent-dark focus:ring-2 focus:ring-accent/30 disabled:bg-gray-50 disabled:text-gray-500"
        />

        {isOpen ? (
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={() => setStatus("approved")}
              disabled={submitting}
              className="flex items-center gap-2 rounded-full bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <CheckCircle2 size={16} />
              )}
              Aprobar
            </button>
            <button
              onClick={() => setStatus("rejected")}
              disabled={submitting}
              className="flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <XCircle size={16} />
              )}
              Rechazar
            </button>
          </div>
        ) : (
          <p className="mt-4 flex items-center gap-2 text-sm text-gray-500">
            <Clock size={16} />
            Este reporte ya fue moderado y no se puede cambiar.
          </p>
        )}
      </div>
    </div>
  );
}