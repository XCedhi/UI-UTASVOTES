import type { Metadata } from 'next';
import AdminProfileInteractive from './components/AdminProfileInteractive';
import ProtectedRoute from '@/components/common/ProtectedRoute';

export const metadata: Metadata = {
  title: 'Admin Profile - UTASVotes',
  description: 'View and manage your administrator profile settings.',
};

export default function AdminProfilePage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminProfileInteractive />
    </ProtectedRoute>
  );
}
