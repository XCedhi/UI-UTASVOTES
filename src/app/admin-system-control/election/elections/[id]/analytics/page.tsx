import { Metadata } from 'next';
import ElectionAnalyticsInteractive from './components/ElectionAnalyticsInteractive';

export const metadata: Metadata = {
  title: 'Election Analytics - Admin System Control | UTASVotes',
  description: 'View detailed analytics and statistics for election',
};

export default function ElectionAnalyticsPage() {
  return <ElectionAnalyticsInteractive />;
}
