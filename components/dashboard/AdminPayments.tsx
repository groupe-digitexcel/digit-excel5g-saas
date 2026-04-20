'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'

interface Payment {
  id: string; method: string; amount: number; reference: string;
  payer_phone: string | null; status: string; credits_awarded: number; created_at: string;
  profiles?: { name: string; email: string } | null
}

export default function AdminPayments({ payments: initial }: { payments: Payment[] }) {
  const [payments, setPayments] = useState(initial)
  const [loading, setLoading] = useState<string | null>(null)

  const verify = async (id: string) => {
    setLoading(id)
    try {
      const res = await fetch('/api/payments/verify', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(data.message)
      setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'approved' } : p))
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Erreur') }
    finally { setLoading(null) }
  }

  const pending = payments.filter(p => p.status === 'pending')

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title text-lg text-white">Paiements ({payments.length})</h2>
        {pending.length > 0 && <span className="badge-gold">{pending.length} en attente</span>}
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface">
                {['Utilisateur', 'Méthode', 'Montant', 'Référence', 'Téléphone', 'Statut', 'Date', 'Action'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-white/35 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface">
              {payments.map(p => (
                <tr key={p.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-5 py-3">
                    <div className="text-white font-medium text-xs">{p.profiles?.name ?? '—'}</div>
                    <div className="text-white/35 text-xs">{p.profiles?.email ?? '—'}</div>
                  </td>
                  <td className="px-5 py-3 font-semibold text-xs whitespace-nowrap" style={{ color: p.method === 'MTN MoMo' ? '#FFCC00' : '#FF9944' }}>{p.method}</td>
                  <td className="px-5 py-3 font-bold text-white">{Number(p.amount).toLocaleString()} FCFA</td>
                  <td className="px-5 py-3 font-mono text-xs text-white/50">{p.reference}</td>
                  <td className="px-5 py-3 text-white/40 text-xs">{p.payer_phone}</td>
                  <td className="px-5 py-3">
                    <span className={p.status === 'approved' ? 'badge-green' : p.status === 'rejected' ? 'badge-red' : 'badge-gold'}>
                      {p.status === 'approved' ? 'Approuvé' : p.status === 'rejected' ? 'Rejeté' : 'En attente'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-white/30 text-xs">{new Date(p.created_at).toLocaleDateString('fr-CM')}</td>
                  <td className="px-5 py-3">
                    {p.status === 'pending' && (
                      <button onClick={() => verify(p.id)} disabled={loading === p.id}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                        style={{ background: 'rgba(0,196,140,0.15)', border: '1px solid rgba(0,196,140,0.3)', color: '#00C48C' }}>
                        {loading === p.id ? '...' : '✓ Approuver'}
                      </button>
                    )}
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
