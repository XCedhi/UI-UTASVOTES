import type { Metadata } from 'next';
import ManageElectionInteractive from './components/ManageElectionInteractive';
import ProtectedRoute from '@/components/common/ProtectedRoute';

export const metadata: Metadata = {
  title: 'Manage Election - UTASVotes',
  description: 'Manage election settings and details',
};

export default function ManageElectionPage() {
  return (
    <ProtectedRoute>
      <ManageElectionInteractive />
    </ProtectedRoute>
  );
}
