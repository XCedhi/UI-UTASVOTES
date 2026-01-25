import type { Metadata } from 'next';
import AdminElectionResultsInteractive from './components/AdminElectionResultsInteractive';
import ProtectedRoute from '@/components/common/ProtectedRoute';

export const metadata: Metadata = {
  title: 'Admin Election Results - UTASVotes',
  description:
    'Administrative view of election results with detailed analytics, export options, and certification tools.',
};

export default function AdminElectionResultsPage() {
  return (
    <ProtectedRoute>
      <AdminElectionResultsInteractive />
    </ProtectedRoute>
  );
}
