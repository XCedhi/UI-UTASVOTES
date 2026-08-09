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
  // 1. Replace processFile with shared parser
  const pfStart = src.indexOf('  const processFile = async (file: File) => {');
  const pfEnd = src.indexOf('\n  const validateData =', pfStart);
  if (pfStart === -1 || pfEnd === -1) throw new Error('processFile span not found');

  const newProcessFile = `  const processFile = async (file: File) => {
    setIsProcessing(true);

    try {
      const students = await parseStudentSpreadsheet(file);
      console.log(\`Successfully parsed \${students.length} students from Excel file\`);
      alert(\`Successfully loaded \${students.length} students from your file!\`);

      setPreviewData(students);
      setShowPreview(true);
    } catch (error: any) {
      console.error('Error processing Excel file:', error);
      alert(
        error.message ||
          'Error processing file. Please check the file format and try again.'
      );
    } finally {
      setIsProcessing(false);
    }
  };
`;

  src = src.slice(0, pfStart) + newProcessFile + src.slice(pfEnd);

  // 2. Replace validateData with shared validator wrapper
  const vdStart = src.indexOf('  const validateData = (data: StudentData[]): ValidationError[] => {');
  const vdEnd = src.indexOf('\n  const handleImport =', vdStart);
  if (vdStart === -1 || vdEnd === -1) throw new Error('validateData span not found');

  const newValidateData = `  const validateData = (data: StudentData[]): StudentValidationError[] => {
    return validateStudentData(data);
  };
`;

  src = src.slice(0, vdStart) + newValidateData + src.slice(vdEnd);

  return src;
});
