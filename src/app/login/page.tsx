import Image from "next/image";
import Link from "next/link";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-navy px-4">
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
          <p className="mt-1 text-sm text-muted">Panel de administración</p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <h2 className="mb-1 text-lg font-bold text-black">Iniciar sesión</h2>
          <p className="mb-6 text-sm text-gray-500">Acceso exclusivo para administradores</p>
          <LoginForm />
          <p className="mt-5 text-center text-sm text-gray-500">
            ¿Eres un nuevo administrador?{" "}
            <Link href="/register" className="font-semibold text-accent-dark hover:underline">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}