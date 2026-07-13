import { AppwriteDocument } from "./appwrite";
import { Role } from "./auth";

export interface UserProfile extends AppwriteDocument {
  userId: string;

  role: Role;

  firstName: string;
  middleName?: string;
  lastName: string;
  extensionName?: string;

  email: string;

  avatar?: string;

  isActive: boolean;
}
