import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast, Toaster } from "sonner";
import { Loader2, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Admin login — Venture Growth Labs" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/dashboard` },
        });
        if (error) throw error;
        toast.success("Account created. Signing you in…");
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate({ to: "/dashboard" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Login failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <Toaster position="top-center" richColors />
      <form onSubmit={onSubmit} className="paper-card w-full max-w-md rounded-lg p-8 space-y-5">
        <div className="flex items-center gap-2 border-b border-foreground/10 pb-4">
          <Lock className="h-4 w-4" />
          <h1 className="font-display text-xl tracking-wide">Admin access</h1>
        </div>

        <p className="text-xs text-muted-foreground">
          Restricted area. Only the account owner can view applications.
        </p>

        <label className="block">
          <span className="font-display text-xs tracking-widest text-muted-foreground uppercase">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-md border border-foreground/15 bg-paper px-3 py-2.5 text-sm outline-none focus:border-foreground/50 focus:ring-2 focus:ring-ring/40"
          />
        </label>

        <label className="block">
          <span className="font-display text-xs tracking-widest text-muted-foreground uppercase">Password</span>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-md border border-foreground/15 bg-paper px-3 py-2.5 text-sm outline-none focus:border-foreground/50 focus:ring-2 focus:ring-ring/40"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="cta-bounce inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 font-display text-sm tracking-wide text-primary-foreground shadow-paper disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {mode === "signin" ? "Sign in" : "Create admin account"}
        </button>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="underline underline-offset-2 hover:text-foreground"
          >
            {mode === "signin" ? "First time? Create the admin account" : "Already have an account? Sign in"}
          </button>
          <Link to="/" className="hover:text-foreground">← back</Link>
        </div>
      </form>
    </div>
  );
}
