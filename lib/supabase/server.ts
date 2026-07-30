import { createClient } from "@supabase/supabase-js";
import { requiredServerEnv } from "@/lib/server/env";
import { fetchSupabase } from "./fetch";

export const supabase = createClient(
  requiredServerEnv("SUPABASE_URL"),
  requiredServerEnv("SUPABASE_SECRET_KEY"),
  { global: { fetch: fetchSupabase } },
);
