import Link from 'next/link'
import { CapsuleMark, Telegram } from '@/components/ui/icons'

export function Footer() {
  return (
    <footer className="bg-night text-[#c8bda4]">
      <div className="mx-auto grid max-w-shell gap-8 px-5 pb-10 pt-14 sm:px-10 md:grid-cols-[1.4fr_1fr_1fr]">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2.5">
            <CapsuleMark className="border border-white/20" />
            <span className="font-serif text-xl font-semibold text-sand">MedCapsula</span>
          </div>
          <p className="mt-3 font-mono text-[12.5px] tracking-[0.03em] text-ink-dim">
            Talabalardan — talabalarga.
          </p>
          <p className="mt-3 max-w-[34ch] text-sm leading-relaxed text-[#9a907c]">
            Ikki tibbiyot talabasi tomonidan yaratilgan — o&apos;zbek tilidagi birinchi tibbiy
            ta&apos;lim platformasi.
          </p>
        </div>

        {/* Pages */}
        <div>
          <h4 className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#7d7461]">Sahifa</h4>
          <nav className="mt-4 flex flex-col gap-3 text-[15px]">
            <Link href="/subjects" className="text-[#c8bda4] hover:text-sand">Fanlar</Link>
            <Link href="/notes" className="text-[#c8bda4] hover:text-sand">Qaydlar</Link>
            <Link href="/auth/login" className="text-[#c8bda4] hover:text-sand">Kirish</Link>
            <Link href="/auth/register" className="text-[#c8bda4] hover:text-sand">Ro&apos;yxatdan o&apos;tish</Link>
          </nav>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#7d7461]">Aloqa</h4>
          <a
            href="https://t.me/Med_Capsula"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2.5 rounded-[10px] border border-[rgba(127,184,220,0.3)] bg-[rgba(127,184,220,0.14)] px-3.5 py-2.5 text-[15px] text-sand hover:bg-[rgba(127,184,220,0.22)]"
          >
            <Telegram className="h-[17px] w-[17px] text-[#9cc8e6]" />
            t.me/Med_Capsula
          </a>
        </div>
      </div>

      <div className="mx-auto max-w-shell border-t border-white/10 px-5 py-5 sm:px-10">
        <p className="font-mono text-[12px] text-[#7d7461]">© 2026 MedCapsula</p>
      </div>
    </footer>
  )
}
