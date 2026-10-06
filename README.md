# DJ Rakumi University — Landing Page

A fast, mobile-first demand-validation landing page. One job: turn TikTok
visitors into early-access leads (name + phone, optional email).

## Run locally

```
python -m http.server 8902
```

Then open http://127.0.0.1:8902/

## Files

- `index.html` — the full page (hero, copy, form, success state, SEO/OG meta)
- `app.js` — form validation + lead submission
- `config.js` — Supabase connection (edit this to go live)
- `images/dj-rakumi.jpg` — the brand photo (add it; placeholder shows until then)

## Add the DJ Rakumi photo

Drop the real photo at `images/dj-rakumi.jpg` (square, compressed < ~200 KB).
No code change needed.

## Connect Supabase (to store leads for real)

1. In Supabase → SQL Editor, run:

   ```sql
   create table leads (
     id uuid primary key default gen_random_uuid(),
     name text not null,
     phone text not null,
     email text,
     source text,
     created_at timestamptz default now()
   );
   alter table leads enable row level security;
   create policy "allow public insert" on leads
     for insert to anon with check (true);
   ```

2. In `config.js`, paste:
   - `SUPABASE_URL` — Project Settings → API → Project URL
   - `SUPABASE_ANON_KEY` — Project Settings → API → anon / public key

That's it. Leads then insert into the `leads` table with `source = "dj-rakumi-university"`.

**Before Supabase is configured:** the form still works and saves leads to the
browser's `localStorage` (key `djr_leads`) so nothing is lost — but that is local
to one device. Connect Supabase before sending real traffic.
