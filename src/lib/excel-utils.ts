/**
 * Excel Template Generation Utilities
 * Generates downloadable Excel templates for data import
 */
import * as XLSX from 'xlsx';

export interface StudentData {
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  level: string;
  program: string;
  phoneNumber?: string;
}

export interface StudentValidationError {
  row: number;
  field: string;
  message: string;
}


export interface StudentTemplateData {
  'Student ID': string;
  'First Name': string;
  'Last Name': string;
  Email: string;
  Department: string;
  Level: string;
  Program: string;
  'Phone Number': string;
}

/**
 * Generate and download student import Excel template
 * Creates a properly formatted Excel file with headers and sample data
 */
export function downloadStudentImportTemplate() {
  // Sample data to include in template
  const sampleData: StudentTemplateData[] = [
    {
      'Student ID': '2024001',
      'First Name': 'Kwame',
      'Last Name': 'Mensah',
      Email: 'kwame.mensah@cktutas.edu.gh',
      Department: 'Computer Science',
      Level: '300',
      Program: 'BSc Computer Science',
      'Phone Number': '+233241234567',
    },
    {
      'Student ID': '2024002',
      'First Name': 'Ama',
      'Last Name': 'Osei',
      Email: 'ama.osei@cktutas.edu.gh',
      Department: 'Business Administration',
      Level: '200',
      Program: 'BSc Business Administration',
      'Phone Number': '+233242345678',
    },
    {
      'Student ID': '2024003',
      'First Name': 'Kofi',
      'Last Name': 'Asante',
      Email: 'kofi.asante@cktutas.edu.gh',
      Department: 'Engineering',
      Level: '400',
      Program: 'BEng Mechanical Engineering',
      'Phone Number': '',
    },
  ];

  // Convert to CSV format (Excel can open CSV files)
  const headers = Object.keys(sampleData[0]);
  const csvContent = [
    // Header row
    headers.join(','),
    // Data rows
    ...sampleData.map((row) =>
      headers
        .map((header) => {
          const value = row[header as keyof StudentTemplateData];
          // Wrap in quotes if contains comma
          return value.includes(',') ? `"${value}"` : value;
        })
        .join(',')
    ),
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', 'UTASVotes_Student_Import_Template.csv');
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Generate Excel template with proper formatting using XLSX library
 * This is the production-ready version that creates actual .xlsx files
 *
 * To use this, install: npm install xlsx
 * Then uncomment and use this function instead
 */
export function downloadStudentImportTemplateXLSX() {
  // This requires the 'xlsx' library
  // Uncomment when ready to use in production

  /*
  import * as XLSX from 'xlsx';
  
  const sampleData: StudentTemplateData[] = [
    {
      'Student ID': '2024001',
      'First Name': 'Kwame',
      'Last Name': 'Mensah',
      'Email': 'kwame.mensah@cktutas.edu.gh',
      'Department': 'Computer Science',
      'Level': '300',
      'Program': 'BSc Computer Science',
      'Phone Number': '+233241234567',
    },
    {
      'Student ID': '2024002',
      'First Name': 'Ama',
      'Last Name': 'Osei',
      'Email': 'ama.osei@cktutas.edu.gh',
      'Department': 'Business Administration',
      'Level': '200',
      'Program': 'BSc Business Administration',
      'Phone Number': '+233242345678',
    },
    {
      'Student ID': '2024003',
      'First Name': 'Kofi',
      'Last Name': 'Asante',
      'Email': 'kofi.asante@cktutas.edu.gh',
      'Department': 'Engineering',
      'Level': '400',
      'Program': 'BEng Mechanical Engineering',
      'Phone Number': '',
    },
  ];

  // Create worksheet from data
  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  
  // Set column widths
  worksheet['!cols'] = [
    { wch: 15 }, // Student ID
    { wch: 15 }, // First Name
    { wch: 15 }, // Last Name
    { wch: 30 }, // Email
    { wch: 25 }, // Department
    { wch: 8 },  // Level
    { wch: 30 }, // Program
    { wch: 15 }, // Phone Number
  ];
  
  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
  
  // Add instructions sheet
  const instructions = [
    ['UTASVotes Student Import Template'],
    [''],
    ['Instructions:'],
    ['1. Fill in student data starting from row 2 (row 1 contains headers)'],
    ['2. Do not modify the column headers'],
    ['3. Ensure all required fields are filled'],
    ['4. Save the file and upload it to the import page'],
    [''],
    ['Required Columns:'],
    ['- Student ID: Numeric only (e.g., 2024001, 123456)'],
    ['- First Name: Student\'s first name'],
    ['- Last Name: Student\'s last name'],
    ['- Email: Must end with @cktutas.edu.gh'],
    ['- Department: Student\'s department'],
    ['- Level: Must be 100, 200, 300, or 400'],
    ['- Program: Full program name (e.g., BSc Computer Science)'],
    [''],
    ['Optional Columns:'],
    ['- Phone Number: Student\'s phone number (optional)'],
    [''],
    ['Sample data is provided in the "Students" sheet for reference.'],
    ['You can delete the sample rows and add your own data.'],
  ];
  
  const instructionsSheet = XLSX.utils.aoa_to_sheet(instructions);
  instructionsSheet['!cols'] = [{ wch: 80 }];
  XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');
  
  // Download file
  XLSX.writeFile(workbook, 'UTASVotes_Student_Import_Template.xlsx');
  */

  console.log('XLSX library not installed. Using CSV fallback.');
  downloadStudentImportTemplate();
}

/**
 * Validate Excel/CSV file before processing
 */
export function validateImportFile(file: File): { valid: boolean; error?: string } {
  const validTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv',
  ];

  const validExtensions = ['.xlsx', '.xls', '.csv'];
  const hasValidExtension = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));

  if (!validTypes.includes(file.type) && !hasValidExtension) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload an Excel (.xlsx, .xls) or CSV file.',
    };
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size exceeds 10MB limit. Please upload a smaller file.',
    };
  }

  return { valid: true };
}

