import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminPayments from '@/components/dashboard/AdminPayments'

export default async function AdminPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const admin = createAdminClient()
  const [{ count: users }, { count: jobs }, { count: payments }, { count: pending }, { data: allPayments }, { data: allUsers }] = await Promise.all([
    admin.from('profiles').select('*', { count: 'exact', head: true }),
    admin.from('ai_jobs').select('*', { count: 'exact', head: true }),
    admin.from('payments').select('*', { count: 'exact', head: true }),
    admin.from('payments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    admin.from('payments').select('*, profiles(name,email)').order('created_at', { ascending: false }).limit(50),
    admin.from('profiles').select('*').order('created_at', { ascending: false }).limit(100),
  ])

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">🛡️</span>
            <h1 className="section-title text-2xl text-white">Administration</h1>
            <span className="badge-gold">ADMIN</span>
          </div>
          <p className="text-white/40 text-sm">Panneau de contrôle Digit-Excel5G</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Utilisateurs', value: users ?? 0, icon: '👤', color: '#0F4CFF' },
          { label: 'Paiements', value: payments ?? 0, icon: '💳', color: '#F5B301' },
          { label: 'Travaux IA', value: jobs ?? 0, icon: '🤖', color: '#00D4FF' },
          { label: 'En attente', value: pending ?? 0, icon: '⏳', color: '#FF4D4F' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="card p-5 text-center">
            <div className="text-3xl mb-2">{icon}</div>
            <div className="section-title text-3xl mb-0.5" style={{ color }}>{value}</div>
            <div className="text-white/40 text-xs">{label}</div>
          </div>
        ))}
      </div>

      {/* Payments table */}
      <AdminPayments payments={allPayments ?? []} />

      {/* Users table */}
      <div>
        <h2 className="section-title text-lg text-white mb-4">Utilisateurs ({allUsers?.length ?? 0})</h2>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface">
                  {['Nom', 'Email', 'Téléphone', 'Plan', 'Crédits', 'Rôle', 'Statut', 'Inscription'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-white/35 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface">
                {allUsers?.map(u => (
                  <tr key={u.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-5 py-3 font-medium text-white whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-accent flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        {u.name}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-white/50">{u.email}</td>
                    <td className="px-5 py-3 text-white/40">{u.phone || '—'}</td>
                    <td className="px-5 py-3 text-yellow-400 font-medium">{u.plan}</td>
                    <td className="px-5 py-3 text-accent font-bold">{u.credits}</td>
                    <td className="px-5 py-3"><span className={u.role === 'admin' ? 'badge-gold' : 'badge-blue'}>{u.role}</span></td>
                    <td className="px-5 py-3"><span className={u.status === 'active' ? 'badge-green' : 'badge-red'}>{u.status}</span></td>
                    <td className="px-5 py-3 text-white/30 text-xs">{new Date(u.created_at).toLocaleDateString('fr-CM')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
