import { create } from "zustand";

export type AuthPhase = "boot" | "auth" | "play";

export interface UserAccount {
  username: string;
  passHash: string;
  createdAt: number;
}

export interface CloudProgress {
  coins: number;
  unlockedParts: string[];
  unlockedTier: number;
  highestWave: number;
  blueprint: {
    chassisId: string;
    engineId: string;
    weaponId: string;
    name?: string;
  };
  updatedAt: number;
}

interface AccountState {
  authPhase: AuthPhase;
  user: UserAccount | null;
  error: string;
  setError: (msg: string) => void;
  continueAsGuest: () => void;
  register: (username: string, password: string) => boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  saveProgress: (data: Omit<CloudProgress, "updatedAt">) => void;
  loadProgress: () => CloudProgress | null;
}

const USERS_KEY = "treads_users_v2";
const SESSION_KEY = "treads_session_v2";
const PROGRESS_PREFIX = "treads_progress_v2:";
const GUEST_PROGRESS = "treads_progress_guest_v2";

/** Stable non-crypto hash for local prototype accounts */
function simpleHash(s: string): string {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16);
}

function credHash(usernameKey: string, password: string): string {
  // usernameKey already lowercased; password trimmed by callers
  return simpleHash(`treads|${usernameKey}|${password}`);
}

function readUsers(): Record<string, UserAccount> {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeUsers(users: Record<string, UserAccount>) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function progressKey(username: string | null) {
  return username ? PROGRESS_PREFIX + username.toLowerCase() : GUEST_PROGRESS;
}

export const useAccountStore = create<AccountState>((set, get) => {
  let user: UserAccount | null = null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      const session = JSON.parse(raw) as { username: string };
      const users = readUsers();
      user = users[session.username.toLowerCase()] || null;
      if (user) {
        // already logged in → skip auth gate
        return {
          authPhase: "play",
          user,
          error: "",
          setError: (error) => set({ error }),
          continueAsGuest: () => {
            localStorage.removeItem(SESSION_KEY);
            set({ user: null, authPhase: "play", error: "" });
          },
          register: registerFn(set),
          login: loginFn(set),
          logout: () => {
            localStorage.removeItem(SESSION_KEY);
            set({ user: null, authPhase: "auth", error: "" });
          },
          saveProgress: saveFn(get),
          loadProgress: loadFn(get),
        };
      }
    }
  } catch {
    user = null;
  }

  return {
    authPhase: "auth",
    user: null,
    error: "",
    setError: (error) => set({ error }),
    continueAsGuest: () => {
      localStorage.removeItem(SESSION_KEY);
      set({ user: null, authPhase: "play", error: "" });
    },
    register: registerFn(set),
    login: loginFn(set),
    logout: () => {
      localStorage.removeItem(SESSION_KEY);
      set({ user: null, authPhase: "auth", error: "" });
    },
    saveProgress: saveFn(get),
    loadProgress: loadFn(get),
  };
});

function registerFn(set: (p: Partial<AccountState>) => void) {
  return (username: string, password: string) => {
    const u = username.trim();
    const pw = password.trim();
    if (u.length < 3) {
      set({ error: "Username must be at least 3 characters" });
      return false;
    }
    if (pw.length < 4) {
      set({ error: "Password must be at least 4 characters" });
      return false;
    }
    const users = readUsers();
    const key = u.toLowerCase();
    if (users[key]) {
      set({ error: "Username already taken" });
      return false;
    }
    const account: UserAccount = {
      username: u,
      passHash: credHash(key, pw),
      createdAt: Date.now(),
    };
    users[key] = account;
    writeUsers(users);
    localStorage.setItem(SESSION_KEY, JSON.stringify({ username: u }));
    set({ user: account, authPhase: "play", error: "" });
    return true;
  };
}

function loginFn(set: (p: Partial<AccountState>) => void) {
  return (username: string, password: string) => {
    const key = username.trim().toLowerCase();
    const pw = password.trim();
    if (!key || !pw) {
      set({ error: "Enter username and password" });
      return false;
    }
    const users = readUsers();
    const account = users[key];
    const hash = credHash(key, pw);
    if (!account) {
      set({ error: "No account with that username" });
      return false;
    }
    if (account.passHash !== hash) {
      set({ error: "Wrong password" });
      return false;
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify({ username: account.username }));
    set({ user: account, authPhase: "play", error: "" });
    return true;
  };
}

function saveFn(get: () => AccountState) {
  return (data: Omit<CloudProgress, "updatedAt">) => {
    const { user } = get();
    const payload: CloudProgress = { ...data, updatedAt: Date.now() };
    localStorage.setItem(progressKey(user?.username ?? null), JSON.stringify(payload));
  };
}

function loadFn(get: () => AccountState) {
  return () => {
    const { user } = get();
    try {
      const raw = localStorage.getItem(progressKey(user?.username ?? null));
      if (!raw) return null;
      return JSON.parse(raw) as CloudProgress;
    } catch {
      return null;
    }
  };
}
