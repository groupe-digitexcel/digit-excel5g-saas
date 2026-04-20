'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'

const packs = [
  { credits: 200,  price: 2000,  label: 'Pack Découverte' },
  { credits: 600,  price: 5000,  label: 'Pack Créateur',  popular: true },
  { credits: 1500, price: 10000, label: 'Pack Pro' },
  { credits: 5000, price: 25000, label: 'Pack Agence' },
]

type Step = 1 | 2 | 3
interface Pack { credits: number; price: number; label: string; popular?: boolean }

export default function BillingPage() {
  const [step, setStep] = useState<Step>(1)
  const [selected, setSelected] = useState<Pack | null>(null)
  const [method, setMethod] = useState<'MTN MoMo' | 'Orange Money'>('MTN MoMo')
  const [form, setForm] = useState({ reference: '', phone: '' })
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!form.reference.trim() || !form.phone.trim()) { toast.error('Référence et téléphone requis'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/payments/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method, amount: selected!.price, reference: form.reference, phone: form.phone }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setStep(3)
      toast.success('Paiement soumis!')
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Erreur') }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-6 animate-fade-up max-w-2xl">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl" style={{ background: 'rgba(245,179,1,0.12)', border: '1px solid rgba(245,179,1,0.25)' }}>💳</div>
        <h1 className="section-title text-2xl text-white">Facturation & Recharge</h1>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-2">
        {(['1', '2', '3'] as const).map((n, i) => {
          const labels = ['Choisir', 'Payer', 'Confirmation']
          const done = step > i + 1
          const active = step === i + 1
          return (
            <div key={n} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${done ? 'bg-emerald-500 text-white' : active ? 'bg-brand-500 text-white' : 'bg-white/10 text-white/40'}`}>
                {done ? '✓' : n}
              </div>
              <span className={`text-sm ${active ? 'text-white font-medium' : 'text-white/35'}`}>{labels[i]}</span>
              {i < 2 && <div className={`w-8 h-px ${step > i + 1 ? 'bg-emerald-500' : 'bg-white/10'}`} />}
            </div>
          )
        })}
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <>
          <h2 className="text-lg font-semibold text-white">Choisissez votre pack de crédits</h2>
          <div className="grid grid-cols-2 gap-3">
            {packs.map(pack => (
              <div key={pack.credits} onClick={() => setSelected(pack)}
                className={`relative p-5 rounded-2xl cursor-pointer transition-all ${selected?.credits === pack.credits ? 'border-brand-500/60 shadow-lg shadow-brand-500/15 scale-[1.02]' : 'border-surface hover:border-white/15'} border`}
                style={{ background: selected?.credits === pack.credits ? 'linear-gradient(145deg,rgba(15,76,255,0.18),rgba(0,212,255,0.04))' : 'var(--surface)' }}>
                {pack.popular && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-brand-500 to-accent whitespace-nowrap">⭐ Populaire</div>
                )}
                <div className="section-title text-2xl text-accent mb-0.5">{pack.credits.toLocaleString()}</div>
                <div className="text-xs text-white/40 mb-2">crédits</div>
                <div className="font-bold text-white text-lg">{pack.price.toLocaleString()} FCFA</div>
                <div className="text-xs text-white/35">{pack.label}</div>
              </div>
            ))}
          </div>
          <button onClick={() => selected && setStep(2)} disabled={!selected} className="btn btn-primary w-full">
            Continuer → {selected ? `(${selected.price.toLocaleString()} FCFA)` : ''}
          </button>
        </>
      )}

      {/* Step 2 */}
      {step === 2 && selected && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Payer {selected.price.toLocaleString()} FCFA</h2>
          <div className="flex gap-3">
            {(['MTN MoMo', 'Orange Money'] as const).map(m => (
              <button key={m} onClick={() => setMethod(m)}
                className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all border ${method === m ? (m === 'MTN MoMo' ? 'border-yellow-400/50 bg-yellow-400/12 text-yellow-400' : 'border-orange-400/50 bg-orange-400/12 text-orange-400') : 'border-surface text-white/45 hover:text-white'}`}>
                📱 {m}
              </button>
            ))}
          </div>

          <div className="p-4 rounded-xl space-y-1 text-sm"
            style={{ background: method === 'MTN MoMo' ? 'rgba(255,204,0,0.07)' : 'rgba(255,102,0,0.07)', border: `1px solid ${method === 'MTN MoMo' ? 'rgba(255,204,0,0.2)' : 'rgba(255,102,0,0.2)'}` }}>
            <div className="font-bold mb-2" style={{ color: method === 'MTN MoMo' ? '#FFCC00' : '#FF9944' }}>Instructions:</div>
            {[
              `1. Composez *126# sur votre téléphone`,
              `2. Envoyez ${selected.price.toLocaleString()} FCFA au numéro fourni par le support`,
              `3. Notez la référence de transaction`,
              `4. Renseignez-la ci-dessous`,
            ].map((line, i) => <div key={i} className="text-white/60">{line}</div>)}
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Référence de transaction *</label>
            <input className="input" placeholder="Ex: TXN1234567890" value={form.reference} onChange={e => setForm({ ...form, reference: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Votre numéro de téléphone *</label>
            <input className="input" placeholder="+237 6XX XXX XXX" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="btn btn-ghost">← Retour</button>
            <button onClick={submit} disabled={loading} className="btn btn-primary flex-1">
              {loading ? <><span className="spinner w-4 h-4" /> Envoi...</> : '✓ Soumettre le paiement'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="text-center py-12 space-y-4">
          <div className="text-5xl">✅</div>
          <h2 className="section-title text-2xl text-white">Paiement soumis!</h2>
          <p className="text-white/55 text-sm max-w-sm mx-auto leading-relaxed">
            Votre paiement de <strong className="text-white">{selected?.price.toLocaleString()} FCFA</strong> est en cours de vérification.<br />
            Vos crédits seront ajoutés dans les <strong className="text-yellow-400">30 minutes</strong>.
          </p>
          <div className="flex gap-3 justify-center">
            <a href="/dashboard" className="btn btn-primary no-underline">Retour au dashboard</a>
            <button onClick={() => { setStep(1); setSelected(null); setForm({ reference: '', phone: '' }) }} className="btn btn-ghost">Nouvelle recharge</button>
          </div>
        </div>
      )}
    </div>
  )
}
