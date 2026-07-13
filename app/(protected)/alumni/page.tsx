import { getCurrentUser, getSessionCookie } from "@/lib/auth";

export default async function AlumniPage() {
  const session = await getSessionCookie();
  const user = await getCurrentUser(session);

  if (!user) {
    return (
      <div className="w-full h-full">
        <h1>Unauthorized</h1>
      </div>
    );
  }

  return (
    <div className="place-self-center h-full">
      <h1>Hello, {user.name}</h1>
    </div>
  );
}
