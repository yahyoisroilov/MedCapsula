'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { CapsuleMark } from '@/components/ui/icons'

type Status = 'checking' | 'ready' | 'invalid'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [status, setStatus] = useState<Status>('checking')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // The recovery email lands here with a one-time code — exchange it for a
  // session so updateUser can change the password.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const supabase = createClient()
      const params = new URLSearchParams(window.location.search)

      if (params.get('error_description') || params.get('error')) {
        if (!cancelled) setStatus('invalid')
        return
      }

      const code = params.get('code')
      if (code) {
        const { error: err } = await supabase.auth.exchangeCodeForSession(code)
        if (!cancelled && !err) {
          setStatus('ready')
          return
        }
      }

      // The browser client may have auto-exchanged the code already.
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!cancelled) setStatus(session ? 'ready' : 'invalid')
    })()
    return () => {
      cancelled = true
    }
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    const form = new FormData(e.currentTarget)
    const password = String(form.get('password') || '')
    const confirm = String(form.get('confirm') || '')

    if (password.length < 6) {
      setError('Parol kamida 6 ta belgidan iborat bo‘lishi kerak.')
      return
    }
    if (password !== confirm) {
      setError('Parollar mos kelmadi.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error: err } = await supabase.auth.updateUser({ password })
    if (err) {
      setError('Parolni yangilashda xatolik. Qayta urinib ko‘ring.')
      setLoading(false)
      return
    }
    router.replace('/subjects')
    router.refresh()
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
        <h1 className="mb-6 text-center font-serif text-2xl font-semibold text-ink">
          Yangi parol o‘rnatish
        </h1>

        {status === 'checking' && (
          <p className="text-center font-mono text-sm text-ink-faint">Tekshirilmoqda…</p>
        )}

        {status === 'invalid' && (
          <div>
            <div className="rounded-xl border border-[#e0c4be] bg-[#f4e3df] px-4 py-3.5 text-sm leading-relaxed text-[#b3493d]">
              Havola yaroqsiz yoki muddati o‘tgan. Iltimos, parolni tiklashni qaytadan so‘rang.
            </div>
            <p className="mt-5 text-center text-sm text-ink-mute">
              <Link href="/auth/forgot" className="font-semibold text-brand hover:underline">
                Yangi havola so‘rash
              </Link>
            </p>
          </div>
        )}

        {status === 'ready' && (
          <>
            {error && (
              <div className="mb-4 rounded-xl border border-[#e0c4be] bg-[#f4e3df] px-4 py-2.5 text-sm text-[#b3493d]">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input id="password" name="password" type="password" placeholder="Yangi parol" required />
              <Input id="confirm" name="confirm" type="password" placeholder="Yangi parolni tasdiqlang" required />
              <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
                Parolni yangilash
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
