import type { Metadata } from 'next';
import SecurityAlertsInteractive from './components/SecurityAlertsInteractive';
import ProtectedRoute from '@/components/common/ProtectedRoute';

export const metadata: Metadata = {
  title: 'Security Alerts - UTASVotes Admin',
  description: 'Review security incidents, alerts, and system logs.',
};

export default function SecurityAlertsPage() {
  return (
    <ProtectedRoute>
      <SecurityAlertsInteractive />
    </ProtectedRoute>
  );
}
