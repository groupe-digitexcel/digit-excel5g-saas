import Link from 'next/link'

const features = [
  { icon: '🎨', title: 'Génération d\'Images IA', desc: 'Créez des images époustouflantes avec SDXL. Portraits, logos, illustrations africaines.', color: '#0F4CFF', cost: 3 },
  { icon: '📷', title: 'Traitement Photo Pro', desc: 'Upscale 4K, restauration faciale, suppression de fond. Qualité studio en 1 clic.', color: '#00D4FF', cost: 2 },
  { icon: '📋', title: 'Flyers Publicitaires', desc: 'Contenu percutant généré par Gemini IA. Événements, promos, inaugurations.', color: '#F5B301', cost: 4 },
  { icon: '🎵', title: 'Chansons & Jingles', desc: 'Paroles personnalisées en Français, Ewondo, Bamiléké et plus. Style Gospel, Makossa, Afrobeat.', color: '#00C48C', cost: 5 },
]

const plans = [
  { name: 'Gratuit', price: '0', period: 'FCFA', credits: 100, features: ['100 crédits offerts', 'Filigrane sur images', 'Résolution standard', 'Templates de base'], cta: 'Commencer', href: '/auth/register', accent: false },
  { name: 'Starter',  price: '5 000', period: 'FCFA/mois', credits: 500, features: ['500 crédits/mois', 'Sans filigrane', 'Résolution HD', '50+ templates premium', 'Support email'], cta: 'Choisir Starter', href: '/auth/register?plan=starter', accent: false },
  { name: 'Pro',      price: '15 000', period: 'FCFA/mois', credits: 2000, features: ['2 000 crédits/mois', 'Upscale 4K', 'Restauration faciale', 'Tous les templates', 'Support prioritaire'], cta: 'Choisir Pro', href: '/auth/register?plan=pro', accent: true },
  { name: 'VIP',      price: '50 000', period: 'FCFA/mois', credits: 99999, features: ['Crédits illimités', 'Usage commercial', 'Équipe 5 comptes', 'API access', 'Manager dédié'], cta: 'Nous Contacter', href: '/auth/register?plan=vip', accent: false },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-ink">
      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 border-b border-surface transition-all" style={{ background: 'rgba(8,13,26,0.85)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent flex items-center justify-center font-extrabold text-white text-xs" style={{ fontFamily: 'Syne, sans-serif' }}>DE</div>
            <span className="font-bold text-white text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>DIGIT-EXCEL<span className="text-accent">5G</span></span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            {[['Fonctionnalités', '#features'], ['Tarifs', '#pricing'], ['À Propos', '#about']].map(([l, h]) => (
              <a key={l} href={h} className="text-white/60 hover:text-white text-sm font-medium no-underline transition-colors">{l}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="btn btn-ghost btn-sm no-underline">Connexion</Link>
            <Link href="/auth/register" className="btn btn-primary btn-sm no-underline">Commencer →</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-[90vh] flex items-center justify-center text-center px-6 overflow-hidden">
        <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
        <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/8 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/6 rounded-full blur-3xl pointer-events-none animate-pulse-slow" style={{ animationDelay: '2s' }} />

        <div className="relative z-10 max-w-4xl mx-auto animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-xs font-semibold tracking-widest uppercase"
            style={{ background: 'rgba(15,76,255,0.12)', border: '1px solid rgba(15,76,255,0.3)', color: '#60a5fa' }}>
            🇨🇲 Conçu pour le Cameroun et l&apos;Afrique
          </div>

          <h1 className="section-title text-5xl md:text-7xl text-white mb-6 leading-[1.05]">
            Créez l&apos;Extraordinaire<br />
            <span className="gradient-text">avec l&apos;IA</span>
          </h1>

          <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Images IA · Photos pro · Flyers publicitaires · Chansons & jingles.<br />
            Payez avec <span className="font-bold text-yellow-400">MTN MoMo</span> ou <span className="font-bold text-orange-400">Orange Money</span>.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/auth/register" className="btn btn-primary btn-lg no-underline">
              🚀 Commencer Gratuitement
            </Link>
            <a href="#features" className="btn btn-ghost btn-lg no-underline">
              Voir les fonctionnalités ↓
            </a>
          </div>

          <div className="flex flex-wrap gap-8 justify-center mt-14">
            {[['500+', 'Utilisateurs actifs'], ['10K+', 'Créations générées'], ['4', 'Outils IA'], ['$0', 'Pour commencer']].map(([n, l]) => (
              <div key={l} className="text-center">
                <div className="text-2xl font-extrabold text-accent" style={{ fontFamily: 'Syne, sans-serif' }}>{n}</div>
                <div className="text-xs text-white/40 mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="section-title text-4xl text-white mb-3">Tout ce dont vous avez besoin</h2>
            <p className="text-white/50">Une plateforme IA complète, adaptée à l&apos;Afrique</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map(({ icon, title, desc, color, cost }) => (
              <div key={title} className="card-hover p-6 group cursor-pointer">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4"
                  style={{ background: `${color}18`, border: `1px solid ${color}35` }}>{icon}</div>
                <h3 className="section-title text-base text-white mb-2">{title}</h3>
                <p className="text-white/50 text-sm leading-relaxed mb-4">{desc}</p>
                <span className="badge-blue text-xs">{cost} crédits</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-24 px-6" style={{ background: 'rgba(15,22,41,0.5)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="section-title text-4xl text-white mb-3">Tarifs accessibles à tous</h2>
            <p className="text-white/50">Payez avec MTN MoMo ou Orange Money — 100% local, 0% complication</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {plans.map(({ name, price, period, features: feats, cta, href, accent }) => (
              <div key={name} className={`relative p-6 rounded-2xl transition-all duration-300 ${accent ? 'border border-brand-500/50 shadow-2xl shadow-brand-500/15 scale-[1.02]' : 'card'}`}
                style={{ background: accent ? 'linear-gradient(145deg, rgba(15,76,255,0.18), rgba(0,212,255,0.04))' : undefined }}>
                {accent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #0F4CFF, #00D4FF)' }}>⭐ Populaire</div>
                )}
                <div className="mb-4">
                  <div className={`text-xs font-bold tracking-widest uppercase mb-2 ${accent ? 'text-accent' : 'text-white/40'}`}>{name}</div>
                  <div className="flex items-end gap-1">
                    <span className="section-title text-3xl text-white">{price}</span>
                    <span className="text-white/40 text-sm mb-1">{period}</span>
                  </div>
                </div>
                <ul className="space-y-2 mb-6">
                  {feats.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-white/65">
                      <span className="text-emerald-400 mt-0.5 flex-shrink-0">✓</span>{f}
                    </li>
                  ))}
                </ul>
                <Link href={href} className={`btn w-full no-underline justify-center py-2.5 text-sm font-semibold rounded-xl ${accent ? 'btn-primary' : 'btn-ghost'}`}>{cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PAYMENT METHODS ── */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h3 className="section-title text-2xl text-white mb-2">Méthodes de paiement acceptées</h3>
          <p className="text-white/45 text-sm mb-8">Simple, rapide, 100% local — aucune carte bancaire nécessaire</p>
          <div className="flex gap-4 justify-center flex-wrap">
            {[
              { name: 'MTN Mobile Money', color: '#FFCC00', bg: 'rgba(255,204,0,0.1)', border: 'rgba(255,204,0,0.25)' },
              { name: 'Orange Money', color: '#FF9944', bg: 'rgba(255,102,0,0.1)', border: 'rgba(255,102,0,0.25)' },
              { name: 'Bientôt: Flutterwave', color: '#00C48C', bg: 'rgba(0,196,140,0.1)', border: 'rgba(0,196,140,0.25)' },
            ].map(({ name, color, bg, border }) => (
              <div key={name} className="flex items-center gap-3 px-6 py-4 rounded-2xl"
                style={{ background: bg, border: `1px solid ${border}` }}>
                <span className="text-2xl">📱</span>
                <span className="font-bold text-sm" style={{ color }}>{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-surface py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-accent flex items-center justify-center text-white font-bold text-xs">DE</div>
            <span className="font-bold text-white text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>DIGIT-EXCEL<span className="text-accent">5G</span></span>
          </div>
          <p className="text-white/30 text-sm">© 2026 Digit-Excel5G AI Studio · Yaoundé, Cameroun 🇨🇲</p>
          <p className="text-white/30 text-sm">Fait avec ❤️ pour l&apos;Afrique</p>
        </div>
      </footer>
    </div>
  )
}
