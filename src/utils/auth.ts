// Admin Authentication & Persistent Session Management
import type { AdminAuthState } from '../types.ts';

const AUTH_STORAGE_KEY = 'nexus_admin_auth_state_v1';
const CREDENTIALS_STORAGE_KEY = 'nexus_admin_custom_creds_v1';

// Default Master Credentials
export const DEFAULT_ADMIN_USERNAME = 'admin';
export const DEFAULT_ADMIN_PASSWORD = 'NexusCloud2026!#';

export interface StoredCredentials {
  username: string;
  passwordHash: string; // Plain/masked representation for client-side persistence
  updatedAt: string;
}

export const getStoredCredentials = (): { username: string; password: string } => {
  try {
    const raw = localStorage.getItem(CREDENTIALS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        username: parsed.username || DEFAULT_ADMIN_USERNAME,
        password: parsed.password || DEFAULT_ADMIN_PASSWORD,
      };
    }
  } catch (e) {
    console.error('Failed to parse credentials from storage', e);
  }
  return {
    username: DEFAULT_ADMIN_USERNAME,
    password: DEFAULT_ADMIN_PASSWORD,
  };
};

export const updateStoredCredentials = (username: string, password: string): boolean => {
  try {
    localStorage.setItem(
      CREDENTIALS_STORAGE_KEY,
      JSON.stringify({
        username: username.trim(),
        password: password.trim(),
        updatedAt: new Date().toISOString(),
      })
    );
    return true;
  } catch (e) {
    console.error('Failed to update credentials', e);
    return false;
  }
};

export const getActiveSession = (): AdminAuthState | null => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const session: AdminAuthState = JSON.parse(raw);
    if (session && session.isAuthenticated && session.sessionToken) {
      return session;
    }
  } catch (e) {
    console.error('Failed to retrieve active session', e);
  }
  return null;
};

export const saveActiveSession = (session: AdminAuthState): void => {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  } catch (e) {
    console.error('Failed to save session', e);
  }
};

export const clearActiveSession = (): void => {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear session', e);
  }
};

export const generateSessionToken = (username: string): string => {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 12);
  return `nexus_sess_${username}_${ts}_${rand}`;
};

export const validateAdminLogin = (
  enteredUser: string,
  enteredPass: string,
  rememberMe: boolean = true
): { success: boolean; session?: AdminAuthState; error?: string } => {
  const activeCreds = getStoredCredentials();

  if (
    enteredUser.trim().toLowerCase() === activeCreds.username.toLowerCase() &&
    enteredPass === activeCreds.password
  ) {
    const session: AdminAuthState = {
      isAuthenticated: true,
      username: activeCreds.username,
      adminEmail: `${activeCreds.username}@nexus-cloud.local`,
      role: 'SUPERADMIN',
      sessionToken: generateSessionToken(activeCreds.username),
      lastLogin: new Date().toLocaleTimeString(),
      rememberMe,
      twoFactorEnabled: false,
    };

    if (rememberMe) {
      saveActiveSession(session);
    }

    return { success: true, session };
  }

  return {
    success: false,
    error: 'Invalid administrator username or password. Check credentials and try again.',
  };
};
