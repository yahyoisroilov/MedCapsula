'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
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
      setError(data.error || 'Registration failed')
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
        <h1 className="text-lg font-extrabold text-gray-900 dark:text-white text-center mb-5">Ro'yxatdan o'tish</h1>
        {error && (
          <div className="bg-red-500/10 text-red-500 px-4 py-2 rounded-xl text-sm mb-4 border border-red-500/20">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input id="name" name="name" placeholder="To'liq ismingiz" required />
          <Input id="email" name="email" type="email" placeholder="Email" required />
          <Input id="password" name="password" type="password" placeholder="Parol (kamida 6 belgi)" required />
          <Button type="submit" variant="accent" loading={loading} className="w-full">
            Ro'yxatdan o'tish
          </Button>
        </form>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4">
          Hisobingiz bormi?{' '}
          <Link href="/auth/login" className="text-emerald-500 hover:underline font-semibold">
            Kirish
          </Link>
        </p>
      </div>
    </div>
  )
}
