import type { Metadata } from 'next';
import ApplicationDetailsInteractive from './components/ApplicationDetailsInteractive';
import ProtectedRoute from '@/components/common/ProtectedRoute';

export const metadata: Metadata = {
  title: 'Application Details - UTASVotes',
  description: 'View and manage candidate application details.',
};

export default function ApplicationDetailsPage() {
  return (
    <ProtectedRoute allowedRoles={['commission', 'admin']}>
      <ApplicationDetailsInteractive />
    </ProtectedRoute>
  );
}
