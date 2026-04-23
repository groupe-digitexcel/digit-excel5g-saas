import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminPayments from '@/components/dashboard/AdminPayments'

/* ================= TYPES ================= */

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
  created_at: string | null
}

/* ================= PAGE ================= */

export default async function AdminPage() {
  const supabase = createClient()

  // AUTH
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // ADMIN CHECK (typed)
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single<Profile>()

  if (profileError || !profile || profile.role !== 'admin') {
    redirect('/dashboard')
  }

  const admin = createAdminClient()

  // ✅ TYPE EACH QUERY DIRECTLY (NO Promise.all TYPE LOSS)
  const { count: usersCount } = await admin
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  const { count: jobsCount } = await admin
    .from('ai_jobs')
    .select('*', { count: 'exact', head: true })

  const { count: paymentsCount } = await admin
    .from('payments')
    .select('*', { count: 'exact', head: true })

  const { count: pendingCount } = await admin
    .from('payments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  // ✅ USERS (TYPED)
  const { data: allUsers } = await admin
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)
    .returns<UserProfile[]>()

  // PAYMENTS (can type later if needed)
  const { data: allPayments } = await admin
    .from('payments')
    .select('*, profiles(name,email)')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-white">Administration</h1>
        <p className="text-white/40 text-sm">
          Panneau de contrôle Digit-Excel5G
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Utilisateurs', value: usersCount ?? 0 },
          { label: 'Paiements', value: paymentsCount ?? 0 },
          { label: 'Travaux IA', value: jobsCount ?? 0 },
          { label: 'En attente', value: pendingCount ?? 0 },
        ].map((item) => (
          <div key={item.label} className="card p-5 text-center">
            <div className="text-2xl font-bold">{item.value}</div>
            <div className="text-white/40 text-xs">{item.label}</div>
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

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-white/40 text-left">
                <th className="p-2">Nom</th>
                <th className="p-2">Email</th>
                <th className="p-2">Rôle</th>
                <th className="p-2">Statut</th>
                <th className="p-2">Inscription</th>
              </tr>
            </thead>

            <tbody>
              {allUsers?.map((u) => (
                <tr key={u.id} className="border-t border-white/10">
                  <td className="p-2">{u.name ?? '—'}</td>
                  <td className="p-2">{u.email}</td>
                  <td className="p-2">{u.role}</td>
                  <td className="p-2">{u.status}</td>
                  <td className="p-2">
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
    </div>
  )
}
