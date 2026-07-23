import { NextResponse } from "next/server";
import { createServices } from "@/lib/appwrite/appwrite-server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    // 1. Delete session in Appwrite backend
    const { account } = await createServices();
    await account.deleteSession("current");
  } catch (error) {
    // Session might already be expired or missing on the server
    console.error("Error deleting Appwrite session:", error);
  }

  const response = NextResponse.json({ success: true });

  // 2. Clear all Appwrite session cookies from the browser
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  allCookies.forEach((c) => {
    if (c.name.startsWith("a_session_")) {
      response.cookies.set(c.name, "", {
        path: "/",
        maxAge: 0,
        expires: new Date(0),
      });
    }
  });

  return response;
}
