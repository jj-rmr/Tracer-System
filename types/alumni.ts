import { AppwriteDocument } from "./appwrite";

export interface Alumni extends AppwriteDocument {
  userId: string;

  studentNumber: string;

  course: string;

  campus: string;

  graduationYear: number;

  civilStatus: string;

  birthDate: string;

  sex: string;

  contactNumber: string;

  address: string;
}
