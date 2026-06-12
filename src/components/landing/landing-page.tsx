"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { OpenClassLogo } from "@/components/ui/openclass-logo"
import { cn } from "@/lib/utils"
import { useI18n } from "@/lib/i18n/context"
import { localeNames, type Locale } from "@/lib/i18n/locales"

// ─── tiny hook: track scroll position ────────────────────────────────────────
function useScrollY() {
  const [y, setY] = useState(0)
  useEffect(() => {
    const handler = () => setY(window.scrollY)
    window.addEventListener("scroll", handler, { passive: true })
    return () => window.removeEventListener("scroll", handler)
  }, [])
  return y
}

// ─── animated counter ─────────────────────────────────────────────────────────
function AnimatedCounter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        let start = 0
        const step = Math.ceil(to / 60)
        const timer = setInterval(() => {
          start += step
          if (start >= to) { setCount(to); clearInterval(timer) }
          else setCount(start)
        }, 16)
      },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [to])
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

// ─── language switcher ────────────────────────────────────────────────────────
function LangSwitcher({ compact }: { compact?: boolean }) {
  const { locale, setLocale } = useI18n()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-1.5 text-sm font-medium rounded-lg border transition-colors",
          "border-gray-200 bg-white/80 hover:border-lime-300 hover:bg-lime-50 text-gray-600",
          compact ? "px-2.5 py-1.5" : "px-3 py-2"
        )}
        aria-label="Switch language"
        aria-expanded={open}
      >
        <GlobeIcon className="size-3.5 shrink-0" />
        <span>{localeNames[locale]}</span>
        <ChevronDownIcon className={cn("size-3 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute right-0 mt-1.5 w-36 rounded-xl border border-gray-100 bg-white shadow-lg shadow-black/5 py-1 z-50">
          {(Object.keys(localeNames) as Locale[]).map((l) => (
            <button
              key={l}
              onClick={() => { setLocale(l); setOpen(false) }}
              className={cn(
                "w-full text-left px-3 py-2 text-sm transition-colors",
                l === locale
                  ? "text-lime-700 font-semibold bg-lime-50"
                  : "text-gray-600 hover:bg-gray-50"
              )}
            >
              {localeNames[l]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── feature card ─────────────────────────────────────────────────────────────
function FeatureCard({
  icon,
  title,
  description,
  accent,
}: {
  icon: React.ReactNode
  title: string
  description: string
  accent?: string
}) {
  return (
    <div
      className={cn(
        "group relative rounded-2xl border border-[#d4f0c0] bg-white/70 backdrop-blur-sm p-6",
        "hover:border-[#84cc16] hover:shadow-lg hover:shadow-lime-100/60",
        "transition-all duration-300 hover:-translate-y-1"
      )}
    >
      <div className={cn("mb-4 inline-flex items-center justify-center size-12 rounded-xl", accent ?? "bg-lime-100 text-lime-700")}>
        {icon}
      </div>
      <h3 className="font-heading font-semibold text-gray-900 mb-2 text-[15px]">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  )
}

// ─── plan card ────────────────────────────────────────────────────────────────
function PlanCard({
  name, price, priceSuffix, description, features, highlighted, badge, cta,
}: {
  name: string; price: string; priceSuffix: string; description: string
  features: string[]; highlighted?: boolean; badge?: string; cta: string
}) {
  return (
    <div
      className={cn(
        "relative rounded-2xl p-7 flex flex-col gap-5 transition-all duration-300",
        highlighted
          ? "bg-gradient-to-br from-lime-400 to-lime-500 text-white shadow-2xl shadow-lime-300/40 scale-105"
          : "bg-white border border-[#d4f0c0] hover:border-lime-400 hover:shadow-lg hover:shadow-lime-50"
      )}
    >
      {badge && (
        <span className={cn("absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full",
          highlighted ? "bg-white text-lime-600" : "bg-lime-500 text-white")}>
          {badge}
        </span>
      )}
      <div>
        <p className={cn("text-xs font-semibold uppercase tracking-widest mb-1", highlighted ? "text-lime-100" : "text-lime-600")}>{name}</p>
        <div className="flex items-end gap-1">
          <span className={cn("text-4xl font-bold font-heading", highlighted ? "text-white" : "text-gray-900")}>{price}</span>
          <span className={cn("text-sm mb-1", highlighted ? "text-lime-100" : "text-gray-400")}>{priceSuffix}</span>
        </div>
        <p className={cn("text-sm mt-1", highlighted ? "text-lime-50" : "text-gray-500")}>{description}</p>
      </div>
      <ul className="flex flex-col gap-2 flex-1">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <span className={cn("mt-0.5 shrink-0", highlighted ? "text-white" : "text-lime-500")}>✓</span>
            <span className={highlighted ? "text-lime-50" : "text-gray-600"}>{f}</span>
          </li>
        ))}
      </ul>
      <Link href="/register"
        className={cn("mt-2 w-full text-center text-sm font-semibold py-3 rounded-xl transition-all duration-200",
          highlighted ? "bg-white text-lime-600 hover:bg-lime-50 shadow-sm" : "bg-lime-500 text-white hover:bg-lime-600 shadow-sm shadow-lime-200"
        )}>
        {cta}
      </Link>
    </div>
  )
}

// ─── testimonial ─────────────────────────────────────────────────────────────
function Testimonial({ quote, name, role, color }: { quote: string; name: string; role: string; color: string }) {
  return (
    <div className="rounded-2xl border border-[#d4f0c0] bg-white/80 backdrop-blur-sm p-6 flex flex-col gap-4 hover:shadow-md hover:shadow-lime-100/50 transition-all duration-300">
      <div className={cn("size-8 rounded-full flex items-center justify-center text-xs font-bold text-white", color)}>{name[0]}</div>
      <p className="text-sm text-gray-600 leading-relaxed italic">&ldquo;{quote}&rdquo;</p>
      <div>
        <p className="text-sm font-semibold text-gray-900">{name}</p>
        <p className="text-xs text-gray-400">{role}</p>
      </div>
    </div>
  )
}

// ─── main component ───────────────────────────────────────────────────────────
export function LandingPage() {
  const scrollY = useScrollY()
  const navScrolled = scrollY > 40
  const { t, isRTL } = useI18n()
  const l = t.landing

  // parse marquee items from comma-separated string
  const marqueeItems = l.marqueeItems.split(",")
  const marqueeDoubled = [...marqueeItems, ...marqueeItems]

  return (
    <div className="min-h-screen bg-[#f7fef2] text-gray-900 overflow-x-hidden" dir={isRTL ? "rtl" : "ltr"}>

      {/* ── NAV ──────────────────────────────────────────────────────────── */}
      <header className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        navScrolled ? "bg-white/90 backdrop-blur-md border-b border-lime-100 shadow-sm shadow-lime-50/50" : "bg-transparent"
      )}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <OpenClassLogo href="/" size="md" />
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-gray-500">
            <a href="#features" className="hover:text-lime-600 transition-colors">{l.navFeatures}</a>
            <a href="#pricing" className="hover:text-lime-600 transition-colors">{l.navPricing}</a>
            <a href="#testimonials" className="hover:text-lime-600 transition-colors">{l.navStories}</a>
          </nav>
          <div className="flex items-center gap-2">
            <LangSwitcher compact />
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-lime-700 transition-colors px-3 py-2">
              {l.navSignIn}
            </Link>
            <Link href="/register" className="text-sm font-semibold bg-lime-500 hover:bg-lime-600 text-white px-4 py-2 rounded-lg transition-colors shadow-sm shadow-lime-200">
              {l.navStartFree}
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-20 overflow-hidden">
        <div aria-hidden className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, oklch(0.92 0.12 135 / 0.45) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 80% 80%, oklch(0.88 0.14 110 / 0.3) 0%, transparent 60%)" }} />
        <div aria-hidden className="absolute top-32 left-[8%] size-64 rounded-full bg-lime-200/30 blur-3xl animate-pulse" style={{ animationDuration: "4s" }} />
        <div aria-hidden className="absolute bottom-20 right-[6%] size-80 rounded-full bg-green-200/25 blur-3xl animate-pulse" style={{ animationDuration: "6s", animationDelay: "1s" }} />

        <div className="relative mb-6 inline-flex items-center gap-2 bg-lime-100 border border-lime-200 text-lime-700 text-xs font-semibold px-4 py-1.5 rounded-full">
          <span className="size-1.5 rounded-full bg-lime-500 animate-pulse" />
          {l.heroBadge}
        </div>

        <h1 className="relative font-heading font-bold text-5xl md:text-7xl leading-[1.05] tracking-tight text-gray-900 max-w-4xl">
          {l.heroHeadlinePre}{" "}
          <span className="relative inline-block">
            <span className="relative z-10 text-lime-600">{l.heroHeadlineAccent}</span>
            <svg aria-hidden className="absolute -bottom-1 left-0 w-full" viewBox="0 0 220 10" fill="none">
              <path d="M2 7 Q110 1 218 7" stroke="oklch(0.72 0.18 135)" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </span>{" "}
          {l.heroHeadlinePost}
        </h1>

        <p className="relative mt-6 text-lg md:text-xl text-gray-500 max-w-2xl leading-relaxed">
          {l.heroSub}
        </p>

        <div className="relative mt-10 flex flex-col sm:flex-row items-center gap-4">
          <Link href="/register"
            className="group inline-flex items-center gap-2 bg-lime-500 hover:bg-lime-600 text-white font-semibold text-base px-8 py-3.5 rounded-xl shadow-lg shadow-lime-300/40 transition-all duration-200 hover:shadow-xl hover:shadow-lime-300/50 hover:-translate-y-0.5">
            {l.heroCTA}
            <ArrowRightIcon className={cn("size-4 transition-transform group-hover:translate-x-1", isRTL && "rotate-180")} />
          </Link>
          <Link href="/login"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-lime-700 font-medium text-base px-5 py-3.5 rounded-xl border border-gray-200 hover:border-lime-300 bg-white/70 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5">
            {l.heroSecondaryCTA}
          </Link>
        </div>

        {/* stats */}
        <div className="relative mt-16 flex flex-wrap justify-center gap-10 text-center">
          {[
            { to: 1200, suffix: "+", label: l.statStudents },
            { to: 340, suffix: "+", label: l.statClasses },
            { to: 98, suffix: "%", label: l.statSatisfaction },
          ].map(({ to, suffix, label }) => (
            <div key={label}>
              <p className="font-heading font-bold text-3xl text-lime-600">
                <AnimatedCounter to={to} suffix={suffix} />
              </p>
              <p className="text-sm text-gray-400 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* fake UI preview */}
        <div className="relative mt-20 max-w-3xl w-full mx-auto">
          <div className="rounded-2xl border border-lime-100 bg-white/80 backdrop-blur-md shadow-2xl shadow-lime-200/30 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50/80">
              <span className="size-3 rounded-full bg-red-400" />
              <span className="size-3 rounded-full bg-yellow-400" />
              <span className="size-3 rounded-full bg-lime-400" />
              <span className="flex-1 mx-4 h-5 rounded-md bg-gray-100 text-[10px] flex items-center px-3 text-gray-400">{l.previewUrl}</span>
            </div>
            <div className={cn("flex h-48 md:h-64", isRTL && "flex-row-reverse")}>
              {/* sidebar */}
              <div className={cn("w-44 bg-[#f9fef5] flex flex-col gap-1 p-3", isRTL ? "border-l border-gray-100" : "border-r border-gray-100")}>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">{l.previewChannelLabel}</p>
                {["# general", "# homework", "# announcements", "📹 Live session", "🤖 AI Tutor"].map((c, i) => (
                  <div key={c} className={cn("text-[11px] px-2 py-1.5 rounded-lg cursor-default",
                    i === 0 ? "bg-lime-100 text-lime-700 font-medium" : "text-gray-500")}>
                    {c}
                  </div>
                ))}
              </div>
              {/* chat */}
              <div className="flex-1 flex flex-col p-4 gap-3">
                <div className={cn("flex items-start gap-2", isRTL && "flex-row-reverse")}>
                  <div className="size-6 rounded-full bg-lime-400 shrink-0" />
                  <div className={cn("flex flex-col gap-1", isRTL && "items-end")}>
                    <span className="text-[10px] text-gray-400">{l.previewMsg1Sender}</span>
                    <div className={cn("bg-lime-50 border border-lime-100 px-3 py-2 text-[11px] text-gray-700 max-w-xs",
                      isRTL ? "rounded-xl rounded-tr-none" : "rounded-xl rounded-tl-none")}>
                      {l.previewMsg1}
                    </div>
                  </div>
                </div>
                <div className={cn("flex items-start gap-2 self-end", isRTL ? "flex-row-start" : "flex-row-reverse")}>
                  <div className="size-6 rounded-full bg-emerald-400 shrink-0" />
                  <div className={cn("flex flex-col gap-1", isRTL ? "items-start" : "items-end")}>
                    <span className="text-[10px] text-gray-400">{l.previewMsg2Sender}</span>
                    <div className={cn("bg-white border border-gray-100 px-3 py-2 text-[11px] text-gray-700 max-w-xs",
                      isRTL ? "rounded-xl rounded-tl-none" : "rounded-xl rounded-tr-none")}>
                      {l.previewMsg2}
                    </div>
                  </div>
                </div>
                <div className={cn("flex items-start gap-2", isRTL && "flex-row-reverse")}>
                  <div className="size-6 rounded-full bg-violet-400 shrink-0 flex items-center justify-center text-[8px] text-white font-bold">AI</div>
                  <div className={cn("bg-violet-50 border border-violet-100 px-3 py-2 text-[11px] text-gray-700 max-w-xs",
                    isRTL ? "rounded-xl rounded-tr-none" : "rounded-xl rounded-tl-none")}>
                    {l.previewMsg3}
                    <span className="inline-block w-1 h-3 bg-violet-400 ml-0.5 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div aria-hidden className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-3/4 h-16 bg-lime-300/20 blur-2xl rounded-full" />
        </div>
      </section>

      {/* ── MARQUEE STRIP ────────────────────────────────────────────────── */}
      <section className="py-8 border-y border-lime-100 bg-white/60 backdrop-blur-sm overflow-hidden">
        <div className={cn("flex gap-12 whitespace-nowrap", isRTL ? "animate-[marquee-rtl_18s_linear_infinite]" : "animate-[marquee_18s_linear_infinite]")}>
          {marqueeDoubled.map((text, i) => (
            <span key={i} className="inline-flex items-center gap-3 text-sm font-medium text-gray-400 shrink-0">
              <span className="size-1.5 rounded-full bg-lime-400" />
              {text.trim()}
            </span>
          ))}
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────── */}
      <section id="features" className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-lime-600 mb-3">{l.featuresEyebrow}</p>
            <h2 className="font-heading font-bold text-4xl md:text-5xl text-gray-900">
              {l.featuresHeadlinePre}{" "}
              <span className="text-lime-600">{l.featuresHeadlineAccent}</span>
            </h2>
            <p className="mt-4 text-gray-500 text-lg max-w-xl mx-auto">{l.featuresSub}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard icon={<ChannelsIcon />} title={l.feat1Title} description={l.feat1Desc} accent="bg-lime-100 text-lime-700" />
            <FeatureCard icon={<VideoIcon />} title={l.feat2Title} description={l.feat2Desc} accent="bg-sky-100 text-sky-600" />
            <FeatureCard icon={<AIIcon />} title={l.feat3Title} description={l.feat3Desc} accent="bg-violet-100 text-violet-600" />
            <FeatureCard icon={<AssignmentIcon />} title={l.feat4Title} description={l.feat4Desc} accent="bg-amber-100 text-amber-600" />
            <FeatureCard icon={<OrgIcon />} title={l.feat5Title} description={l.feat5Desc} accent="bg-emerald-100 text-emerald-600" />
            <FeatureCard icon={<ResourceIcon />} title={l.feat6Title} description={l.feat6Desc} accent="bg-rose-100 text-rose-600" />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-gradient-to-b from-white to-[#f0fde4]">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-lime-600 mb-3">{l.howEyebrow}</p>
          <h2 className="font-heading font-bold text-4xl text-gray-900 mb-16">{l.howHeadline}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {([
              { step: "01", title: l.step1Title, desc: l.step1Desc },
              { step: "02", title: l.step2Title, desc: l.step2Desc },
              { step: "03", title: l.step3Title, desc: l.step3Desc },
            ] as const).map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center gap-3">
                <div className="size-14 rounded-2xl bg-lime-500 text-white font-heading font-bold text-lg flex items-center justify-center shadow-md shadow-lime-200">
                  {step}
                </div>
                <h3 className="font-heading font-semibold text-gray-900 text-lg">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-lime-600 mb-3">{l.pricingEyebrow}</p>
            <h2 className="font-heading font-bold text-4xl md:text-5xl text-gray-900">{l.pricingHeadline}</h2>
            <p className="mt-4 text-gray-500 text-lg max-w-lg mx-auto">{l.pricingSub}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <PlanCard name={l.plan1Name} price="200" priceSuffix={l.planPriceSuffix} description={l.plan1Desc}
              features={[l.plan1F1, l.plan1F2, l.plan1F3, l.plan1F4, l.plan1F5]} cta={l.planCTA} />
            <PlanCard name={l.plan2Name} price="500" priceSuffix={l.planPriceSuffix} description={l.plan2Desc}
              features={[l.plan2F1, l.plan2F2, l.plan2F3, l.plan2F4, l.plan2F5]}
              highlighted badge={l.plan2Badge} cta={l.planCTA} />
            <PlanCard name={l.plan3Name} price="150" priceSuffix={l.planPriceSuffix} description={l.plan3Desc}
              features={[l.plan3F1, l.plan3F2, l.plan3F3, l.plan3F4, l.plan3F5]} cta={l.planCTA} />
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
      <section id="testimonials" className="py-28 px-6 bg-gradient-to-b from-[#f0fde4] to-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-lime-600 mb-3">{l.testimonialsEyebrow}</p>
            <h2 className="font-heading font-bold text-4xl text-gray-900">{l.testimonialsHeadline}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Testimonial quote={l.t1Quote} name={l.t1Name} role={l.t1Role} color="bg-lime-500" />
            <Testimonial quote={l.t2Quote} name={l.t2Name} role={l.t2Role} color="bg-emerald-500" />
            <Testimonial quote={l.t3Quote} name={l.t3Name} role={l.t3Role} color="bg-sky-500" />
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-28 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-lime-400 via-lime-500 to-green-500 p-12 md:p-16 shadow-2xl shadow-lime-300/40">
            <div aria-hidden className="absolute -top-8 -right-8 size-40 rounded-full bg-lime-300/30 blur-2xl" />
            <div aria-hidden className="absolute -bottom-8 -left-8 size-52 rounded-full bg-green-400/20 blur-2xl" />
            <p className="relative text-xs font-semibold uppercase tracking-widest text-lime-100 mb-4">{l.ctaEyebrow}</p>
            <h2 className="relative font-heading font-bold text-4xl md:text-5xl text-white leading-tight mb-5">{l.ctaHeadline}</h2>
            <p className="relative text-lime-100 text-lg mb-10 max-w-xl mx-auto">{l.ctaSub}</p>
            <div className="relative flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register"
                className="group inline-flex items-center gap-2 bg-white text-lime-600 font-bold text-base px-8 py-3.5 rounded-xl shadow-lg hover:bg-lime-50 transition-all duration-200 hover:-translate-y-0.5">
                {l.ctaPrimary}
                <ArrowRightIcon className={cn("size-4 transition-transform group-hover:translate-x-1", isRTL && "rotate-180")} />
              </Link>
              <Link href="/login" className="text-lime-100 hover:text-white font-medium text-sm underline underline-offset-4 transition-colors">
                {l.ctaSecondary}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-lime-100 bg-white/60 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <OpenClassLogo href="/" size="sm" />
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} OpenClass. {l.footerCopy}</p>
          <div className="flex items-center gap-4">
            <LangSwitcher />
            <div className="flex gap-5 text-xs text-gray-400">
              <Link href="/login" className="hover:text-lime-600 transition-colors">{l.navSignIn}</Link>
              <Link href="/register" className="hover:text-lime-600 transition-colors">{l.navStartFree}</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* marquee keyframes */}
      <style>{`
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes marquee-rtl { from { transform: translateX(0); } to { transform: translateX(50%); } }
      `}</style>
    </div>
  )
}

// ─── inline svg icons ─────────────────────────────────────────────────────────
function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  )
}
function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6.5" />
      <path d="M8 1.5C8 1.5 5.5 4 5.5 8s2.5 6.5 2.5 6.5M8 1.5C8 1.5 10.5 4 10.5 8S8 14.5 8 14.5M1.5 8h13" />
    </svg>
  )
}
function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4l4 4 4-4" />
    </svg>
  )
}
function ChannelsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-6">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}
function VideoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-6">
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" />
    </svg>
  )
}
function AIIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-6">
      <path d="M12 2a4 4 0 0 1 4 4 4 4 0 0 1-4 4 4 4 0 0 1-4-4 4 4 0 0 1 4-4z" />
      <path d="M20 22a8 8 0 1 0-16 0" />
      <path d="M12 14v4M10 18h4" />
    </svg>
  )
}
function AssignmentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-6">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="2" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
function OrgIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-6">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
function ResourceIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-6">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  )
}
