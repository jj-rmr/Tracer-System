import { authProvider } from "./provider";

export async function getCurrentUser() {
  try {
    return await authProvider.getCurrentUser();
  } catch (error) {
    console.error("Authentication session validation failed:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
    });
    throw error;
  }
}
