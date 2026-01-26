import { Metadata } from 'next';
import ManageElectionInteractive from './components/ManageElectionInteractive';

export const metadata: Metadata = {
  title: 'Manage Election | Electoral Commission Panel',
  description: 'Manage election settings and operations',
};

export default function ManageElectionPage({ params }: { params: { id: string } }) {
  return <ManageElectionInteractive electionId={params.id} />;
}
