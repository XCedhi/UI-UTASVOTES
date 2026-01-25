import type { Metadata } from 'next';
import ElectionGuidelinesInteractive from './components/ElectionGuidelinesInteractive';
import ProtectedRoute from '@/components/common/ProtectedRoute';

export const metadata: Metadata = {
  title: 'Election Guidelines - UTASVotes',
  description:
    'Read the official electoral guidelines, rules, and regulations for participating in UTAS student elections.',
};

export default function ElectionGuidelinesPage() {
  return (
    <ProtectedRoute>
      <ElectionGuidelinesInteractive />
    </ProtectedRoute>
  );
}
