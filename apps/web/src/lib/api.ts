export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  avatarUrl: string | null;
  role: string;
  expPoints: number;
  rankTier: string;
  streakDays: number;
  bio?: string | null;
  specialty?: string | null;
  isPublic?: boolean;
  lastActiveAt?: string;
  createdAt: string;
}

export interface SkillTelemetry {
  webExploitation: number;
  cloudSecurity: number;
  networkPentest: number;
  devSecOps: number;
  cryptography: number;
  reverseEngineering: number;
  osint: number;
  binaryExploitation: number;
}

export interface BadgeItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  unlockedAt?: string;
}

export interface CertificateItem {
  code: string;
  title: string;
  scorePercentage: number;
  issuedAt: string;
  verificationHash: string;
}

export interface LearningPathProgress {
  title: string;
  completionPercentage: number;
  completedRooms: number;
  totalRooms: number;
}

export interface UserDossierResponse {
  isPublic: boolean;
  isSelf: boolean;
  username: string;
  avatarUrl?: string | null;
  rankTier?: string;
  expPoints?: number;
  streakDays?: number;
  bio?: string | null;
  specialty?: string | null;
  memberSince?: string;
  labsCleared?: number;
  telemetry?: SkillTelemetry;
  badges?: BadgeItem[];
  certificates?: CertificateItem[];
  completedPaths?: LearningPathProgress[];
  email?: string;
}

export interface UpdateProfileInput {
  bio?: string | null;
  specialty?: string;
  isPublic?: boolean;
  avatarUrl?: string | null;
}

export interface AuthSuccessResponse {
  success: true;
  message?: string;
  data: {
    user: UserProfile;
    accessToken: string;
    isNewUser?: boolean;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    statusCode: number;
    details?: {
      remainingSeconds?: number;
      remainingAttempts?: number;
      attemptedProvider?: string;
      [key: string]: unknown;
    };
  };
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code: string = 'API_ERROR',
    public details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = new Headers(options.headers);

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Include HTTP-only cookies
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorData = (json as ApiErrorResponse).error || {
      message: res.statusText || 'An unexpected error occurred',
      code: 'REQUEST_FAILED',
      statusCode: res.status,
    };
    throw new ApiError(res.status, errorData.message, errorData.code, errorData.details);
  }

  return json as T;
}

export const authApi = {
  async register(data: { email: string; username: string; password: string }) {
    return request<AuthSuccessResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async login(data: { email: string; password: string }) {
    return request<AuthSuccessResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getMe(accessToken: string) {
    return request<{ success: true; data: UserProfile }>('/auth/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },

  async logout(accessToken?: string) {
    return request<{ success: true }>('/auth/logout', {
      method: 'POST',
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });
  },

  async getOAuthUrl(provider: 'github' | 'google', redirectUri?: string) {
    const params = new URLSearchParams();
    if (redirectUri) params.set('redirect_uri', redirectUri);
    const queryString = params.toString() ? `?${params.toString()}` : '';

    return request<{
      success: true;
      data: { url: string; state: string; provider: string };
    }>(`/auth/oauth/${provider}/url${queryString}`, {
      method: 'GET',
    });
  },

  async exchangeOAuthCallback(
    provider: 'github' | 'google',
    data: { code: string; state: string; codeVerifier?: string; redirectUri?: string },
  ) {
    return request<AuthSuccessResponse>(`/auth/oauth/${provider}/callback`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async initiateAccountLinking(pendingLinkToken: string) {
    return request<{ success: true; message: string; data: { otpSent: boolean; email: string } }>(
      '/auth/link/send-otp',
      {
        method: 'POST',
        body: JSON.stringify({ pendingLinkToken }),
      },
    );
  },

  async verifyLinkPassword(pendingLinkToken: string, password: string) {
    return request<AuthSuccessResponse>('/auth/link/verify-password', {
      method: 'POST',
      body: JSON.stringify({ pendingLinkToken, password }),
    });
  },

  async verifyLinkOtp(pendingLinkToken: string, otp: string) {
    return request<AuthSuccessResponse>('/auth/link/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ pendingLinkToken, otp }),
    });
  },

  async linkAccount(data: {
    pendingLinkToken: string;
    method?: 'password' | 'otp';
    password?: string;
    otp?: string;
  }) {
    return request<AuthSuccessResponse>('/auth/link-account', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

export const userApi = {
  async getProfile(username: string, accessToken?: string) {
    return request<{ success: true; data: UserDossierResponse }>(
      `/users/${encodeURIComponent(username)}/profile`,
      {
        method: 'GET',
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      },
    );
  },

  async updateProfile(data: UpdateProfileInput, accessToken: string) {
    return request<{ success: true; message: string; data: UserProfile }>('/users/me/profile', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(data),
    });
  },
};
