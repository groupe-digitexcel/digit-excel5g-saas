// app/api/ai/flyer/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import axios from 'axios'

const COST = 4

async function callAI(prompt: string): Promise<string | null> {
  if (process.env.OPENROUTER_API_KEY) {
    try {
      const res = await axios.post('https://openrouter.ai/api/v1/chat/completions',
        { model: 'google/gemini-flash-1.5', messages: [{ role: 'user', content: prompt }], max_tokens: 800 },
        { headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`, 'HTTP-Referer': 'https://digit-excel5g.cm', 'X-Title': 'DE5G AI Studio' } })
      return res.data.choices[0].message.content.trim()
    } catch { /* fallback */ }
  }
  if (process.env.GEMINI_API_KEY) {
    try {
      const res = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        { contents: [{ parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: 800 } })
      return res.data.candidates[0].content.parts[0].text.trim()
    } catch { /* fallback */ }
  }
  return null
}

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const body = await req.json()
  const { brand, offer, contact, type = 'business', language = 'Français', details = '' } = body
  if (!brand || !offer) return NextResponse.json({ error: 'Marque et offre requises' }, { status: 400 })

  const { data: ok } = await supabase.rpc('deduct_credits', { p_user_id: user.id, p_amount: COST })
  if (!ok) return NextResponse.json({ error: 'Crédits insuffisants' }, { status: 402 })

  const prompt = `Tu es expert en publicité africaine, spécialisé Cameroun. Réponds UNIQUEMENT en JSON valide sans markdown.
Crée un contenu flyer pour: Marque: ${brand}, Type: ${type}, Offre: ${offer}, Contact: ${contact}, Langue: ${language}, Détails: ${details}
JSON: {"headline":"titre court accrocheur","subtitle":"sous-titre 15 mots max","body":"texte principal 2-3 phrases","cta":"appel action 6 mots","imagePrompt":"description image IA en anglais style africain professionnel"}`

  let result: Record<string, string>
  const aiText = await callAI(prompt)
  try {
    result = JSON.parse(aiText?.replace(/```json|```/g, '').trim() || '')
  } catch {
    result = { headline: `${brand} — ${offer}`, subtitle: 'La meilleure offre de la saison', body: `Profitez de cette offre exceptionnelle. Qualité garantie, service professionnel. Ne manquez pas cette opportunité!`, cta: `Contactez-nous maintenant!`, imagePrompt: `Professional ${type} advertising for ${brand} in Cameroon, African style` }
  }

  await supabase.from('ai_jobs').insert({ user_id: user.id, job_type: 'flyer', prompt: JSON.stringify({ brand, offer }), output_data: result, status: 'completed', credits_used: COST, provider: 'openrouter' })
  return NextResponse.json(result)
}
