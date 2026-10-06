// ============================================================
// DJ RAKUMI UNIVERSITY — lead storage config
// ============================================================
// To store leads in Supabase, paste your project values below.
// Leave them empty and the form will keep working in LOCAL mode
// (leads saved in the browser's localStorage so none are lost).
//
// Where to find these: Supabase dashboard -> Project Settings -> API
//   SUPABASE_URL      = Project URL        (https://xxxx.supabase.co)
//   SUPABASE_ANON_KEY = Project API key -> anon / public
//
// Required table (SQL to run in Supabase -> SQL Editor):
//
//   create table leads (
//     id uuid primary key default gen_random_uuid(),
//     name text not null,
//     phone text not null,
//     email text,
//     source text,
//     created_at timestamptz default now()
//   );
//   alter table leads enable row level security;
//   create policy "allow public insert" on leads
//     for insert to anon with check (true);
// ============================================================

window.DJR_CONFIG = {
  SUPABASE_URL: "https://ncswkpmiapdgyxiywjvc.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jc3drcG1pYXBkZ3l4aXl3anZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyNzM2MjQsImV4cCI6MjEwNjg0OTYyNH0.Bnt80k19r_Sv_oeWnhwUJV-3XOkcdLUCo1VIsTapRBw",
  SOURCE: "dj-rakumi-university"
};