/**
 * Parse CSV content to JSON
 */
export function parseCSV(csvContent: string): Record<string, string>[] {
  const lines = csvContent.split('\n').filter((line) => line.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  const data: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
    const row: Record<string, string> = {};

    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    data.push(row);
  }

  return data;
}

/**
 * Read file content as text
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target?.result as string;
      resolve(content);
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}

/**
 * Generate instructions document for download
 */
export function downloadImportInstructions() {
  const instructions = `
UTASVotes Student Import Instructions
=====================================

File Format Requirements:
------------------------
- File Type: Excel (.xlsx, .xls) or CSV (.csv)
- Maximum Size: 10MB
- First row must contain column headers
- Data starts from row 2

Required Columns:
----------------
1. Student ID
   - Format: Numeric only (no prefix)
   - Example: 2024001, 123456
   - Must be unique for each student

2. First Name
   - Student's first name
   - Minimum 2 characters
   - Example: Kwame

3. Last Name
   - Student's last name
   - Minimum 2 characters
   - Example: Mensah

4. Email
   - Must be institutional email
   - Format: username@cktutas.edu.gh
   - Example: kwame.mensah@cktutas.edu.gh

5. Department
   - Student's department
   - Example: Computer Science, Engineering, Business Administration

6. Level
   - Student's current level
   - Valid values: 100, 200, 300, 400
   - Example: 300

7. Program
   - Full program name
   - Example: BSc Computer Science, BEng Mechanical Engineering

Optional Columns:
----------------
8. Phone Number
   - Student's phone number
   - Format: +233XXXXXXXXX
   - Example: +233241234567

Import Process:
--------------
1. Download the template file
2. Fill in student data (you can delete sample rows)
3. Save the file
4. Upload to the import page
5. Review preview data
6. Confirm import

What Happens After Import:
--------------------------
- Student accounts are created automatically
- Secure passwords are generated
- Welcome emails are sent to all students
- Students can login immediately

Common Errors:
-------------
- Invalid Student ID format
- Non-institutional email addresses
- Invalid level values
- Missing required fields
- Duplicate Student IDs

For support, contact: admin@cktutas.edu.gh
`;

  const blob = new Blob([instructions], { type: 'text/plain;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', 'UTASVotes_Import_Instructions.txt');
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Election Report Generation Functions
 */

export interface ElectionReportData {
  electionName: string;
  startDate: string;
  endDate: string;
  totalVoters: number;
  votedCount: number;
  turnoutPercentage: number;
  positions: Array<{
    name: string;
    candidates: number;
    votes: number;
  }>;
  candidates: Array<{
    name: string;
    position: string;
    votes: number;
    percentage: number;
  }>;
}

/**
 * Generate comprehensive election report as CSV
 */
export function generateElectionReport(data: ElectionReportData) {
  const timestamp = new Date().toISOString().split('T')[0];
  const reportContent = [
    '='.repeat(80),
    `UTASVOTES ELECTION REPORT`,
    `Generated: ${new Date().toLocaleString()}`,
    '='.repeat(80),
    '',
    'ELECTION OVERVIEW',
    '-'.repeat(80),
    `Election Name: ${data.electionName}`,
    `Start Date: ${new Date(data.startDate).toLocaleString()}`,
    `End Date: ${new Date(data.endDate).toLocaleString()}`,
    `Total Registered Voters: ${data.totalVoters}`,
    `Total Votes Cast: ${data.votedCount}`,
    `Voter Turnout: ${data.turnoutPercentage.toFixed(2)}%`,
    '',
    'POSITIONS SUMMARY',
    '-'.repeat(80),
    'Position,Candidates,Total Votes',
    ...data.positions.map((p) => `${p.name},${p.candidates},${p.votes}`),
    '',
    'CANDIDATE RESULTS',
    '-'.repeat(80),
    'Candidate Name,Position,Votes,Percentage',
    ...data.candidates.map(
      (c) => `${c.name},${c.position},${c.votes},${c.percentage.toFixed(2)}%`
    ),
    '',
    '='.repeat(80),
    'END OF REPORT',
    '='.repeat(80),
  ].join('\n');

  const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `Election_Report_${data.electionName.replace(/\s+/g, '_')}_${timestamp}.txt`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Export election data as CSV
 */
export function exportElectionDataCSV(data: ElectionReportData) {
  const timestamp = new Date().toISOString().split('T')[0];
  
  // Create CSV content
  const csvContent = [
    // Header
    'Candidate Name,Position,Votes,Percentage,Election Name,Start Date,End Date,Total Voters,Votes Cast,Turnout',
    // Data rows
    ...data.candidates.map((c) =>
      [
        c.name,
        c.position,
        c.votes,
        c.percentage.toFixed(2) + '%',
        data.electionName,
        new Date(data.startDate).toLocaleDateString(),
        new Date(data.endDate).toLocaleDateString(),
        data.totalVoters,
        data.votedCount,
        data.turnoutPercentage.toFixed(2) + '%',
      ].join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `Election_Data_${data.electionName.replace(/\s+/g, '_')}_${timestamp}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Export voter statistics as CSV
 */
export function exportVoterStatistics(elections: Array<{
  name: string;
  totalVoters: number;
  votedCount: number;
  turnoutPercentage: number;
  startDate: string;
  endDate: string;
}>) {
  const timestamp = new Date().toISOString().split('T')[0];
  
  const csvContent = [
    'Election Name,Total Voters,Votes Cast,Turnout %,Start Date,End Date,Status',
    ...elections.map((e) =>
      [
        e.name,
        e.totalVoters,
        e.votedCount,
        e.turnoutPercentage.toFixed(2),
        new Date(e.startDate).toLocaleDateString(),
        new Date(e.endDate).toLocaleDateString(),
        new Date(e.endDate) < new Date() ? 'Completed' : 'Active',
      ].join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `Voter_Statistics_${timestamp}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Export candidate applications as CSV
 */
export function exportCandidateApplications(applications: Array<{
  candidateName: string;
  studentId: string;
  email: string;
  position: string;
  department: string;
  eligibilityStatus: string;
  paymentStatus: string;
  submittedAt: string;
}>) {
  const timestamp = new Date().toISOString().split('T')[0];
  
  const csvContent = [
    'Candidate Name,Student ID,Email,Position,Department,Status,Payment,Submitted Date',
    ...applications.map((a) =>
      [
        a.candidateName,
        a.studentId,
        a.email,
        a.position,
        a.department,
        a.eligibilityStatus,
        a.paymentStatus,
        new Date(a.submittedAt).toLocaleDateString(),
      ].join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `Candidate_Applications_${timestamp}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Parse an Excel/CSV spreadsheet into structured student data.
 * Shared by the Admin and Electoral Commission import screens so both
 * portals parse identically.
 *
 * Throws an Error with a user-friendly message when the file has no
 * valid data rows or required columns cannot be found.
 */
export async function parseStudentSpreadsheet(file: File): Promise<StudentData[]> {
  const arrayBuffer = await file.arrayBuffer();

  const workbook = XLSX.read(arrayBuffer, { type: 'array' });

  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const jsonData = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: '',
    blankrows: false,
  }) as any[][];

  if (jsonData.length < 2) {
    throw new Error('File appears to be empty or has no data rows.');
  }

  // Get headers from first row
  const headers = jsonData[0].map((h: any) => String(h).toLowerCase().trim());

  const findColumnIndex = (possibleNames: string[]): number => {
    for (const name of possibleNames) {
      const index = headers.findIndex(
        (h) => h.includes(name.toLowerCase()) || name.toLowerCase().includes(h)
      );
      if (index !== -1) return index;
    }
    return -1;
  };

  const columnMap = {
    studentId: findColumnIndex(['student id', 'studentid', 'id', 'student_id', 'matric', 'registration']),
    firstName: findColumnIndex(['first name', 'firstname', 'first_name', 'fname', 'given name']),
    lastName: findColumnIndex(['last name', 'lastname', 'last_name', 'lname', 'surname', 'family name']),
    email: findColumnIndex(['email', 'e-mail', 'email address', 'mail']),
    department: findColumnIndex(['department', 'dept', 'faculty', 'school']),
    level: findColumnIndex(['level', 'year', 'class', 'grade']),
    program: findColumnIndex(['program', 'programme', 'course', 'major', 'degree']),
    phoneNumber: findColumnIndex(['phone', 'phone number', 'phonenumber', 'mobile', 'contact', 'tel']),
  };

  const students: StudentData[] = [];

  for (let i = 1; i < jsonData.length; i++) {
    const row = jsonData[i];
    if (!row || row.every((cell: any) => !cell)) continue;

    const student: StudentData = {
      studentId: columnMap.studentId >= 0 ? String(row[columnMap.studentId] || '').trim() : '',
      firstName: columnMap.firstName >= 0 ? String(row[columnMap.firstName] || '').trim() : '',
      lastName: columnMap.lastName >= 0 ? String(row[columnMap.lastName] || '').trim() : '',
      email: columnMap.email >= 0 ? String(row[columnMap.email] || '').trim() : '',
      department: columnMap.department >= 0 ? String(row[columnMap.department] || '').trim() : '',
      level: columnMap.level >= 0 ? String(row[columnMap.level] || '').trim() : '',
      program: columnMap.program >= 0 ? String(row[columnMap.program] || '').trim() : '',
      phoneNumber:
        columnMap.phoneNumber >= 0
          ? String(row[columnMap.phoneNumber] || '').trim() || undefined
          : undefined,
    };

    // Only add if we have the minimum required fields
    if (student.studentId && student.firstName && student.lastName && student.email) {
      students.push(student);
    }
  }

  if (students.length === 0) {
    const missingColumns: string[] = [];
    if (columnMap.studentId === -1) missingColumns.push('Student ID');
    if (columnMap.firstName === -1) missingColumns.push('First Name');
    if (columnMap.lastName === -1) missingColumns.push('Last Name');
    if (columnMap.email === -1) missingColumns.push('Email');

    throw new Error(
      `No valid student data found!\n\nFound headers: ${headers.join(', ')}${
        missingColumns.length
          ? `\n\nMissing columns: ${missingColumns.join(', ')}`
          : '\n\nRequired columns: Student ID, First Name, Last Name, Email, Department, Level, Program'
      }`
    );
  }

  return students;
}


/**
 * Validate student data. Returns a list of per-row validation errors.
 * Shared by the Admin and Electoral Commission import screens.
 */
export function validateStudentData(data: StudentData[]): StudentValidationError[] {
  const errors: StudentValidationError[] = [];
  const emailRegex = /^[a-zA-Z0-9._%+-]+@cktutas\.edu\.gh$/;
  const studentIdRegex = /^\d+$/;

  data.forEach((student, index) => {
    const row = index + 2; // +2 because row 1 is header and arrays are 0-indexed

    if (!student.studentId || !studentIdRegex.test(student.studentId)) {
      errors.push({
        row,
        field: 'Student ID',
        message: 'Invalid format. Must be numeric only (e.g., 2024001, 123456)',
      });
    }

    if (!student.firstName || student.firstName.trim().length < 2) {
      errors.push({
        row,
        field: 'First Name',
        message: 'First name is required and must be at least 2 characters',
      });
    }

    if (!student.lastName || student.lastName.trim().length < 2) {
      errors.push({
        row,
        field: 'Last Name',
        message: 'Last name is required and must be at least 2 characters',
      });
    }

    if (!student.email || !emailRegex.test(student.email)) {
      errors.push({
        row,
        field: 'Email',
        message: 'Must be a valid institutional email (@cktutas.edu.gh)',
      });
    }

    if (!student.department || student.department.trim().length < 2) {
      errors.push({
        row,
        field: 'Department',
        message: 'Department is required',
      });
    }

    if (!student.level || !['100', '200', '300', '400'].includes(student.level)) {
      errors.push({
        row,
        field: 'Level',
        message: 'Level must be 100, 200, 300, or 400',
      });
    }

    if (!student.program || student.program.trim().length < 2) {
      errors.push({
        row,
        field: 'Program',
        message: 'Program is required',
      });
    }
  });

  return errors;
}

/**
 * Download the one-time credentials sheet (fallback channel when email
 * delivery is not configured). The passwords are provided exactly once by
 * the import API response and are never stored or logged client-side.
 */
export function downloadCredentialsSheetCSV(
  credentials: Array<{ studentId: string; email: string; name: string; password: string }>
) {
  if (credentials.length === 0) return;

  const timestamp = new Date().toISOString().split('T')[0];
  const csvContent = [
    'Student ID,Email,Full Name,Temporary Password',
    ...credentials.map((c) =>
      [c.studentId, c.email, `"${c.name.replace(/"/g, '""')}"`, c.password].join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `UTASVotes_Student_Credentials_${timestamp}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

