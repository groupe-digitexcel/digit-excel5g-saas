import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import axios from 'axios'
import { runAiJob } from '@/lib/ai/ai-pipeline'

const COST = 5

async function callAI(prompt: string): Promise<string | null> {
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
      return res.data.choices[0].message.content.trim()
    } catch {}
  }

  if (process.env.GEMINI_API_KEY) {
    try {
      const res = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 1200 },
        }
      )
      return res.data.candidates[0].content.parts[0].text.trim()
    } catch {}
  }

  return null
}

export async function POST(req: Request) {
  const supabase = createClient()

  // 1. AUTH
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
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

  // 3. AI GENERATION (no credit logic here anymore)
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
Que Dieu t'accompagne chaque jour,
Et que ta vie soit pleine d'amour.

[Couplet 2]
Tes efforts et ton courage, tout le monde les voit,
Tu avances avec grâce sur le bon chemin.

[Refrain]
${name}, nous te célébrons...

[Outro]
Dieu te bénisse ${name}, à jamais!`,
      musicPrompt: `${mood} African inspirational song, uplifting choir, piano and percussion`,
    }
  }

  try {
    // 4. CENTRALIZED AI PIPELINE (CREDIT + SAVE)
    await runAiJob({
      userId: user.id,
      cost: COST,
      prompt: JSON.stringify({ occasion, brand, mood }),
      type: 'song',

      generate: async () => {
        // song output is already generated above
        return 'internal://song-generated'
      },
    })

    // 5. SAVE FINAL RESULT
    await supabase.from('ai_jobs').insert({
      user_id: user.id,
      job_type: 'song',
      prompt: JSON.stringify({ occasion, brand, mood }),
      output_data: result,
      status: 'completed',
      credits_used: COST,
      provider: 'openrouter',
    } as any)

    return NextResponse.json(result)
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
