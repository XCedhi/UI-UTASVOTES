import type { Metadata } from 'next';
import ChangePasswordInteractive from './components/ChangePasswordInteractive';

export const metadata: Metadata = {
  title: 'Change Password - UTASVotes',
  description: 'Change your password to secure your UTASVotes account',
};

export default function ChangePasswordPage() {
  return <ChangePasswordInteractive />;
}
