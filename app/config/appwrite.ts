// app/config/appwrite.ts
import { Client, Account } from "appwrite";

const endpoint =
  process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || process.env.APPWRITE_ENDPOINT;
const projectId =
  process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ||
  process.env.APPWRITE_PROJECT_ID;

export const appwriteConfig = {
  endpoint: endpoint || "",
  projectId: projectId || "",
};

// Brought back the missing configuration checker function
export function hasAppwriteConfig() {
  return Boolean(appwriteConfig.endpoint && appwriteConfig.projectId);
}

// Global Appwrite Client instance
export const client = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId);

// Unified Account service module for client-side hooks/pages
export const account = new Account(client);
