import type { Metadata } from 'next';
import ProfileInteractive from './components/ProfileInteractive';
import ProtectedRoute from '@/components/common/ProtectedRoute';

export const metadata: Metadata = {
  title: 'Profile - UTASVotes',
  description:
    'Manage your account profile, update personal information, and configure your preferences for the UTASVotes electoral system.',
};

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileInteractive />
    </ProtectedRoute>
  );
}
