import type { Metadata } from 'next';
import ElectoralCommissionInteractive from './components/ElectoralCommissionInteractive';
import ProtectedRoute from '@/components/common/ProtectedRoute';

export const metadata: Metadata = {
  title: 'Electoral Commission Panel - UTASVotes',
  description:
    'Comprehensive election management dashboard for UTAS Electoral Commission members. Monitor elections, verify candidate applications, manage fee structures, and generate certified reports.',
};

export default function ElectoralCommissionPanelPage() {
  return (
    <ProtectedRoute>
      <ElectoralCommissionInteractive />
    </ProtectedRoute>
  );
}
