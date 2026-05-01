"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Check, Scissors } from "lucide-react";
import { signUpAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    userName: "",
    businessName: "",
    whatsapp: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const router = useRouter();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.userName) newErrors.userName = "El nombre es obligatorio";
    if (!formData.businessName) newErrors.businessName = "El nombre de la barbería es obligatorio";
    if (!formData.whatsapp || formData.whatsapp.replace(/\D/g, '').length < 10) {
      newErrors.whatsapp = "Ingresa un número de WhatsApp válido (mín. 10 dígitos)";
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Ingresa un email válido";
    }
    if (formData.password.length < 8) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsLoading(true);
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));

    const result = await signUpAction(data);

    if (result.success) {
      toast.success("¡Cuenta creada! Bienvenido a Trimly 🎉");
      router.push("/dashboard");
      router.refresh();
    } else {
      toast.error(result.error || "Error al crear cuenta");
      setIsLoading(false);
    }
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
            <h1 className="text-2xl font-bold text-text-primary">Crea tu cuenta gratis</h1>
            <p className="text-sm text-text-secondary">Configura tu barbería en menos de 5 minutos.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Nombre completo</label>
                <Input 
                  placeholder="Carlos Martínez"
                  value={formData.userName}
                  onChange={(e) => setFormData({...formData, userName: e.target.value})}
                  className={errors.userName ? "border-danger/50" : ""}
                />
                {errors.userName && <p className="text-xs text-danger mt-1">{errors.userName}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Nombre de la barbería</label>
                <Input 
                  placeholder="Barbería Don Pedro"
                  value={formData.businessName}
                  onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                  className={errors.businessName ? "border-danger/50" : ""}
                />
                {errors.businessName && <p className="text-xs text-danger mt-1">{errors.businessName}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">WhatsApp</label>
                <Input 
                  placeholder="+57 300 000 0000"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                  className={errors.whatsapp ? "border-danger/50" : ""}
                />
                {errors.whatsapp && <p className="text-xs text-danger mt-1">{errors.whatsapp}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Email</label>
                <Input 
                  type="email"
                  placeholder="carlos@mibarberia.co"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className={errors.email ? "border-danger/50" : ""}
                />
                {errors.email && <p className="text-xs text-danger mt-1">{errors.email}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Contraseña</label>
                <div className="relative">
                  <Input 
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 8 caracteres"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className={errors.password ? "border-danger/50" : ""}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-danger mt-1">{errors.password}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Confirmar contraseña</label>
                <Input 
                  type="password"
                  placeholder="Repite tu contraseña"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  className={errors.confirmPassword ? "border-danger/50" : ""}
                />
                {errors.confirmPassword && <p className="text-xs text-danger mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-sm font-bold uppercase tracking-widest"
              disabled={isLoading}
            >
              {isLoading ? "Creando tu cuenta..." : "Crear mi cuenta gratis →"}
            </Button>

            <p className="text-[10px] text-text-tertiary text-center leading-relaxed">
              Al registrarte aceptas nuestros <Link href="#" className="underline">Términos y condiciones</Link> y <Link href="#" className="underline">Política de privacidad</Link>.
            </p>

            <div className="pt-4 text-center">
              <p className="text-sm text-text-secondary">
                ¿Ya tienes cuenta? <Link href="/auth/login" className="text-accent font-bold hover:underline">Inicia sesión aquí</Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Columna Derecha - Panel Decorativo */}
      <div className="hidden lg:flex flex-col items-center justify-center bg-accent-muted p-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] -z-0 translate-x-1/2 -translate-y-1/2" />
        
        <div className="max-w-md space-y-12 relative z-10 text-center">
          <div className="text-accent/20 text-8xl font-serif absolute -top-16 left-0 -translate-x-12 select-none">“</div>
          
          <div className="space-y-6">
            <p className="text-2xl font-medium text-text-primary leading-relaxed">
              Configuré Trimly en 4 minutos y ese mismo día recibí mi primera cita online. Increíble.
            </p>
            <div>
              <p className="text-lg font-bold text-text-primary">— Carlos M.</p>
              <p className="text-sm text-accent font-bold">El Corte Perfecto · Medellín</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-8 pt-8 border-t border-accent/10">
            {[
              { label: 'barberías', val: '50+' },
              { label: 'citas', val: '2.400+' },
              { label: 'setup', val: '5 min' }
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
