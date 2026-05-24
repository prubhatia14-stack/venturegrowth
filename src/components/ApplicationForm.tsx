import { useRef, useState, type DragEvent, type FormEvent } from "react";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import type { Role } from "./RoleCard";

const schema = z.object({
  full_name: z.string().trim().min(1, "Name required").max(100),
  email: z.string().trim().email("Valid email required").max(255),
  role: z.string().min(1, "Pick a role"),
  why_join: z.string().trim().min(10, "Tell us a bit more (10+ chars)").max(1000),
  fun_answer: z.string().trim().max(500).optional(),
});

const ALLOWED = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    const f = files?.[0];
    if (!f) return;
    if (!ALLOWED.includes(f.type)) {
      toast.error("PDF, DOC, DOCX, or TXT only");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error("File must be under 5MB");
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
    const parsed = schema.safeParse({
      full_name: form.get("full_name"),
      email: form.get("email"),
      role: selectedRole,
      why_join: form.get("why_join"),
      fun_answer: form.get("fun_answer") || undefined,
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check the form");
      return;
    }

    setSubmitting(true);
    try {
      let resume_path: string | null = null;

      if (file) {
        const ext = file.name.split(".").pop() ?? "bin";
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("resumes")
          .upload(path, file, { contentType: file.type, upsert: false });
        if (uploadErr) throw uploadErr;
        resume_path = path;
      }

      const { error: insertErr } = await supabase
        .from("applications")
        .insert({ ...parsed.data, resume_path });
      if (insertErr) throw insertErr;

      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error("Submission failed. Please try again.");
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

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Full name" name="full_name" placeholder="Jane Halpert" required />
        <Field label="Email" name="email" type="email" placeholder="jane@example.com" required />
      </div>

      <div>
        <Label>Applying for</Label>
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
        label="Why do you want to join?"
        name="why_join"
        rows={4}
        placeholder="No paper pun required, but encouraged."
        required
      />

      <TextArea
        label="The fun question: pitch us a stapler-in-jello-level office prank (PG)."
        name="fun_answer"
        rows={3}
        placeholder="Be creative. Or don't. We won't judge. Much."
      />

      <div>
        <Label>Resume (optional, PDF/DOC/TXT, ≤5MB)</Label>
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
            accept=".pdf,.doc,.docx,.txt"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          {file ? (
            <div className="flex items-center justify-center gap-3">
              <FileText className="h-5 w-5 text-foreground/70" />
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
                {dragging ? "Drop it like it's a TPS report" : "Drag & drop, or click to upload"}
              </p>
            </div>
          )}
        </div>
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
