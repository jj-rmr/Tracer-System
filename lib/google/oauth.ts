import { google } from "googleapis";

function requireEnvironmentVariable(name: string) {
  const value = process.env[name];

  if (value) {
    return value;
  }

  throw new Error(`Missing required environment variable: ${name}`);
}

function createGoogleOAuthClient(
  clientId: string,
  clientSecret: string,
  redirectUri: string,
) {
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export function createGoogleSignInClient() {
  return createGoogleOAuthClient(
    requireEnvironmentVariable("GOOGLE_SIGN_IN_CLIENT_ID"),
    requireEnvironmentVariable("GOOGLE_SIGN_IN_CLIENT_SECRET"),
    requireEnvironmentVariable("GOOGLE_SIGN_IN_REDIRECT_URI"),
  );
}

export function createGoogleDriveAuthorizationClient() {
  return createGoogleOAuthClient(
    requireEnvironmentVariable("GOOGLE_DRIVE_CLIENT_ID"),
    requireEnvironmentVariable("GOOGLE_DRIVE_CLIENT_SECRET"),
    requireEnvironmentVariable("GOOGLE_DRIVE_REDIRECT_URI"),
  );
}

export function getGoogleDriveRefreshToken() {
  return requireEnvironmentVariable("GOOGLE_DRIVE_REFRESH_TOKEN");
}
