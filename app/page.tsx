import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminPayments from '@/components/dashboard/AdminPayments'

type Profile = {
  role: 'admin' | 'user'
}

type UserProfile = {
  id: string
  name: string | null
  email: string
  phone: string | null
  plan: string | null
  credits: number | null
  role: 'admin' | 'user'
  status: 'active' | 'inactive'
  created_at: string
}

export default async function AdminPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // ✅ FIX 1: Type profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single<Profile>()

  if (profileError || !profile || profile.role !== 'admin') {
    redirect('/dashboard')
  }

  const admin = createAdminClient()

  const [
    { count: usersCount },
    { count: jobsCount },
    { count: paymentsCount },
    { count: pendingCount },
    { data: allPayments },
    { data: allUsers },
  ] = await Promise.all([
    admin.from('profiles').select('*', { count: 'exact', head: true }),
    admin.from('ai_jobs').select('*', { count: 'exact', head: true }),
    admin.from('payments').select('*', { count: 'exact', head: true }),
    admin
      .from('payments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),

    // payments list (you can type later if needed)
    admin
      .from('payments')
      .select('*, profiles(name,email)')
      .order('created_at', { ascending: false })
      .limit(50),

    // ✅ FIX 2: Type allUsers
    admin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)
      .returns<UserProfile[]>(),
  ])

  return (
    <div className="space-y-8 animate-fade-up">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl text-white">Administration</h1>
        <p className="text-white/40 text-sm">Panneau de contrôle</p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Utilisateurs', value: usersCount ?? 0 },
          { label: 'Paiements', value: paymentsCount ?? 0 },
          { label: 'Travaux IA', value: jobsCount ?? 0 },
          { label: 'En attente', value: pendingCount ?? 0 },
        ].map((s) => (
          <div key={s.label} className="card p-5 text-center">
            <div className="text-2xl">{s.value}</div>
            <div className="text-white/40 text-xs">{s.label}</div>
          </div>
        ))}
      </div>

      {/* PAYMENTS */}
      <AdminPayments payments={allPayments ?? []} />

      {/* USERS */}
      <div>
        <h2 className="text-white mb-4">
          Utilisateurs ({allUsers?.length ?? 0})
        </h2>

        <table className="w-full text-sm">
          <tbody>
            {allUsers?.map((u) => (
              <tr key={u.id}>
                <td>{u.name ?? '—'}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  {u.created_at
                    ? new Date(u.created_at).toLocaleDateString('fr-CM')
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
