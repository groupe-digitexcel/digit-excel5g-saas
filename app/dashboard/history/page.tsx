import { createClient } from '@/lib/supabase/server'

const typeMap: Record<string, [string, string]> = {
  image: ['🎨', 'Image générée'],
  photo: ['📷', 'Photo traitée'],
  flyer: ['📋', 'Flyer créé'],
  song:  ['🎵', 'Chanson générée'],
  video: ['🎬', 'Vidéo générée'],
}

export default async function HistoryPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: jobs } = await supabase
    .from('ai_jobs')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="section-title text-2xl text-white mb-1">Historique des Créations</h1>
        <p className="text-white/45 text-sm">{jobs?.length ?? 0} création(s) au total</p>
      </div>

      {!jobs?.length ? (
        <div className="card p-16 text-center">
          <div className="text-5xl mb-3 opacity-20">📂</div>
          <p className="text-white/40 text-sm">Aucune création pour l&apos;instant.<br />Utilisez un outil IA pour commencer!</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="divide-y divide-surface">
            {jobs.map((job) => {
              const [icon, label] = typeMap[job.job_type] ?? ['⚙️', job.job_type]
              return (
                <div key={job.id} className="flex items-center justify-between px-6 py-4 hover:bg-white/2 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{icon}</span>
                    <div>
                      <div className="text-sm font-medium text-white">{label}</div>
                      {job.prompt && (
                        <div className="text-xs text-white/35 mt-0.5 max-w-sm truncate">{String(job.prompt).slice(0, 80)}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-xs text-white/30 text-right">
                      <div>{new Date(job.created_at).toLocaleDateString('fr-CM', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                      <div className="mt-0.5">{job.credits_used} cr.</div>
                    </div>
                    <span className={`badge ${job.status === 'completed' ? 'badge-green' : job.status === 'failed' ? 'badge-red' : 'badge-gold'}`}>
                      {job.status === 'completed' ? '✓ Fait' : job.status === 'failed' ? '✕ Échoué' : '⏳ En cours'}
                    </span>
                    {job.output_url && (
                      <a href={job.output_url} target="_blank" rel="noreferrer"
                        className="text-accent text-sm hover:underline no-underline">⬇️</a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
