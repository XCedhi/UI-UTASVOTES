import { Metadata } from 'next';
import ManageElectionInteractive from './components/ManageElectionInteractive';

export const metadata: Metadata = {
  title: 'Manage Election - Admin System Control | UTASVotes',
  description: 'Manage election settings and controls',
};

export default function ManageElectionPage() {
  return <ManageElectionInteractive />;
}
