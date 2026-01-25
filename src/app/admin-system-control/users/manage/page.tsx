import type { Metadata } from 'next';
import UserManagementInteractive from './components/UserManagementInteractive';
import ProtectedRoute from '@/components/common/ProtectedRoute';

export const metadata: Metadata = {
  title: 'User Management - UTASVotes Admin',
  description: 'Manage user accounts, roles, and permissions for the UTASVotes system.',
};

export default function UserManagementPage() {
  return (
    <ProtectedRoute>
      <UserManagementInteractive />
    </ProtectedRoute>
  );
}
