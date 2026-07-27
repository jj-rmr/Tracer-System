import { google } from "googleapis";

import {
  createGoogleDriveAuthorizationClient,
  getGoogleDriveRefreshToken,
} from "@/lib/google/oauth";
import { EXTERNAL_TIMEOUTS } from "@/lib/server/timeouts";

google.options({ timeout: EXTERNAL_TIMEOUTS.driveMetadata });

export const googleDriveOAuthClient = createGoogleDriveAuthorizationClient();

googleDriveOAuthClient.setCredentials({
  refresh_token: getGoogleDriveRefreshToken(),
});

export const drive = google.drive({
  version: "v3",
  auth: googleDriveOAuthClient,
});
