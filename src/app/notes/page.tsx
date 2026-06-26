import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getSubjects } from '@/lib/subjects'
import { NotesApp } from '@/components/notes/NotesApp'

export const dynamic = 'force-dynamic'

export default async function NotesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="relative z-[2] mx-auto max-w-shell px-5 py-24 text-center sm:px-10">
        <div className="mx-auto inline-block rounded-2xl border border-[rgba(43,39,34,0.1)] bg-sand-card p-10 shadow-card">
          <h2 className="font-serif text-2xl font-semibold text-ink">Kirish talab qilinadi</h2>
          <p className="mt-2 text-sm text-ink-mute">Qaydlar uchun tizimga kiring yoki ro‘yxatdan o‘ting.</p>
          <Link href="/auth/login?redirect=/notes" className="btn-sm mx-auto mt-5">
            Kirish
          </Link>
        </div>
      </div>
    )
  }

  const subjects = await getSubjects()
  const subjectNames = subjects.map(s => s.title)

  return <NotesApp subjects={subjectNames} />
}
