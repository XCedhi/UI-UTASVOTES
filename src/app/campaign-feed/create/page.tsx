import type { Metadata } from 'next';
import CreatePostInteractive from './components/CreatePostInteractive';
import ProtectedRoute from '@/components/common/ProtectedRoute';

export const metadata: Metadata = {
  title: 'Create Post - UTASVotes',
  description: 'Share your thoughts, ideas, and campaign updates with the UTAS community.',
};

export default function CreatePostPage() {
  return (
    <ProtectedRoute>
      <CreatePostInteractive />
    </ProtectedRoute>
  );
}
