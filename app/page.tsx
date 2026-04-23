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

  // 🔐 AUTH
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // 🔐 ADMIN CHECK (FIXED TYPE)
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single<Profile>()

  if (error || !profile || profile.role !== 'admin') {
    redirect('/dashboard')
  }

  const admin = createAdminClient()

  // 🚀 FETCH DATA (SAFE)
  const results = await Promise.all([
    admin.from('profiles').select('*', { count: 'exact', head: true }),
    admin.from('ai_jobs').select('*', { count: 'exact', head: true }),
    admin.from('payments').select('*', { count: 'exact', head: true }),
    admin
      .from('payments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
    admin
      .from('payments')
      .select('*, profiles(name,email)')
      .order('created_at', { ascending: false })
      .limit(50),
    admin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100),
  ])

  // 📊 COUNTS
  const usersCount = results[0].count ?? 0
  const jobsCount = results[1].count ?? 0
  const paymentsCount = results[2].count ?? 0
  const pendingCount = results[3].count ?? 0

  // 💳 PAYMENTS
  const allPayments = results[4].data ?? []

  // 👤 USERS (FORCED TYPE FIX)
  const allUsers = (results[5].data ?? []) as UserProfile[]

  /* ================= UI ================= */

  return (
    <div className="space-y-8 animate-fade-up">
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
          { label: 'Utilisateurs', value: usersCount },
          { label: 'Paiements', value: paymentsCount },
          { label: 'Travaux IA', value: jobsCount },
          { label: 'En attente', value: pendingCount },
        ].map((item) => (
          <div key={item.label} className="card p-5 text-center">
            <div className="text-2xl font-bold">{item.value}</div>
            <div className="text-white/40 text-xs">{item.label}</div>
          </div>
        ))}
      </div>

      {/* PAYMENTS */}
      <AdminPayments payments={allPayments} />

      {/* USERS TABLE */}
      <div>
        <h2 className="text-white mb-4">
          Utilisateurs ({allUsers.length})
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

            <tbody className="divide-y divide-surface">
              {/* 🔥 FINAL FIX HERE */}
              {(allUsers as UserProfile[]).map((u) => (
                <tr
                  key={u.id}
                  className="hover:bg-white/2 transition-colors"
                >
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
