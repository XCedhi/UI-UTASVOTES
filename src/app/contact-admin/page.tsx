import type { Metadata } from 'next';
import ContactAdminInteractive from './components/ContactAdminInteractive';

export const metadata: Metadata = {
  title: 'Contact Admin - UTASVotes',
  description:
    'Get in touch with the UTASVotes system administrators for support, inquiries, or assistance with the electoral platform.',
};

export default function ContactAdminPage() {
  return <ContactAdminInteractive />;
}
