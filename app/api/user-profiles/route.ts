import { NextResponse } from "next/server";
import { Client, Databases } from "node-appwrite";
import { createNextServerHelpers } from "@appwrite.io/react/server/next";

const appwriteConfig = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!,
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!,
};

export async function GET() {
  try {
    const helpers = createNextServerHelpers(appwriteConfig);

    const session = await helpers.readSessionCookie();

    if (!session) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const client = new Client()
      .setEndpoint(appwriteConfig.endpoint)
      .setProject(appwriteConfig.projectId)
      .setSession(session);

    const databases = new Databases(client);

    const response = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_TRACER_DATABASE!,
      process.env.NEXT_PUBLIC_APPWRITE_TRACER_FORM!,
    );

    return NextResponse.json(response.documents);
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        message: error?.message ?? "Failed to fetch Appwrite documents.",
      },
      {
        status: 500,
      },
    );
  }
}
