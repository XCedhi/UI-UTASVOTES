import type { Metadata } from 'next';
import ElectionManagementInteractive from './components/ElectionManagementInteractive';
import ProtectedRoute from '@/components/common/ProtectedRoute';

export const metadata: Metadata = {
  title: 'Election Management - UTASVotes Admin',
  description: 'Create, edit, and manage elections for the UTASVotes electoral system.',
};

export default function ElectionManagementPage() {
  return (
    <ProtectedRoute>
      <ElectionManagementInteractive />
    </ProtectedRoute>
  );
}
