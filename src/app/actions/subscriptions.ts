"use server"

import { createClient } from "@/lib/supabase/server"
import { getBarbershopId } from "./utils"
import { revalidatePath } from "next/cache"

/**
 * Obtiene la suscripción activa de la barbería actual
 */
export async function getSubscription() {
  try {
    const barbershopId = await getBarbershopId()
    if (!barbershopId) return null

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('barbershop_id', barbershopId)
      .eq('status', 'active')
      .maybeSingle()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error in getSubscription:", error)
    return null
  }
}

/**
 * Crea un registro de suscripción inicial en estado 'pending'
 */
export async function createSubscription(planType: string, mpSubscriptionId?: string, mpPreferenceId?: string) {
  try {
    const barbershopId = await getBarbershopId()
    if (!barbershopId) return { success: false, error: "No barbershopId" }

    const supabase = await createClient()
    const { error } = await supabase
      .from('subscriptions')
      .insert({
        barbershop_id: barbershopId,
        plan_type: planType,
        status: 'pending',
        mp_subscription_id: mpSubscriptionId || null,
        mp_preference_id: mpPreferenceId || null,
        current_period_start: new Date().toISOString()
      })

    if (error) throw error
    return { success: true }
  } catch (error: any) {
    console.error("Error in createSubscription:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Actualiza el estado de una suscripción y de la barbería
 */
export async function updateSubscriptionStatus(mpId: string, status: string, isSubscription: boolean = true) {
  try {
    const supabase = await createClient()
    
    // 1. Update subscription record
    const query = isSubscription 
      ? supabase.from('subscriptions').update({ status, updated_at: new Date().toISOString() }).eq('mp_subscription_id', mpId)
      : supabase.from('subscriptions').update({ status, updated_at: new Date().toISOString() }).eq('mp_preference_id', mpId)

    const { data: updatedSub, error } = await query.select('barbershop_id, plan_type').single()
    if (error) throw error

    // 2. Update barbershop status
    const barbershopStatus = status === 'active' ? 'active' : status === 'cancelled' ? 'cancelled' : 'expired'
    await supabase
      .from('barbershops')
      .update({ subscription_status: barbershopStatus })
      .eq('id', updatedSub.barbershop_id)

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error: any) {
    console.error("Error in updateSubscriptionStatus:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Verifica si la barbería tiene acceso (active o trialing vigente)
 */
export async function checkAccess(): Promise<boolean> {
  try {
    const barbershopId = await getBarbershopId()
    if (!barbershopId) return false

    const supabase = await createClient()
    const { data: barbershop, error } = await supabase
      .from('barbershops')
      .select('subscription_status, trial_ends_at')
      .eq('id', barbershopId)
      .single()

    if (error || !barbershop) return false

    if (barbershop.subscription_status === 'active') return true
    
    if (barbershop.subscription_status === 'trialing') {
      const trialEnd = new Date(barbershop.trial_ends_at)
      return trialEnd > new Date()
    }

    return false
  } catch (error) {
    return false
  }
}
