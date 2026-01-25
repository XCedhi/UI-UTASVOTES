export type UserRole = 'student' | 'candidate' | 'commission' | 'admin';

export interface UserSession {
  email: string;
  role: UserRole;
  name: string;
  avatar?: string;
}

export const getUserSession = (): UserSession | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const role = localStorage.getItem('userRole') as UserRole;
    const email = localStorage.getItem('userEmail');
    const name = localStorage.getItem('userName') || 'User';
    const avatar = localStorage.getItem('userAvatar');
    
    if (!role || !email) return null;
    
    return { email, role, name, avatar };
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
};

export const clearUserSession = () => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('userRole');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userName');
  localStorage.removeItem('userAvatar');
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
    return !path.startsWith('/admin-dashboard') && 
           !path.startsWith('/admin-system-control');
  }
  
  // Students and candidates can't access admin or commission routes
  if (role === 'student' || role === 'candidate') {
    return !path.startsWith('/admin') && 
           !path.startsWith('/electoral-commission-panel');
  }
  
  return true;
};
