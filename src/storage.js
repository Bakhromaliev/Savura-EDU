// Storage layer for Savura EDU.
//
// - Public marketing data (universities, company) lives in the `kv` table:
//   everyone can READ it; only a signed-in admin can write it (enforced by RLS).
// - Customer inquiries live in the `leads` table: anyone can SUBMIT (insert),
//   but only a signed-in admin can READ them. So contacts can't be stolen.
// - Admin signs in with Supabase Auth (email + password) — checked on the
//   server, so the browser-side code can't be bypassed.
//
// The publishable key below is public by design; security comes from RLS.

import { createClient } from "@supabase/supabase-js";

const url =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://xxrjcyofbgmcqzoaaktq.supabase.co";

const anon =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "sb_publishable_ceM-8qTVH8RubZcFKsFLOQ_t6iT_uAS";

export const usingSupabase = Boolean(url && anon);
const sb = usingSupabase ? createClient(url, anon) : null;

/* ---------- local mirror helpers ---------- */
function readLocal(key) {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return { val: null, ts: 0 };
    const o = JSON.parse(raw);
    if (o && typeof o === "object" && o.__kv) return { val: o.v, ts: o.t || 0 };
    return { val: o, ts: 0 };
  } catch { return { val: null, ts: 0 }; }
}
function writeLocal(key, val, ts) {
  try { localStorage.setItem(key, JSON.stringify({ __kv: 1, v: val, t: ts })); } catch {}
}

/* ---------- kv store (universities, company) ---------- */
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

const supa = {
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
    writeLocal(key, val, ts);
    try {
      await sb.from("kv").upsert({ key, value: val, updated_at: new Date(ts).toISOString() }, { onConflict: "key" });
    } catch {}
  },
  async update(key, mutator, fallback) {
    const cur = (await this.get(key)) ?? fallback;
    const next = mutator(cur);
    await this.set(key, next);
    return next;
  },
};

export const store = usingSupabase ? supa : local;

/* ---------- admin auth (Supabase Auth) ---------- */
export const auth = usingSupabase ? {
  async signIn(email, password) {
    try {
      const { data, error } = await sb.auth.signInWithPassword({ email: (email || "").trim(), password });
      return { ok: !!(data && data.session) && !error, error };
    } catch (e) { return { ok: false, error: e }; }
  },
  async signOut() { try { await sb.auth.signOut(); } catch {} },
  async session() { try { const { data } = await sb.auth.getSession(); return (data && data.session) || null; } catch { return null; } },
} : {
  // offline/demo fallback only (Supabase is normally configured)
  async signIn() { return { ok: true }; },
  async signOut() {},
  async session() { return null; },
};

/* ---------- leads (customer inquiries) ---------- */
export async function addLead(lead) {
  const row = {
    name: lead.name || "", phone: lead.phone || "", email: lead.email || "",
    msg: lead.msg || "", uni: lead.uni || "", faculty: lead.faculty || "",
  };
  if (!usingSupabase) {
    const arr = (await store.get("savura:leads")) || [];
    arr.unshift({ ...row, created_at: new Date().toISOString() });
    await store.set("savura:leads", arr);
    return true;
  }
  try { const { error } = await sb.from("leads").insert(row); return !error; }
  catch { return false; }
}

export async function getLeads() {
  if (!usingSupabase) return (await store.get("savura:leads")) || [];
  try {
    const { data, error } = await sb.from("leads").select("*").order("created_at", { ascending: false });
    if (error) return [];
    return data || [];
  } catch { return []; }
}
