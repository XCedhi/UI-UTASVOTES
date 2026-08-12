import type { Metadata } from 'next';
import { Suspense } from 'react';
import ResetPasswordInteractive from './components/ResetPasswordInteractive';

export const metadata: Metadata = {
  title: 'Reset Password - UTASVotes',
  description:
    'Create a new password for your UTASVotes account. Enter your new password to regain access to the electoral system.',
};

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordInteractive />
    </Suspense>
  );
}
