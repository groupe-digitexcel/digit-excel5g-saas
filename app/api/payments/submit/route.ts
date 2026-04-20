// app/api/payments/submit/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { method, amount, reference, phone } = await req.json()
  if (!method || !amount || !reference || !phone) return NextResponse.json({ error: 'Tous les champs sont requis' }, { status: 400 })
  if (!['MTN MoMo', 'Orange Money'].includes(method)) return NextResponse.json({ error: 'Méthode invalide' }, { status: 400 })

  const { error } = await supabase.from('payments').insert({
    user_id: user.id, method, amount: parseFloat(amount),
    reference: reference.trim(), payer_phone: phone.trim(),
    status: 'pending', credits_awarded: 0,
  })

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'Cette référence a déjà été soumise' }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Paiement soumis. Vos crédits seront ajoutés dans 30 minutes.' })
}
