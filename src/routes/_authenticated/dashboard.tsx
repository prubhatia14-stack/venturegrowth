import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast, Toaster } from "sonner";
import { Loader2, LogOut, Star, Video, Instagram, Mail, CheckCircle2 } from "lucide-react";
import {
  listApplications,
  toggleShortlist,
  getVideoUrl,
  checkIsAdmin,
} from "@/lib/applications.functions";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Applications — Admin" }] }),
  component: Dashboard,
});

type Application = {
  id: string;
  full_name: string;
  email: string;
  instagram: string | null;
  role: string;
  why_join: string;
  resume_path: string | null;
  shortlisted: boolean;
  created_at: string;
};

function Dashboard() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const listFn = useServerFn(listApplications);
  const adminFn = useServerFn(checkIsAdmin);
  const toggleFn = useServerFn(toggleShortlist);
  const videoFn = useServerFn(getVideoUrl);

  const [filter, setFilter] = useState<"all" | "shortlisted" | "new">("all");

  const adminCheck = useQuery({ queryKey: ["isAdmin"], queryFn: () => adminFn() });
  const apps = useQuery({
    queryKey: ["applications"],
    queryFn: () => listFn(),
    enabled: adminCheck.data?.isAdmin === true,
  });

  const toggle = useMutation({
    mutationFn: (v: { id: string; shortlisted: boolean }) => toggleFn({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["applications"] }),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  }

  async function openVideo(path: string) {
    try {
      const { url } = await videoFn({ data: { path } });
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not open video");
    }
  }

  if (adminCheck.isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  }
  if (adminCheck.data && !adminCheck.data.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="paper-card max-w-md rounded-lg p-8 text-center">
          <h1 className="font-display text-xl">Not authorized</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This dashboard is restricted to the account owner ({adminCheck.data.ownerEmail}).
          </p>
          <button onClick={signOut} className="cta-bounce mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </div>
    );
  }

  const all = (apps.data?.applications ?? []) as Application[];
  const list = all.filter((a) =>
    filter === "all" ? true : filter === "shortlisted" ? a.shortlisted : !a.shortlisted,
  );
  const counts = {
    all: all.length,
    shortlisted: all.filter((a) => a.shortlisted).length,
    new: all.filter((a) => !a.shortlisted).length,
  };

  return (
    <div className="min-h-screen">
      <Toaster position="top-center" richColors />
      <header className="border-b border-foreground/10 bg-paper/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <h1 className="font-display tracking-widest text-sm">VGL · APPLICATIONS</h1>
          <button onClick={signOut} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-foreground/10 pb-4">
          <div>
            <p className="font-display text-xs tracking-[0.3em] text-muted-foreground">DASHBOARD</p>
            <h2 className="font-display mt-1 text-3xl">All applications</h2>
          </div>
          <div className="flex gap-2 text-xs">
            {(["all", "new", "shortlisted"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-full border px-3 py-1.5 font-display tracking-wider uppercase",
                  filter === f
                    ? "border-foreground bg-foreground text-background"
                    : "border-foreground/20 hover:bg-accent/30",
                )}
              >
                {f} · {counts[f]}
              </button>
            ))}
          </div>
        </div>

        {apps.isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>
        ) : list.length === 0 ? (
          <p className="py-20 text-center text-muted-foreground">No applications yet.</p>
        ) : (
          <div className="mt-6 grid gap-4">
            {list.map((a) => (
              <article key={a.id} className="paper-card rounded-lg p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-lg">{a.full_name}</h3>
                      {a.shortlisted && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-display tracking-widest text-amber-900 uppercase">
                          <CheckCircle2 className="h-3 w-3" /> Shortlisted
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 font-display text-xs tracking-widest text-muted-foreground uppercase">
                      {a.role} · {new Date(a.created_at).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => toggle.mutate({ id: a.id, shortlisted: !a.shortlisted })}
                    disabled={toggle.isPending}
                    className={cn(
                      "cta-bounce inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-display tracking-wider uppercase shadow-paper",
                      a.shortlisted
                        ? "bg-foreground/5 border border-foreground/20 text-foreground"
                        : "bg-primary text-primary-foreground",
                    )}
                  >
                    <Star className={cn("h-3.5 w-3.5", a.shortlisted && "fill-current")} />
                    {a.shortlisted ? "Remove shortlist" : "Shortlist"}
                  </button>
                </div>

                <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                  <a href={`mailto:${a.email}`} className="inline-flex items-center gap-1.5 text-foreground hover:underline">
                    <Mail className="h-3.5 w-3.5" /> {a.email}
                  </a>
                  {a.instagram && (
                    <a
                      href={a.instagram.startsWith("http") ? a.instagram : `https://instagram.com/${a.instagram.replace(/^@/, "")}`}
                      target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-foreground hover:underline"
                    >
                      <Instagram className="h-3.5 w-3.5" /> {a.instagram}
                    </a>
                  )}
                </div>

                <div className="mt-4 rounded-md border border-foreground/10 bg-paper/60 p-4">
                  <p className="font-display text-[10px] tracking-widest text-muted-foreground uppercase">Why join</p>
                  <p className="mt-1.5 whitespace-pre-wrap text-sm">{a.why_join}</p>
                </div>

                {a.resume_path && (
                  <button
                    onClick={() => openVideo(a.resume_path!)}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-foreground/20 px-3 py-2 text-xs hover:bg-accent/30"
                  >
                    <Video className="h-3.5 w-3.5" /> Watch intro video
                  </button>
                )}
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
