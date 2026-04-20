'use client'
import { useState, useRef } from 'react'
import toast from 'react-hot-toast'

const treatments = [
  { id: 'upscale',   label: 'Upscale 4K',           icon: '🔍', desc: 'Augmenter la résolution 4x',   cost: 2 },
  { id: 'restore',   label: 'Restauration Faciale',  icon: '✨', desc: 'Améliorer les visages flous',  cost: 2 },
  { id: 'bg-remove', label: 'Supprimer le Fond',     icon: '✂️', desc: 'Fond transparent professionnel',cost: 2 },
  { id: 'colorize',  label: 'Colorisation',          icon: '🎨', desc: 'Coloriser photo noir & blanc', cost: 3 },
  { id: 'denoise',   label: 'Réduction du Bruit',    icon: '🧹', desc: 'Éliminer grain et artefacts',  cost: 2 },
]

export default function PhotoTreatmentPage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [type, setType] = useState('upscale')
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File) => {
    if (!f.type.startsWith('image/')) { toast.error('Fichier image requis (JPG, PNG, WEBP)'); return }
    if (f.size > 10 * 1024 * 1024) { toast.error('Taille maximale: 10 MB'); return }
    setFile(f); setResult(null)
    const reader = new FileReader()
    reader.onloadend = () => setPreview(reader.result as string)
    reader.readAsDataURL(f)
  }

  const process = async () => {
    if (!file) { toast.error('Sélectionnez une image'); return }
    setLoading(true); setResult(null)
    try {
      const fd = new FormData()
      fd.append('image', file)
      fd.append('type', type)
      const res = await fetch('/api/ai/photo', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data.url)
      toast.success('Photo traitée!')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erreur de traitement')
    } finally {
      setLoading(false)
    }
  }

  const sel = treatments.find(t => t.id === type)!

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl" style={{ background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.25)' }}>📷</div>
        <div>
          <h1 className="section-title text-2xl text-white">Traitement Photo IA</h1>
          <p className="text-white/45 text-sm">Upscale · Restauration · Fond · Colorisation</p>
        </div>
      </div>

      {/* Treatment type */}
      <div className="flex flex-wrap gap-2">
        {treatments.map(({ id, label, icon, cost }) => (
          <button key={id} onClick={() => setType(id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${type === id ? 'border-accent/50 bg-accent/12 text-accent' : 'border-surface bg-surface text-white/50 hover:text-white hover:border-white/20'}`}>
            {icon} {label} · <span className="text-xs opacity-70">{cost}cr</span>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upload */}
        <div className="space-y-4">
          <div className="card p-5 min-h-56 flex flex-col items-center justify-center cursor-pointer transition-all hover:border-white/15"
            onClick={() => inputRef.current?.click()}
            onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
            onDragOver={e => e.preventDefault()}>
            {preview ? (
              <img src={preview} alt="Aperçu" className="max-w-full max-h-48 rounded-xl object-contain" />
            ) : (
              <div className="text-center text-white/30">
                <div className="text-5xl mb-3 opacity-30">📁</div>
                <div className="text-sm">Glissez votre image ici</div>
                <div className="text-xs mt-1 opacity-60">ou cliquez · JPG PNG WEBP · max 10MB</div>
              </div>
            )}
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
          </div>

          {file && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/40 truncate">📎 {file.name}</span>
              <button onClick={() => { setFile(null); setPreview(null); setResult(null) }} className="text-red-400 text-xs hover:text-red-300">✕ Retirer</button>
            </div>
          )}

          <div className="px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(0,212,255,0.07)', border: '1px solid rgba(0,212,255,0.2)' }}>
            <span className="font-semibold text-accent">{sel.icon} {sel.label}</span>
            <span className="text-white/50 ml-2">{sel.desc}</span>
          </div>

          <button onClick={process} disabled={loading || !file} className="btn btn-primary w-full">
            {loading ? <><span className="spinner w-4 h-4" /> Traitement...</> : `✨ Traiter (${sel.cost} crédits)`}
          </button>
        </div>

        {/* Result */}
        <div className="card flex items-center justify-center min-h-64">
          {loading ? (
            <div className="text-center space-y-3">
              <div className="text-4xl animate-float">⚙️</div>
              <div className="text-white/50 text-sm">Traitement IA en cours...</div>
            </div>
          ) : result ? (
            <div className="w-full p-4 space-y-3">
              <div className="badge-green mb-2">✓ Traitement terminé</div>
              <img src={result} alt="Résultat" className="w-full rounded-xl max-h-72 object-contain" />
              <a href={result} download="photo-traitee.png" target="_blank" rel="noreferrer"
                className="btn btn-primary w-full no-underline">⬇️ Télécharger</a>
            </div>
          ) : (
            <div className="text-center text-white/20">
              <div className="text-5xl mb-2 opacity-20">✨</div>
              <p className="text-sm">Le résultat apparaîtra ici</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
