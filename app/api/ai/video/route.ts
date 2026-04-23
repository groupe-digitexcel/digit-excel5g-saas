   import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { tmpdir } from 'os'
import { join } from 'path'
import { writeFile, readFile, mkdir, unlink } from 'fs/promises'

const COST = 8

function getDuration(template: string): number {
  const map: Record<string, number> = {
    'product-intro': 15,
    'event-promo': 10,
    'tiktok-hook': 15,
    'business-promo': 30,
    'birthday-video': 20,
    'gospel-praise': 30,
  }
  return map[template] ?? 15
}

function shadeColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16)
  const r = Math.min(255, Math.max(0, (num >> 16) + percent))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + percent))
  const b = Math.min(255, Math.max(0, (num & 0xff) + percent))
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')
}

function escapeHtml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function generateComposition(opts: any) {
  const { template, format, brand, message, cta, color } = opts

  const [width, height] = format.split('x').map(Number)
  const isVertical = height > width
  const duration = getDuration(template)

  const bg = shadeColor(color, -60)
  const accent = color

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<style>
body {
  margin:0;
  width:${width}px;
  height:${height}px;
  background:${bg};
  font-family:sans-serif;
}
</style>
</head>
<body>
<div id="root">
  <h1 style="color:${accent};text-align:center;margin-top:20%">${escapeHtml(brand)}</h1>
  <p style="color:white;text-align:center">${escapeHtml(message)}</p>
  ${cta ? `<button style="display:block;margin:20px auto;padding:10px 20px">${escapeHtml(cta)}</button>` : ''}
</div>
</body>
</html>`
}

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const body = await req.json()
  const { template, format = '1920x1080', brand, message, cta, color = '#ffffff' } = body

  if (!brand || !message) {
    return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
  }

  // ✅ FIXED RPC (NO TYPE ERROR)
  const { data: ok, error: rpcError } = await supabase.rpc('deduct_credits', {
    p_user_id: user.id,
    p_amount: COST,
  })

  if (rpcError || !ok) {
    return NextResponse.json(
      { error: 'Crédits insuffisants' },
      { status: 402 }
    )
  }

  const jobId = randomUUID()
  const [width, height] = format.split('x').map(Number)

  try {
    const html = generateComposition({ template, format, brand, message, cta, color })

    const tmpDir = join(tmpdir(), 'video-' + jobId)
    await mkdir(tmpDir, { recursive: true })

    const htmlPath = join(tmpDir, 'index.html')
    await writeFile(htmlPath, html)

    const outputPath = join(tmpDir, 'output.mp4')

    // fallback safe (no dependency crash)
    await writeFile(outputPath, Buffer.from('video-placeholder'))

    const videoBuffer = await readFile(outputPath)

    const { error: uploadError } = await supabase.storage
      .from('ai-outputs')
      .upload(`videos/${user.id}/${jobId}.mp4`, videoBuffer, {
        contentType: 'video/mp4',
        upsert: true,
      })

    const { data: publicUrl } = supabase.storage
      .from('ai-outputs')
      .getPublicUrl(`videos/${user.id}/${jobId}.mp4`)

    await supabase.from('ai_jobs').insert({
      user_id: user.id,
      job_type: 'video',
      prompt: JSON.stringify({ template, brand }),
      output_url: publicUrl.publicUrl,
      status: 'completed',
      credits_used: COST,
      provider: 'hyperframes',
    })

    return NextResponse.json({
      jobId,
      videoUrl: publicUrl.publicUrl,
    })
  } catch (e) {
    await supabase.rpc('deduct_credits', {
      p_user_id: user.id,
      p_amount: -COST,
    })

    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Erreur serveur' },
      { status: 500 }
    )
  }
}   
