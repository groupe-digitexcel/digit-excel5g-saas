import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Admin seulement' }, { status: 403 })
  }

  const admin = createAdminClient()

  const [
    { count: usersCount },
    { count: jobsCount },
    { count: paymentsCount },
    { count: pendingPaymentsCount },
  ] = await Promise.all([
    admin.from('profiles').select('*', { count: 'exact', head: true }),
    admin.from('ai_jobs').select('*', { count: 'exact', head: true }),
    admin.from('payments').select('*', { count: 'exact', head: true }),
    admin
      .from('payments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
  ])

  return NextResponse.json({
    users: usersCount,
    jobs: jobsCount,
    payments: paymentsCount,
    pending: pendingPaymentsCount,
  })
}
