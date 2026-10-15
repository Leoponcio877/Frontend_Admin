"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  User,
  Mail,
  Lock,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { registerAdmin } from "@/api";

type FormErrors = Partial<Record<"name" | "email" | "password" | "confirm" | "inviteCode", string>>;

const inputClass = (hasError?: string) =>
  `w-full rounded-xl border bg-white py-2.5 pl-10 pr-10 text-sm outline-none transition focus:ring-2 ${
    hasError
      ? "border-red-400 focus:ring-red-200"
      : "border-slate-300 focus:border-accent-dark focus:ring-accent/30"
  }`;

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  function validate() {
    const next: FormErrors = {};
    if (!name.trim()) next.name = "Ingresa tu nombre";
    if (!email.trim()) next.email = "Ingresa tu correo electrónico";
    else if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Ingresa un correo válido";
    if (!password) next.password = "Ingresa una contraseña";
    else if (password.length < 8) next.password = "Debe tener al menos 8 caracteres";
    if (confirm !== password) next.confirm = "Las contraseñas no coinciden";
    if (!inviteCode.trim()) next.inviteCode = "Ingresa el código de invitación";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setApiError("");
    if (!validate()) return;

    setLoading(true);
    try {
      await registerAdmin({
        name: name.trim(),
        email: email.trim(),
        password,
        inviteCode: inviteCode.trim(),
      });
      setDone(true);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "Error al registrar");
    }
    setLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-navy px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <Image
            src="/logoNet.jpg"
            alt="NetShield"
            width={128}
            height={128}
            priority
            className="mb-4 h-32 w-32 rounded-2xl object-cover"
          />
          <h1 className="text-3xl font-extrabold tracking-wide">
            <span className="text-white">NET</span>
            <span className="text-brand-yellow">SHIELD</span>
          </h1>
          <p className="mt-1 text-sm text-muted">Registro de administradores</p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-xl">
          {done ? (
            <div className="space-y-4 text-center">
              <CheckCircle2 size={40} className="mx-auto text-green-500" />
              <h2 className="text-lg font-bold text-black">Administrador registrado</h2>
              <p className="text-sm text-gray-500">
                Ya puedes iniciar sesión con tu correo y contraseña.
              </p>
              <Link
                href="/login"
                className="block rounded-xl bg-accent py-3 text-sm font-semibold text-navy hover:bg-accent-dark"
              >
                Ir a iniciar sesión
              </Link>
            </div>
          ) : (
            <>
              <h2 className="mb-1 text-lg font-bold text-black">Crear cuenta de administrador</h2>
              <p className="mb-6 text-sm text-gray-500">Necesitas un código de invitación</p>

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {apiError && (
                  <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                    <AlertCircle size={16} className="shrink-0" />
                    {apiError}
                  </div>
                )}

                <div>
                  <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Nombre
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={inputClass(errors.name)}
                    />
                  </div>
                  {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputClass(errors.email)}
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={inputClass(errors.password)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
                </div>

                <div>
                  <label htmlFor="confirm" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Confirmar contraseña
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="confirm"
                      type={showConfirm ? "text" : "password"}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className={inputClass(errors.confirm)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                      aria-label={showConfirm ? "Ocultar contraseña" : "Mostrar contraseña"}
                      tabIndex={-1}
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.confirm && <p className="mt-1 text-xs text-red-600">{errors.confirm}</p>}
                </div>

                <div>
                  <label htmlFor="inviteCode" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Código de invitación
                  </label>
                  <div className="relative">
                    <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="inviteCode"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      className={inputClass(errors.inviteCode)}
                    />
                  </div>
                  {errors.inviteCode && <p className="mt-1 text-xs text-red-600">{errors.inviteCode}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-semibold text-navy transition hover:bg-accent-dark disabled:opacity-70"
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  {loading ? "Registrando..." : "Registrar administrador"}
                </button>
              </form>

              <p className="mt-5 text-center text-sm text-gray-500">
                ¿Ya tienes cuenta?{" "}
                <Link href="/login" className="font-semibold text-accent-dark hover:underline">
                  Iniciar sesión
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}