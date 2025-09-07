import { createClient } from "@supabase/supabase-js";

// These environment variables should be set in your .env file
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  process.env.REACT_APP_SUPABASE_URL ||
  "your_supabase_project_url_here";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.REACT_APP_SUPABASE_ANON_KEY ||
  "your_supabase_anon_public_key_here";

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;

// Named export for convenience
export { supabase };

// Optional: Service role client for server-side operations (use with caution)
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "your_supabase_service_role_key_here",
);
