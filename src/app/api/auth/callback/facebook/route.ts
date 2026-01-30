/**
 * Facebook OAuth Callback Route
 *
 * Handles the OAuth callback from Facebook after user authorization.
 * Used for connecting Facebook Ads and Instagram accounts.
 *
 * Flow:
 * 1. User clicks "Connect Facebook" in settings
 * 2. User is redirected to Facebook OAuth dialog
 * 3. After authorization, Facebook redirects here with auth code
 * 4. We exchange the code for a short-lived token
 * 5. We exchange the short-lived token for a long-lived token
 * 6. We get page access tokens for managing pages
 * 7. User is redirected back to settings page
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Environment variables
const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID ?? "";
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET ?? "";
const FACEBOOK_REDIRECT_URI =
  process.env.FACEBOOK_OAUTH_REDIRECT_URI ??
  `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/facebook`;

const GRAPH_API_VERSION = "v19.0";
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

interface FacebookTokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

interface FacebookLongLivedTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface FacebookMeResponse {
  id: string;
  name: string;
  email?: string;
}

interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  category: string;
  instagram_business_account?: {
    id: string;
  };
}

interface FacebookPagesResponse {
  data: FacebookPage[];
}

interface FacebookAdAccount {
  id: string;
  account_id: string;
  name: string;
}

interface FacebookAdAccountsResponse {
  data: FacebookAdAccount[];
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const errorReason = url.searchParams.get("error_reason");
  const errorDescription = url.searchParams.get("error_description");

  // Parse state
  let returnUrl = "/settings?tab=integrations";
  if (state) {
    try {
      const stateData = JSON.parse(Buffer.from(state, "base64").toString());
      returnUrl = stateData.returnUrl || returnUrl;
    } catch {
      // Invalid state, continue with defaults
    }
  }

  // Handle OAuth errors (user denied access)
  if (error) {
    console.error(`[Facebook OAuth] Error: ${error} - ${errorReason} - ${errorDescription}`);
    const errorUrl = new URL(returnUrl, request.url);
    errorUrl.searchParams.set("error", error);
    errorUrl.searchParams.set("error_description", errorDescription ?? errorReason ?? "Unknown error");
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
    // Step 1: Exchange code for short-lived access token
    const tokenUrl = new URL(`${GRAPH_API_BASE}/oauth/access_token`);
    tokenUrl.searchParams.set("client_id", FACEBOOK_APP_ID);
    tokenUrl.searchParams.set("client_secret", FACEBOOK_APP_SECRET);
    tokenUrl.searchParams.set("redirect_uri", FACEBOOK_REDIRECT_URI);
    tokenUrl.searchParams.set("code", code);

    const tokenResponse = await fetch(tokenUrl.toString());

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error(`[Facebook OAuth] Token exchange failed: ${errorText}`);
      throw new Error(`Token exchange failed: ${tokenResponse.status}`);
    }

    const shortLivedToken = (await tokenResponse.json()) as FacebookTokenResponse;

    // Step 2: Exchange for long-lived token (60 days)
    const longLivedUrl = new URL(`${GRAPH_API_BASE}/oauth/access_token`);
    longLivedUrl.searchParams.set("grant_type", "fb_exchange_token");
    longLivedUrl.searchParams.set("client_id", FACEBOOK_APP_ID);
    longLivedUrl.searchParams.set("client_secret", FACEBOOK_APP_SECRET);
    longLivedUrl.searchParams.set("fb_exchange_token", shortLivedToken.access_token);

    const longLivedResponse = await fetch(longLivedUrl.toString());

    if (!longLivedResponse.ok) {
      const errorText = await longLivedResponse.text();
      console.error(`[Facebook OAuth] Long-lived token exchange failed: ${errorText}`);
      throw new Error(`Long-lived token exchange failed`);
    }

    const longLivedToken = (await longLivedResponse.json()) as FacebookLongLivedTokenResponse;

    // Step 3: Get user info
    const meUrl = new URL(`${GRAPH_API_BASE}/me`);
    meUrl.searchParams.set("access_token", longLivedToken.access_token);
    meUrl.searchParams.set("fields", "id,name,email");

    const meResponse = await fetch(meUrl.toString());
    const meData = (await meResponse.json()) as FacebookMeResponse;

    // Step 4: Get pages the user manages
    const pagesUrl = new URL(`${GRAPH_API_BASE}/me/accounts`);
    pagesUrl.searchParams.set("access_token", longLivedToken.access_token);
    pagesUrl.searchParams.set("fields", "id,name,access_token,category,instagram_business_account");

    const pagesResponse = await fetch(pagesUrl.toString());
    const pagesData = (await pagesResponse.json()) as FacebookPagesResponse;
    const pages = pagesData.data || [];

    // Step 5: Get ad accounts
    const adAccountsUrl = new URL(`${GRAPH_API_BASE}/me/adaccounts`);
    adAccountsUrl.searchParams.set("access_token", longLivedToken.access_token);
    adAccountsUrl.searchParams.set("fields", "id,account_id,name");

    const adAccountsResponse = await fetch(adAccountsUrl.toString());
    const adAccountsData = (await adAccountsResponse.json()) as FacebookAdAccountsResponse;
    const adAccounts = adAccountsData.data || [];

    // Use the first page and ad account if available
    const primaryPage = pages[0];
    const primaryAdAccount = adAccounts[0];

    // Build credentials object
    const credentials = {
      app_id: FACEBOOK_APP_ID,
      app_secret: FACEBOOK_APP_SECRET,
      user_id: meData.id,
      user_name: meData.name,
      user_email: meData.email,
      page_id: primaryPage?.id ?? "",
      page_name: primaryPage?.name ?? "",
      page_access_token: primaryPage?.access_token ?? longLivedToken.access_token,
      ad_account_id: primaryAdAccount?.account_id ?? "",
      ad_account_name: primaryAdAccount?.name ?? "",
      instagram_account_id: primaryPage?.instagram_business_account?.id ?? "",
      // Store all pages and ad accounts for user selection later
      available_pages: JSON.stringify(
        pages.map((p) => ({
          id: p.id,
          name: p.name,
          instagram_id: p.instagram_business_account?.id,
        }))
      ),
      available_ad_accounts: JSON.stringify(
        adAccounts.map((a) => ({
          id: a.account_id,
          name: a.name,
        }))
      ),
    };

    // Calculate token expiration (long-lived tokens last ~60 days)
    // Default to 60 days if expires_in is not provided
    const expiresInSeconds = longLivedToken.expires_in ?? 60 * 24 * 60 * 60;
    const tokenExpiresAt = new Date(Date.now() + expiresInSeconds * 1000);

    // Store tokens in database for Facebook
    await prisma.integrationConfig.upsert({
      where: { platform: "facebook" },
      create: {
        platform: "facebook",
        credentials: JSON.stringify(credentials),
        accessToken: longLivedToken.access_token,
        tokenExpiresAt,
        isActive: true,
      },
      update: {
        credentials: JSON.stringify(credentials),
        accessToken: longLivedToken.access_token,
        tokenExpiresAt,
        isActive: true,
        updatedAt: new Date(),
      },
    });

    // If Instagram account is connected, also create/update Instagram integration
    if (credentials.instagram_account_id) {
      await prisma.integrationConfig.upsert({
        where: { platform: "instagram" },
        create: {
          platform: "instagram",
          credentials: JSON.stringify({
            ...credentials,
            linked_to: "facebook", // Mark that this uses Facebook's token
          }),
          accessToken: longLivedToken.access_token,
          tokenExpiresAt,
          isActive: true,
        },
        update: {
          credentials: JSON.stringify({
            ...credentials,
            linked_to: "facebook",
          }),
          accessToken: longLivedToken.access_token,
          tokenExpiresAt,
          isActive: true,
          updatedAt: new Date(),
        },
      });
    }

    console.log(`[Facebook OAuth] Successfully connected for ${meData.name} (${meData.email})`);
    console.log(`[Facebook OAuth] Pages: ${pages.length}, Ad Accounts: ${adAccounts.length}`);

    // Redirect back to settings with success message
    const successUrl = new URL(returnUrl, request.url);
    successUrl.searchParams.set("success", "true");
    successUrl.searchParams.set("platform", "facebook");
    if (credentials.instagram_account_id) {
      successUrl.searchParams.set("instagram_connected", "true");
    }
    return NextResponse.redirect(successUrl);
  } catch (err) {
    console.error(`[Facebook OAuth] Callback error:`, err);

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
 * Generate the Facebook OAuth URL for initiating the flow
 * This is called from the frontend when user clicks "Connect"
 */
export function generateFacebookOAuthUrl(): string {
  // Marketing API + Page permissions
  const permissions = [
    "pages_show_list",
    "pages_read_engagement",
    "ads_read",
    "business_management",
  ];

  // Encode state
  const state = Buffer.from(
    JSON.stringify({
      returnUrl: "/settings?tab=integrations",
    })
  ).toString("base64");

  const params = new URLSearchParams({
    client_id: FACEBOOK_APP_ID,
    redirect_uri: FACEBOOK_REDIRECT_URI,
    response_type: "code",
    scope: permissions.join(","),
    state,
  });

  return `https://www.facebook.com/${GRAPH_API_VERSION}/dialog/oauth?${params.toString()}`;
}
