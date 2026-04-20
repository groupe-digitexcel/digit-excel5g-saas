'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword(form)
    if (error) {
      toast.error(error.message === 'Invalid login credentials'
        ? 'Email ou mot de passe incorrect'
        : error.message)
    } else {
      toast.success('Connexion réussie!')
      router.push('/dashboard')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div>
      {/* Logo */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 no-underline mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-accent flex items-center justify-center font-extrabold text-white"
            style={{ fontFamily: 'Syne, sans-serif' }}>DE</div>
          <span className="font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
            DIGIT-EXCEL<span className="text-accent">5G</span>
          </span>
        </Link>
        <h1 className="section-title text-2xl text-white mb-1">Content de vous revoir!</h1>
        <p className="text-white/45 text-sm">Connectez-vous à votre compte</p>
      </div>

      <form onSubmit={handleSubmit} className="glass p-8 space-y-4">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1.5">Adresse email</label>
          <input type="email" required className="input" placeholder="vous@exemple.com"
            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1.5">Mot de passe</label>
          <input type="password" required className="input" placeholder="Votre mot de passe"
            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
        </div>

        <button type="submit" className="btn btn-primary w-full mt-2" disabled={loading}>
          {loading ? <><span className="spinner w-4 h-4" /> Connexion...</> : 'Se connecter →'}
        </button>

        <p className="text-center text-white/40 text-sm pt-2">
          Pas encore de compte?{' '}
          <Link href="/auth/register" className="text-accent font-semibold no-underline hover:underline">
            S&apos;inscrire gratuitement
          </Link>
        </p>
      </form>
    </div>
  )
}
