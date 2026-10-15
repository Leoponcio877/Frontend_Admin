const styles = {
  pending: { label: "Pendiente", className: "bg-amber-500/15 text-amber-600" },
  approved: { label: "Aprobado", className: "bg-green-500/15 text-green-600" },
  rejected: { label: "Rechazado", className: "bg-red-500/15 text-red-600" },
  active: { label: "Activo", className: "bg-green-500/15 text-green-600" },
  inactive: { label: "Inactivo", className: "bg-slate-500/15 text-slate-600" },
};

export type BadgeStatus = keyof typeof styles;

export default function StatusBadge({ status }: { status: BadgeStatus }) {
  const { label, className } = styles[status];
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}>
      {label}
    </span>
  );
}