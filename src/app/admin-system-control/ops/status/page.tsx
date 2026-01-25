import type { Metadata } from 'next';
import SystemStatusInteractive from './components/SystemStatusInteractive';
import ProtectedRoute from '@/components/common/ProtectedRoute';

export const metadata: Metadata = {
  title: 'System Status - UTASVotes Admin',
  description: 'Monitor system health, performance metrics, and operational status.',
};

export default function SystemStatusPage() {
  return (
    <ProtectedRoute>
      <SystemStatusInteractive />
    </ProtectedRoute>
  );
}
