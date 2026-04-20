'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'

const moods = [
  { id: 'gospel',      label: 'Gospel',       icon: '🙏' },
  { id: 'makossa',     label: 'Makossa',      icon: '🇨🇲' },
  { id: 'afrobeat',    label: 'Afrobeat',     icon: '🥁' },
  { id: 'bikutsi',     label: 'Bikutsi',      icon: '🎶' },
  { id: 'jingle',      label: 'Jingle Pub',   icon: '📢' },
  { id: 'birthday',    label: 'Anniversaire', icon: '🎂' },
  { id: 'wedding',     label: 'Mariage',      icon: '💒' },
  { id: 'graduation',  label: 'Diplôme',      icon: '🎓' },
]
const langs = ['Français', 'English', 'Ewondo', 'Bamiléké', 'Douala', 'Fulfuldé', 'Franglais']

interface SongResult { title: string; lyrics: string; musicPrompt: string }

export default function SongGeneratorPage() {
  const [form, setForm] = useState({ occasion: '', brand: '', mood: 'gospel', language: 'Français', recipient: '', details: '' })
  const [result, setResult] = useState<SongResult | null>(null)
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    if (!form.occasion) { toast.error('Précisez l\'occasion ou le sujet'); return }
    setLoading(true); setResult(null)
    try {
      const res = await fetch('/api/ai/song', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data)
      toast.success('Chanson générée!')
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Erreur') }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl" style={{ background: 'rgba(0,196,140,0.12)', border: '1px solid rgba(0,196,140,0.25)' }}>🎵</div>
        <div>
          <h1 className="section-title text-2xl text-white">Chansons & Jingles IA</h1>
          <p className="text-white/45 text-sm">Coût: <span className="text-emerald-400 font-bold">5 crédits</span></p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-5 space-y-4">
          <div>
            <div className="text-sm font-medium text-white/70 mb-2">Style musical</div>
            <div className="grid grid-cols-4 gap-2">
              {moods.map(({ id, label, icon }) => (
                <button key={id} onClick={() => setForm({ ...form, mood: id })}
                  className={`py-2.5 rounded-xl text-xs font-medium transition-all border text-center ${form.mood === id ? 'border-emerald-400/50 bg-emerald-400/12 text-emerald-400' : 'border-surface bg-surface text-white/45 hover:text-white hover:border-white/20'}`}>
                  <div className="text-lg mb-0.5">{icon}</div>{label}
                </button>
              ))}
            </div>
          </div>

          {[
            { key: 'occasion',  label: 'Occasion / Sujet *',             placeholder: 'Ex: Anniversaire de Marie, Inauguration, Fête nationale...' },
            { key: 'brand',     label: 'Nom (personne ou marque)',        placeholder: 'Ex: Marie Nkodo, Boulangerie Star...' },
            { key: 'recipient', label: 'Message à transmettre',           placeholder: 'Ex: Merci pour ta fidélité, Joyeux anniversaire...' },
            { key: 'details',   label: 'Détails supplémentaires',         placeholder: 'Ex: Elle aime la danse, 10 ans de service...' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-white/70 mb-1.5">{label}</label>
              <input className="input" placeholder={placeholder} value={(form as Record<string,string>)[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
            </div>
          ))}

          <div>
            <div className="text-sm font-medium text-white/70 mb-2">Langue des paroles</div>
            <div className="flex flex-wrap gap-2">
              {langs.map(l => (
                <button key={l} onClick={() => setForm({ ...form, language: l })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${form.language === l ? 'border-emerald-400/50 bg-emerald-400/12 text-emerald-400' : 'border-surface text-white/45 hover:text-white'}`}>{l}</button>
              ))}
            </div>
          </div>

          <button onClick={generate} disabled={loading}
            className="btn w-full text-white font-bold py-3 rounded-xl"
            style={{ background: loading ? undefined : 'linear-gradient(135deg,#00C48C,#00A070)', opacity: loading ? 0.6 : 1 }}>
            {loading ? <><span className="spinner w-4 h-4" /> Composition...</> : '🎵 Générer les Paroles (5 crédits)'}
          </button>
        </div>

        {/* Result */}
        <div>
          {result ? (
            <div className="space-y-3 h-full">
              <div className="p-5 rounded-2xl" style={{ background: 'linear-gradient(145deg,rgba(0,196,140,0.08),rgba(15,76,255,0.05))', border: '1px solid rgba(0,196,140,0.2)' }}>
                <span className="badge-green mb-3 inline-block">🎵 Chanson générée</span>
                <h2 className="section-title text-xl text-white mb-4">{result.title}</h2>
                <div className="bg-black/30 border border-white/6 rounded-xl p-4 max-h-72 overflow-y-auto font-mono text-sm text-white/80 leading-7 whitespace-pre-wrap">
                  {result.lyrics}
                </div>
                {result.musicPrompt && (
                  <div className="mt-3 px-3 py-2 rounded-lg text-xs text-emerald-300/70" style={{ background: 'rgba(0,196,140,0.07)', border: '1px solid rgba(0,196,140,0.15)' }}>
                    <span className="font-bold uppercase tracking-wider opacity-60">🎼 Prompt musical (Suno/Udio)</span>
                    <p className="mt-1 opacity-80">{result.musicPrompt}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={() => navigator.clipboard.writeText(`${result.title}\n\n${result.lyrics}`).then(() => toast.success('Paroles copiées!'))} className="btn btn-primary flex-1 text-sm">📋 Copier les paroles</button>
                <button onClick={() => setResult(null)} className="btn btn-ghost text-sm px-4">↺ Nouveau</button>
              </div>
            </div>
          ) : (
            <div className="card flex items-center justify-center min-h-80">
              {loading
                ? <div className="text-center space-y-3"><div className="text-4xl animate-float">🎵</div><div className="text-white/50 text-sm">Composition en cours...</div></div>
                : <div className="text-center text-white/20"><div className="text-5xl mb-2 opacity-20">🎼</div><p className="text-sm">Vos paroles apparaîtront ici</p></div>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
