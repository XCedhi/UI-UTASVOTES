import { Metadata } from 'next';
import CreateElectionInteractive from './components/CreateElectionInteractive';

export const metadata: Metadata = {
  title: 'Create Election | UTASVotes Admin',
  description: 'Create a new election for the university',
};

export default function CreateElectionPage() {
  return <CreateElectionInteractive />;
}
