export type ReportStatus = "pending" | "approved" | "rejected";

export type Report = {
  id: string;
  url: string;
  category: string;
  user: string;
  date: string;
  status: ReportStatus;
  description: string;
  observations: string;
};

export type User = {
  id: number;
  name: string;
  email: string;
  registeredAt: string;
  active: boolean;
};

export type Notification = {
  id: number;
  message: string;
  date: string;
  read: boolean;
};

export type Category = { id: number; name: string };

export const reports: Report[] = [
  { id: "RP-001", url: "http://banco-seguro-mx.com", category: "Suplantación bancaria", user: "Carlos Ramírez", date: "2026-09-28", status: "pending", description: "Recibí un SMS con un enlace que imita la página de mi banco y pide mis claves de acceso.", observations: "" },
  { id: "RP-002", url: "https://tienda-ofertas-ya.shop", category: "Tienda falsa", user: "Ana López", date: "2026-09-27", status: "pending", description: "Vende celulares a mitad de precio. Pagué y nunca llegó el pedido.", observations: "" },
  { id: "RP-003", url: "https://premio-ganador.net", category: "Premio falso", user: "Luis Torres", date: "2026-09-25", status: "approved", description: "Dice que gané un premio y pide un pago para liberarlo.", observations: "Sitio confirmado como fraudulento." },
  { id: "RP-004", url: "https://invierte-hoy-cripto.io", category: "Inversión fraudulenta", user: "María Gómez", date: "2026-09-20", status: "approved", description: "Promete duplicar el dinero en 24 horas con criptomonedas.", observations: "Coincide con otros reportes." },
  { id: "RP-005", url: "http://banco-seguro-mx.com", category: "Suplantación bancaria", user: "Ana López", date: "2026-09-18", status: "pending", description: "Mismo sitio que me llegó por correo electrónico, con el logo del banco.", observations: "" },
  { id: "RP-006", url: "https://soporte-microsoft-ayuda.com", category: "Soporte técnico falso", user: "Carlos Ramírez", date: "2026-08-30", status: "rejected", description: "Mostró una alerta de virus con un número de teléfono.", observations: "No hay evidencia suficiente del fraude." },
  { id: "RP-007", url: "https://tienda-ofertas-ya.shop", category: "Tienda falsa", user: "Sofía Herrera", date: "2026-08-22", status: "approved", description: "No entrega los productos y no responde mensajes.", observations: "Varios reportes coinciden." },
  { id: "RP-008", url: "https://login-facebook-verifica.com", category: "Phishing", user: "Luis Torres", date: "2026-08-10", status: "approved", description: "Pide iniciar sesión en Facebook para verificar la cuenta.", observations: "Dominio imita a la red social." },
  { id: "RP-009", url: "https://premio-ganador.net", category: "Premio falso", user: "María Gómez", date: "2026-07-19", status: "approved", description: "Mensaje de WhatsApp con enlace para reclamar un premio.", observations: "Duplicado de un caso aprobado." },
  { id: "RP-010", url: "https://sat-devolucion-mx.com", category: "Phishing", user: "Sofía Herrera", date: "2026-07-05", status: "rejected", description: "Correo sobre una supuesta devolución de impuestos.", observations: "El sitio ya no está disponible." },
  { id: "RP-011", url: "https://cripto-duplica.com", category: "Inversión fraudulenta", user: "Carlos Ramírez", date: "2026-06-14", status: "approved", description: "Grupo de Telegram que pide depósitos para invertir.", observations: "Sitio confirmado como fraudulento." },
  { id: "RP-012", url: "https://paquete-retenido-envios.com", category: "Phishing", user: "Ana López", date: "2026-05-22", status: "pending", description: "SMS que dice que un paquete está retenido y pide un pago.", observations: "" },
];

export const users: User[] = [
  { id: 1, name: "Carlos Ramírez", email: "carlos.ramirez@correo.com", registeredAt: "2026-03-12", active: true },
  { id: 2, name: "Ana López", email: "ana.lopez@correo.com", registeredAt: "2026-04-02", active: true },
  { id: 3, name: "Luis Torres", email: "luis.torres@correo.com", registeredAt: "2026-04-18", active: true },
  { id: 4, name: "María Gómez", email: "maria.gomez@correo.com", registeredAt: "2026-05-07", active: true },
  { id: 5, name: "Sofía Herrera", email: "sofia.herrera@correo.com", registeredAt: "2026-06-21", active: true },
  { id: 6, name: "Diego Castillo", email: "diego.castillo@correo.com", registeredAt: "2026-07-30", active: false },
];

export const notifications: Notification[] = [
  { id: 1, message: "Nuevo reporte RP-001 sobre banco-seguro-mx.com", date: "2026-09-28", read: false },
  { id: 2, message: "Nuevo reporte RP-002 sobre tienda-ofertas-ya.shop", date: "2026-09-27", read: false },
  { id: 3, message: "Nuevo reporte RP-005 sobre un sitio ya reportado", date: "2026-09-18", read: false },
  { id: 4, message: "Nuevo reporte RP-004 sobre invierte-hoy-cripto.io", date: "2026-09-20", read: true },
  { id: 5, message: "Nuevo reporte RP-003 sobre premio-ganador.net", date: "2026-09-25", read: true },
];

export const categories: Category[] = [
  { id: 1, name: "Phishing" },
  { id: 2, name: "Tienda falsa" },
  { id: 3, name: "Suplantación bancaria" },
  { id: 4, name: "Premio falso" },
  { id: 5, name: "Inversión fraudulenta" },
  { id: 6, name: "Soporte técnico falso" },
];

export function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function countByMonth(list: Report[]) {
  const map: Record<string, number> = {};
  list.forEach((r) => {
    const key = r.date.slice(0, 7);
    map[key] = (map[key] ?? 0) + 1;
  });
  return Object.keys(map)
    .sort()
    .map((month) => ({ month, total: map[month] }));
}

export function countByCategory(list: Report[]) {
  const map: Record<string, number> = {};
  list.forEach((r) => {
    map[r.category] = (map[r.category] ?? 0) + 1;
  });
  return Object.keys(map).map((name) => ({ name, total: map[name] }));
}

export function countByStatus(list: Report[]) {
  return [
    { key: "pending", name: "Pendientes", total: list.filter((r) => r.status === "pending").length, color: "#f59e0b" },
    { key: "approved", name: "Aprobados", total: list.filter((r) => r.status === "approved").length, color: "#22c55e" },
    { key: "rejected", name: "Rechazados", total: list.filter((r) => r.status === "rejected").length, color: "#ef4444" },
  ];
}