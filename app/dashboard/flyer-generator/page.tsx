'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'

const flyerTypes = [
  { id: 'business',    label: 'Business',     icon: '💼' },
  { id: 'event',       label: 'Événement',    icon: '🎉' },
  { id: 'promo',       label: 'Promotion',    icon: '🏷️' },
  { id: 'church',      label: 'Église',       icon: '⛪' },
  { id: 'restaurant',  label: 'Restaurant',   icon: '🍽️' },
  { id: 'service',     label: 'Service',      icon: '🔧' },
]
const langs = ['Français', 'English', 'Franglais']

interface FlyerResult { headline: string; subtitle: string; body: string; cta: string; imagePrompt: string }

export default function FlyerGeneratorPage() {
  const [form, setForm] = useState({ type: 'business', brand: '', offer: '', contact: '', language: 'Français', details: '' })
  const [result, setResult] = useState<FlyerResult | null>(null)
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    if (!form.brand || !form.offer) { toast.error('Nom de marque et offre requis'); return }
    setLoading(true); setResult(null)
    try {
      const res = await fetch('/api/ai/flyer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data)
      toast.success('Flyer généré!')
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Erreur') }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl" style={{ background: 'rgba(245,179,1,0.12)', border: '1px solid rgba(245,179,1,0.25)' }}>📋</div>
        <div>
          <h1 className="section-title text-2xl text-white">Créateur de Flyers IA</h1>
          <p className="text-white/45 text-sm">Coût: <span className="text-yellow-400 font-bold">4 crédits</span></p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="card p-5 space-y-4">
          <div>
            <div className="text-sm font-medium text-white/70 mb-2">Type de flyer</div>
            <div className="grid grid-cols-3 gap-2">
              {flyerTypes.map(({ id, label, icon }) => (
                <button key={id} onClick={() => setForm({ ...form, type: id })}
                  className={`py-2.5 rounded-xl text-xs font-medium transition-all border text-center ${form.type === id ? 'border-yellow-400/50 bg-yellow-400/12 text-yellow-400' : 'border-surface bg-surface text-white/45 hover:text-white hover:border-white/20'}`}>
                  <div className="text-lg mb-0.5">{icon}</div>{label}
                </button>
              ))}
            </div>
          </div>

          {[
            { key: 'brand',   label: 'Nom de la marque / Business *', placeholder: 'Ex: Boulangerie La Paix, MTN...' },
            { key: 'offer',   label: 'Offre / Message principal *',    placeholder: 'Ex: -50% ce weekend, Nouveau menu...' },
            { key: 'contact', label: 'Contact (téléphone / WhatsApp)', placeholder: '+237 699 XXX XXX' },
            { key: 'details', label: 'Détails supplémentaires',        placeholder: 'Adresse, horaires, conditions...' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-white/70 mb-1.5">{label}</label>
              {key === 'details'
                ? <textarea className="input resize-none" rows={2} placeholder={placeholder} value={(form as Record<string,string>)[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
                : <input className="input" placeholder={placeholder} value={(form as Record<string,string>)[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />}
            </div>
          ))}

          <div>
            <div className="text-sm font-medium text-white/70 mb-2">Langue</div>
            <div className="flex gap-2">
              {langs.map(l => (
                <button key={l} onClick={() => setForm({ ...form, language: l })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${form.language === l ? 'border-yellow-400/50 bg-yellow-400/12 text-yellow-400' : 'border-surface text-white/45 hover:text-white'}`}>{l}</button>
              ))}
            </div>
          </div>

          <button onClick={generate} disabled={loading} className="btn btn-gold w-full">
            {loading ? <><span className="spinner w-4 h-4 border-t-ink" /> Génération...</> : '📋 Générer le Flyer (4 crédits)'}
          </button>
        </div>

        {/* Result */}
        <div>
          {result ? (
            <div className="space-y-3">
              <div className="p-6 rounded-2xl" style={{ background: 'linear-gradient(145deg, rgba(245,179,1,0.1), rgba(15,76,255,0.06))', border: '1px solid rgba(245,179,1,0.2)' }}>
                <span className="badge-gold mb-3 inline-block">✓ Flyer généré</span>
                <h2 className="section-title text-2xl text-white mb-2">{result.headline}</h2>
                <p className="text-white/70 text-sm mb-3 leading-relaxed">{result.subtitle}</p>
                {result.body && <p className="text-white/55 text-sm mb-4 leading-relaxed">{result.body}</p>}
                <div className="px-4 py-3 rounded-xl mb-3" style={{ background: 'rgba(245,179,1,0.12)', border: '1px solid rgba(245,179,1,0.25)' }}>
                  <div className="text-xs text-yellow-400/60 font-bold uppercase tracking-wider mb-1">Appel à l&apos;action</div>
                  <div className="text-yellow-400 font-bold">{result.cta}</div>
                </div>
                {form.contact && <div className="text-white/45 text-sm">📞 {form.contact}</div>}
              </div>
              {result.imagePrompt && (
                <div className="card p-4 text-xs text-white/45">
                  <span className="text-white/30 font-bold uppercase tracking-wider">💡 Prompt image IA</span>
                  <p className="mt-1 leading-relaxed">{result.imagePrompt}</p>
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={() => navigator.clipboard.writeText(`${result.headline}\n\n${result.subtitle}\n\n${result.body}\n\nCTA: ${result.cta}`).then(() => toast.success('Copié!'))} className="btn btn-primary flex-1 text-sm">📋 Copier</button>
                <button onClick={() => { setResult(null) }} className="btn btn-ghost text-sm px-4">↺ Nouveau</button>
              </div>
            </div>
          ) : (
            <div className="card flex items-center justify-center min-h-80">
              {loading ? (
                <div className="text-center space-y-3"><div className="text-4xl animate-float">📝</div><div className="text-white/50 text-sm">Création en cours...</div></div>
              ) : (
                <div className="text-center text-white/20"><div className="text-5xl mb-2 opacity-20">📋</div><p className="text-sm">Votre flyer apparaîtra ici</p></div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
