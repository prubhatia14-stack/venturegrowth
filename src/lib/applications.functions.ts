import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ADMIN_EMAIL = "pru.bhatia14@gmail.com";

async function assertAdmin(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error || !data) throw new Error("Forbidden");
}

// Public: expose Turnstile site key to the form
export const getTurnstileSiteKey = createServerFn({ method: "GET" }).handler(
  async () => ({ siteKey: process.env.TURNSTILE_SITE_KEY ?? "" }),
);

const submitSchema = z.object({
  full_name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  instagram: z.string().trim().min(1).max(255),
  role: z.string().min(1).max(50),
  why_join: z.string().trim().min(10).max(2000),
  resume_path: z.string().min(1).max(500),
  turnstile_token: z.string().max(2048).optional().default(""),
  hp: z.string().max(0).optional().default(""), // honeypot — must be empty
});

export const submitApplication = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => submitSchema.parse(input))
  .handler(async ({ data }) => {
    // Honeypot
    if (data.hp && data.hp.length > 0) {
      return { ok: true }; // pretend success for bots
    }

    // Verify Turnstile only if a token was provided (widget may not render on all clients)
    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (data.turnstile_token && secret) {
      const verify = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          headers: { "content-type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ secret, response: data.turnstile_token }),
        },
      );
      const result = (await verify.json()) as { success: boolean };
      if (!result.success) throw new Error("Spam check failed. Please try again.");
    }

    const { error } = await supabaseAdmin.from("applications").insert({
      full_name: data.full_name,
      email: data.email,
      instagram: data.instagram,
      role: data.role,
      why_join: data.why_join,
      resume_path: data.resume_path,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listApplications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { applications: data ?? [] };
  });

export const toggleShortlist = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), shortlisted: z.boolean() }).parse(input),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("applications")
      .update({ shortlisted: data.shortlisted })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getVideoUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ path: z.string().min(1).max(500) }).parse(input),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const { data: signed, error } = await supabaseAdmin.storage
      .from("resumes")
      .createSignedUrl(data.path, 60 * 30);
    if (error || !signed) throw new Error(error?.message ?? "No URL");
    return { url: signed.signedUrl };
  });

export const checkIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    return { isAdmin: !!data, ownerEmail: ADMIN_EMAIL };
  });
