import type { Role } from "@/types";

export interface AuthUser {
  id: string;
  providerUserId: string;
  name: string;
  email: string;
  pictureUrl: string | null;
  role: Role;
  emailVerified: boolean;
  enabled: boolean;
  roleChangeNotice: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthProvider {
  getCurrentUser(): Promise<AuthUser | null>;
  getGoogleAuthorizationUrl(origin: string): Promise<string>;
  completeOAuth(code: string, state?: string | null): Promise<AuthUser>;
  refreshSession(): Promise<void>;
  signOut(): Promise<void>;
  consumeRoleChangeNotice(user: AuthUser): Promise<string | null>;
}
