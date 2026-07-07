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

export function hasAppwriteConfig() {
  return Boolean(appwriteConfig.endpoint && appwriteConfig.projectId);
}

export const client = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId);

export const account = new Account(client);
