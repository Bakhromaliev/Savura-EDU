// Storage layer for Savura EDU.
//
// Connected to Supabase (shared across ALL visitors) by default.
// The publishable key below is safe to ship in client code — Supabase keys are
// public by design; security is enforced by Row Level Security (RLS) policies.
//
// Robust against quick "save then refresh": every write is stored in
// localStorage instantly (with a timestamp) AND pushed to Supabase. On read we
// take whichever copy is newer, so a refresh never loses a just-made change.

import { createClient } from "@supabase/supabase-js";

const url =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://xxrjcyofbgmcqzoaaktq.supabase.co";

const anon =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "sb_publishable_ceM-8qTVH8RubZcFKsFLOQ_t6iT_uAS";

function readLocal(key) {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return { val: null, ts: 0 };
    const o = JSON.parse(raw);
    if (o && typeof o === "object" && o.__kv) return { val: o.v, ts: o.t || 0 };
    return { val: o, ts: 0 }; // legacy unwrapped value
  } catch {
    return { val: null, ts: 0 };
  }
}
function writeLocal(key, val, ts) {
  try { localStorage.setItem(key, JSON.stringify({ __kv: 1, v: val, t: ts })); } catch {}
}

/* ---------- localStorage-only adapter (used if Supabase is not configured) ---------- */
const local = {
  async get(key) { return readLocal(key).val; },
  async set(key, val) { writeLocal(key, val, Date.now()); },
  async update(key, mutator, fallback) {
    const cur = (await this.get(key)) ?? fallback;
    const next = mutator(cur);
    await this.set(key, next);
    return next;
  },
};

/* ---------- Supabase adapter (shared) with local mirror + newest-wins ---------- */
function makeSupabase() {
  const sb = createClient(url, anon);
  return {
    async get(key) {
      let remote = null, remoteTs = 0;
      try {
        const { data, error } = await sb.from("kv").select("value, updated_at").eq("key", key).maybeSingle();
        if (!error && data) { remote = data.value; remoteTs = data.updated_at ? Date.parse(data.updated_at) : 1; }
      } catch {}
      const { val: localVal, ts: localTs } = readLocal(key);
      if (remote != null && localVal != null) return remoteTs >= localTs ? remote : localVal;
      return remote != null ? remote : localVal;
    },
    async set(key, val) {
      const ts = Date.now();
      writeLocal(key, val, ts); // instant local save (survives an immediate refresh)
      try {
        await sb.from("kv").upsert({ key, value: val, updated_at: new Date(ts).toISOString() }, { onConflict: "key" });
      } catch {}
    },
    // Read the freshest copy, apply a change, then write. Prevents a stale
    // in-memory copy (e.g. another open tab) from overwriting newer data.
    async update(key, mutator, fallback) {
      const cur = (await this.get(key)) ?? fallback;
      const next = mutator(cur);
      await this.set(key, next);
      return next;
    },
  };
}

export const usingSupabase = Boolean(url && anon);
export const store = usingSupabase ? makeSupabase() : local;
