import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Toaster } from "sonner";
import { Megaphone, Camera, Palette, LineChart, Coffee, Paperclip } from "lucide-react";
import { StickyNote } from "@/components/StickyNote";
import { RoleCard, type Role } from "@/components/RoleCard";
import { ApplicationForm } from "@/components/ApplicationForm";
import { SuccessStamp } from "@/components/SuccessStamp";
import { MusicToggle } from "@/components/MusicToggle";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Careers — Venture Growth Labs" },
      { name: "description", content: "Join Venture Growth Labs in Noida. We run our own ventures in sports, fashion and commodities — not client work. Apply for content, video, design and growth roles." },
      { property: "og:title", content: "Careers — Venture Growth Labs" },
      { property: "og:description", content: "We don't build for other people — we build our own brands across sports, fashion and commodities. Noida-based." },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Special+Elite&family=Caveat:wght@500;700&family=Inter:wght@400;500;600;700&display=swap" },
    ],
  }),
  component: CareersPage,
});

const ROLES: Role[] = [
  {
    id: "lead",
    title: "Growth & Content Lead",
    shortTitle: "Growth & Content Lead",
    summary: "Lead the team, plan strategy, manage execution, track performance across all brands.",
    bullets: [
      "Own strategy & weekly content calendars",
      "Coordinate creators, editors & designers",
      "Track performance and iterate fast",
    ],
    icon: LineChart,
  },
  {
    id: "creator",
    title: "Content Creator / Brand Executive",
    shortTitle: "Content Creator (×2)",
    summary: "Create daily reels, posts, stories, product content and on-ground content for multiple brand pages. We're hiring 2 for this role.",
    bullets: [
      "2 positions open",
      "Daily reels, posts and stories",
      "Ride trends, product content, on-ground shoots",
      "Manage multiple brand voices",
    ],
    icon: Megaphone,
  },
  {
    id: "video",
    title: "Video Editor + Camera",
    shortTitle: "Video Editor + Camera",
    summary: "Shoot and edit reels, product videos, campaign content and high-quality social videos.",
    bullets: [
      "Shoot reels, product & campaign video",
      "Edit in Premiere / CapCut / DaVinci",
      "Sound design, motion, color grade",
    ],
    icon: Camera,
  },
  {
    id: "designer",
    title: "Designer + AI Visual Creator",
    shortTitle: "Designer + AI Visuals",
    summary: "Brand aesthetics, AI shoots, packaging mockups, feed design, thumbnails, posters and campaign visuals.",
    bullets: [
      "Brand systems, feed & thumbnail design",
      "AI shoots, packaging mockups, posters",
      "Campaign visuals end-to-end",
    ],
    icon: Palette,
  },
];

