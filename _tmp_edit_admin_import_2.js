const fs = require('fs');

function edit(path, fn) {
  const src = fs.readFileSync(path, 'utf8');
  const out = fn(src);
  if (out === src) {
    console.log('NO CHANGE: ' + path);
  } else {
    fs.writeFileSync(path, out);
    console.log('EDITED: ' + path);
  }
}

const adminImport = 'src/app/admin-system-control/users/import/components/StudentImportInteractive.tsx';

edit(adminImport, (src) => {
  // 3. Replace handleImport with authed real flow
  const hiStart = src.indexOf('  const handleImport = async () => {');
  const hiEnd = src.indexOf('\n  const downloadTemplate =', hiStart);
  if (hiStart === -1 || hiEnd === -1) throw new Error('handleImport span not found');

  const newHandleImport = `  const handleImport = async () => {
    if (previewData.length === 0) return;

    setIsProcessing(true);

    // Validate data
    const errors = validateData(previewData);

    if (errors.length > 0) {
      setImportResult({
        success: 0,
        failed: errors.length,
        duplicates: 0,
        errors,
        students: [],
        emailConfigured: false,
        emailDelivered: 0,
        emailFailed: 0,
      });
      setIsProcessing(false);
      return;
    }

    try {
      // Attach the caller's session token so the server can authorize the import
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch('/api/import-students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token
            ? { Authorization: \`Bearer \${session.access_token}\` }
            : {}),
        },
        body: JSON.stringify({ students: previewData }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to import students');
      }

      const createdStudents = result.results.createdStudents || [];

      // Show results
      setImportResult({
        success: result.results.success,
        failed: result.results.failed,
        duplicates: result.results.duplicates || 0,
        errors: (result.results.errors || []).map((err: any) => ({
          row: err.row,
          field: 'Account Creation',
          message: err.error,
        })),
        students: createdStudents.map((s: any) => ({
          studentId: s.studentId,
          firstName: s.name.split(' ')[0],
          lastName: s.name.split(' ').slice(1).join(' '),
          email: s.email,
          department: '',
          level: '',
          program: '',
        })),
        emailConfigured: result.results.email?.configured ?? false,
        emailDelivered: result.results.email?.delivered ?? 0,
        emailFailed: result.results.email?.failed ?? 0,
      });

      // Hold the credentials only for the one-time fallback sheet download
      setCredentials(
        createdStudents.map((s: any) => ({
          studentId: s.studentId,
          email: s.email,
          name: s.name,
          password: s.password,
        }))
      );
    } catch (error: any) {
      console.error('Error importing students:', error);
      alert(
        \`Failed to import students: \${error.message}\\n\\nPlease check:\\n1. SUPABASE_SERVICE_ROLE_KEY is set in .env\\n2. Database schema is up to date\\n3. Check browser console for details\`
      );
    } finally {
      setIsProcessing(false);
      setShowPreview(false);
    }
  };
`;

  src = src.slice(0, hiStart) + newHandleImport + src.slice(hiEnd);

  // 4. Add credentials state
  const stateAnchor = '  const [previewData, setPreviewData] = useState<StudentData[]>([]);';
  const stateIdx = src.indexOf(stateAnchor);
  if (stateIdx === -1) throw new Error('state anchor not found');
  const credentialsState =
    '\n  const [credentials, setCredentials] = useState<\n    Array<{ studentId: string; email: string; name: string; password: string }>\n  >([]);';
  src =
    src.slice(0, stateIdx + stateAnchor.length) +
    credentialsState +
    src.slice(stateIdx + stateAnchor.length);

  // 5. Add handleDownloadCredentials before downloadTemplate
  const dtAnchor = '  const downloadTemplate = () => {';
  const dtIdx = src.indexOf(dtAnchor);
  if (dtIdx === -1) throw new Error('downloadTemplate anchor not found');
  const newHandler = `  const handleDownloadCredentials = () => {
    if (credentials.length === 0) return;
    downloadCredentialsSheetCSV(credentials);
  };

`;
  src = src.slice(0, dtIdx) + newHandler + src.slice(dtIdx);

  return src;
});
