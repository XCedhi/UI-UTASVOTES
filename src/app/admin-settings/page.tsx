import type { Metadata } from 'next';
import AdminSettingsInteractive from './components/AdminSettingsInteractive';
import ProtectedRoute from '@/components/common/ProtectedRoute';

export const metadata: Metadata = {
  title: 'Admin Settings - UTASVotes',
  description: 'Configure system settings and preferences.',
};

export default function AdminSettingsPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminSettingsInteractive />
    </ProtectedRoute>
  );
}
