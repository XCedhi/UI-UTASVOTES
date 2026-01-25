import type { Metadata } from 'next';
import ForgotPasswordInteractive from './components/ForgotPasswordInteractive';

export const metadata: Metadata = {
  title: 'Forgot Password - UTASVotes',
  description:
    'Reset your UTASVotes account password securely. Enter your institutional email to receive password reset instructions.',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordInteractive />;
}
