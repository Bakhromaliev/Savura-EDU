// Storage layer for Savura EDU.
// Default: browser localStorage (works instantly, but data is per-browser only).
// Optional: Supabase (shared across ALL visitors) — set VITE_SUPABASE_URL and
// VITE_SUPABASE_ANON_KEY in your environment, and create the `kv` table (see README).

import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

/* ---------- localStorage adapter (default) ---------- */
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

/* ---------- Supabase adapter (shared, when env is configured) ---------- */
function makeSupabase() {
  const sb = createClient(url, anon);
  return {
    async get(key) {
      try {
        const { data, error } = await sb.from("kv").select("value").eq("key", key).maybeSingle();
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
    },
  };
}

export const usingSupabase = Boolean(url && anon);
export const store = usingSupabase ? makeSupabase() : local;
