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
    "Missing SUPABASE_SERVICE_ROLE_KEY. Set it in .env.local/.env or your shell before running npm run seed."
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
    role: "rider",
  },
  {
    email: "b@aol.com",
    password: "bbbbbb",
    full_name: "Matthew Bezman",
    phone: "5162797883",
    role: "rider",
  },
  {
    email: "c@aol.com",
    password: "cccccc",
    full_name: "Terence Bezman",
    phone: "5165327603",
    role: "rider",
  },
  {
    email: "d@aol.com",
    password: "dddddd",
    full_name: "Steve Bezman",
    phone: "5160000004",
    role: "driver",
  },
  {
    email: "e@aol.com",
    password: "eeeeee",
    full_name: "Amrit Singh",
    phone: "5160000005",
    role: "driver",
  },
  {
    email: "f@aol.com",
    password: "ffffff",
    full_name: "Steve Matthews",
    phone: "5160000006",
    role: "driver",
  },
];

const rideTypes = ["Economy", "XL", "Luxury", "Luxury SUV"];
const rideKinds = ["ride", "scheduled", "package"];

const locationPairs = [
  ["JFK Airport Terminal 4", "Times Square, Manhattan"],
  ["Penn Station, Manhattan", "LaGuardia Airport Terminal B"],
  ["Grand Central Terminal", "Brooklyn Bridge Park"],
  ["Prospect Park, Brooklyn", "Yankee Stadium, Bronx"],
  ["Barclays Center, Brooklyn", "Columbia University, Manhattan"],
  ["Roosevelt Field Mall, Garden City", "Long Beach Boardwalk"],
  ["Northwell Health, Manhasset", "UBS Arena, Elmont"],
  ["Nassau Coliseum, Uniondale", "Jones Beach State Park"],
  ["Atlantic Terminal, Brooklyn", "Citi Field, Queens"],
  ["Flushing Main St, Queens", "Wall Street, Manhattan"],
  ["Astoria Park, Queens", "Chelsea Market, Manhattan"],
  ["Forest Hills, Queens", "Bryant Park, Manhattan"],
];

function pickFrom(list, seed) {
  return list[seed % list.length];
}

function isoAtHoursFromNow(hoursFromNow) {
  return new Date(Date.now() + hoursFromNow * 60 * 60 * 1000).toISOString();
}

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
  const createdUsers = [];

  for (const user of seedUsers) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: {
        full_name: user.full_name,
        phone: user.phone,
        role: user.role,
      },
    });
    if (error) throw error;
    if (!data?.user?.id) {
      throw new Error(`Unable to resolve created user id for ${user.email}`);
    }

    createdUsers.push({
      id: data.user.id,
      email: user.email,
      role: user.role,
    });
  }

  return createdUsers;
}

function buildSeedReservationsForUser(userId, userSeed) {
  const rows = [];

  for (let i = 0; i < 16; i += 1) {
    const pairSeed = userSeed * 31 + i;
    const [pickup, dropoff] = pickFrom(locationPairs, pairSeed);
    const rideType = pickFrom(rideTypes, pairSeed);
    const kind = pickFrom(rideKinds, pairSeed + 7);

    let status = "pending";
    let scheduledAtHours = 2 + (i % 10);
    let createdAtHours = -(72 - i * 5);
    let canceledAt = null;

    const statusSlot = i % 4;

    if (statusSlot === 1) {
      status = "accepted";
      scheduledAtHours = -(36 - i * 2);
      createdAtHours = -(84 - i * 4);
    } else if (statusSlot === 2) {
      status = "completed";
      scheduledAtHours = -(22 - i);
      createdAtHours = -(96 - i * 3);
    } else if (statusSlot === 3) {
      status = "canceled";
      scheduledAtHours = -(18 - i);
      createdAtHours = -(96 - i * 3);
      canceledAt = isoAtHoursFromNow(-(12 - i));
    }

    rows.push({
      user_id: userId,
      kind,
      status,
      pickup_label: pickup,
      pickup_lat: null,
      pickup_lng: null,
      dropoff_label: dropoff,
      dropoff_lat: null,
      dropoff_lng: null,
      ride_type: rideType,
      scheduled_at: isoAtHoursFromNow(scheduledAtHours),
      created_at: isoAtHoursFromNow(createdAtHours),
      canceled_at: canceledAt,
    });
  }

  return rows;
}

async function createSeedReservations(createdUsers) {
  const riderUsers = createdUsers.filter((user) => user.role === "rider");
  if (!riderUsers.length) return 0;

  const reservationRows = riderUsers.flatMap((user, index) =>
    buildSeedReservationsForUser(user.id, index + 1)
  );

  const { error } = await supabase.from("reservations").insert(reservationRows);
  if (error) throw error;

  return reservationRows.length;
}

async function main() {
  const deletedCount = await deleteAllUsers();
  const createdUsers = await createSeedUsers();
  const createdReservationsCount = await createSeedReservations(createdUsers);
  console.log(
    `Seed complete: deleted ${deletedCount} existing user(s), created ${seedUsers.length} user(s), created ${createdReservationsCount} reservation(s).`
  );
}

main().catch((error) => {
  console.error("Seed failed:", error?.message || error);
  process.exit(1);
});
