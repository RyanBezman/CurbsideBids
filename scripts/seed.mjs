import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

function loadEnvFile(fileName) {
  const envPath = path.join(process.cwd(), fileName);
  if (!fs.existsSync(envPath)) return;

  const content = fs.readFileSync(envPath, "utf8");
  const lines = content.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const match = line.match(/^([^=]+)=(.*)$/);
    if (!match) continue;

    const key = match[1].trim();
    let value = match[2].trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const supabaseUrl =
  process.env.SUPABASE_URL || "https://pawutljjpmjqofadwsrv.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error(
    "Missing SUPABASE_SERVICE_ROLE_KEY. Set it in your shell before running npm run seed."
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const seedUsers = [
  {
    email: "a@aol.com",
    password: "aaaaaa",
    full_name: "Ryan Bezman",
    phone: "5164064098",
  },
  {
    email: "b@aol.com",
    password: "bbbbbb",
    full_name: "Matthew Bezman",
    phone: "5162797883",
  },
  {
    email: "c@aol.com",
    password: "cccccc",
    full_name: "Terence Bezman",
    phone: "5165327603",
  },
];

async function deleteAllUsers() {
  let page = 1;
  const perPage = 200;
  let deleted = 0;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) throw error;

    const users = data?.users ?? [];
    if (!users.length) break;

    for (const user of users) {
      const { error: deleteError } = await supabase.auth.admin.deleteUser(
        user.id
      );
      if (deleteError) throw deleteError;
      deleted += 1;
    }

    if (users.length < perPage) break;
    page += 1;
  }

  return deleted;
}

async function createSeedUsers() {
  for (const user of seedUsers) {
    const { error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: {
        full_name: user.full_name,
        phone: user.phone,
      },
    });
    if (error) throw error;
  }
}

async function main() {
  const deletedCount = await deleteAllUsers();
  await createSeedUsers();
  console.log(
    `Seed complete: deleted ${deletedCount} existing user(s), created ${seedUsers.length} user(s).`
  );
}

main().catch((error) => {
  console.error("Seed failed:", error.message || error);
  process.exit(1);
});
