import { Metadata } from 'next';
import ApplicationDetailsInteractive from './components/ApplicationDetailsInteractive';

export const metadata: Metadata = {
  title: 'Application Details - Admin Election Management | UTASVotes',
  description: 'Review and manage candidate application details',
};

export default function ApplicationDetailsPage() {
  return <ApplicationDetailsInteractive />;
}
