import { createClient } from "@supabase/supabase-js";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
export const backend = url && key ? createClient(url, key) : null;
export const appName = process.env.NEXT_PUBLIC_APP_NAME || "Math Atlas";
