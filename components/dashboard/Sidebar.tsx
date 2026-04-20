'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'
import toast from 'react-hot-toast'

const navLinks = [
  { href: '/dashboard',                    icon: '⊞',  label: 'Vue d\'ensemble' },
  { href: '/dashboard/image-generator',    icon: '🎨',  label: 'Génération d\'Images' },
  { href: '/dashboard/photo-treatment',    icon: '📷',  label: 'Traitement Photo' },
  { href: '/dashboard/flyer-generator',    icon: '📋',  label: 'Créateur Flyers' },
  { href: '/dashboard/song-generator',     icon: '🎵',  label: 'Chansons & Jingles' },
  { href: '/dashboard/video-generator',    icon: '🎬',  label: 'Vidéos IA', badge: 'NEW' },
  { href: '/dashboard/billing',            icon: '💳',  label: 'Facturation' },
  { href: '/dashboard/history',            icon: '📂',  label: 'Historique' },
]

export default function DashboardSidebar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Déconnecté')
    router.push('/')
    router.refresh()
  }

  const creditPct = Math.min(((profile?.credits ?? 0) / 500) * 100, 100)

  return (
    <aside
      className="flex-shrink-0 flex flex-col border-r border-surface sticky top-0 h-screen transition-all duration-300"
      style={{ width: collapsed ? 72 : 256, background: 'var(--surface)' }}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-surface">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2 no-underline">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-accent flex items-center justify-center font-extrabold text-white text-xs" style={{ fontFamily: 'Syne,sans-serif' }}>DE</div>
            <span className="font-bold text-white text-sm" style={{ fontFamily: 'Syne,sans-serif' }}>DIGIT-EXCEL<span className="text-accent">5G</span></span>
          </Link>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="text-white/40 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5">
          <span className="text-lg">{collapsed ? '→' : '←'}</span>
        </button>
      </div>

      {/* Profile */}
      {!collapsed && profile && (
        <div className="px-4 py-3 border-b border-surface">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-accent flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
              {profile.name?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white truncate">{profile.name}</div>
              <div className="text-xs text-white/40">{profile.plan} Plan</div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-white/45">Crédits</span>
              <span className="font-bold text-accent">{profile.credits}</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent transition-all duration-700"
                style={{ width: `${creditPct}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto space-y-0.5">
        {navLinks.map(({ href, icon, label, badge }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href}
              className={`nav-link ${active ? 'active' : ''}`}
              style={{ justifyContent: collapsed ? 'center' : undefined }}
              title={collapsed ? label : undefined}>
              <span className="text-lg flex-shrink-0">{icon}</span>
              {!collapsed && <span className="flex-1">{label}</span>}
              {!collapsed && badge && (
                <span style={{
                  fontSize: '9px', fontWeight: 800, padding: '2px 6px',
                  borderRadius: '5px', letterSpacing: '.05em',
                  background: 'rgba(124,58,237,0.25)', color: '#a78bfa',
                  border: '1px solid rgba(124,58,237,0.4)', flexShrink: 0,
                }}>{badge}</span>
              )}
            </Link>
          )
        })}
        {profile?.role === 'admin' && (
          <Link href="/admin"
            className={`nav-link ${pathname.startsWith('/admin') ? 'active' : ''}`}
            style={{
              color: '#F5B301',
              background: pathname.startsWith('/admin') ? 'rgba(245,179,1,0.1)' : undefined,
              borderLeft: pathname.startsWith('/admin') ? '2px solid #F5B301' : undefined,
              justifyContent: collapsed ? 'center' : undefined,
            }}
            title={collapsed ? 'Administration' : undefined}>
            <span className="text-lg">🛡️</span>
            {!collapsed && <span>Administration</span>}
          </Link>
        )}
      </nav>

      {/* Logout */}
      <div className="px-2 py-3 border-t border-surface">
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400/80 hover:text-red-400 hover:bg-red-500/8 transition-all"
          style={{ justifyContent: collapsed ? 'center' : undefined }}
          title={collapsed ? 'Déconnexion' : undefined}>
          <span className="text-lg">🚪</span>
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </div>
    </aside>
  )
}
