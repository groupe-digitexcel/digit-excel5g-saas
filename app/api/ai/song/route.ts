import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import axios from 'axios'

const COST = 5

async function callAI(prompt: string): Promise<string | null> {
  if (process.env.OPENROUTER_API_KEY) {
    try {
      const res = await axios.post('https://openrouter.ai/api/v1/chat/completions',
        { model: 'google/gemini-flash-1.5', messages: [{ role: 'user', content: prompt }], max_tokens: 1200 },
        { headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`, 'HTTP-Referer': 'https://digit-excel5g.cm' } })
      return res.data.choices[0].message.content.trim()
    } catch { /* fallback */ }
  }
  if (process.env.GEMINI_API_KEY) {
    try {
      const res = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        { contents: [{ parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: 1200 } })
      return res.data.candidates[0].content.parts[0].text.trim()
    } catch { /* fallback */ }
  }
  return null
}

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { occasion, brand, mood = 'gospel', language = 'Français', recipient = '', details = '' } = await req.json()
  if (!occasion) return NextResponse.json({ error: 'Occasion requise' }, { status: 400 })

  const { data: ok } = await supabase.rpc('deduct_credits', { p_user_id: user.id, p_amount: COST })
  if (!ok) return NextResponse.json({ error: 'Crédits insuffisants' }, { status: 402 })

  const prompt = `Tu es auteur-compositeur camerounais talentueux. Réponds UNIQUEMENT en JSON valide sans markdown.
Compose une chanson: Occasion: ${occasion}, Nom: ${brand || 'non spécifié'}, Style: ${mood}, Langue: ${language}, Message: ${recipient}, Détails: ${details}
Structure: Couplet 1, Refrain, Couplet 2, Refrain, Outro
JSON: {"title":"titre de la chanson","lyrics":"paroles complètes avec labels Couplet/Refrain","musicPrompt":"style musical en anglais pour IA audio"}`

  const moodGuides: Record<string, string> = {
    gospel: 'gospel africain chrétien uplifting', makossa: 'makossa camerounais authentique', afrobeat: 'afrobeat moderne festif',
    bikutsi: 'bikutsi beti rythmé joyeux', jingle: 'jingle publicitaire accrocheur mémorable', birthday: 'chanson anniversaire joyeuse touchante',
    wedding: 'chanson mariage romantique élégante', graduation: 'chanson diplôme fierté encouragement',
  }

  let result: Record<string, string>
  const aiText = await callAI(prompt + ` Style guide: ${moodGuides[mood] || mood}`)
  try {
    result = JSON.parse(aiText?.replace(/```json|```/g, '').trim() || '')
  } catch {
    const name = brand || occasion
    result = {
      title: `${name} — Chanson Spéciale`,
      lyrics: `[Couplet 1]\nEn ce jour béni, nous célébrons avec joie,\n${name}, tu brilles guidé(e) par la foi.\n\n[Refrain]\n${name}, nous te célébrons,\nAvec amour et joie nous chantons.\nQue Dieu t'accompagne chaque jour,\nEt que ta vie soit pleine d'amour.\n\n[Couplet 2]\nTes efforts et ton courage, tout le monde les voit,\nTu avances avec grâce sur le bon chemin.\n\n[Refrain]\n${name}, nous te célébrons...\n\n[Outro]\nDieu te bénisse ${name}, à jamais!`,
      musicPrompt: `${mood} African inspirational song, uplifting choir, piano and percussion, warm joyful atmosphere`,
    }
  }

  await supabase.from('ai_jobs').insert({ user_id: user.id, job_type: 'song', prompt: JSON.stringify({ occasion, brand, mood }), output_data: result, status: 'completed', credits_used: COST, provider: 'openrouter' })
  return NextResponse.json(result)
}
