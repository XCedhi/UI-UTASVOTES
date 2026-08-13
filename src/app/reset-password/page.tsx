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
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      }
    >
      <ResetPasswordInteractive />
    </Suspense>
  );
}

