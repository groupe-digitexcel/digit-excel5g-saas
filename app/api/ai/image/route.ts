// app/api/ai/image/route.ts

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

  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 2000))

    const poll = await axios.get(
      `https://api.replicate.com/v1/predictions/${id}`,
      {
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_KEY}`,
        },
      }
    )

    if (poll.data.status === 'succeeded') {
      return poll.data.output[0]
    }

    if (poll.data.status === 'failed') {
      throw new Error('Génération échouée')
    }
  }

  throw new Error('Timeout')
}

export async function POST(req: Request) {
  const supabase = createClient()

  try {
    // 1. Auth
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

    // 2. Body
    const { prompt } = await req.json()

    if (!prompt?.trim()) {
      return NextResponse.json(
        { error: 'Prompt requis' },
        { status: 400 }
      )
    }

    // 3. Deduct credits (FIXED TYPE ISSUE)
    const { data: ok, error: rpcError } = await supabase.rpc<boolean>(
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

    // 4. Generate image
    const url = await generateImage(prompt)

    // 5. Save job
    const { error: insertError } = await supabase.from('ai_jobs').insert({
      user_id: user.id,
      job_type: 'image',
      prompt,
      output_url: url,
      status: 'completed',
      credits_used: COST,
      provider: 'replicate',
    })

    if (insertError) {
      // optional: log but don’t fail request
      console.error('Insert error:', insertError.message)
    }

    // 6. Response
    return NextResponse.json({ url })
  } catch (e: unknown) {
    console.error('AI Image Error:', e)

    // OPTIONAL rollback (safe version)
    try {
      await supabase.rpc('deduct_credits', {
        p_user_id: (await supabase.auth.getUser()).data.user?.id,
        p_amount: -COST,
      } as any)
    } catch (rollbackError) {
      console.error('Rollback failed:', rollbackError)
    }

    return NextResponse.json(
      {
        error: e instanceof Error ? e.message : 'Erreur IA',
      },
      { status: 500 }
    )
  }
}
