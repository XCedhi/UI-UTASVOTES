import type { Metadata } from 'next';
import ReportIssueInteractive from './components/ReportIssueInteractive';
import ProtectedRoute from '@/components/common/ProtectedRoute';

export const metadata: Metadata = {
  title: 'Report Issue - UTASVotes',
  description:
    'Report technical issues, bugs, or problems with the UTASVotes electoral system to help us improve the platform.',
};

export default function ReportIssuePage() {
  return (
    <ProtectedRoute>
      <ReportIssueInteractive />
    </ProtectedRoute>
  );
}
