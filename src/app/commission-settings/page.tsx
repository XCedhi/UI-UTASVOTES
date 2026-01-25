import type { Metadata } from 'next';
import CommissionSettingsInteractive from './components/CommissionSettingsInteractive';
import ProtectedRoute from '@/components/common/ProtectedRoute';

export const metadata: Metadata = {
  title: 'Commission Settings - UTASVotes',
  description: 'Configure your Electoral Commission preferences.',
};

export default function CommissionSettingsPage() {
  return (
    <ProtectedRoute allowedRoles={['commission']}>
      <CommissionSettingsInteractive />
    </ProtectedRoute>
  );
}
