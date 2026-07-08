"use server";

import { Client, Databases } from "node-appwrite";

export interface UserProfileDocument {
  $id: string;
  userId: string;
  civilStatus: string;
  $createdAt: string;
  $updatedAt: string;
}

export async function fetchUserRegistrations(): Promise<{
  data: UserProfileDocument[] | null;
  error: string | null;
}> {
  try {
    // 1. Initialize safe Server SDK
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
      // Bypasses browser permission limits securely on the server backend
      .setKey(process.env.APPWRITE_API_KEY!);

    const databases = new Databases(client);

    const response = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_TRACER_DATABASE!,
      process.env.NEXT_PUBLIC_APPWRITE_TRACER_FORM!,
    );

    return {
      data: response.documents as unknown as UserProfileDocument[],
      error: null,
    };
  } catch (err: any) {
    console.error("Appwrite Server Action failure:", err);
    return {
      data: null,
      error: err.message || "Failed to retrieve documents via backend router.",
    };
  }
}
