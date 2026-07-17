import { createLocalClient } from "./supabase-local";

// In Replit the app talks to the local Express API server directly.
// No real Supabase connection is needed.
export const supabase = createLocalClient() as any;
