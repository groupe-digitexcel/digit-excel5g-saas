'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirm) { toast.error('Les mots de passe ne correspondent pas'); return }
    if (form.password.length < 6) { toast.error('Mot de passe: minimum 6 caractères'); return }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { name: form.name, phone: form.phone },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Compte créé! Redirection...')
      router.push('/dashboard')
      router.refresh()
    }
    setLoading(false)
  }

  const fields = [
    { key: 'name',     label: 'Nom complet',                    placeholder: 'Jean Nkomo',          type: 'text' },
    { key: 'email',    label: 'Adresse email',                  placeholder: 'vous@exemple.com',    type: 'email' },
    { key: 'phone',    label: 'Téléphone (MTN / Orange)',        placeholder: '+237 6XX XXX XXX',    type: 'tel' },
    { key: 'password', label: 'Mot de passe',                   placeholder: 'Minimum 6 caractères',type: 'password' },
    { key: 'confirm',  label: 'Confirmer le mot de passe',      placeholder: 'Répéter le mot passe',type: 'password' },
  ]

  return (
    <div>
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 no-underline mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-accent flex items-center justify-center font-extrabold text-white" style={{ fontFamily: 'Syne,sans-serif' }}>DE</div>
          <span className="font-bold text-white" style={{ fontFamily: 'Syne,sans-serif' }}>DIGIT-EXCEL<span className="text-accent">5G</span></span>
        </Link>
        <h1 className="section-title text-2xl text-white mb-1">Créez votre compte</h1>
        <p className="text-white/45 text-sm">🎁 100 crédits offerts à l&apos;inscription</p>
      </div>

      <form onSubmit={handleSubmit} className="glass p-8 space-y-4">
        {fields.map(({ key, label, placeholder, type }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-white/70 mb-1.5">{label}</label>
            <input type={type} required={key !== 'phone'} className="input" placeholder={placeholder}
              value={(form as Record<string, string>)[key]}
              onChange={e => setForm({ ...form, [key]: e.target.value })} />
          </div>
        ))}
        <button type="submit" className="btn btn-primary w-full mt-2" disabled={loading}>
          {loading ? <><span className="spinner w-4 h-4" /> Création...</> : '🚀 Créer mon compte gratuit'}
        </button>
        <p className="text-center text-white/40 text-sm pt-2">
          Déjà un compte?{' '}
          <Link href="/auth/login" className="text-accent font-semibold no-underline hover:underline">Se connecter</Link>
        </p>
      </form>
    </div>
  )
}
