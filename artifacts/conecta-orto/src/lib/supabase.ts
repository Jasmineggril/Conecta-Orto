import { createClient } from "@supabase/supabase-js";
import { createLocalClient } from "./supabase-local";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Se a URL for localhost, usa o mock local que aponta para a API REST
const isLocal = supabaseUrl?.includes("localhost") || supabaseUrl?.includes("127.0.0.1");

export const supabase = isLocal
  ? (createLocalClient() as any)
  : createClient(supabaseUrl, supabaseKey);
