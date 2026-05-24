import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Toaster } from "sonner";
import { Megaphone, Camera, Palette, LineChart, Coffee, Paperclip } from "lucide-react";
import { StickyNote } from "@/components/StickyNote";
import { RoleCard, type Role } from "@/components/RoleCard";
import { ApplicationForm } from "@/components/ApplicationForm";
import { SuccessStamp } from "@/components/SuccessStamp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Careers — Apply to the Branch" },
      { name: "description", content: "Open roles for content, video, design and growth. Submit your application — the Regional Manager will review it. Probably." },
      { property: "og:title", content: "Careers — Apply to the Branch" },
      { property: "og:description", content: "Open roles for content, video, design and growth." },
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
    shortTitle: "Content Creator",
    summary: "Create daily reels, posts, stories, product content and on-ground content for multiple brand pages.",
    bullets: [
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

      {/* Header */}
      <header className="border-b border-foreground/10 bg-paper/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 font-display tracking-widest text-sm">
            <Paperclip className="h-4 w-4" />
            HUMAN&nbsp;RESOURCES
          </div>
          <div className="font-display text-xs text-muted-foreground tracking-widest">
            MEMO / OPEN POSITIONS
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-6 pt-16 pb-12 md:pt-24 md:pb-20">
        <div className="grid items-start gap-10 md:grid-cols-[1.4fr_1fr]">
          <div className="paper-rise">
            <p className="font-display text-xs tracking-[0.3em] text-muted-foreground">
              NOW HIRING · 4 OPEN ROLES
            </p>
            <h1 className="font-display mt-4 text-4xl leading-tight text-foreground md:text-6xl">
              Come work at the
              <br />
              <span className="highlight-text">best branch</span> on the internet.
            </h1>
            <p className="mt-6 max-w-xl text-base text-muted-foreground md:text-lg">
              We make content. Lots of it. For multiple brands, every single day.
              You'll get great teammates, real ownership, and approximately one (1)
              questionable office mug.
            </p>
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
              "Best team I've worked with. The snacks are also fine."
              <div className="font-body mt-3 text-xs text-foreground/60">— Anonymous</div>
            </StickyNote>
            <StickyNote className="absolute right-0 top-20 w-56" variant="pink">
              Pitch days every Friday. Bring weird ideas.
            </StickyNote>
            <StickyNote className="absolute left-8 top-48 w-52" variant="blue">
              Remote-friendly. Async-first. Meetings only when truly required.
            </StickyNote>
            <StickyNote className="absolute right-6 top-64 w-56" variant="green">
              Real ownership. No micro-managing. Promise.
            </StickyNote>
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
            Fill it out. Drop your resume. We read everything.
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
      </section>

      <footer className="border-t border-foreground/10 bg-paper/60 py-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5 font-display tracking-widest">
            <Coffee className="h-3.5 w-3.5" /> POWERED BY COFFEE
          </span>
          <span className="font-display tracking-widest">© THE BRANCH</span>
        </div>
      </footer>
    </div>
  );
}
