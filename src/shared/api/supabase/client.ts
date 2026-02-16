import { createClient } from "@supabase/supabase-js";
import { appEnv } from "../../config/env";

export const supabase = createClient(appEnv.supabaseUrl, appEnv.supabaseAnonKey);
