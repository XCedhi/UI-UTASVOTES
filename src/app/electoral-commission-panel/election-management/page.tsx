import type { Metadata } from 'next';
import ElectionManagementInteractive from './components/ElectionManagementInteractive';
import ProtectedRoute from '@/components/common/ProtectedRoute';

export const metadata: Metadata = {
  title: 'Election Management - Electoral Commission',
  description: 'Create, edit, and manage elections for the UTASVotes electoral system.',
};

export default function CommissionElectionManagementPage() {
  return (
    <ProtectedRoute allowedRoles={['commission', 'admin']}>
      <ElectionManagementInteractive />
    </ProtectedRoute>
  );
}
