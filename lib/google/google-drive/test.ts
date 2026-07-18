import { drive } from "../google-drive";

export async function testDriveConnection() {
  const response = await drive.files.list({
    pageSize: 5,
    fields: "files(id,name)",
  });

  console.log(response.data.files);

  return response.data.files;
}
