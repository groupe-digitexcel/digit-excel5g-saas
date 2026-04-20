// app/api/ai/image/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import axios from 'axios'

const COST = 3

async function generateImage(prompt: string): Promise<string> {
  if (!process.env.REPLICATE_API_KEY) {
    return `https://picsum.photos/seed/${encodeURIComponent(prompt.slice(0, 10))}/1024/1024`
  }
  const start = await axios.post(
    'https://api.replicate.com/v1/predictions',
    { version: 'ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4', input: { prompt, negative_prompt: 'blurry, low quality, nsfw', width: 1024, height: 1024, num_inference_steps: 25 } },
    { headers: { Authorization: `Token ${process.env.REPLICATE_API_KEY}` } }
  )
  const id = start.data.id
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 2000))
    const poll = await axios.get(`https://api.replicate.com/v1/predictions/${id}`, { headers: { Authorization: `Token ${process.env.REPLICATE_API_KEY}` } })
    if (poll.data.status === 'succeeded') return poll.data.output[0]
    if (poll.data.status === 'failed') throw new Error('Génération échouée')
  }
  throw new Error('Timeout')
}

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { prompt } = await req.json()
  if (!prompt?.trim()) return NextResponse.json({ error: 'Prompt requis' }, { status: 400 })

  const { data: ok } = await supabase.rpc('deduct_credits', { p_user_id: user.id, p_amount: COST })
  if (!ok) return NextResponse.json({ error: 'Crédits insuffisants' }, { status: 402 })

  try {
    const url = await generateImage(prompt)
    await supabase.from('ai_jobs').insert({ user_id: user.id, job_type: 'image', prompt, output_url: url, status: 'completed', credits_used: COST, provider: 'replicate' })
    return NextResponse.json({ url })
  } catch (e: unknown) {
    await supabase.rpc('deduct_credits', { p_user_id: user.id, p_amount: -COST })
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Erreur IA' }, { status: 500 })
  }
}
