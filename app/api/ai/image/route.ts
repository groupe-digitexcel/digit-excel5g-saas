import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import axios from 'axios'

const COST = 3

async function generateImage(prompt: string): Promise<string> {
  if (!process.env.REPLICATE_API_KEY) {
    return `https://picsum.photos/seed/${encodeURIComponent(
      prompt.slice(0, 10)
    )}/1024/1024`
  }

  const start = await axios.post(
    'https://api.replicate.com/v1/predictions',
    {
      version:
        'ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4',
      input: {
        prompt,
        negative_prompt: 'blurry, low quality, nsfw',
        width: 1024,
        height: 1024,
        num_inference_steps: 25,
      },
    },
    {
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  )

  const id = start.data.id

  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 1500)) // faster polling

    const poll = await axios.get(
      `https://api.replicate.com/v1/predictions/${id}`,
      {
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_KEY}`,
        },
      }
    )

    const status = poll.data.status

    if (status === 'succeeded') {
      return poll.data.output?.[0]
    }

    if (status === 'failed' || status === 'canceled') {
      throw new Error('Génération échouée')
    }
  }

  throw new Error('Timeout génération image')
}

export async function POST(req: Request) {
  const supabase = createClient()

  let userId: string | null = null

  try {
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

    userId = user.id

    // 2. INPUT
    const { prompt } = await req.json()

    if (!prompt?.trim()) {
      return NextResponse.json(
        { error: 'Prompt requis' },
        { status: 400 }
      )
    }

    // 3. PRE-DEDUCT (safe approach)
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

    let url: string

    try {
      // 4. GENERATE IMAGE
      url = await generateImage(prompt)
    } catch (genError) {
      // 5. ROLLBACK credits ONLY if generation fails
      await supabase.rpc(
        'deduct_credits',
        {
          p_user_id: user.id,
          p_amount: -COST,
        } as any
      )

      throw genError
    }

    // 6. SAVE JOB (safe non-blocking)
    await supabase.from('ai_jobs').insert({
      user_id: user.id,
      job_type: 'image',
      prompt,
      output_url: url,
      status: 'completed',
      credits_used: COST,
      provider: 'replicate',
    } as any)

    // 7. RESPONSE
    return NextResponse.json({ url })
  } catch (e: unknown) {
    console.error('AI IMAGE ERROR:', e)

    return NextResponse.json(
      {
        error: e instanceof Error ? e.message : 'Erreur IA',
      },
      { status: 500 }
    )
  }
}
