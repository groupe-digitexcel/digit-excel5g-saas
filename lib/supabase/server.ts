import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

type Cookie = {
  name: string
  value: string
  options?: Record<string, any>
}

type CookieStore = {
  getAll: () => Cookie[]
  setAll: (cookiesToSet: Cookie[]) => void
}

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll(): Cookie[] {
          return cookieStore.getAll()
        },

        setAll(cookiesToSet: Cookie[]): void {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options as any)
          })
        },
      },
    }
  )
}

/**
 * ADMIN CLIENT (SERVER ONLY)
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
