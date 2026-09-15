import { getBarbershopId as getLibBarbershopId } from "@/lib/getBarbershopId";
import { getSupabaseAdmin } from "@/lib/supabase/serviceRole";

export async function getBarbershopId(): Promise<string | null> {
  try {
    return await getLibBarbershopId();
  } catch (error) {
    console.error("Error in getBarbershopId wrapper:", error);
    return null;
  }
}

/**
 * Bloquea acciones que crean valor nuevo (citas, barberos, servicios, etc.)
 * cuando la prueba venció y no hay licencia activa. La lectura de datos
 * existentes nunca pasa por aquí — solo las acciones de creación la llaman.
 */
export async function requireActiveLicense(existingBarbershopId?: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const barbershopId = existingBarbershopId ?? (await getBarbershopId());
  if (!barbershopId) return { ok: false, error: "No autenticado" };

  const supabase = getSupabaseAdmin();
  const { data: barbershop } = await supabase
    .from("barbershops")
    .select("subscription_status, trial_ends_at")
    .eq("id", barbershopId)
    .maybeSingle();

  const isActive = barbershop?.subscription_status === "active";
  const isTrialActive =
    barbershop?.subscription_status === "trialing" &&
    !!barbershop?.trial_ends_at &&
    new Date(barbershop.trial_ends_at) > new Date();

  if (isActive || isTrialActive) return { ok: true };

  return {
    ok: false,
    error: "Tu período de prueba terminó. Activa tu licencia para seguir creando cosas nuevas en Trimly.",
  };
}
