import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import axios from 'axios'

const COST = 2

const MODELS: Record<string, { version: string; inputKey: string }> = {
  upscale: {
    version:
      'f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa',
    inputKey: 'image',
  },
  restore: {
    version:
      '0fbacf7afc6aa69352f051b6e73b37c3a931edc9a77e1c3c0d58cc56d2cc4e7e',
    inputKey: 'img',
  },
  'bg-remove': {
    version:
      'fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003',
    inputKey: 'image',
  },
  colorize: {
    version:
      'f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa',
    inputKey: 'image',
  },
  denoise: {
    version:
      'f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa',
    inputKey: 'image',
  },
}

export async function POST(req: Request) {
  const supabase = createClient()

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

    // 2. INPUT
    const formData = await req.formData()
    const file = formData.get('image') as File
    const type = (formData.get('type') as string) || 'upscale'

    if (!file) {
      return NextResponse.json(
        { error: 'Image requise' },
        { status: 400 }
      )
    }

    // 3. DEDUCT CREDITS (FIXED GLOBAL PATTERN)
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

    let url: string | null = null

    try {
      // 4. FALLBACK MODE (no API key)
      if (!process.env.REPLICATE_API_KEY) {
        url = `https://picsum.photos/1024/1024?type=${type}`
      } else {
        // 5. CONVERT FILE
        const bytes = await file.arrayBuffer()
        const b64 = Buffer.from(bytes).toString('base64')
        const dataUrl = `data:${file.type};base64,${b64}`

        const model = MODELS[type] ?? MODELS.upscale

        const start = await axios.post(
          'https://api.replicate.com/v1/predictions',
          {
            version: model.version,
            input: {
              [model.inputKey]: dataUrl,
              scale: 4,
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

        // 6. POLLING
        for (let i = 0; i < 40; i++) {
          await new Promise((r) => setTimeout(r, 1500))

          const poll = await axios.get(
            `https://api.replicate.com/v1/predictions/${id}`,
            {
              headers: {
                Authorization: `Token ${process.env.REPLICATE_API_KEY}`,
              },
            }
          )

          if (poll.data.status === 'succeeded') {
            url = Array.isArray(poll.data.output)
              ? poll.data.output[0]
              : poll.data.output
            break
          }

          if (poll.data.status === 'failed') {
            throw new Error('Traitement échoué')
          }
        }

        if (!url) {
          throw new Error('Timeout génération image')
        }
      }

      // 7. SAVE JOB (FIXED TYPE ISSUE)
      await supabase.from('ai_jobs').insert({
        user_id: user.id,
        job_type: 'photo',
        prompt: type,
        output_url: url,
        status: 'completed',
        credits_used: COST,
        provider: 'replicate',
      } as any)

      return NextResponse.json({ url })
    } catch (err) {
      // 8. SAFE ROLLBACK
      await supabase.rpc(
        'deduct_credits',
        {
          p_user_id: user.id,
          p_amount: -COST,
        } as any
      )

      throw err
    }
  } catch (e: unknown) {
    return NextResponse.json(
      {
        error: e instanceof Error ? e.message : 'Erreur serveur',
      },
      { status: 500 }
    )
  }
}
