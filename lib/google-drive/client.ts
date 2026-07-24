import { google } from "googleapis";

import {
  createGoogleDriveAuthorizationClient,
  getGoogleDriveRefreshToken,
} from "@/lib/google/oauth";

const oauth2Client = createGoogleDriveAuthorizationClient();

oauth2Client.setCredentials({
  refresh_token: getGoogleDriveRefreshToken(),
});

export const drive = google.drive({
  version: "v3",
  auth: oauth2Client,
});
