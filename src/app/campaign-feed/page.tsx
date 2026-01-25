import type { Metadata } from 'next';
import CampaignFeedInteractive from './components/CampaignFeedInteractive';
import ProtectedRoute from '@/components/common/ProtectedRoute';

export const metadata: Metadata = {
  title: 'Campaign Feed - UTASVotes',
  description:
    'View campaign updates, manifestos, and announcements from candidates running in UTAS elections.',
};

export default function CampaignFeedPage() {
  return (
    <ProtectedRoute>
      <CampaignFeedInteractive />
    </ProtectedRoute>
  );
}
