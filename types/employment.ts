import { AppwriteDocument } from "./appwrite";

export interface Employment extends AppwriteDocument {
  alumniId: string;

  employed: boolean;

  company?: string;

  position?: string;

  employmentStatus?: string;

  salary?: number;

  dateHired?: string;
}
