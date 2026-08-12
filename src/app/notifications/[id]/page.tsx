import type { Metadata } from 'next';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import NotificationDetailInteractive from './components/NotificationDetailInteractive';

export const metadata: Metadata = {
  title: 'Notification Details - UTASVotes',
  description:
    'Read the full message of an in-app notification, including candidate application decision updates from the Electoral Commission.',
};

export default function NotificationDetailPage() {
  return (
    <ProtectedRoute>
      <NotificationDetailInteractive />
    </ProtectedRoute>
  );
}
