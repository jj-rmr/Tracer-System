import { getCurrentUser, getSessionCookie } from "@/lib/auth";

export default async function AdminPage() {
  const session = await getSessionCookie();
  const user = await getCurrentUser(session);

  if (!user) {
    return (
      <div>
        <h1>Unauthorized</h1>
      </div>
    );
  }

  return (
    <div>
      <h1>Hello, {user.name}</h1>
    </div>
  );
}
