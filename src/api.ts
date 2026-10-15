export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

const SERVER_ERROR = "Ocurrió un error en el servidor. Intenta de nuevo más tarde";

function errorMessage(body: unknown, status: number) {
  if (status >= 500) return SERVER_ERROR;
  if (status === 403) return "No tienes permiso para realizar esta acción";
  const message = (body as { message?: string | string[] } | null)?.message;
  return Array.isArray(message) ? message.join(", ") : (message ?? `Error ${status}`);
}

export async function loginAdmin(email: string, password: string) {
  let response: Response;

  try {
    response = await fetch(`${API_URL}/admin/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    throw new Error("No se pudo conectar con el servidor");
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Correo o contraseña incorrectos");
    }
    const body = await response.json().catch(() => null);
    throw new Error(errorMessage(body, response.status));
  }

  const data = await response.json();
  localStorage.setItem("token", data.accessToken);
  localStorage.setItem("refreshToken", data.refreshToken);
  return data;
}

export function hasToken() {
  return Boolean(localStorage.getItem("token"));
}

export function logoutAdmin() {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
}

async function apiRequest<T>(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  path: string,
  body?: unknown,
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("No se pudo conectar con el servidor");
  }

  if (response.status === 401) {
    logoutAdmin();
    window.location.href = "/login";
    throw new Error("Sesión expirada");
  }

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(errorMessage(data, response.status));
  }

  return response.json();
}

export const apiGet = <T,>(path: string) => apiRequest<T>("GET", path);
export const apiPost = <T,>(path: string, body: unknown) => apiRequest<T>("POST", path, body);
export const apiPatch = <T,>(path: string, body: unknown = {}) => apiRequest<T>("PATCH", path, body);
export const apiDelete = <T,>(path: string) => apiRequest<T>("DELETE", path);

export async function registerAdmin(data: {
  name: string;
  email: string;
  password: string;
  inviteCode: string;
}) {
  let response: Response;

  try {
    response = await fetch(`${API_URL}/admin/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch {
    throw new Error("No se pudo conectar con el servidor");
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(errorMessage(body, response.status));
  }

  return response.json();
}