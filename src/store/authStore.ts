import { create } from 'zustand';

export type UserRole = 'CFO' | 'CEO' | 'SuperAdmin';

interface AuthUser {
  username: string;
  role: UserRole;
  displayName: string;
  title: string;
}

const CREDENTIALS: Record<string, { password: string; user: AuthUser }> = {
  'cfo@leadway.com': {
    password: 'cfo2025',
    user: { username: 'cfo@leadway.com', role: 'CFO', displayName: 'Adaeze Okonkwo', title: 'Group CFO' },
  },
  'ceo@leadway.com': {
    password: 'ceo2025',
    user: { username: 'ceo@leadway.com', role: 'CEO', displayName: 'Tunde Adesanya', title: 'Group CEO' },
  },
  'admin@leadway.com': {
    password: 'admin2025',
    user: { username: 'admin@leadway.com', role: 'SuperAdmin', displayName: 'System Administrator', title: 'Super Admin' },
  },
};

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loginError: string | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  canViewCFO: () => boolean;
  canViewCEO: () => boolean;
  canViewTransactionDetail: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  loginError: null,

  login: (email, password) => {
    const record = CREDENTIALS[email.toLowerCase()];
    if (record && record.password === password) {
      set({ user: record.user, isAuthenticated: true, loginError: null });
      return true;
    }
    set({ loginError: 'Invalid email or password. Please try again.' });
    return false;
  },

  logout: () => set({ user: null, isAuthenticated: false, loginError: null }),

  canViewCFO: () => {
    const role = get().user?.role;
    return role === 'CFO' || role === 'SuperAdmin';
  },

  canViewCEO: () => {
    const role = get().user?.role;
    return role === 'CEO' || role === 'SuperAdmin';
  },

  canViewTransactionDetail: () => {
    const role = get().user?.role;
    return role === 'CFO' || role === 'SuperAdmin';
  },
}));
