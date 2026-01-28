import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://pawutljjpmjqofadwsrv.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhd3V0bGpqcG1qcW9mYWR3c3J2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MzE1ODAsImV4cCI6MjA4NTIwNzU4MH0.151ZvK3rvJpIn6anTeijpDIS5okbQ-5GP69arc4ucQY";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
