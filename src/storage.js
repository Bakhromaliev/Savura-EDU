// Storage layer for Savura EDU.
//
// Connected to Supabase (shared across ALL visitors) by default.
// The publishable key below is safe to ship in client code — Supabase keys are
// public by design; security is enforced by Row Level Security (RLS) policies.
// You can override these with environment variables if you ever move projects.

import { createClient } from "@supabase/supabase-js";

const url =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://xxrjcyofbgmcqzoaaktq.supabase.co";

const anon =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "sb_publishable_ceM-8qTVH8RubZcFKsFLOQ_t6iT_uAS";

/* ---------- localStorage fallback (used only if Supabase is unreachable) ---------- */
const local = {
  async get(key) {
    try {
      const v = localStorage.getItem(key);
      return v == null ? null : JSON.parse(v);
    } catch {
      return null;
    }
  },
  async set(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch {}
  },
};

/* ---------- Supabase adapter (shared key/value store) ---------- */
function makeSupabase() {
  const sb = createClient(url, anon);
  return {
    async get(key) {
      try {
        const { data, error } = await sb
          .from("kv")
          .select("value")
          .eq("key", key)
          .maybeSingle();
        if (error || !data) return null;
        return data.value;
      } catch {
        return null;
      }
    },
    async set(key, val) {
      try {
        await sb.from("kv").upsert({ key, value: val }, { onConflict: "key" });
      } catch {}
      try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
    },
  };
}

export const usingSupabase = Boolean(url && anon);
export const store = usingSupabase ? makeSupabase() : local;
