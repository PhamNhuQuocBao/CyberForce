import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import { authApi, pathsApi, rolesApi, userApi } from '../src/lib/api';
import { useAuthStore } from '../src/lib/auth-store';

const user = { id: 'user-1', username: 'student', role: 'student' };
const response = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
const ok = (data: unknown) => response({ success: true, data });
const unauthorized = () => response({ error: { message: 'Expired', code: 'TOKEN_EXPIRED' } }, 401);
const refresh = () => ok({ user, accessToken: 'fresh-token' });
let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  const storage = new Map<string, string>();
  vi.stubGlobal('window', {});
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  });
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
  useAuthStore.setState({
    user: null,
    accessToken: null,
    isLoading: true,
    isAuthenticated: false,
    initializationError: null,
  });
});
afterEach(() => vi.unstubAllGlobals());

describe('Shared authentication and existing API contracts', () => {
  it('deduplicates initialization and ignores an untrusted cached user', async () => {
    localStorage.setItem('cyberforce_access_token', 'valid-token');
    localStorage.setItem('cyberforce_user', '{corrupted');
    fetchMock.mockResolvedValue(ok(user));
    await Promise.all([useAuthStore.getState().initialize(), useAuthStore.getState().initialize()]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().user).toEqual(user);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it('restores a cookie session without a local access token', async () => {
    fetchMock.mockResolvedValue(refresh());
    await useAuthStore.getState().initialize();
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/auth\/refresh$/);
    expect(useAuthStore.getState().accessToken).toBe('fresh-token');
  });

  it('retries an authenticated mutation once after refresh', async () => {
    useAuthStore.setState({ accessToken: 'old-token' });
    fetchMock
      .mockResolvedValueOnce(unauthorized())
      .mockResolvedValueOnce(refresh())
      .mockResolvedValueOnce(ok(user));
    await userApi.updateProfile({ bio: 'Draft' }, 'old-token');
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[2][1].headers.get('Authorization')).toBe('Bearer fresh-token');
    expect(fetchMock.mock.calls[2][1].body).toBe(JSON.stringify({ bio: 'Draft' }));
    expect(useAuthStore.getState().accessToken).toBe('fresh-token');
  });

  it('shares one refresh across concurrent 401 responses', async () => {
    useAuthStore.setState({ accessToken: 'old-token' });
    let refreshCount = 0;
    fetchMock.mockImplementation(async (url: string, options: RequestInit) => {
      if (url.endsWith('/auth/refresh')) {
        refreshCount++;
        await new Promise((resolve) => setTimeout(resolve, 10));
        return refresh();
      }
      return new Headers(options.headers).get('Authorization') === 'Bearer fresh-token'
        ? ok([])
        : unauthorized();
    });
    await Promise.all([rolesApi.getMyRequests('old-token'), authApi.getMe('old-token')]);
    expect(refreshCount).toBe(1);
  });

  it('does not refresh failed login or forbidden responses', async () => {
    fetchMock.mockResolvedValueOnce(unauthorized());
    await expect(authApi.login({ email: 'x', password: 'wrong' })).rejects.toMatchObject({
      statusCode: 401,
    });
    fetchMock.mockResolvedValueOnce(response({ error: { message: 'Forbidden' } }, 403));
    await expect(rolesApi.getAdminRequests({}, 'token')).rejects.toMatchObject({ statusCode: 403 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('clears an expired session when refresh is rejected', async () => {
    localStorage.setItem('cyberforce_access_token', 'expired');
    fetchMock.mockResolvedValue(unauthorized());
    await useAuthStore.getState().initialize();
    expect(useAuthStore.getState().isLoading).toBe(false);
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(localStorage.getItem('cyberforce_access_token')).toBeNull();
  });

  it('preserves credentials on network failure and allows retry', async () => {
    localStorage.setItem('cyberforce_access_token', 'valid');
    fetchMock.mockRejectedValueOnce(new TypeError('offline'));
    await useAuthStore.getState().initialize();
    expect(localStorage.getItem('cyberforce_access_token')).toBe('valid');
    expect(useAuthStore.getState().initializationError).toBeTruthy();
    fetchMock.mockResolvedValueOnce(ok(user));
    await useAuthStore.getState().initialize();
    expect(useAuthStore.getState().initializationError).toBeNull();
  });

  it('does not restore a session after it was cleared during refresh', async () => {
    const { refreshSession } = await import('../src/lib/api');
    let resolveRefresh!: (value: Response) => void;
    fetchMock.mockImplementation(
      () =>
        new Promise<Response>((resolve) => {
          resolveRefresh = resolve;
        }),
    );
    const pending = refreshSession();
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    useAuthStore.getState().clearAuth();
    resolveRefresh(refresh());
    await expect(pending).rejects.toMatchObject({ code: 'SESSION_CHANGED' });
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('does not loop when the retried request is also unauthorized', async () => {
    useAuthStore.setState({ accessToken: 'old-token' });
    fetchMock
      .mockResolvedValueOnce(unauthorized())
      .mockResolvedValueOnce(refresh())
      .mockResolvedValueOnce(unauthorized());
    await expect(authApi.getMe('old-token')).rejects.toMatchObject({ statusCode: 401 });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(useAuthStore.getState().accessToken).toBeNull();
  });

  it('does not declare a JSON body for bodyless enroll and logout requests', async () => {
    fetchMock.mockImplementation(async () => ok({}));
    await pathsApi.enroll('test-path', 'token');
    await authApi.logout('token');
    for (const [, options] of fetchMock.mock.calls) {
      expect(options.headers.has('Content-Type')).toBe(false);
      expect(options.body).toBeUndefined();
    }
  });

  it('refreshes before public personalized requests silently become anonymous', async () => {
    const expired = `header.${btoa(JSON.stringify({ exp: 1 }))}.signature`;
    useAuthStore.setState({ accessToken: expired });
    fetchMock.mockResolvedValueOnce(refresh()).mockResolvedValueOnce(ok([]));
    await pathsApi.listPaths({}, expired);
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/auth\/refresh$/);
    expect(fetchMock.mock.calls[1][1].headers.get('Authorization')).toBe('Bearer fresh-token');
  });
});
