import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const tools = [
  { icon: '🎨', label: 'Générer une Image',  href: '/dashboard/image-generator',  color: '#0F4CFF', desc: '3 crédits' },
  { icon: '📷', label: 'Traiter une Photo',  href: '/dashboard/photo-treatment',   color: '#00D4FF', desc: '2 crédits' },
  { icon: '📋', label: 'Créer un Flyer',     href: '/dashboard/flyer-generator',   color: '#F5B301', desc: '4 crédits' },
  { icon: '🎵', label: 'Générer une Chanson',href: '/dashboard/song-generator',    color: '#00C48C', desc: '5 crédits' },
  { icon: '🎬', label: 'Créer une Vidéo IA', href: '/dashboard/video-generator',   color: '#7C3AED', desc: '8 crédits · NEW', isNew: true },
]

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: jobs }, { data: payments }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user!.id).single(),
    supabase.from('ai_jobs').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('payments').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }).limit(3),
  ])

  const firstName = profile?.name?.split(' ')[0] ?? 'Créateur'
  const totalJobs = jobs?.length ?? 0

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Welcome */}
      <div>
        <h1 className="section-title text-3xl text-white mb-1">Bonjour, {firstName} 👋</h1>
        <p className="text-white/45 text-sm">Que voulez-vous créer aujourd&apos;hui?</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Crédits Restants', value: profile?.credits ?? 0, icon: '⚡', color: '#00D4FF' },
          { label: 'Plan Actuel',      value: profile?.plan ?? 'Free', icon: '👑', color: '#F5B301' },
          { label: 'Créations',        value: totalJobs,               icon: '🎨', color: '#0F4CFF' },
          { label: 'Statut',           value: 'Actif',                 icon: '✅', color: '#00C48C' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="card p-5">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="text-white/45 text-xs font-medium mb-1">{label}</div>
                <div className="section-title text-2xl text-white">{value}</div>
              </div>
              <span className="text-2xl opacity-70">{icon}</span>
            </div>
            {label === 'Crédits Restants' && (
              <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(((profile?.credits ?? 0) / 500) * 100, 100)}%`, background: `linear-gradient(90deg, #0F4CFF, ${color})` }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Low credits warning */}
      {(profile?.credits ?? 0) < 20 && (
        <div className="flex items-center justify-between gap-4 px-5 py-4 rounded-2xl flex-wrap"
          style={{ background: 'rgba(245,179,1,0.08)', border: '1px solid rgba(245,179,1,0.25)' }}>
          <div className="flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <div className="text-sm font-semibold text-yellow-400">Crédits faibles</div>
              <div className="text-xs text-white/50">Il vous reste {profile?.credits} crédits seulement.</div>
            </div>
          </div>
          <Link href="/dashboard/billing" className="btn btn-gold btn-sm no-underline">Recharger →</Link>
        </div>
      )}

      {/* Tools grid */}
      <div>
        <h2 className="section-title text-lg text-white mb-4">Outils IA</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tools.map(({ icon, label, href, color, desc, isNew }) => (
            <Link key={href} href={href} className="card-hover p-5 flex items-center gap-4 no-underline group relative overflow-hidden">
              {isNew && (
                <div className="absolute top-2 right-2 text-xs font-bold px-1.5 py-0.5 rounded-md"
                  style={{ background: 'rgba(124,58,237,0.25)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.4)', fontSize: '9px' }}>
                  NEW
                </div>
              )}
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 transition-transform group-hover:scale-110"
                style={{ background: `${color}18`, border: `1px solid ${color}35` }}>{icon}</div>
              <div>
                <div className="text-sm font-semibold text-white">{label}</div>
                <div className="text-xs text-white/40 mt-0.5">{desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent jobs */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title text-lg text-white">Créations récentes</h2>
            <Link href="/dashboard/history" className="text-accent text-sm no-underline hover:underline">Tout voir →</Link>
          </div>
          <div className="card">
            {!jobs?.length ? (
              <div className="p-8 text-center">
                <div className="text-3xl mb-2 opacity-30">🎨</div>
                <p className="text-white/35 text-sm">Aucune création pour l&apos;instant.<br />Choisissez un outil pour commencer!</p>
              </div>
            ) : (
              <div className="divide-y divide-surface">
                {jobs.map((job) => {
                  const typeMap: Record<string, [string, string]> = {
                    image: ['🎨', 'Image générée'],
                    photo: ['📷', 'Photo traitée'],
                    flyer: ['📋', 'Flyer créé'],
                    song:  ['🎵', 'Chanson générée'],
                  }
                  const [icon, label] = typeMap[job.job_type] ?? ['⚙️', job.job_type]
                  return (
                    <div key={job.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-white/2 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{icon}</span>
                        <div>
                          <div className="text-sm font-medium text-white">{label}</div>
                          <div className="text-xs text-white/35">{new Date(job.created_at).toLocaleDateString('fr-CM', { day: '2-digit', month: 'short' })}</div>
                        </div>
                      </div>
                      <span className={`badge ${job.status === 'completed' ? 'badge-green' : 'badge-gold'}`}>
                        {job.status === 'completed' ? '✓ Fait' : '⏳ En cours'}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recent payments */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title text-lg text-white">Paiements récents</h2>
            <Link href="/dashboard/billing" className="text-accent text-sm no-underline hover:underline">Recharger →</Link>
          </div>
          <div className="card">
            {!payments?.length ? (
              <div className="p-8 text-center">
                <div className="text-3xl mb-2 opacity-30">💳</div>
                <p className="text-white/35 text-sm">Aucun paiement encore.<br />Rechargez avec MTN MoMo ou Orange Money.</p>
              </div>
            ) : (
              <div className="divide-y divide-surface">
                {payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between px-5 py-3.5">
                    <div>
                      <div className="text-sm font-medium text-white">{p.method}</div>
                      <div className="text-xs text-white/35">{new Date(p.created_at).toLocaleDateString('fr-CM', { day: '2-digit', month: 'short' })}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-white">{Number(p.amount).toLocaleString()} FCFA</div>
                      <span className={`badge ${p.status === 'approved' ? 'badge-green' : p.status === 'rejected' ? 'badge-red' : 'badge-gold'}`}>
                        {p.status === 'approved' ? 'Approuvé' : p.status === 'rejected' ? 'Rejeté' : 'En attente'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
