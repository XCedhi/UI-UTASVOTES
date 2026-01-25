import type { Metadata } from 'next';
import StudentDashboardInteractive from './components/StudentDashboardInteractive';
import ProtectedRoute from '@/components/common/ProtectedRoute';

export const metadata: Metadata = {
  title: 'Student Dashboard - UTASVotes',
  description:
    'Access ongoing elections, view campaign content, and engage with candidates. Your central hub for all electoral activities at University of Technical and Applied Sciences.',
};

export default function StudentDashboardPage() {
  return (
    <ProtectedRoute>
      <StudentDashboardInteractive />
    </ProtectedRoute>
  );
}
