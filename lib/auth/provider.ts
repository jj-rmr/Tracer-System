import "server-only";

import { supabaseAuthProvider } from "@/lib/auth/providers/supabase";
import type { AuthProvider } from "./types";

export const authProvider: AuthProvider = supabaseAuthProvider;
