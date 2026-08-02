type AppwriteUser = {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  name: string;
  email: string;
  emailVerification: boolean;
  status: boolean;
  labels?: string[];
};

type AppwriteUserList = {
  total: number;
  users: AppwriteUser[];
};

const apply = process.argv.includes("--apply");
const pageSize = 100;

function required(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value.replace(/\/$/, "");
}

const appwriteEndpoint = required("APPWRITE_ENDPOINT");
const appwriteProjectId = required("APPWRITE_PROJECT_ID");
const appwriteApiKey = required("APPWRITE_API_KEY");
const supabaseUrl = required("SUPABASE_URL");
const supabaseSecretKey = required("SUPABASE_SECRET_KEY");

async function listUsers(offset: number) {
  const url = new URL(`${appwriteEndpoint}/users`);
  url.searchParams.append(
    "queries[]",
    JSON.stringify({ method: "limit", values: [pageSize] }),
  );
  url.searchParams.append(
    "queries[]",
    JSON.stringify({ method: "offset", values: [offset] }),
  );

  const response = await fetch(url, {
    headers: {
      "X-Appwrite-Project": appwriteProjectId,
      "X-Appwrite-Key": appwriteApiKey,
      "X-Appwrite-Response-Format": "1.8.0",
    },
  });

  if (!response.ok) {
    throw new Error(`Appwrite list users failed (${response.status})`);
  }

  return (await response.json()) as AppwriteUserList;
}

async function readAllUsers() {
  const users: AppwriteUser[] = [];
  let total = Number.POSITIVE_INFINITY;

  while (users.length < total) {
    const page = await listUsers(users.length);
    total = page.total;
    users.push(...page.users);
    if (page.users.length === 0) break;
  }

  return users;
}

function mapUser(user: AppwriteUser) {
  const labels = user.labels ?? [];
  return {
    id: user.$id,
    provider: "appwrite",
    provider_user_id: null,
    email: user.email.trim().toLowerCase(),
    name: user.name.trim() || user.email.split("@")[0],
    role: labels.includes("admin") ? "admin" : "alumni",
    email_verified: user.emailVerification,
    enabled: user.status,
    created_at: user.$createdAt,
    updated_at: user.$updatedAt,
  };
}

async function upsertAccounts(accounts: ReturnType<typeof mapUser>[]) {
  for (let offset = 0; offset < accounts.length; offset += pageSize) {
    const batch = accounts.slice(offset, offset + pageSize);
    const response = await fetch(
      `${supabaseUrl}/rest/v1/auth_accounts?on_conflict=id`,
      {
        method: "POST",
        headers: {
          apikey: supabaseSecretKey,
          Authorization: `Bearer ${supabaseSecretKey}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates,return=minimal",
        },
        body: JSON.stringify(batch),
      },
    );

    if (!response.ok) {
      const message = await response.text();
      throw new Error(
        `Supabase upsert failed (${response.status}): ${message}`,
      );
    }

    console.log(`Imported ${Math.min(offset + pageSize, accounts.length)}/${accounts.length}`);
  }
}

const users = await readAllUsers();
const accounts = users.map(mapUser);
const duplicateEmails = accounts
  .map((account) => account.email)
  .filter((email, index, all) => all.indexOf(email) !== index);

console.log(`Read ${accounts.length} Appwrite accounts.`);
console.log(
  `Roles: ${accounts.filter((account) => account.role === "admin").length} admin, ${accounts.filter((account) => account.role === "alumni").length} alumni.`,
);
console.log(
  `Status: ${accounts.filter((account) => account.enabled).length} enabled, ${accounts.filter((account) => !account.enabled).length} disabled.`,
);

if (duplicateEmails.length > 0) {
  throw new Error(
    `Aborting: ${new Set(duplicateEmails).size} duplicate normalized email(s) found.`,
  );
}

if (!apply) {
  console.log("Dry run complete. Re-run with --apply to write to Supabase.");
} else {
  await upsertAccounts(accounts);
  console.log(`Migration complete: ${accounts.length} accounts imported.`);
}
