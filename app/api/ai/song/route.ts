 import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import axios from 'axios'

const COST = 5

async function callAI(prompt: string): Promise<string | null> {
  // OpenRouter (primary)
  if (process.env.OPENROUTER_API_KEY) {
    try {
      const res = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'google/gemini-flash-1.5',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1200,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'HTTP-Referer': 'https://digit-excel5g.cm',
          },
        }
      )

      return res.data.choices?.[0]?.message?.content?.trim() || null
    } catch {}
  }

  // Gemini fallback
  if (process.env.GEMINI_API_KEY) {
    try {
      const res = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 1200 },
        }
      )

      return (
        res.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
        null
      )
    } catch {}
  }

  return null
}

export async function POST(req: Request) {
  const supabase = createClient()

  // 1. AUTH
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Non authentifié' },
      { status: 401 }
    )
  }

  // 2. INPUT
  const {
    occasion,
    brand,
    mood = 'gospel',
    language = 'Français',
    recipient = '',
    details = '',
  } = await req.json()

  if (!occasion) {
    return NextResponse.json(
      { error: 'Occasion requise' },
      { status: 400 }
    )
  }

  // 3. CREDIT DEDUCTION (FIXED — NO TYPES ISSUE)
  const { data: ok, error: rpcError } = await supabase.rpc(
    'deduct_credits',
    {
      p_user_id: user.id,
      p_amount: COST,
    } as any
  )

  if (rpcError || !ok) {
    return NextResponse.json(
      { error: 'Crédits insuffisants' },
      { status: 402 }
    )
  }

  // 4. PROMPT
  const moodGuides: Record<string, string> = {
    gospel: 'gospel africain chrétien uplifting',
    makossa: 'makossa camerounais authentique',
    afrobeat: 'afrobeat moderne festif',
    bikutsi: 'bikutsi beti rythmé joyeux',
    jingle: 'jingle publicitaire accrocheur mémorable',
    birthday: 'chanson anniversaire joyeuse touchante',
    wedding: 'chanson mariage romantique élégante',
    graduation: 'chanson diplôme fierté encouragement',
  }

  const prompt = `
Tu es auteur-compositeur camerounais talentueux.
Réponds UNIQUEMENT en JSON valide sans markdown.

Compose une chanson:
Occasion: ${occasion}
Nom: ${brand || 'non spécifié'}
Style: ${mood}
Langue: ${language}
Message: ${recipient}
Détails: ${details}

Structure:
Couplet 1, Refrain, Couplet 2, Refrain, Outro

JSON:
{
  "title": "titre de la chanson",
  "lyrics": "paroles complètes avec labels Couplet/Refrain",
  "musicPrompt": "style musical en anglais pour IA audio"
}

Style guide: ${moodGuides[mood] || mood}
`

  // 5. AI CALL
  const aiText = await callAI(prompt)

  let result: any

  try {
    const cleaned = aiText?.replace(/```json|```/g, '').trim()
    result = JSON.parse(cleaned || '')
  } catch {
    const name = brand || occasion

    result = {
      title: `${name} — Chanson Spéciale`,
      lyrics: `[Couplet 1]
En ce jour béni, nous célébrons avec joie,
${name}, tu brilles guidé(e) par la foi.

[Refrain]
${name}, nous te célébrons,
Avec amour et joie nous chantons.

[Couplet 2]
Tes efforts et ton courage sont visibles,
Tu avances avec grâce et dignité.

[Refrain]
${name}, nous te célébrons...

[Outro]
Dieu te bénisse ${name}!`,
      musicPrompt: `${mood} African inspirational music, choir, percussion, emotional uplifting`,
    }
  }

  // 6. SAVE JOB
  await supabase.from('ai_jobs').insert({
    user_id: user.id,
    job_type: 'song',
    prompt: JSON.stringify({ occasion, brand, mood }),
    output_data: result,
    status: 'completed',
    credits_used: COST,
    provider: 'multi-ai',
  } as any)

  return NextResponse.json(result)
}       
