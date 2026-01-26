import { Metadata } from 'next';
import ElectionAnalyticsInteractive from './components/ElectionAnalyticsInteractive';

export const metadata: Metadata = {
  title: 'Election Analytics | Electoral Commission Panel',
  description: 'View detailed analytics and statistics for election',
};

export default function ElectionAnalyticsPage({ params }: { params: { id: string } }) {
  return <ElectionAnalyticsInteractive electionId={params.id} />;
}
