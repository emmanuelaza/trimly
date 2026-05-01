"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Scissors } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      toast.error(signInError.message);
      setIsLoading(false);
      return;
    }

    toast.success("Bienvenido de nuevo");
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[0.4fr_0.6fr]">
      {/* Columna Izquierda - Formulario */}
      <div className="flex items-center justify-center p-8 md:p-12 bg-background-primary">
        <div className="w-full max-w-md space-y-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center transition-transform group-hover:rotate-12">
              <Scissors size={18} className="text-background-primary" />
            </div>
            <span className="text-xl font-bold text-text-primary tracking-tight">Trimly</span>
          </Link>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-text-primary">Bienvenido</h1>
            <p className="text-sm text-text-secondary">Ingresa a tu cuenta para continuar gestionando tu barbería.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Email</label>
                <Input 
                  type="email"
                  placeholder="tu@barberia.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Contraseña</label>
                  <Link href="#" className="text-[10px] font-bold text-accent hover:underline uppercase tracking-widest">¿Olvidaste tu contraseña?</Link>
                </div>
                <div className="relative">
                  <Input 
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-sm font-bold uppercase tracking-widest"
              disabled={isLoading}
            >
              {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>

            <div className="pt-4 text-center">
              <p className="text-sm text-text-secondary">
                ¿No tienes cuenta? <Link href="/auth/register" className="text-accent font-bold hover:underline">Crea una gratis</Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Columna Derecha - Panel Decorativo */}
      <div className="hidden lg:flex flex-col items-center justify-center bg-background-secondary p-20 relative overflow-hidden border-l border-border">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] -z-0 translate-x-1/2 -translate-y-1/2" />
        
        <div className="max-w-md space-y-12 relative z-10 text-center">
          <div className="text-accent/20 text-8xl font-serif absolute -top-16 left-0 -translate-x-12 select-none">“</div>
          
          <div className="space-y-6">
            <p className="text-2xl font-medium text-text-primary leading-relaxed">
              La plataforma que simplifica mi día a día. Mis clientes aman lo fácil que es agendar.
            </p>
            <div>
              <p className="text-lg font-bold text-text-primary">— Andrés R.</p>
              <p className="text-sm text-accent font-bold">Filo & Estilo · Bogotá</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-8 pt-8 border-t border-border-strong">
            {[
              { label: 'ahorro tiempo', val: '4h/semana' },
              { label: 'sin no-shows', val: '98%' },
              { label: 'soporte', val: '24/7' }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-xl font-black text-text-primary">{stat.val}</div>
                <div className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
