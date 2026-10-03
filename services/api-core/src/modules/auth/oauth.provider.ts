import { env } from '../../config/env.js';
import { AuthError } from './auth.service.js';

export interface NormalizedOAuthProfile {
  provider: 'github' | 'google';
  providerAccountId: string;
  email: string;
  username: string;
  avatarUrl: string | null;
}

export interface IOAuthProviderClient {
  getAuthorizationUrl(params: {
    provider: 'github' | 'google';
    state: string;
    codeChallenge?: string;
    redirectUri?: string;
  }): string;

  exchangeCodeForProfile(params: {
    provider: 'github' | 'google';
    code: string;
    codeVerifier?: string;
    redirectUri?: string;
  }): Promise<NormalizedOAuthProfile>;
}

export class OAuthProviderClient implements IOAuthProviderClient {
  getAuthorizationUrl({
    provider,
    state,
    codeChallenge,
    redirectUri,
  }: {
    provider: 'github' | 'google';
    state: string;
    codeChallenge?: string;
    redirectUri?: string;
  }): string {
    if (provider === 'github') {
      const clientId = env.GITHUB_CLIENT_ID || 'mock_github_client_id';
      const callback = redirectUri || env.GITHUB_CALLBACK_URL;
      const scope = 'read:user,user:email';
      return `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(
        clientId,
      )}&redirect_uri=${encodeURIComponent(callback)}&scope=${encodeURIComponent(
        scope,
      )}&state=${encodeURIComponent(state)}`;
    }

    if (provider === 'google') {
      const clientId = env.GOOGLE_CLIENT_ID || 'mock_google_client_id';
      const callback = redirectUri || env.GOOGLE_CALLBACK_URL;
      const scope = 'openid email profile';
      let url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
        clientId,
      )}&redirect_uri=${encodeURIComponent(callback)}&response_type=code&scope=${encodeURIComponent(
        scope,
      )}&state=${encodeURIComponent(state)}&access_type=offline&prompt=consent`;

      if (codeChallenge) {
        url += `&code_challenge=${encodeURIComponent(codeChallenge)}&code_challenge_method=S256`;
      }
      return url;
    }

    throw new AuthError(400, `Unsupported OAuth provider: ${provider}`, 'UNSUPPORTED_PROVIDER');
  }

  async exchangeCodeForProfile({
    provider,
    code,
    codeVerifier,
    redirectUri,
  }: {
    provider: 'github' | 'google';
    code: string;
    codeVerifier?: string;
    redirectUri?: string;
  }): Promise<NormalizedOAuthProfile> {
    if (provider === 'github') {
      return this.handleGithubExchange(code, redirectUri);
    }
    if (provider === 'google') {
      return this.handleGoogleExchange(code, codeVerifier, redirectUri);
    }
    throw new AuthError(400, `Unsupported OAuth provider: ${provider}`, 'UNSUPPORTED_PROVIDER');
  }

  private async handleGithubExchange(
    code: string,
    redirectUri?: string,
  ): Promise<NormalizedOAuthProfile> {
    const clientId = env.GITHUB_CLIENT_ID;
    const clientSecret = env.GITHUB_CLIENT_SECRET;
    const callback = redirectUri || env.GITHUB_CALLBACK_URL;

    // 1. Exchange code for access token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: callback,
      }),
    });

    if (!tokenRes.ok) {
      throw new AuthError(
        401,
        'Failed to exchange GitHub authorization code',
        'OAUTH_TOKEN_EXCHANGE_FAILED',
      );
    }

    const tokenData = (await tokenRes.json()) as {
      access_token?: string;
      error?: string;
      error_description?: string;
    };

    if (!tokenData.access_token) {
      throw new AuthError(
        401,
        tokenData.error_description || 'GitHub did not return an access token',
        'OAUTH_TOKEN_EXCHANGE_FAILED',
      );
    }

    const accessToken = tokenData.access_token;

    // 2. Fetch user profile
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'CyberForce-Auth-Service',
      },
    });

    if (!userRes.ok) {
      throw new AuthError(401, 'Failed to fetch GitHub user profile', 'OAUTH_PROFILE_FETCH_FAILED');
    }

    const userData = (await userRes.json()) as {
      id: number;
      login: string;
      email?: string | null;
      avatar_url?: string;
    };

    let userEmail = userData.email;

    // 3. If primary email is private in profile, fetch from emails endpoint
    if (!userEmail) {
      const emailRes = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'User-Agent': 'CyberForce-Auth-Service',
        },
      });

      if (emailRes.ok) {
        const emails = (await emailRes.json()) as Array<{
          email: string;
          primary: boolean;
          verified: boolean;
        }>;
        const primary =
          emails.find((e) => e.primary && e.verified) ||
          emails.find((e) => e.verified) ||
          emails[0];
        if (primary) {
          userEmail = primary.email;
        }
      }
    }

    if (!userEmail) {
      throw new AuthError(
        400,
        'Cannot authenticate without a verified email address from GitHub',
        'OAUTH_MISSING_EMAIL',
      );
    }

    return {
      provider: 'github',
      providerAccountId: String(userData.id),
      email: userEmail.toLowerCase(),
      username: userData.login,
      avatarUrl: userData.avatar_url || null,
    };
  }

  private async handleGoogleExchange(
    code: string,
    codeVerifier?: string,
    redirectUri?: string,
  ): Promise<NormalizedOAuthProfile> {
    const clientId = env.GOOGLE_CLIENT_ID;
    const clientSecret = env.GOOGLE_CLIENT_SECRET;
    const callback = redirectUri || env.GOOGLE_CALLBACK_URL;

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: callback,
      client_id: clientId,
      client_secret: clientSecret,
    });

    if (codeVerifier) {
      params.append('code_verifier', codeVerifier);
    }

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!tokenRes.ok) {
      throw new AuthError(
        401,
        'Failed to exchange Google authorization code',
        'OAUTH_TOKEN_EXCHANGE_FAILED',
      );
    }

    const tokenData = (await tokenRes.json()) as {
      access_token?: string;
      error?: string;
      error_description?: string;
    };

    if (!tokenData.access_token) {
      throw new AuthError(
        401,
        tokenData.error_description || 'Google did not return an access token',
        'OAUTH_TOKEN_EXCHANGE_FAILED',
      );
    }

    // 2. Fetch UserInfo
    const userInfoRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userInfoRes.ok) {
      throw new AuthError(401, 'Failed to fetch Google user profile', 'OAUTH_PROFILE_FETCH_FAILED');
    }

    const userInfo = (await userInfoRes.json()) as {
      sub: string;
      email: string;
      email_verified?: boolean;
      name?: string;
      picture?: string;
    };

    if (!userInfo.email) {
      throw new AuthError(
        400,
        'Cannot authenticate without an email from Google',
        'OAUTH_MISSING_EMAIL',
      );
    }

    // Sanitize username from email handle or name
    const rawUsername = (userInfo.email.split('@')[0] || userInfo.name || 'user').replace(
      /[^a-zA-Z0-9_-]/g,
      '_',
    );

    return {
      provider: 'google',
      providerAccountId: userInfo.sub,
      email: userInfo.email.toLowerCase(),
      username: rawUsername.slice(0, 30),
      avatarUrl: userInfo.picture || null,
    };
  }
}

export const defaultOAuthClient = new OAuthProviderClient();
