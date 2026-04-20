import { createAdminClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const CREDITS_TABLE: Record<number, number> = { 2000: 200, 5000: 600, 10000: 1500, 25000: 5000 }
function getCredits(amount: number): number { return CREDITS_TABLE[amount] ?? Math.floor(amount / 10) }

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Admin seulement' }, { status: 403 })

  const { paymentId, creditsOverride } = await req.json()
  const admin = createAdminClient()

  const { data: payment } = await admin.from('payments').select('*').eq('id', paymentId).single()
  if (!payment) return NextResponse.json({ error: 'Paiement introuvable' }, { status: 404 })
  if (payment.status === 'approved') return NextResponse.json({ error: 'Déjà approuvé' }, { status: 400 })

  const credits = creditsOverride || getCredits(Number(payment.amount))

  await admin.from('payments').update({ status: 'approved', credits_awarded: credits, verified_by: user.id }).eq('id', paymentId)
  await admin.rpc('deduct_credits', { p_user_id: payment.user_id, p_amount: -credits })

  return NextResponse.json({ message: `Approuvé. ${credits} crédits ajoutés.` })
}
