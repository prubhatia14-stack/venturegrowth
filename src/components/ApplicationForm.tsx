import { useEffect, useRef, useState, type DragEvent, type FormEvent } from "react";
import { Upload, FileVideo, X, Loader2 } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { getTurnstileSiteKey, submitApplication } from "@/lib/applications.functions";
import type { Role } from "./RoleCard";

const schema = z.object({
  full_name: z.string().trim().min(1, "Name required").max(100),
  email: z.string().trim().email("Valid email required").max(255),
  instagram: z.string().trim().min(1, "Instagram is required").max(255),
  role: z.string().min(1, "Pick a role"),
  why_join: z.string().trim().min(10, "Tell us a bit more (10+ chars)").max(2000),
});

const ALLOWED = ["video/mp4", "video/quicktime", "video/webm", "video/x-matroska", "video/x-m4v", "video/3gpp"];
const MAX_SIZE = 50 * 1024 * 1024;

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: { sitekey: string; callback: (token: string) => void; "error-callback"?: () => void; "expired-callback"?: () => void; theme?: string }) => string;
      reset: (id?: string) => void;
    };
  }
}

export function ApplicationForm({
  roles,
  selectedRole,
  onSelectRole,
  onSuccess,
}: {
  roles: Role[];
  selectedRole: string;
  onSelectRole: (id: string) => void;
  onSuccess: () => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [tsToken, setTsToken] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tsContainerRef = useRef<HTMLDivElement>(null);
  const tsWidgetId = useRef<string | null>(null);

  const siteKeyFn = useServerFn(getTurnstileSiteKey);
  const submitFn = useServerFn(submitApplication);
  const siteKeyQ = useQuery({ queryKey: ["turnstile-site-key"], queryFn: () => siteKeyFn() });

  // Load Turnstile script + render widget
  useEffect(() => {
    if (!siteKeyQ.data?.siteKey) return;
    const SCRIPT_ID = "cf-turnstile-script";
    function render() {
      if (!window.turnstile || !tsContainerRef.current || tsWidgetId.current) return;
      tsWidgetId.current = window.turnstile.render(tsContainerRef.current, {
        sitekey: siteKeyQ.data!.siteKey,
        callback: (token) => setTsToken(token),
        "error-callback": () => setTsToken(""),
        "expired-callback": () => setTsToken(""),
      });
    }
    if (document.getElementById(SCRIPT_ID)) {
      render();
    } else {
      const s = document.createElement("script");
      s.id = SCRIPT_ID;
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      s.async = true;
      s.defer = true;
      s.onload = render;
      document.head.appendChild(s);
    }
  }, [siteKeyQ.data?.siteKey]);

  function handleFiles(files: FileList | null) {
    const f = files?.[0];
    if (!f) return;
    if (!ALLOWED.includes(f.type)) {
      toast.error("Video only (MP4, MOV, WEBM, MKV)");
      return;
    }
    if (f.size > MAX_SIZE) {
      toast.error("Video must be under 50MB");
      return;
    }
    setFile(f);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    const form = new FormData(e.currentTarget);
    const hp = String(form.get("website") ?? "");
    if (hp) {
      // Silently swallow bot
      onSuccess();
      return;
    }

    const parsed = schema.safeParse({
      full_name: form.get("full_name"),
      email: form.get("email"),
      instagram: form.get("instagram"),
      role: selectedRole,
      why_join: form.get("why_join"),
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check the form");
      return;
    }
    if (!file) {
      toast.error("Upload your intro video — it's required");
      return;
    }
    // Turnstile is optional — if the widget didn't render or token expired,
    // honeypot + server-side checks still protect the form.

    setSubmitting(true);
    try {
      const ext = file.name.split(".").pop() ?? "mp4";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("resumes")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (uploadErr) throw uploadErr;

      await submitFn({
        data: {
          ...parsed.data,
          resume_path: path,
          turnstile_token: tsToken,
          hp: "",
        },
      });

      toast.success("Application received!");
      onSuccess();
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Submission failed. Please try again.";
      toast.error(msg);
      // Reset turnstile so user can retry
      if (window.turnstile && tsWidgetId.current) {
        window.turnstile.reset(tsWidgetId.current);
        setTsToken("");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="paper-card rounded-lg p-8 md:p-10 space-y-6">
      <div className="flex items-baseline justify-between border-b border-foreground/10 pb-4">
        <h2 className="font-display text-2xl">Application Form</h2>
        <span className="font-display text-xs text-muted-foreground tracking-widest">FORM 9B / REV 2</span>
      </div>

      <p className="text-xs text-muted-foreground">All fields are required.</p>

      {/* Honeypot: hidden from humans, bots will fill it */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Full name *" name="full_name" placeholder="Jane Halpert" required />
        <Field label="Email *" name="email" type="email" placeholder="jane@example.com" required />
      </div>

      <Field
        label="Instagram (URL or @handle) *"
        name="instagram"
        placeholder="@yourhandle or https://instagram.com/yourhandle"
        required
      />

      <div>
        <Label>Applying for *</Label>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {roles.map((r) => (
            <label
              key={r.id}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2.5 text-sm transition",
                selectedRole === r.id
                  ? "border-foreground/60 bg-accent/50"
                  : "border-foreground/15 bg-paper hover:bg-accent/20",
              )}
            >
              <input
                type="radio"
                name="role-pick"
                value={r.id}
                checked={selectedRole === r.id}
                onChange={() => onSelectRole(r.id)}
                className="accent-foreground"
              />
              <span>{r.shortTitle}</span>
            </label>
          ))}
        </div>
      </div>

      <TextArea
        label="Why do you want to join? *"
        name="why_join"
        rows={4}
        placeholder="No paper pun required, but encouraged."
        required
      />

      <div>
        <Label>Raw intro video — why you're the best for this *</Label>
        <p className="mt-1 text-xs text-muted-foreground">
          Unedited, phone-shot is perfect. MP4 / MOV / WEBM, up to 50MB.
        </p>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "upload-zone mt-2 cursor-pointer rounded-lg px-6 py-10 text-center",
            dragging && "is-dragging",
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/quicktime,video/webm,video/x-matroska,video/x-m4v,video/3gpp"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          {file ? (
            <div className="flex items-center justify-center gap-3">
              <FileVideo className="h-5 w-5 text-foreground/70" />
              <span className="text-sm font-medium">{file.name}</span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                className="rounded-full p-1 hover:bg-foreground/10"
                aria-label="Remove file"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Upload className={cn("h-6 w-6 transition-transform", dragging && "scale-125 -translate-y-1")} />
              <p className="text-sm">
                {dragging ? "Drop the video — we're ready" : "Drag & drop your video, or click to upload"}
              </p>
            </div>
          )}
        </div>
      </div>

      <div>
        <Label>Spam check *</Label>
        <div ref={tsContainerRef} className="mt-2" />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="cta-bounce inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-6 py-3.5 font-display text-base tracking-wide text-primary-foreground shadow-paper disabled:opacity-60"
      >
        {submitting ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Filing your paperwork…</>
        ) : (
          "Submit Application"
        )}
      </button>

      <p className="text-center text-xs text-muted-foreground">
        Stuck? Can't get the form to submit? WhatsApp Pranav at{" "}
        <a href="https://wa.me/918882999359" target="_blank" rel="noopener noreferrer" className="font-medium text-foreground underline underline-offset-2">
          +91 88829 99359
        </a>
        .
      </p>
    </form>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <span className="font-display text-xs tracking-widest text-muted-foreground uppercase">{children}</span>;
}

function Field({
  label, name, type = "text", placeholder, required,
}: { label: string; name: string; type?: string; placeholder?: string; required?: boolean }) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="mt-2 w-full rounded-md border border-foreground/15 bg-paper px-3 py-2.5 text-sm outline-none transition focus:border-foreground/50 focus:ring-2 focus:ring-ring/40"
      />
    </label>
  );
}

function TextArea({
  label, name, rows = 3, placeholder, required,
}: { label: string; name: string; rows?: number; placeholder?: string; required?: boolean }) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <textarea
        name={name}
        rows={rows}
        required={required}
        placeholder={placeholder}
        className="mt-2 w-full resize-none rounded-md border border-foreground/15 bg-paper px-3 py-2.5 text-sm outline-none transition focus:border-foreground/50 focus:ring-2 focus:ring-ring/40"
      />
    </label>
  );
}
