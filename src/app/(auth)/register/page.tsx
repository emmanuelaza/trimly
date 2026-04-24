"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { signUpAction } from "@/app/actions/auth";
import styles from "../auth.module.css";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const [businessName, setBusinessName] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    formData.append("businessName", businessName);
    formData.append("userName", userName);

    const result = await signUpAction(formData);

    if (result.success) {
      toast.success("Cuenta creada correctamente");
      router.push("/dashboard");
      router.refresh();
    } else {
      setError(result.error || "Error al crear cuenta");
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className={styles.card}>
      {/* 1. Logo Trimly arriba centrado */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
        <div style={{ position: 'relative', width: '240px', height: '120px' }}>
          <Image src="/logo.png" alt="Trimly" fill style={{ objectFit: 'contain', objectPosition: 'center' }} priority />
        </div>
      </div>

      {/* 2. Título + subtítulo */}
      <div className={styles.formHeader} style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 className={styles.formTitle}>Crea tu cuenta</h2>
        <p className={styles.formSubtitle}>Comienza a gestionar tu barbería hoy mismo</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        {/* 3. Campo "Nombre del Negocio" */}
        <div className="input-group">
          <label className="input-label" htmlFor="negocio">Nombre del Negocio</label>
          <input
            id="negocio"
            type="text"
            className="input-field w-full"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="Ej. Trimly Studio"
            required
          />
        </div>

        {/* 4. Campo "Tu Nombre" */}
        <div className="input-group">
          <label className="input-label" htmlFor="nombre">Tu Nombre</label>
          <input
            id="nombre"
            type="text"
            className="input-field w-full"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Ej. Juan Pérez"
            required
          />
        </div>

        {/* 5. Campo Email */}
        <div className="input-group">
          <label className="input-label" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className="input-field w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@barberia.com"
            required
            autoComplete="email"
          />
        </div>

        {/* 6. Campo Contraseña */}
        <div className="input-group">
          <label className="input-label" htmlFor="password">Contraseña</label>
          <div style={{ position: "relative" }}>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              className="input-field w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "1rem",
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                color: "#6B7280",
                cursor: "pointer",
              }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* 7. Botón "Crear cuenta" (ancho completo) */}
        <button type="submit" className="btn btn-primary w-full" disabled={isLoading} style={{ marginTop: '1.5rem' }}>
          {isLoading ? <div className="spinner" /> : "Crear cuenta"}
        </button>
      </form>

      {/* 8. Separador "O" centrado */}
      <div className={styles.divider}>O</div>

      {/* 9. Botón "Continuar con Google" (ancho completo) */}
      <button
        type="button"
        className={`btn ${styles.socialBtn} w-full`}
        onClick={handleGoogleLogin}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '10px' }}>
          <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
            <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
            <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
            <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
            <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
          </g>
        </svg>
        Continuar con Google
      </button>

      {/* 10. Link abajo centrado */}
      <p className="text-center mt-8 text-sm text-gray">
        ¿Ya tienes cuenta? <Link href="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>Inicia sesión</Link>
      </p>
    </div>
  );
}
