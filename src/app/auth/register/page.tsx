'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { CapsuleMark } from '@/components/ui/icons'

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.get('name'),
        email: form.get('email'),
        password: form.get('password'),
      }),
    })

    if (res.ok) {
      // Auto-login after signup
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.get('email'),
          password: form.get('password'),
        }),
      })
      if (loginRes.ok) {
        router.replace('/')
        return
      }
      router.replace('/auth/login')
    } else {
      const data = await res.json()
      setError(data.error || 'Roʻyxatdan oʻtishda xatolik')
      setLoading(false)
    }
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
          Ro&apos;yxatdan o&apos;tish
        </h1>
        {error && (
          <div className="mb-4 rounded-xl border border-[#e0c4be] bg-[#f4e3df] px-4 py-2.5 text-sm text-[#b3493d]">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input id="name" name="name" placeholder="To'liq ismingiz" required />
          <Input id="email" name="email" type="email" placeholder="Email" required />
          <Input id="password" name="password" type="password" placeholder="Parol (kamida 6 belgi)" required />
          <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
            Ro&apos;yxatdan o&apos;tish
          </Button>
        </form>
        <p className="mt-5 text-center text-sm text-ink-mute">
          Hisobingiz bormi?{' '}
          <Link href="/auth/login" className="font-semibold text-brand hover:underline">
            Kirish
          </Link>
        </p>
      </div>
    </div>
  )
}
