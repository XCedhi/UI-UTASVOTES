import type { Metadata } from 'next';
import LoginInteractive from './components/LoginInteractive';

export const metadata: Metadata = {
  title: 'Login - UTASVotes Electoral System',
  description:
    'Secure login portal for UTAS students, candidates, Electoral Commission members, and administrators to access the digital campus electoral system.',
};

export default function LoginPage() {
  return <LoginInteractive />;
}
