import type { Metadata } from 'next';
import AdminDashboardInteractive from './components/AdminDashboardInteractive';
import ProtectedRoute from '@/components/common/ProtectedRoute';

export const metadata: Metadata = {
  title: 'Admin Dashboard - UTASVotes',
  description:
    'System administration dashboard for managing the UTASVotes electoral platform, monitoring system health, and overseeing all electoral operations.',
};

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute>
      <AdminDashboardInteractive />
    </ProtectedRoute>
  );
}
