function requireEnvValue(key: "EXPO_PUBLIC_SUPABASE_URL" | "EXPO_PUBLIC_SUPABASE_ANON_KEY"): string {
  const value = process.env[key];
  if (!value || !value.trim()) {
    throw new Error(`${key} is required.`);
  }
  return value.trim();
}

export const appEnv = {
  supabaseAnonKey: requireEnvValue("EXPO_PUBLIC_SUPABASE_ANON_KEY"),
  supabaseUrl: requireEnvValue("EXPO_PUBLIC_SUPABASE_URL"),
} as const;
