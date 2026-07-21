'use client'

import { Suspense, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { CapsuleLoader } from '@/components/ui/CapsuleLoader'
import { CapsuleMark } from '@/components/ui/icons'

function loginErrorUz(message: string): string {
  if (/invalid login credentials/i.test(message)) return 'Email yoki parol noto‘g‘ri'
  if (/not confirmed/i.test(message)) return 'Email tasdiqlanmagan'
  if (/rate|too many/i.test(message)) return 'Juda ko‘p urinish. Birozdan so‘ng qayta urinib ko‘ring.'
  return 'Kirishda xatolik. Qayta urinib ko‘ring.'
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const form = new FormData(e.currentTarget)
    // Sign in with the BROWSER client so the session is live in the browser
    // right away (and its cookies are what the middleware reads). Doing this on
    // the server left the client cache stale until a manual refresh.
    const supabase = createClient()
    const { error: err } = await supabase.auth.signInWithPassword({
      email: String(form.get('email') || ''),
      password: String(form.get('password') || ''),
    })

    if (err) {
      setError(loginErrorUz(err.message))
      setLoading(false)
      return
    }

    const redirect = searchParams.get('redirect') || '/subjects'
    router.replace(redirect)
    router.refresh() // revalidate server components with the new auth cookies
  }

  return (
    <div className="relative z-[2] flex min-h-[70vh] items-center justify-center px-5 py-12">
      <div className="w-full max-w-md animate-fade-up rounded-2xl border border-[rgba(43,39,34,0.1)] bg-sand-card p-8 shadow-card">
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <CapsuleMark className="shadow-[0_1px_2px_rgba(43,39,34,0.12)]" />
          <span className="font-serif text-2xl font-semibold tracking-[-0.01em] text-ink">
            Med<span className="text-brand">Capsula</span>
          </span>
        </div>
        <h1 className="mb-6 text-center font-serif text-2xl font-semibold text-ink">Tizimga kirish</h1>
        {error && (
          <div className="mb-4 rounded-xl border border-[#e0c4be] bg-[#f4e3df] px-4 py-2.5 text-sm text-[#b3493d]">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input id="email" name="email" type="email" placeholder="Email" required />
          <Input id="password" name="password" type="password" placeholder="Parol" required />
          <div className="flex justify-end">
            <Link href="/auth/forgot" className="text-[13px] font-medium text-ink-mute hover:text-brand">
              Parolni unutdingizmi?
            </Link>
          </div>
          <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
            Kirish
          </Button>
        </form>
        <p className="mt-5 text-center text-sm text-ink-mute">
          Hisobingiz yo&apos;qmi?{' '}
          <Link href="/auth/register" className="font-semibold text-brand hover:underline">
            Ro&apos;yxatdan o&apos;tish
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="relative z-[2] flex min-h-[70vh] items-center justify-center">
          <CapsuleLoader size="md" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
