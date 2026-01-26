import type { Metadata } from 'next';
import AdminElectionManagementInteractive from './components/AdminElectionManagementInteractive';

export const metadata: Metadata = {
  title: 'Election Management | Admin Panel',
  description: 'Comprehensive election management dashboard for system administrators',
};

export default function AdminElectionManagementPage() {
  return <AdminElectionManagementInteractive />;
}
