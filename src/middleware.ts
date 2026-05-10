import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  try {
    const { data: { user } } = await supabase.auth.getUser()
    const url = new URL(request.url)
    const path = url.pathname

    // 1. Proteger Dashboard y Barber (Auth)
    if (!user && (path.startsWith('/dashboard') || path.startsWith('/barber')) && path !== '/dashboard/billing') {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // 2. Control de Acceso por Rol, Suscripción y Onboarding
    const isAuthPage = path === '/login' || path === '/register';
    
    if (user && (path.startsWith('/dashboard') || path.startsWith('/barber') || path === '/onboarding' || isAuthPage)) {
      const userId = user.id;

      // DETECCIÓN DE ROL BASADA EN TABLAS
      const { data: barbershop } = await supabase
        .from('barbershops')
        .select('id, onboarding_completed, subscription_status, trial_ends_at')
        .eq('owner_id', userId)
        .limit(1)
        .maybeSingle()

      if (barbershop) {
        // ES DUEÑO

        // Si intenta entrar a rutas de barbero, login o register → redirigir a dashboard de dueño
        if (path.startsWith('/barber') || isAuthPage) {
          if (isAuthPage && !barbershop.onboarding_completed) {
            return NextResponse.redirect(new URL('/onboarding', request.url))
          }
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }

        // Onboarding check
        if (!barbershop.onboarding_completed && path.startsWith('/dashboard')) {
          return NextResponse.redirect(new URL('/onboarding', request.url))
        }
        if (barbershop.onboarding_completed && path === '/onboarding') {
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }

        // Subscription check (solo en dashboard)
        if (barbershop.onboarding_completed && path.startsWith('/dashboard') && !path.startsWith('/dashboard/billing')) {
          const isTrialActive = barbershop.subscription_status === 'trialing' && 
            barbershop.trial_ends_at && new Date(barbershop.trial_ends_at) > new Date()
          const isActive = barbershop.subscription_status === 'active'

          if (!isActive && !isTrialActive) {
            return NextResponse.redirect(new URL('/dashboard/billing?expired=true', request.url))
          }
        }
        
        return response;
      }

      // 2B. ¿Es Barbero?
      const { data: barber } = await supabase
        .from('barbers')
        .select('id, barbershop_id')
        .eq('user_id', userId)
        .limit(1)
        .maybeSingle()

      if (barber) {
        // ES BARBERO

        // Si intenta entrar a rutas de dueño, onboarding, login o register → redirigir a su propio dashboard
        if (path.startsWith('/dashboard') || path === '/onboarding' || isAuthPage) {
          return NextResponse.redirect(new URL('/barber/dashboard', request.url))
        }

        return response;
      }

      // 2C. Usuario autenticado sin rol (Nuevo registro en proceso)
      if (path.startsWith('/dashboard') || isAuthPage) {
        if (isAuthPage) return response; // Dejar entrar a login/register si no hay rol aún? No, usualmente onboarding
        return NextResponse.redirect(new URL('/onboarding', request.url))
      }
    }
  } catch (err) {
    console.error("Middleware error:", err)
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
