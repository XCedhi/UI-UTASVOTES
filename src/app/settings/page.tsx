import type { Metadata } from 'next';
import SettingsInteractive from './components/SettingsInteractive';
import ProtectedRoute from '@/components/common/ProtectedRoute';

export const metadata: Metadata = {
  title: 'Settings - UTASVotes',
  description:
    'Configure your account settings, notification preferences, and system options for the UTASVotes electoral platform.',
};

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsInteractive />
    </ProtectedRoute>
  );
}
