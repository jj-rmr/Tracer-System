import { drive } from "../google-drive";

export async function createFolder(name: string) {
  const response = await drive.files.create({
    requestBody: {
      name,

      mimeType: "application/vnd.google-apps.folder",

      parents: [process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID!],
    },

    fields: "id,name",
  });

  return response.data;
}
