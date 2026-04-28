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

  const { data: { user } } = await supabase.auth.getUser()
  const url = new URL(request.url)
  const path = url.pathname

  // 1. Proteger Dashboard (Auth)
  if (!user && path.startsWith('/dashboard') && path !== '/dashboard/billing') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 2. Control de Acceso por Suscripción y Onboarding
  if (user && (path.startsWith('/dashboard') || path === '/onboarding')) {
    const { data: barbershop } = await supabase
      .from('barbershops')
      .select('subscription_status, trial_ends_at, onboarding_completed')
      .eq('owner_id', user.id)
      .single()

    if (barbershop) {
      // Onboarding check
      if (!barbershop.onboarding_completed && path.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/onboarding', request.url))
      }
      if (barbershop.onboarding_completed && path === '/onboarding') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }

      // Subscription check (only if onboarding is done and in dashboard)
      if (barbershop.onboarding_completed && path.startsWith('/dashboard') && !path.startsWith('/dashboard/billing')) {
        const isTrialActive = barbershop.subscription_status === 'trialing' && new Date(barbershop.trial_ends_at) > new Date()
        const isActive = barbershop.subscription_status === 'active'

        if (!isActive && !isTrialActive) {
          return NextResponse.redirect(new URL('/dashboard/billing?expired=true', request.url))
        }
      }
    } else {
      // Si no hay barbería y está en dashboard, forzar onboarding
      if (path.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/onboarding', request.url))
      }
    }
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
