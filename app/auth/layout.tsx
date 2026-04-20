export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4 py-12"
      style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(15,76,255,0.22) 0%, transparent 60%), #080D1A' }}>
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
      <div className="relative z-10 w-full max-w-md">
        {children}
      </div>
    </div>
  )
}
