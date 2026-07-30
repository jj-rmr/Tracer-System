import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { requiredServerEnv } from "@/lib/server/env";
import { fetchSupabase } from "./fetch";

export async function createSupabaseSessionClient() {
  const cookieStore = await cookies();

  return createServerClient(
    requiredServerEnv("SUPABASE_URL"),
    requiredServerEnv("SUPABASE_PUBLISHABLE_KEY"),
    {
      global: { fetch: fetchSupabase },
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {}
        },
      },
    },
  );
}
