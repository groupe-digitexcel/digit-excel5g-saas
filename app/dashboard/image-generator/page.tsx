'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'

const styles = [
  { id: 'realistic', label: 'Réaliste', icon: '📸' },
  { id: 'cinematic', label: 'Cinéma', icon: '🎬' },
  { id: 'oil-painting', label: 'Peinture', icon: '🖼️' },
  { id: '3d-render', label: '3D', icon: '🔮' },
  { id: 'watercolor', label: 'Aquarelle', icon: '🎨' },
  { id: 'african-art', label: 'Art Africain', icon: '🌍' },
]

const examples = [
  'Un entrepreneur africain souriant en costume moderne devant Douala',
  'Logo moderne pour une startup tech camerounaise, fond noir',
  'Une femme africaine en tenue traditionnelle bamiléké dans un jardin',
  'Paysage du Mont Cameroun au lever du soleil, couleurs vibrantes',
  'Marché traditionnel de Yaoundé animé, style peinture africaine',
]

export default function ImageGeneratorPage() {
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState('realistic')
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    if (!prompt.trim()) { toast.error('Décrivez l\'image à générer'); return }
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/ai/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: `${prompt}, style: ${style}` }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur de génération')
      setResult(data.url)
      toast.success('Image générée avec succès!')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl" style={{ background: 'rgba(15,76,255,0.15)', border: '1px solid rgba(15,76,255,0.3)' }}>🎨</div>
        <div>
          <h1 className="section-title text-2xl text-white">Générateur d&apos;Images IA</h1>
          <p className="text-white/45 text-sm">Coût: <span className="text-accent font-bold">3 crédits</span> par image</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="space-y-4">
          <div className="card p-5">
            <label className="block text-sm font-medium text-white/70 mb-2">Décrivez votre image</label>
            <textarea className="input resize-none" rows={5}
              placeholder="Ex: Un entrepreneur camerounais souriant en costume bleu devant une ville moderne au coucher du soleil..."
              value={prompt} onChange={e => setPrompt(e.target.value)} />
            <div className="text-xs text-white/25 mt-1 text-right">{prompt.length}/500</div>

            <div className="mt-4">
              <div className="text-sm font-medium text-white/70 mb-2">Style artistique</div>
              <div className="flex flex-wrap gap-2">
                {styles.map(({ id, label, icon }) => (
                  <button key={id} onClick={() => setStyle(id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${style === id ? 'bg-brand-500/25 border-brand-500/60 text-brand-400' : 'bg-white/5 border-white/10 text-white/50 hover:text-white'} border`}>
                    {icon} {label}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={generate} disabled={loading}
              className="btn btn-primary w-full mt-4">
              {loading ? <><span className="spinner w-4 h-4" /> Génération...</> : '🎨 Générer (3 crédits)'}
            </button>
          </div>

          {/* Examples */}
          <div className="card p-4">
            <div className="text-xs font-semibold text-white/35 uppercase tracking-widest mb-3">💡 Exemples</div>
            {examples.map(ex => (
              <button key={ex} onClick={() => setPrompt(ex)}
                className="block w-full text-left text-xs text-white/45 hover:text-accent py-1.5 border-b border-white/5 last:border-0 transition-colors">
                → {ex}
              </button>
            ))}
          </div>
        </div>

        {/* Result */}
        <div className="card flex items-center justify-center min-h-[400px]" style={{ padding: loading || result ? '1.25rem' : '2rem' }}>
          {loading ? (
            <div className="text-center space-y-4 w-full">
              <div className="text-5xl animate-float">🎨</div>
              <div className="text-white/60 text-sm">Génération en cours...</div>
              <div className="w-48 h-1.5 rounded-full bg-white/8 overflow-hidden mx-auto">
                <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent animate-shimmer" style={{ backgroundSize: '200% 100%', width: '100%' }} />
              </div>
              <div className="text-white/30 text-xs">Cela prend 15–30 secondes</div>
            </div>
          ) : result ? (
            <div className="w-full space-y-3">
              <img src={result} alt="Image générée" className="w-full rounded-xl object-cover max-h-80" />
              <div className="flex gap-2">
                <a href={result} download="de5g-image.png" target="_blank" rel="noreferrer"
                  className="btn btn-primary flex-1 no-underline text-sm">⬇️ Télécharger</a>
                <button onClick={() => { setResult(null); setPrompt('') }} className="btn btn-ghost text-sm px-4">+ Nouveau</button>
              </div>
            </div>
          ) : (
            <div className="text-center text-white/20">
              <div className="text-6xl mb-3 opacity-20">🖼️</div>
              <p className="text-sm">Votre image apparaîtra ici</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
