import type { Metadata } from 'next';
import StudentImportInteractive from './components/StudentImportInteractive';
import ProtectedRoute from '@/components/common/ProtectedRoute';

export const metadata: Metadata = {
  title: 'Import Student Data - UTASVotes Admin',
  description: 'Bulk import student data from Excel files to create accounts automatically',
};

export default function StudentImportPage() {
  return (
    <ProtectedRoute>
      <StudentImportInteractive />
    </ProtectedRoute>
  );
}
