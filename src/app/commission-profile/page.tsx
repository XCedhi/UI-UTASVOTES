import type { Metadata } from 'next';
import CommissionProfileInteractive from './components/CommissionProfileInteractive';
import ProtectedRoute from '@/components/common/ProtectedRoute';

export const metadata: Metadata = {
  title: 'Commission Profile - UTASVotes',
  description: 'View and manage your Electoral Commission profile.',
};

export default function CommissionProfilePage() {
  return (
    <ProtectedRoute allowedRoles={['commission']}>
      <CommissionProfileInteractive />
    </ProtectedRoute>
  );
}
