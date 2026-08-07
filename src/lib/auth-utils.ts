import { getEffectiveRole, hasAccessExpired } from './role-management';

export type UserRole = 'student' | 'candidate' | 'commission' | 'admin';

export interface UserSession {
  email: string;
  role: UserRole;
  name: string;
  avatar?: string;
  accessEndDate?: string | null;
  originalRole?: UserRole | null;
  userId?: string;
}

export const getUserSession = (): UserSession | null => {
  if (typeof window === 'undefined') return null;

  try {
    const role = localStorage.getItem('userRole') as UserRole;
    const email = localStorage.getItem('userEmail');
    const name = localStorage.getItem('userName') || 'User';
    const avatar = localStorage.getItem('userAvatar');
    const accessEndDate = localStorage.getItem('userAccessEndDate');
    const originalRole = localStorage.getItem('userOriginalRole') as UserRole | null;
    const userId = localStorage.getItem('userId');

    if (!role || !email) return null;

    // Check if commission access has expired and auto-downgrade
    const effectiveRole = getEffectiveRole({ role, accessEndDate, originalRole });

    // If role changed due to expiration, update localStorage
    if (effectiveRole !== role) {
      localStorage.setItem('userRole', effectiveRole);
      // Clear access period data
      localStorage.removeItem('userAccessEndDate');
      localStorage.removeItem('userOriginalRole');

      return { email, role: effectiveRole, name, avatar, userId: userId || undefined };
    }

    return { email, role, name, avatar, accessEndDate, originalRole, userId: userId || undefined };
  } catch {
    return null;
  }
};

export const setUserSession = (session: UserSession) => {
  if (typeof window === 'undefined') return;

  localStorage.setItem('userRole', session.role);
  localStorage.setItem('userEmail', session.email);
  localStorage.setItem('userName', session.name);
  if (session.avatar) localStorage.setItem('userAvatar', session.avatar);
  if (session.accessEndDate) localStorage.setItem('userAccessEndDate', session.accessEndDate);
  if (session.originalRole) localStorage.setItem('userOriginalRole', session.originalRole);
  if (session.userId) localStorage.setItem('userId', session.userId);
};

export const clearUserSession = () => {
  if (typeof window === 'undefined') return;

  localStorage.removeItem('userRole');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userName');
  localStorage.removeItem('userAvatar');
  localStorage.removeItem('userAccessEndDate');
  localStorage.removeItem('userOriginalRole');
  localStorage.removeItem('userId');
};

export const getRoleDashboard = (role: UserRole): string => {
  switch (role) {
    case 'admin':
      return '/admin-dashboard';
    case 'commission':
      return '/electoral-commission-panel';
    case 'student':
    case 'candidate':
    default:
      return '/student-dashboard';
  }
};

export const canAccessRoute = (role: UserRole, path: string): boolean => {
  // Admin can access everything
  if (role === 'admin') return true;

  // Commission can access admin results and their panel
  if (role === 'commission') {
    return !path.startsWith('/admin-dashboard') && !path.startsWith('/admin-system-control');
  }

  // Students and candidates can't access admin or commission routes
  if (role === 'student' || role === 'candidate') {
    // Block admin routes (but not admin-related public pages)
    if (path.startsWith('/admin-dashboard') || path.startsWith('/admin-system-control') || path.startsWith('/admin-election-management')) {
      return false;
    }
    // Block commission panel routes
    if (path.startsWith('/electoral-commission-panel')) {
      return false;
    }
    // Allow all other routes including campaign-feed, voting-interface, etc.
    return true;
  }

  return true;
};
