"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import styles from "../auth.module.css";

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

  const getPasswordStrength = (pass: string) => {
    if (pass.length === 0) return 0;
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score; // 0 to 4
  };

  const strength = getPasswordStrength(password);
  const getStrengthColor = () => {
    if (strength <= 1) return 'var(--error)';
    if (strength === 2) return 'var(--secondary)';
    return 'var(--success)';
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (strength < 2) {
      setError("La contraseña es muy débil.");
      return;
    }
    
    setIsLoading(true);
    setError(null);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre: userName,
          negocio: businessName,
        }
      }
    });

    if (signUpError) {
      setError(signUpError.message);
      setIsLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
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
      <div className={styles.formHeader}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <div style={{ position: 'relative', width: '280px', height: '180px' }}>
            <Image src="/logo.png" alt="Trimly" fill style={{ objectFit: 'contain', objectPosition: 'center' }} priority />
          </div>
        </div>
        <h2 className={styles.formTitle}>Crea tu cuenta</h2>
        <p className={styles.formSubtitle}>Comienza a gestionar tu barbería</p>
      </div>

      <form onSubmit={handleRegister}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="input-group" style={{ marginBottom: 0, flex: 1 }}>
            <label className="input-label" htmlFor="negocio">Nombre del Negocio</label>
            <input
              id="negocio"
              type="text"
              className="input-field"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Trimly Barbers"
              required
            />
          </div>

          <div className="input-group" style={{ marginBottom: 0, flex: 1 }}>
            <label className="input-label" htmlFor="nombre">Tu Nombre</label>
            <input
              id="nombre"
              type="text"
              className="input-field"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Juan Pérez"
              required
            />
          </div>
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@barberia.com"
            required
            autoComplete="email"
          />
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="password">Contraseña</label>
          <div style={{ position: "relative", marginBottom: '0.5rem' }}>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              className="input-field"
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
          {password.length > 0 && (
            <div style={{ display: 'flex', gap: '4px', height: '4px', marginTop: '0.5rem' }}>
              {[1, 2, 3, 4].map((level) => (
                <div 
                  key={level} 
                  style={{ 
                    flex: 1, 
                    backgroundColor: strength >= level ? getStrengthColor() : '#E5E7EB',
                    borderRadius: '2px',
                    transition: 'all 0.3s ease'
                  }} 
                />
              ))}
            </div>
          )}
        </div>

        {error && <div className="error-message" style={{ position: 'relative', marginBottom: '1rem' }}>{error}</div>}

        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? <div className="spinner" /> : null}
          Crear cuenta
        </button>
      </form>

      <div className={styles.divider}>O</div>

      <button
        type="button"
        className={`btn ${styles.socialBtn}`}
        onClick={handleGoogleLogin}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
          <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
            <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
            <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
            <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
            <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
          </g>
        </svg>
        Continuar con Google
      </button>

      <p className="text-center mt-6 text-sm text-gray">
        ¿Ya tienes cuenta? <Link href="/login" style={{ color: 'var(--primary)' }}>Inicia sesión</Link>
      </p>
    </div>
  );
}