function CareersPage() {
  const [selectedRole, setSelectedRole] = useState<string>(ROLES[0].id);
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  function scrollToForm(id: string) {
    setSelectedRole(id);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  useEffect(() => {
    if (submitted) {
      window.scrollTo({ top: formRef.current?.offsetTop ?? 0, behavior: "smooth" });
    }
  }, [submitted]);

  return (
    <div className="min-h-screen">
      <Toaster position="top-center" richColors />
      <MusicToggle src="/office-theme.mp3" />

      {/* Header */}
      <header className="border-b border-foreground/10 bg-paper/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
          <div className="flex items-center gap-2 font-display tracking-widest text-[11px] sm:text-sm">
            <Paperclip className="h-4 w-4 flex-shrink-0" />
            <span>VENTURE&nbsp;GROWTH&nbsp;LABS</span>
          </div>
          <div className="font-display text-[10px] sm:text-xs text-muted-foreground tracking-widest">
            NOIDA · 5 OPEN POSITIONS
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-6 pt-16 pb-12 md:pt-24 md:pb-20">
        <OfficeScene />
        <div className="relative z-10 grid items-start gap-10 md:grid-cols-[1.4fr_1fr]">
          <div className="paper-rise">
            <p className="font-display text-xs tracking-[0.3em] text-muted-foreground">
              NOW HIRING · NOIDA · 5 OPEN ROLES
            </p>
            <h1 className="font-display mt-4 text-4xl leading-tight text-foreground md:text-6xl">
              Build <span className="highlight-text">our own</span> brands.
              <br />
              <span className="type-caret">Not someone else's.</span>
            </h1>
            <div className="mt-6 max-w-xl space-y-4 text-base text-muted-foreground md:text-lg">
              <p className="font-display text-sm tracking-widest text-foreground/80 uppercase">
                Important — please read:
              </p>
              <p>
                <strong className="text-foreground">Venture Growth Labs is not an agency.</strong>{" "}
                We don't build products or companies for other people. Everything we make is{" "}
                <strong className="text-foreground">our own in-house operation</strong> across{" "}
                <span className="highlight-text">sports, fashion &amp; commodities</span>.
              </p>
              <p>
                You won't be doing client work. You'll be building real brands — ours — from
                Noida, with the team, every single day. Let's make something cool.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={() => scrollToForm(selectedRole)}
                className="cta-bounce inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 font-display text-sm tracking-wide text-primary-foreground shadow-paper"
              >
                Apply now
              </button>
              <a
                href="#roles"
                className="cta-bounce inline-flex items-center gap-2 rounded-md border border-foreground/20 bg-paper px-6 py-3 font-display text-sm tracking-wide text-foreground"
              >
                See open roles
              </a>
              <span className="font-hand text-xl text-foreground/60 ml-1">
                ← do it, your future self said so
              </span>
            </div>
          </div>

          {/* Sticky notes cluster */}
          <div className="relative h-[360px] md:h-[420px]">
            <StickyNote className="absolute left-0 top-2 w-56" variant="yellow">
              In-house only. No client work, ever.
            </StickyNote>
            <StickyNote className="absolute right-0 top-20 w-56" variant="pink">
              Sports. Fashion. Commodities. All ours.
            </StickyNote>
            <StickyNote className="absolute left-8 top-48 w-52" variant="blue">
              Based in Noida. On-ground &amp; hands-on.
            </StickyNote>
            <StickyNote className="absolute right-6 top-64 w-56" variant="green">
              Real ownership. No micro-managing. Promise.
            </StickyNote>
            <div className="clip absolute -right-2 top-[140px] hidden md:block text-foreground/30">
              <Paperclip className="h-14 w-14" strokeWidth={1.2} />
            </div>
          </div>
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        <div className="flex items-end justify-between border-b border-foreground/15 pb-4">
          <div>
            <p className="font-display text-xs tracking-[0.3em] text-muted-foreground">SECTION 02</p>
            <h2 className="font-display mt-1 text-3xl md:text-4xl">Open Positions</h2>
          </div>
          <span className="font-hand text-xl text-foreground/60 hidden md:inline">
            pick one →
          </span>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {ROLES.map((r) => (
            <RoleCard key={r.id} role={r} onApply={scrollToForm} />
          ))}
        </div>
      </section>

      {/* Form / Success */}
      <section ref={formRef} className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <div className="mb-8 text-center">
          <p className="font-display text-xs tracking-[0.3em] text-muted-foreground">SECTION 03</p>
          <h2 className="font-display mt-1 text-3xl md:text-4xl">Submit Your Paperwork</h2>
          <p className="mt-3 text-muted-foreground">
            Fill it out. Drop your intro video. All fields are required.
          </p>
        </div>

        {submitted ? (
          <SuccessStamp />
        ) : (
          <ApplicationForm
            roles={ROLES}
            selectedRole={selectedRole}
            onSelectRole={setSelectedRole}
            onSuccess={() => setSubmitted(true)}
          />
        )}

        <div className="mt-10 rounded-lg border border-dashed border-foreground/20 bg-paper/60 p-5 text-center text-sm text-muted-foreground">
          <p className="font-display text-xs tracking-widest text-foreground/70 uppercase">
            Form not working?
          </p>
          <p className="mt-2">
            If for any reason you can't fill the application form, WhatsApp{" "}
            <strong className="text-foreground">Pranav</strong> at{" "}
            <a
              href="https://wa.me/918882999359"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground underline underline-offset-2"
            >
              +91 88829 99359
            </a>
            .
          </p>
        </div>
      </section>

      <footer className="border-t border-foreground/10 bg-paper/60 py-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5 font-display tracking-widest">
            <Coffee className="h-3.5 w-3.5" /> POWERED BY COFFEE · NOIDA
          </span>
          <span className="font-display tracking-widest">© VENTURE GROWTH LABS</span>
        </div>
      </footer>
    </div>
  );
}

function OfficeScene() {
  // Floating paper sheets that drift down the hero like documents falling off a desk.
  const sheets = [
    { left: "8%",  delay: "0s",   dur: "14s", rot: "-8deg",  dx: "30px",  tint: "var(--note-yellow)" },
    { left: "22%", delay: "3s",   dur: "18s", rot: "6deg",   dx: "-20px", tint: "var(--paper)" },
    { left: "48%", delay: "6s",   dur: "16s", rot: "-4deg",  dx: "40px",  tint: "var(--note-blue)" },
    { left: "70%", delay: "2s",   dur: "20s", rot: "10deg",  dx: "-30px", tint: "var(--note-pink)" },
    { left: "88%", delay: "9s",   dur: "15s", rot: "-12deg", dx: "10px",  tint: "var(--note-green)" },
  ];
  return (
    <div className="office-scene" aria-hidden="true">
      {sheets.map((s, i) => (
        <div
          key={i}
          className="drift"
          style={{
            left: s.left,
            animationDelay: s.delay,
            animationDuration: s.dur,
            // @ts-expect-error css vars
            "--rot": s.rot,
            "--dx": s.dx,
          }}
        >
          <div
            style={{
              width: 44,
              height: 56,
              background: s.tint,
              boxShadow: "1px 2px 0 rgba(60,50,30,0.12), 4px 8px 16px -6px rgba(60,50,30,0.25)",
              borderRadius: 2,
              position: "relative",
            }}
          >
            <div style={{ position: "absolute", top: 10, left: 6, right: 6, height: 2, background: "rgba(60,50,30,0.18)" }} />
            <div style={{ position: "absolute", top: 18, left: 6, right: 10, height: 2, background: "rgba(60,50,30,0.14)" }} />
            <div style={{ position: "absolute", top: 26, left: 6, right: 14, height: 2, background: "rgba(60,50,30,0.14)" }} />
            <div style={{ position: "absolute", top: 34, left: 6, right: 8, height: 2, background: "rgba(60,50,30,0.12)" }} />
          </div>
        </div>
      ))}
    </div>
  );
}


