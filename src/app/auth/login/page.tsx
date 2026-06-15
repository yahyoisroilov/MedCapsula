'use client'

import { Suspense, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

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
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: form.get('email'),
        password: form.get('password'),
      }),
    })

    if (res.ok) {
      const redirect = searchParams.get('redirect') || '/'
      router.replace(redirect)
    } else {
      const data = await res.json()
      setError(data.error || 'Login failed')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="glass rounded-2xl w-full max-w-md p-8 animate-fade-up">
        <div className="flex items-center gap-3 mb-6 justify-center">
          <div className="h-10 w-10 rounded-xl accent-grad flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <i className="fa-solid fa-capsules text-white text-xl"></i>
          </div>
          <span className="text-gray-900 dark:text-white font-extrabold text-2xl tracking-tight">
            Med<span className="text-emerald-500">Capsula</span>
          </span>
        </div>
        <h1 className="text-lg font-extrabold text-gray-900 dark:text-white text-center mb-5">Tizimga kirish</h1>
        {error && (
          <div className="bg-red-500/10 text-red-500 px-4 py-2 rounded-xl text-sm mb-4 border border-red-500/20">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input id="email" name="email" type="email" placeholder="Email" required />
          <Input id="password" name="password" type="password" placeholder="Parol" required />
          <Button type="submit" variant="accent" loading={loading} className="w-full">
            Kirish
          </Button>
        </form>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4">
          Hisobingiz yo'qmi?{' '}
          <Link href="/auth/register" className="text-emerald-500 hover:underline font-semibold">
            Ro'yxatdan o'tish
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="glass rounded-2xl p-8 text-center">
          <div className="h-14 w-14 mx-auto rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-3">
            <i className="fa-solid fa-spinner text-gray-400 text-xl animate-spin"></i>
          </div>
          <p className="text-sm text-gray-400">Yuklanmoqda...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
