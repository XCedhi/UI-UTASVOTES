import type { Metadata } from 'next';
import StudentElectionResultsInteractive from './components/StudentElectionResultsInteractive';
import ProtectedRoute from '@/components/common/ProtectedRoute';

export const metadata: Metadata = {
  title: 'Election Results - UTASVotes',
  description:
    'View official election results, vote counts, and winner announcements for UTAS student elections.',
};

export default function StudentElectionResultsPage() {
  return (
    <ProtectedRoute>
      <StudentElectionResultsInteractive />
    </ProtectedRoute>
  );
}
