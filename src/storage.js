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
  "https://lvjkxqeoqqzhddctfzba.supabase.co";

const anon =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "sb_publishable_0OpT5m81YxLTza-1XBBAoQ_rX48aFNn";

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
  async isAdmin() { try { const { data } = await sb.rpc("is_admin"); return data === true; } catch { return false; } },
} : {
  // offline/demo fallback only (Supabase is normally configured)
  async signIn() { return { ok: true }; },
  async signOut() {},
  async session() { return null; },
  async isAdmin() { return true; },
};

/* ---------- referral capture (?ref=CODE) ---------- */
const REF_KEY = "savura:ref";
export function captureRef() {
  try {
    const u = new URL(window.location.href);
    const r = (u.searchParams.get("ref") || "").trim();
    if (r) localStorage.setItem(REF_KEY, r);
  } catch {}
}
export function getRef() {
  try { return localStorage.getItem(REF_KEY) || ""; } catch { return ""; }
}

/* ---------- leads (customer inquiries) ---------- */
export async function addLead(lead) {
  const row = {
    name: lead.name || "", phone: lead.phone || "", email: lead.email || "",
    msg: lead.msg || "", uni: lead.uni || "", faculty: lead.faculty || "",
    referral: (lead.referral || getRef() || "").trim(),
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

/* ---------- partner (referral affiliate) platform ---------- */
function genCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous 0/O/1/I
  let s = "";
  for (let i = 0; i < 8; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export const partner = usingSupabase ? {
  async register({ name, email, phone, password, audience }) {
    try {
      const { data, error } = await sb.auth.signUp({ email: (email || "").trim(), password });
      if (error) return { ok: false, error: error.message };
      const uid = data && data.user && data.user.id;
      if (!data || !data.session) {
        // email confirmation is ON -> no session; cannot create profile yet
        return { ok: false, error: "confirm-disabled-needed", uid };
      }
      let code = genCode(), tries = 0, prow = null;
      while (tries < 6) {
        const { data: ins, error: e2 } = await sb.from("partners")
          .insert({ auth_id: uid, name: name || "", email: email || "", phone: phone || "", audience: audience || "", code })
          .select().single();
        if (!e2) { prow = ins; break; }
        if (e2.code === "23505") { code = genCode(); tries++; continue; }
        return { ok: false, error: e2.message };
      }
      return { ok: true, partner: prow };
    } catch (e) { return { ok: false, error: String(e) }; }
  },
  async signIn(email, password) {
    try {
      const { data, error } = await sb.auth.signInWithPassword({ email: (email || "").trim(), password });
      return { ok: !!(data && data.session) && !error, error: error && error.message };
    } catch (e) { return { ok: false, error: String(e) }; }
  },
  async signOut() { try { await sb.auth.signOut(); } catch {} },
  async session() { try { const { data } = await sb.auth.getSession(); return (data && data.session) || null; } catch { return null; } },
  async me() {
    try {
      const { data } = await sb.from("partners").select("*").eq("auth_id", (await sb.auth.getUser()).data.user.id).maybeSingle();
      return data || null;
    } catch { return null; }
  },
  async referrals() {
    try {
      const { data } = await sb.from("leads")
        .select("id,name,phone,uni,faculty,status,reward_usd,created_at")
        .order("created_at", { ascending: false });
      return data || [];
    } catch { return []; }
  },
  async payouts() {
    try {
      const { data } = await sb.from("payouts").select("*").order("created_at", { ascending: false });
      return data || [];
    } catch { return []; }
  },
  async requestPayout({ partner_id, amount, method, details }) {
    try {
      const { error } = await sb.from("payouts").insert({ partner_id, amount_usd: amount, method, details });
      return !error;
    } catch { return false; }
  },
  async checkCode(code) {
    try { const { data } = await sb.rpc("code_available", { p_code: code }); return data === true; }
    catch { return false; }
  },
  async setCode(code) {
    try {
      const uid = (await sb.auth.getUser()).data.user.id;
      const { error } = await sb.from("partners").update({ code }).eq("auth_id", uid);
      if (error) return { ok: false, error: error.code === "23505" ? "taken" : error.message };
      return { ok: true };
    } catch (e) { return { ok: false, error: String(e) }; }
  },
  async messages() {
    try { const { data } = await sb.from("partner_messages").select("*").order("created_at", { ascending: false }); return data || []; }
    catch { return []; }
  },
} : {
  async register() { return { ok: false, error: "offline" }; },
  async signIn() { return { ok: false }; },
  async signOut() {},
  async session() { return null; },
  async me() { return null; },
  async referrals() { return []; },
  async payouts() { return []; },
  async requestPayout() { return false; },
  async checkCode() { return false; },
  async setCode() { return { ok: false }; },
  async messages() { return []; },
};

/* ---------- admin CRM ---------- */
export const admin = usingSupabase ? {
  async partners() {
    try { const { data } = await sb.from("partners").select("*").order("created_at", { ascending: false }); return data || []; }
    catch { return []; }
  },
  async updateLeadStatus(id, status) {
    try { const { error } = await sb.from("leads").update({ status }).eq("id", id); return !error; }
    catch { return false; }
  },
  async payouts() {
    try { const { data } = await sb.from("payouts").select("*, partners(name,code,phone)").order("created_at", { ascending: false }); return data || []; }
    catch { return []; }
  },
  async markPayoutPaid(id) {
    try { const { error } = await sb.from("payouts").update({ status: "paid", paid_at: new Date().toISOString() }).eq("id", id); return !error; }
    catch { return false; }
  },
  async messages() {
    try { const { data } = await sb.from("partner_messages").select("*, partners(name,code)").order("created_at", { ascending: false }); return data || []; }
    catch { return []; }
  },
  async sendMessage({ partner_id, title, body }) {
    try { const { error } = await sb.from("partner_messages").insert({ partner_id: partner_id || null, title: title || "", body: body || "" }); return !error; }
    catch { return false; }
  },
  async deleteMessage(id) {
    try { const { error } = await sb.from("partner_messages").delete().eq("id", id); return !error; }
    catch { return false; }
  },
} : {
  async partners() { return []; },
  async updateLeadStatus() { return false; },
  async payouts() { return []; },
  async markPayoutPaid() { return false; },
  async messages() { return []; },
  async sendMessage() { return false; },
  async deleteMessage() { return false; },
};
