'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'

const templates = [
  {
    id: 'product-intro',
    label: 'Intro Produit',
    icon: '📦',
    desc: 'Présentation animée de produit ou service',
    duration: 15,
    preview: '🎬 Titre fade-in · Logo · CTA final',
  },
  {
    id: 'event-promo',
    label: 'Promo Événement',
    icon: '🎉',
    desc: 'Annonce d\'événement style social media',
    duration: 10,
    preview: '🎉 Date · Lieu · Compte à rebours',
  },
  {
    id: 'tiktok-hook',
    label: 'TikTok Hook 9:16',
    icon: '📱',
    desc: 'Courte vidéo verticale style TikTok/Reels',
    duration: 15,
    preview: '⚡ Hook · Message · CTA',
  },
  {
    id: 'business-promo',
    label: 'Pub Business',
    icon: '💼',
    desc: 'Publicité professionnelle pour business',
    duration: 30,
    preview: '💼 Problème · Solution · Offre · Contact',
  },
  {
    id: 'birthday-video',
    label: 'Anniversaire',
    icon: '🎂',
    desc: 'Vidéo d\'anniversaire personnalisée',
    duration: 20,
    preview: '🎂 Confettis · Message · Musique',
  },
  {
    id: 'gospel-praise',
    label: 'Louange Gospel',
    icon: '🙏',
    desc: 'Vidéo de louange avec paroles animées',
    duration: 30,
    preview: '🙏 Paroles · Fond · Musique',
  },
]

const formats = [
  { id: '1920x1080', label: '16:9 HD', icon: '🖥️', desc: 'YouTube, Facebook' },
  { id: '1080x1920', label: '9:16 Vertical', icon: '📱', desc: 'TikTok, Reels, Stories' },
  { id: '1080x1080', label: '1:1 Carré', icon: '⬜', desc: 'Instagram, WhatsApp' },
]

interface VideoResult {
  jobId: string
  status: 'processing' | 'completed' | 'failed'
  videoUrl?: string
  thumbnailUrl?: string
  duration?: number
  format?: string
}

