'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { CapsuleMark } from '@/components/ui/icons'

export default function ForgotPasswordPage() {
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const email = String(form.get('email') || '').trim()

    const supabase = createClient()
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset`,
    })

    if (err) {
      setError('Xatolik yuz berdi. Qayta urinib ko‘ring.')
      setLoading(false)
      return
    }
    setSent(true)
    setLoading(false)
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
        <h1 className="mb-2 text-center font-serif text-2xl font-semibold text-ink">
          Parolni tiklash
        </h1>

        {sent ? (
          <div className="mt-4">
            <div className="rounded-xl border border-brand-line bg-brand-tint px-4 py-3.5 text-sm leading-relaxed text-[#2c5e46]">
              Parolni tiklash havolasi emailingizga yuborildi. Pochta qutingizni (spam papkasini ham)
              tekshiring va havola orqali yangi parol o‘rnating.
            </div>
            <p className="mt-5 text-center text-sm text-ink-mute">
              <Link href="/auth/login" className="font-semibold text-brand hover:underline">
                Kirish sahifasiga qaytish
              </Link>
            </p>
          </div>
        ) : (
          <>
            <p className="mb-6 text-center text-sm leading-relaxed text-ink-mute">
              Email manzilingizni kiriting — parolni tiklash havolasini yuboramiz.
            </p>
            {error && (
              <div className="mb-4 rounded-xl border border-[#e0c4be] bg-[#f4e3df] px-4 py-2.5 text-sm text-[#b3493d]">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input id="email" name="email" type="email" placeholder="Email" required />
              <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
                Havola yuborish
              </Button>
            </form>
            <p className="mt-5 text-center text-sm text-ink-mute">
              Parol esingizdami?{' '}
              <Link href="/auth/login" className="font-semibold text-brand hover:underline">
                Kirish
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
