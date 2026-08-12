import type { Metadata } from 'next';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import NotificationsInteractive from './components/NotificationsInteractive';

export const metadata: Metadata = {
  title: 'Notifications - UTASVotes',
  description:
    'View all your in-app notifications, including per-student candidate application decision updates from the Electoral Commission.',
};

export default function NotificationsPage() {
  return (
    <ProtectedRoute>
      <NotificationsInteractive />
    </ProtectedRoute>
  );
}
