/**
 * Supabase client — initialized for anon (public) access.
 * No AsyncStorage needed because auth persistence is disabled;
 * all writes use the Row-Level Security anon policy.
 *
 * Required: npm install @supabase/supabase-js
 *
 * Required Supabase table (run in SQL Editor):
 * ─────────────────────────────────────────────
 * create table if not exists orders (
 *   id           uuid default gen_random_uuid() primary key,
 *   created_at   timestamptz default now(),
 *   item         text        not null,
 *   passenger_name text,
 *   status       text        default 'pending',
 *   gate         text,
 *   shop_name    text,
 *   price        numeric,
 *   pin          text
 * );
 * -- Enable Realtime on the table
 * alter publication supabase_realtime add table orders;
 * -- Allow anon reads and inserts (adjust for production)
 * create policy "anon_read"   on orders for select using (true);
 * create policy "anon_insert" on orders for insert with check (true);
 * alter table orders enable row level security;
 * ─────────────────────────────────────────────
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
    process.env.EXPO_PUBLIC_SUPABASE_URL ??
    'https://grzwgbftfjpuguhubkzi.supabase.co';

const SUPABASE_ANON_KEY =
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
    'sb_publishable_3e7aAmJh98BluNy1gwLIlw_VcBeHPBA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        // No auth flows needed — we use anon key for public order data
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
    },
});

// ─── Typed row shape ──────────────────────────────────────────────────────────
export interface SupabaseOrder {
    id: string;
    created_at: string;
    item: string;
    passenger_name: string | null;
    status: string;
    gate: string | null;
    shop_name: string | null;
    price: number | null;
    pin: string | null;
}
