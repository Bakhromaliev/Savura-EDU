# Savura EDU

Türkiye'deki üniversitelere öğrenci yerleştirme sitesi. 5 dilli (TR / UZ / EN / RU / AR), gizli admin paneli, üniversite + fakülte kataloğu, yıllık kontrat ve 5 yıllık burs fiyatları.

Built with **React + Vite**. Ready to deploy on **Vercel**.

---

## 1) Lokal ishga tushirish

```bash
npm install
npm run dev
```

Brauzerda `http://localhost:5173` ochiladi.

## 2) Vercelga joylash (eng oson yo'l)

1. Bu papkani GitHub'ga yangi repozitoriy sifatida yuklang (push).
2. https://vercel.com → **Add New → Project** → repozitoriyni tanlang.
3. Vercel avtomatik **Vite** ni aniqlaydi. Sozlamalar:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Deploy** bosing. Tayyor — sayt manzilini olasiz.

> Domen ulash: Vercel'da Project → Settings → Domains → `savura.edu` (yoki o'zingiznikini) qo'shing.

## 3) Admin panelga kirish

- Saytda istalgan joyda klaviaturada **`admin`** deb yozing, **yoki**
- Eng pastdagi `© ... Savura EDU` yozuvini **4 marta** bosing, **yoki**
- Manzil oxiriga `#admin` qo'shing: `https://sizning-sayt.vercel.app/#admin`

Parol: **`savura2025`**
(Parolni `src/App.jsx` ichidagi `const PASSWORD = "savura2025"` qatoridan o'zgartiring.)

---

## 4) Supabase — allaqachon ulangan ✅

Bu loyiha **Supabase**ga ulangan (manzil va publishable kalit `src/storage.js` ichida). `kv` jadvali yaratilgan va RLS sozlangan. Hech narsa qilish shart emas — sayt ishga tushgach, katalog, sozlamalar va arizalar **barcha tashrif buyuruvchilarga umumiy** bo'ladi.

> Eslatma: agar kelajakda boshqa Supabase loyihasiga o'tsangiz, `src/storage.js` dagi `url` va `anon` qiymatlarini almashtiring (yoki Vercel'da `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` env qo'shing).

<details><summary>Qo'lda Supabase sozlash kerak bo'lsa (SQL)</summary>


1. https://supabase.com da loyiha oching.
2. **SQL Editor** da quyidagini bajaring:

   ```sql
   create table if not exists kv (
     key text primary key,
     value jsonb,
     updated_at timestamptz default now()
   );

   alter table kv enable row level security;

   create policy "kv read"   on kv for select using (true);
   create policy "kv insert" on kv for insert with check (true);
   create policy "kv update" on kv for update using (true);
   ```

3. Supabase → **Project Settings → API** dan `Project URL` va `anon public` kalitini oling.
4. Vercel → Project → **Settings → Environment Variables** ga qo'shing:
   - `VITE_SUPABASE_URL` = Project URL
   - `VITE_SUPABASE_ANON_KEY` = anon public key
5. Qayta **Deploy** qiling. Endi katalog, sozlamalar va arizalar hammaga umumiy.

> Xavfsizlik eslatmasi: yuqoridagi siyosatlar (policy) `kv` jadvalini ommaga ochiq yozishga ruxsat beradi — bu kichik sayt/demo uchun yetarli. Jiddiy himoya kerak bo'lsa, yozishni faqat autentifikatsiyadan o'tgan adminga cheklang (Supabase Auth + RLS).

</details>

---

## Tuzilma

```
savura-edu/
├─ index.html
├─ package.json
├─ vite.config.js
├─ .env.example
└─ src/
   ├─ main.jsx       # kirish nuqtasi
   ├─ App.jsx        # butun sayt (5 til, admin panel, katalog)
   └─ storage.js     # localStorage yoki Supabase (env bo'lsa)
```
