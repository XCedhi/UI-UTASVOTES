import type { Metadata } from 'next';
import ElectionAnalyticsInteractive from './components/ElectionAnalyticsInteractive';
import ProtectedRoute from '@/components/common/ProtectedRoute';

export const metadata: Metadata = {
  title: 'Election Analytics - UTASVotes',
  description: 'View detailed election analytics and voting statistics',
};

export default function ElectionAnalyticsPage() {
  return (
    <ProtectedRoute>
      <ElectionAnalyticsInteractive />
    </ProtectedRoute>
  );
}
