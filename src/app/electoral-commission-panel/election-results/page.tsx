import type { Metadata } from 'next';
import CommissionElectionResultsInteractive from './components/CommissionElectionResultsInteractive';

export const metadata: Metadata = {
  title: 'Election Results | Electoral Commission Panel',
  description: 'Real-time monitoring of election results with live vote counts and analytics',
};

export default function CommissionElectionResultsPage() {
  return <CommissionElectionResultsInteractive />;
}