export default function VideoGeneratorPage() {
  const [template, setTemplate] = useState('product-intro')
  const [format, setFormat] = useState('1920x1080')
  const [form, setForm] = useState({
    brand: '',
    message: '',
    cta: '',
    color: '#0F4CFF',
    music: 'upbeat-african',
  })
  const [result, setResult] = useState<VideoResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'form' | 'processing' | 'done'>('form')
  const [progress, setProgress] = useState(0)

  const generate = async () => {
    if (!form.brand || !form.message) {
      toast.error('Nom de marque et message requis')
      return
    }
    setLoading(true)
    setStep('processing')
    setProgress(0)

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(p => {
        if (p >= 90) { clearInterval(progressInterval); return 90 }
        return p + Math.random() * 8
      })
    }, 800)

    try {
      const res = await fetch('/api/ai/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template, format, ...form }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      clearInterval(progressInterval)
      setProgress(100)
      setTimeout(() => {
        setResult(data)
        setStep('done')
        toast.success('Vidéo générée avec succès!')
      }, 500)
    } catch (e: unknown) {
      clearInterval(progressInterval)
      setStep('form')
      toast.error(e instanceof Error ? e.message : 'Erreur de génération')
    } finally {
      setLoading(false)
    }
  }

  const sel = templates.find(t => t.id === template)!
  const selFmt = formats.find(f => f.id === format)!

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl"
          style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)' }}>
          🎬
        </div>
        <div>
          <h1 className="section-title text-2xl text-white">Générateur de Vidéos IA</h1>
          <p className="text-white/45 text-sm">
            Coût: <span className="font-bold" style={{ color: '#a78bfa' }}>8 crédits</span> · Propulsé par HyperFrames
          </p>
        </div>
      </div>

      {/* NEW: HyperFrames badge */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
        style={{ background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.2)' }}>
        <span className="text-xl">⚡</span>
        <div>
          <span className="text-sm font-semibold text-white">Propulsé par HyperFrames</span>
          <span className="text-white/45 text-sm ml-2">— HTML → MP4 rendu côté serveur</span>
        </div>
        <a href="https://hyperframes.heygen.com" target="_blank" rel="noreferrer"
          className="ml-auto text-xs text-white/35 hover:text-white no-underline transition-colors">
          En savoir plus →
        </a>
      </div>

      {step === 'form' && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left — config */}
          <div className="space-y-4">
            {/* Template selector */}
            <div className="card p-5">
              <div className="text-sm font-medium text-white/70 mb-3">Modèle vidéo</div>
              <div className="grid grid-cols-2 gap-2">
                {templates.map(t => (
                  <button key={t.id} onClick={() => setTemplate(t.id)}
                    className={`p-3 rounded-xl text-left transition-all border ${
                      template === t.id
                        ? 'border-violet-500/50 bg-violet-500/12 text-white'
                        : 'border-surface bg-surface text-white/45 hover:text-white hover:border-white/20'
                    }`}>
                    <div className="text-lg mb-1">{t.icon}</div>
                    <div className="text-xs font-semibold">{t.label}</div>
                    <div className="text-xs opacity-60 mt-0.5">{t.duration}s</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Format */}
            <div className="card p-5">
              <div className="text-sm font-medium text-white/70 mb-3">Format de sortie</div>
              <div className="flex gap-2">
                {formats.map(f => (
                  <button key={f.id} onClick={() => setFormat(f.id)}
                    className={`flex-1 p-3 rounded-xl transition-all border text-center ${
                      format === f.id
                        ? 'border-violet-500/50 bg-violet-500/12 text-violet-300'
                        : 'border-surface bg-surface text-white/45 hover:text-white'
                    }`}>
                    <div className="text-xl mb-1">{f.icon}</div>
                    <div className="text-xs font-semibold">{f.label}</div>
                    <div className="text-xs opacity-50">{f.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Content fields */}
            <div className="card p-5 space-y-3">
              <div className="text-sm font-medium text-white/70 mb-1">Contenu de la vidéo</div>
              {[
                { key: 'brand', label: 'Nom de marque / Business *', placeholder: 'Ex: Digit-Excel5G, Boulangerie La Paix...' },
                { key: 'message', label: 'Message principal *', placeholder: 'Ex: L\'IA qui transforme vos idées en réalité...' },
                { key: 'cta', label: 'Appel à l\'action', placeholder: 'Ex: Appelez le +237 699 XXX XXX, Visitez notre site...' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-white/55 mb-1">{label}</label>
                  <input className="input" placeholder={placeholder}
                    value={(form as Record<string, string>)[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })} />
                </div>
              ))}

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-white/55 mb-1">Couleur principale</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={form.color}
                      onChange={e => setForm({ ...form, color: e.target.value })}
                      className="w-10 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer" />
                    <span className="text-sm font-mono text-white/50">{form.color}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-white/55 mb-1">Musique de fond</label>
                  <select className="input text-sm"
                    value={form.music}
                    onChange={e => setForm({ ...form, music: e.target.value })}>
                    <option value="upbeat-african">Afrobeat Joyeux</option>
                    <option value="gospel-praise">Gospel Louange</option>
                    <option value="corporate">Corporate Pro</option>
                    <option value="tiktok-trap">TikTok Trap</option>
                    <option value="makossa">Makossa</option>
                    <option value="none">Sans musique</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              onClick={generate}
              disabled={loading}
              className="btn w-full text-white font-bold py-3.5 rounded-2xl text-sm"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #5B21B6)' }}>
              🎬 Générer la Vidéo (8 crédits)
            </button>
          </div>

          {/* Right — preview info */}
          <div className="space-y-4">
            <div className="card p-5"
              style={{ background: 'linear-gradient(145deg, rgba(124,58,237,0.1), rgba(15,76,255,0.05))' }}>
              <div className="text-xs font-bold text-white/30 uppercase tracking-widest mb-3">Aperçu du modèle</div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{sel.icon}</span>
                <div>
                  <div className="font-bold text-white">{sel.label}</div>
                  <div className="text-sm text-white/45">{sel.desc}</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/45">Durée</span>
                  <span className="text-white font-semibold">{sel.duration} secondes</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/45">Format</span>
                  <span className="text-white font-semibold">{selFmt.label}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/45">Résolution</span>
                  <span className="text-white font-semibold">{format.replace('x', ' × ')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/45">Rendu</span>
                  <span className="text-white font-semibold">MP4 · H.264</span>
                </div>
              </div>
              <div className="mt-4 p-3 rounded-xl text-xs text-white/50 leading-relaxed"
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}>
                {sel.preview}
              </div>
            </div>

            {/* HyperFrames info */}
            <div className="card p-5">
              <div className="text-xs font-bold text-white/30 uppercase tracking-widest mb-3">Comment ça marche</div>
              {[
                ['1', 'Remplissez le formulaire', 'Votre marque, message et style'],
                ['2', 'HyperFrames génère le HTML', 'Composition animée avec GSAP'],
                ['3', 'Rendu MP4 côté serveur', 'Puppeteer + FFmpeg via HyperFrames'],
                ['4', 'Téléchargez votre vidéo', 'Stockée sur Supabase Storage'],
              ].map(([num, title, desc]) => (
                <div key={num} className="flex gap-3 mb-3 last:mb-0">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                    style={{ background: 'rgba(124,58,237,0.3)', color: '#a78bfa' }}>{num}</div>
                  <div>
                    <div className="text-sm font-medium text-white">{title}</div>
                    <div className="text-xs text-white/40">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Processing state */}
      {step === 'processing' && (
        <div className="card p-12 text-center"
          style={{ background: 'linear-gradient(145deg, rgba(124,58,237,0.08), rgba(15,76,255,0.04))' }}>
          <div className="text-5xl mb-5" style={{ animation: 'float 3s ease-in-out infinite' }}>🎬</div>
          <div className="section-title text-xl text-white mb-2">Génération en cours...</div>
          <div className="text-white/45 text-sm mb-6">
            HyperFrames rend votre composition HTML en MP4
          </div>
          <div className="max-w-sm mx-auto">
            <div className="flex justify-between text-xs text-white/40 mb-2">
              <span>Progression</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/8 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #7C3AED, #5B21B6)' }} />
            </div>
            <div className="mt-4 text-xs text-white/30 space-y-1">
              {progress < 20 && <div>⚙️ Génération de la composition HTML...</div>}
              {progress >= 20 && progress < 50 && <div>🎨 Application des animations GSAP...</div>}
              {progress >= 50 && progress < 80 && <div>📸 Capture des frames avec Puppeteer...</div>}
              {progress >= 80 && <div>🎞️ Encodage MP4 avec FFmpeg...</div>}
            </div>
          </div>
        </div>
      )}

      {/* Done state */}
      {step === 'done' && result && (
        <div className="space-y-4">
          <div className="card p-5"
            style={{ background: 'linear-gradient(145deg, rgba(124,58,237,0.1), rgba(15,76,255,0.05))', border: '1px solid rgba(139,92,246,0.25)' }}>
            <span className="badge-green mb-3 inline-block">✓ Vidéo générée avec succès</span>

            {/* Video player */}
            {result.videoUrl ? (
              <div className="rounded-xl overflow-hidden mb-4 bg-black">
                <video
                  src={result.videoUrl}
                  controls
                  className="w-full max-h-80 object-contain"
                  poster={result.thumbnailUrl}
                />
              </div>
            ) : (
              <div className="h-48 rounded-xl mb-4 flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="text-center text-white/30">
                  <div className="text-4xl mb-2">🎬</div>
                  <div className="text-sm">Vidéo prête</div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                ['Format', selFmt.label],
                ['Durée', `${sel.duration}s`],
                ['Codec', 'H.264 MP4'],
              ].map(([label, val]) => (
                <div key={label} className="text-center p-3 rounded-xl"
                  style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="text-xs text-white/35 mb-0.5">{label}</div>
                  <div className="text-sm font-bold text-white">{val}</div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              {result.videoUrl && (
                <a href={result.videoUrl} download="de5g-video.mp4" target="_blank" rel="noreferrer"
                  className="btn flex-1 text-sm font-bold py-3 rounded-xl no-underline text-white"
                  style={{ background: 'linear-gradient(135deg, #7C3AED, #5B21B6)' }}>
                  ⬇️ Télécharger MP4
                </a>
              )}
              <button onClick={() => { setStep('form'); setResult(null); setProgress(0) }}
                className="btn btn-ghost text-sm px-4">
                ↺ Nouvelle vidéo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
