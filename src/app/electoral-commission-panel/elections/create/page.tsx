import { Metadata } from 'next';
import CreateElectionInteractive from './components/CreateElectionInteractive';

export const metadata: Metadata = {
  title: 'Create Election | Electoral Commission Panel',
  description: 'Create and configure a new election',
};

export default function CreateElectionPage() {
  return <CreateElectionInteractive />;
}
