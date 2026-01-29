/**
 * Google OAuth Callback Route
 *
 * Handles the OAuth 2.0 callback from Google after user authorization.
 * Used for connecting Google Ads and Google Analytics accounts.
 *
 * Flow:
 * 1. User clicks "Connect Google Ads" in settings
 * 2. User is redirected to Google OAuth consent screen
 * 3. After authorization, Google redirects here with auth code
 * 4. We exchange the code for tokens and store them
 * 5. User is redirected back to settings page
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Environment variables
const GOOGLE_CLIENT_ID = process.env.GOOGLE_ADS_CLIENT_ID ?? "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_ADS_CLIENT_SECRET ?? "";
const GOOGLE_REDIRECT_URI =
  process.env.GOOGLE_OAUTH_REDIRECT_URI ??
  `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/google`;

interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

interface GoogleUserInfo {
  sub: string;
  email: string;
  name?: string;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");

  // Parse state to get the platform (google_ads or google_analytics)
  let platform = "google_ads";
  let returnUrl = "/settings?tab=integrations";

  if (state) {
    try {
      const stateData = JSON.parse(Buffer.from(state, "base64").toString());
      platform = stateData.platform || "google_ads";
      returnUrl = stateData.returnUrl || returnUrl;
    } catch {
      // Invalid state, continue with defaults
    }
  }

  // Handle OAuth errors
  if (error) {
    console.error(`[Google OAuth] Error: ${error} - ${errorDescription}`);
    const errorUrl = new URL(returnUrl, request.url);
    errorUrl.searchParams.set("error", error);
    errorUrl.searchParams.set("error_description", errorDescription ?? "Unknown error");
    return NextResponse.redirect(errorUrl);
  }

  // Verify we have an authorization code
  if (!code) {
    const errorUrl = new URL(returnUrl, request.url);
    errorUrl.searchParams.set("error", "missing_code");
    errorUrl.searchParams.set("error_description", "No authorization code received");
    return NextResponse.redirect(errorUrl);
  }

  try {
    // Exchange authorization code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: GOOGLE_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error(`[Google OAuth] Token exchange failed: ${errorText}`);
      throw new Error(`Token exchange failed: ${tokenResponse.status}`);
    }

    const tokens = (await tokenResponse.json()) as GoogleTokenResponse;

    // Get user info to verify the account
    const userInfoResponse = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      }
    );

    let userEmail = "";
    if (userInfoResponse.ok) {
      const userInfo = (await userInfoResponse.json()) as GoogleUserInfo;
      userEmail = userInfo.email;
    }

    // Get existing credentials to preserve developer_token and customer_id
    const existingConfig = await prisma.integrationConfig.findUnique({
      where: { platform },
    });

    let existingCredentials: Record<string, string> = {};
    if (existingConfig?.credentials) {
      try {
        existingCredentials = JSON.parse(existingConfig.credentials);
      } catch {
        // Ignore parse errors
      }
    }

    // Build credentials object
    const credentials = {
      ...existingCredentials,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: tokens.refresh_token ?? existingCredentials.refresh_token ?? "",
      connected_email: userEmail,
    };

    // Store tokens in database
    await prisma.integrationConfig.upsert({
      where: { platform },
      create: {
        platform,
        credentials: JSON.stringify(credentials),
        accessToken: tokens.access_token,
        tokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
        isActive: true,
      },
      update: {
        credentials: JSON.stringify(credentials),
        accessToken: tokens.access_token,
        tokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
        isActive: true,
        updatedAt: new Date(),
      },
    });

    console.log(`[Google OAuth] Successfully connected ${platform} for ${userEmail}`);

    // Redirect back to settings with success message
    const successUrl = new URL(returnUrl, request.url);
    successUrl.searchParams.set("success", "true");
    successUrl.searchParams.set("platform", platform);
    return NextResponse.redirect(successUrl);
  } catch (err) {
    console.error(`[Google OAuth] Callback error:`, err);

    const errorUrl = new URL(returnUrl, request.url);
    errorUrl.searchParams.set("error", "token_exchange_failed");
    errorUrl.searchParams.set(
      "error_description",
      err instanceof Error ? err.message : "Failed to exchange authorization code"
    );
    return NextResponse.redirect(errorUrl);
  }
}

/**
 * Generate the Google OAuth URL for initiating the flow
 * This is called from the frontend when user clicks "Connect"
 */
export function generateGoogleOAuthUrl(
  platform: "google_ads" | "google_analytics"
): string {
  // Define scopes based on platform
  const scopes =
    platform === "google_ads"
      ? ["https://www.googleapis.com/auth/adwords"]
      : ["https://www.googleapis.com/auth/analytics.readonly"];

  // Add common scopes
  scopes.push(
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile"
  );

  // Encode state with platform info
  const state = Buffer.from(
    JSON.stringify({
      platform,
      returnUrl: "/settings?tab=integrations",
    })
  ).toString("base64");

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: scopes.join(" "),
    access_type: "offline",
    prompt: "consent", // Force consent to get refresh token
    state,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}
