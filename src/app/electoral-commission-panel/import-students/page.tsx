import { Metadata } from 'next';
import CommissionStudentImportInteractive from './components/CommissionStudentImportInteractive';

export const metadata: Metadata = {
  title: 'Import Students | Electoral Commission Panel',
  description: 'Import student data for voter registration',
};

export default function CommissionStudentImportPage() {
  return <CommissionStudentImportInteractive />;
}
