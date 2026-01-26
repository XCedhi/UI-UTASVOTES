/**
 * Excel Template Generation Utilities
 * Generates downloadable Excel templates for data import
 */

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
      'Student ID': 'UTAS2024001',
      'First Name': 'Kwame',
      'Last Name': 'Mensah',
      Email: 'kwame.mensah@cktutas.edu.gh',
      Department: 'Computer Science',
      Level: '300',
      Program: 'BSc Computer Science',
      'Phone Number': '+233241234567',
    },
    {
      'Student ID': 'UTAS2024002',
      'First Name': 'Ama',
      'Last Name': 'Osei',
      Email: 'ama.osei@cktutas.edu.gh',
      Department: 'Business Administration',
      Level: '200',
      Program: 'BSc Business Administration',
      'Phone Number': '+233242345678',
    },
    {
      'Student ID': 'UTAS2024003',
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
      'Student ID': 'UTAS2024001',
      'First Name': 'Kwame',
      'Last Name': 'Mensah',
      'Email': 'kwame.mensah@cktutas.edu.gh',
      'Department': 'Computer Science',
      'Level': '300',
      'Program': 'BSc Computer Science',
      'Phone Number': '+233241234567',
    },
    {
      'Student ID': 'UTAS2024002',
      'First Name': 'Ama',
      'Last Name': 'Osei',
      'Email': 'ama.osei@cktutas.edu.gh',
      'Department': 'Business Administration',
      'Level': '200',
      'Program': 'BSc Business Administration',
      'Phone Number': '+233242345678',
    },
    {
      'Student ID': 'UTAS2024003',
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
    ['- Student ID: Format UTAS followed by 7 digits (e.g., UTAS2024001)'],
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
   - Format: UTAS followed by 7 digits
   - Example: UTAS2024001
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
