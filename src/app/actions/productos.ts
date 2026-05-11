'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { getBarbershopId } from '@/lib/getBarbershopId';

export async function getProducts() {
  const supabase = await createClient();
  const barbershopId = await getBarbershopId();
  if (!barbershopId) throw new Error('No barbershop id');

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('barbershop_id', barbershopId)
    .order('nombre', { ascending: true });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  return data;
}

export async function createProduct(formData: FormData) {
  const supabase = await createClient();
  const barbershopId = await getBarbershopId();
  if (!barbershopId) throw new Error('No barbershop id');

  const nombre = formData.get('nombre') as string;
  const categoria = formData.get('categoria') as string;
  const precio_venta = Number(formData.get('precio_venta'));
  const precio_costo = formData.get('precio_costo') ? Number(formData.get('precio_costo')) : 0;
  const stock = Number(formData.get('stock'));
  const descripcion = formData.get('descripcion') as string;
  const activo = formData.get('activo') === 'true';

  const { error } = await supabase
    .from('products')
    .insert({
      barbershop_id: barbershopId,
      nombre,
      categoria,
      precio_venta,
      precio_costo,
      stock,
      descripcion,
      activo
    });

  if (error) {
    console.error('Error creating product:', error);
    return { error: error.message };
  }

  revalidatePath('/dashboard/productos');
  return { success: true };
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = await createClient();
  const barbershopId = await getBarbershopId();
  if (!barbershopId) throw new Error('No barbershop id');

  const nombre = formData.get('nombre') as string;
  const categoria = formData.get('categoria') as string;
  const precio_venta = Number(formData.get('precio_venta'));
  const precio_costo = formData.get('precio_costo') ? Number(formData.get('precio_costo')) : 0;
  const stock = Number(formData.get('stock'));
  const descripcion = formData.get('descripcion') as string;
  const activo = formData.get('activo') === 'true';

  const { error } = await supabase
    .from('products')
    .update({
      nombre,
      categoria,
      precio_venta,
      precio_costo,
      stock,
      descripcion,
      activo,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('barbershop_id', barbershopId);

  if (error) {
    console.error('Error updating product:', error);
    return { error: error.message };
  }

  revalidatePath('/dashboard/productos');
  return { success: true };
}

export async function toggleProductStatus(id: string, activo: boolean) {
  const supabase = await createClient();
  const barbershopId = await getBarbershopId();
  if (!barbershopId) throw new Error('No barbershop id');

  const { error } = await supabase
    .from('products')
    .update({ activo, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('barbershop_id', barbershopId);

  if (error) return { error: error.message };

  revalidatePath('/dashboard/productos');
  return { success: true };
}

export async function registerSale(data: { product_id: string, cantidad: number, precio_unitario: number, total: number, barber_id?: string, appointment_id?: string }) {
  const supabase = await createClient();
  const barbershopId = await getBarbershopId();
  if (!barbershopId) throw new Error('No barbershop id');

  // Primero descontar el stock
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('stock')
    .eq('id', data.product_id)
    .single();

  if (productError || !product) {
    return { error: 'Producto no encontrado' };
  }

  if (product.stock < data.cantidad) {
    return { error: 'Stock insuficiente' };
  }

  const { error: updateError } = await supabase
    .from('products')
    .update({ stock: product.stock - data.cantidad })
    .eq('id', data.product_id);

  if (updateError) {
    return { error: 'Error actualizando el stock' };
  }

  // Registrar la venta
  const { error: saleError } = await supabase
    .from('product_sales')
    .insert({
      barbershop_id: barbershopId,
      product_id: data.product_id,
      cantidad: data.cantidad,
      precio_unitario: data.precio_unitario,
      total: data.total,
      barber_id: data.barber_id || null,
      appointment_id: data.appointment_id || null
    });

  if (saleError) {
    // Si falla la venta, deberíamos revertir el stock (en la realidad sería mejor usar RPC/Transacción, pero esto servirá para MVP)
    return { error: 'Error registrando la venta' };
  }

  revalidatePath('/dashboard/productos');
  return { success: true };
}

export async function getSales(periodo: string = 'hoy') {
  const supabase = await createClient();
  const barbershopId = await getBarbershopId();
  if (!barbershopId) throw new Error('No barbershop id');

  let dateFilter = new Date();
  
  if (periodo === 'hoy') {
    dateFilter.setHours(0,0,0,0);
  } else if (periodo === 'semana') {
    dateFilter.setDate(dateFilter.getDate() - 7);
  } else if (periodo === 'mes') {
    dateFilter.setMonth(dateFilter.getMonth() - 1);
  }

  const { data, error } = await supabase
    .from('product_sales')
    .select(`
      *,
      products(nombre, categoria),
      barbers(name),
      appointments(id, clients(name))
    `)
    .eq('barbershop_id', barbershopId)
    .gte('created_at', dateFilter.toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching sales:', error);
    return [];
  }
  return data;
}

export async function getBarbersActive() {
    const supabase = await createClient();
    const barbershopId = await getBarbershopId();
    if (!barbershopId) return [];
  
    const { data } = await supabase
      .from('barbers')
      .select('id, name')
      .eq('barbershop_id', barbershopId);
      
    return data || [];
}

export async function getAppointmentsToday() {
    const supabase = await createClient();
    const barbershopId = await getBarbershopId();
    if (!barbershopId) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data } = await supabase
      .from('appointments')
      .select('id, scheduled_at, clients(name)')
      .eq('barbershop_id', barbershopId)
      .gte('scheduled_at', today.toISOString())
      .lt('scheduled_at', tomorrow.toISOString())
      .in('status', ['confirmed', 'pending'])
      .order('scheduled_at', { ascending: true });

    if (!data) return [];

    return data.map((a: any) => ({
      id: a.id,
      client_name: a.clients?.name || 'Cliente',
      time: new Date(a.scheduled_at).toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    }));
}
