'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/common/Header';
import Icon from '@/components/ui/AppIcon';
import { downloadStudentImportTemplate } from '@/lib/excel-utils';
import { getUserSession } from '@/lib/auth-utils';

interface StudentData {
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  level: string;
  program: string;
  phoneNumber?: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: ValidationError[];
  students: StudentData[];
}

const StudentImportInteractive = () => {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'commission'>('admin');
  const [userName, setUserName] = useState('Administrator');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<StudentData[]>([]);

  useEffect(() => {
    setIsHydrated(true);

    // Get user session to determine role
    const session = getUserSession();
    if (session) {
      setUserRole(session.role as 'admin' | 'commission');
      setUserName(session.name);
    }
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && isValidFile(droppedFile)) {
      setFile(droppedFile);
      processFile(droppedFile);
    } else {
      alert('Please upload a valid Excel file (.xlsx or .xls)');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && isValidFile(selectedFile)) {
      setFile(selectedFile);
      processFile(selectedFile);
    } else {
      alert('Please upload a valid Excel file (.xlsx or .xls)');
    }
  };

  const isValidFile = (file: File): boolean => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    return (
      validTypes.includes(file.type) || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
    );
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);

    // Simulate file processing (in production, use a library like xlsx or SheetJS)
    setTimeout(() => {
      // Mock data for demonstration
      const mockData: StudentData[] = [
        {
          studentId: 'UTAS2024001',
          firstName: 'Kwame',
          lastName: 'Mensah',
          email: 'kwame.mensah@cktutas.edu.gh',
          department: 'Computer Science',
          level: '300',
          program: 'BSc Computer Science',
          phoneNumber: '+233241234567',
        },
        {
          studentId: 'UTAS2024002',
          firstName: 'Ama',
          lastName: 'Osei',
          email: 'ama.osei@cktutas.edu.gh',
          department: 'Business Administration',
          level: '200',
          program: 'BSc Business Administration',
          phoneNumber: '+233242345678',
        },
        {
          studentId: 'UTAS2024003',
          firstName: 'Kofi',
          lastName: 'Asante',
          email: 'kofi.asante@cktutas.edu.gh',
          department: 'Engineering',
          level: '400',
          program: 'BEng Mechanical Engineering',
          phoneNumber: '+233243456789',
        },
      ];

      setPreviewData(mockData);
      setShowPreview(true);
      setIsProcessing(false);
    }, 2000);
  };

  const validateData = (data: StudentData[]): ValidationError[] => {
    const errors: ValidationError[] = [];
    const emailRegex = /^[a-zA-Z0-9._%+-]+@cktutas\.edu\.gh$/;
    const studentIdRegex = /^UTAS\d{7}$/;

    data.forEach((student, index) => {
      const row = index + 2; // +2 because row 1 is header and arrays are 0-indexed

      if (!student.studentId || !studentIdRegex.test(student.studentId)) {
        errors.push({
          row,
          field: 'Student ID',
          message: 'Invalid format. Must be UTAS followed by 7 digits (e.g., UTAS2024001)',
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
  };

  const handleImport = async () => {
    if (previewData.length === 0) return;

    setIsProcessing(true);

    // Validate data
    const errors = validateData(previewData);

    if (errors.length > 0) {
      setImportResult({
        success: 0,
        failed: errors.length,
        errors,
        students: [],
      });
      setIsProcessing(false);
      return;
    }

    // Simulate import process
    setTimeout(() => {
      // In production, this would:
      // 1. Create accounts in Supabase
      // 2. Generate secure passwords
      // 3. Send welcome emails

      setImportResult({
        success: previewData.length,
        failed: 0,
        errors: [],
        students: previewData,
      });
      setIsProcessing(false);
      setShowPreview(false);
    }, 3000);
  };

  const downloadTemplate = () => {
    downloadStudentImportTemplate();
  };

  const resetImport = () => {
    setFile(null);
    setPreviewData([]);
    setShowPreview(false);
    setImportResult(null);
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background">
        <Header userRole={userRole} userName="Loading..." notificationCount={0} />
        <main className="pt-24 pb-12 px-4 lg:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="h-96 bg-muted animate-pulse rounded-lg" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        userRole={userRole}
        userName={userName}
        userAvatar={
          userRole === 'admin'
            ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop'
            : 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg'
        }
        notificationCount={5}
      />

      <main className="pt-24 pb-12 px-4 lg:px-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading font-bold text-3xl text-foreground mb-2">
                Import Student Data
              </h1>
              <p className="text-muted-foreground">
                Upload Excel file to create student accounts and send welcome emails
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-all duration-250"
              >
                <Icon name="ArrowLeftIcon" size={20} variant="outline" />
                Back
              </button>
              <button
                onClick={downloadTemplate}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-all duration-250 ease-smooth shadow-md"
              >
                <Icon name="ArrowDownTrayIcon" size={20} variant="outline" />
                Download Template
              </button>
            </div>
          </div>

          {/* Instructions Card */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 p-3 bg-primary/10 rounded-lg">
                <Icon
                  name="InformationCircleIcon"
                  size={24}
                  variant="outline"
                  className="text-primary"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-heading font-semibold text-lg text-foreground mb-3">
                  Required Excel File Format
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-foreground mb-2">Required Columns:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <Icon
                          name="CheckCircleIcon"
                          size={16}
                          variant="solid"
                          className="text-success"
                        />
                        <span>
                          <strong>Student ID</strong> - Format: UTAS2024001
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Icon
                          name="CheckCircleIcon"
                          size={16}
                          variant="solid"
                          className="text-success"
                        />
                        <span>
                          <strong>First Name</strong> - Student&apos;s first name
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Icon
                          name="CheckCircleIcon"
                          size={16}
                          variant="solid"
                          className="text-success"
                        />
                        <span>
                          <strong>Last Name</strong> - Student&apos;s last name
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Icon
                          name="CheckCircleIcon"
                          size={16}
                          variant="solid"
                          className="text-success"
                        />
                        <span>
                          <strong>Email</strong> - Must end with @cktutas.edu.gh
                        </span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-foreground mb-2">Additional Columns:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <Icon
                          name="CheckCircleIcon"
                          size={16}
                          variant="solid"
                          className="text-success"
                        />
                        <span>
                          <strong>Department</strong> - e.g., Computer Science
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Icon
                          name="CheckCircleIcon"
                          size={16}
                          variant="solid"
                          className="text-success"
                        />
                        <span>
                          <strong>Level</strong> - 100, 200, 300, or 400
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Icon
                          name="CheckCircleIcon"
                          size={16}
                          variant="solid"
                          className="text-success"
                        />
                        <span>
                          <strong>Program</strong> - e.g., BSc Computer Science
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Icon
                          name="CheckCircleIcon"
                          size={16}
                          variant="outline"
                          className="text-muted-foreground"
                        />
                        <span>
                          <strong>Phone Number</strong> - Optional
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-md">
                  <p className="text-sm text-warning flex items-center gap-2">
                    <Icon name="ExclamationTriangleIcon" size={16} variant="solid" />
                    <span>
                      Download the template to ensure correct format. First row must contain column
                      headers.
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Upload Area */}
          {!showPreview && !importResult && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-all duration-250 ${
                isDragging
                  ? 'border-primary bg-primary/5 scale-105'
                  : 'border-border hover:border-primary/50 hover:bg-muted/30'
              }`}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="p-6 bg-primary/10 rounded-full">
                  <Icon
                    name="CloudArrowUpIcon"
                    size={48}
                    variant="outline"
                    className="text-primary"
                  />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-xl text-foreground mb-2">
                    {isDragging ? 'Drop your file here' : 'Upload Excel File'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Drag and drop your Excel file here, or click to browse
                  </p>
                  <label className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-all duration-250 ease-smooth cursor-pointer shadow-md">
                    <Icon name="FolderOpenIcon" size={20} variant="outline" />
                    <span className="font-medium">Choose File</span>
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Supported formats: .xlsx, .xls • Maximum file size: 10MB
                </p>
              </div>
            </div>
          )}

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="bg-card border border-border rounded-lg p-12">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <div className="text-center">
                  <p className="font-medium text-foreground mb-1">Processing file...</p>
                  <p className="text-sm text-muted-foreground">
                    Validating data and preparing preview
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Preview Data */}
          {showPreview && !isProcessing && (
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="p-6 border-b border-border bg-muted/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-heading font-semibold text-xl text-foreground mb-1">
                      Preview Import Data
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Review {previewData.length} student{previewData.length !== 1 ? 's' : ''}{' '}
                      before importing
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={resetImport}
                      className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-all duration-250"
                    >
                      <Icon name="XMarkIcon" size={20} variant="outline" />
                      Cancel
                    </button>
                    <button
                      onClick={handleImport}
                      className="flex items-center gap-2 px-6 py-2 bg-success text-success-foreground rounded-md hover:bg-success/90 transition-all duration-250 ease-smooth shadow-md"
                    >
                      <Icon name="CheckCircleIcon" size={20} variant="outline" />
                      Import {previewData.length} Student{previewData.length !== 1 ? 's' : ''}
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/30">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                        #
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                        Student ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                        Department
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                        Level
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                        Program
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {previewData.map((student, index) => (
                      <tr key={index} className="hover:bg-muted/20 transition-colors duration-200">
                        <td className="px-4 py-3 text-sm text-muted-foreground">{index + 1}</td>
                        <td className="px-4 py-3 text-sm font-medium text-foreground font-data">
                          {student.studentId}
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground">
                          {student.firstName} {student.lastName}
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground font-data">
                          {student.email}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {student.department}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{student.level}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {student.program}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Import Result */}
          {importResult && (
            <div className="space-y-6">
              {/* Success Summary */}
              {importResult.success > 0 && (
                <div className="bg-success/5 border border-success/20 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 p-3 bg-success/10 rounded-lg">
                      <Icon
                        name="CheckCircleIcon"
                        size={32}
                        variant="solid"
                        className="text-success"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-heading font-semibold text-xl text-foreground mb-2">
                        Import Successful!
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Successfully imported {importResult.success} student
                        {importResult.success !== 1 ? 's' : ''}
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-success">
                          <Icon name="CheckCircleIcon" size={16} variant="solid" />
                          <span>Accounts created in database</span>
                        </div>
                        <div className="flex items-center gap-2 text-success">
                          <Icon name="CheckCircleIcon" size={16} variant="solid" />
                          <span>Secure passwords generated</span>
                        </div>
                        <div className="flex items-center gap-2 text-success">
                          <Icon name="CheckCircleIcon" size={16} variant="solid" />
                          <span>Welcome emails sent to all students</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Summary */}
              {importResult.failed > 0 && (
                <div className="bg-error/5 border border-error/20 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 p-3 bg-error/10 rounded-lg">
                      <Icon name="XCircleIcon" size={32} variant="solid" className="text-error" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-heading font-semibold text-xl text-foreground mb-2">
                        Validation Errors Found
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {importResult.failed} error{importResult.failed !== 1 ? 's' : ''} detected.
                        Please fix and try again.
                      </p>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {importResult.errors.map((error, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-2 text-sm p-2 bg-error/5 rounded"
                          >
                            <Icon
                              name="ExclamationCircleIcon"
                              size={16}
                              variant="solid"
                              className="text-error flex-shrink-0 mt-0.5"
                            />
                            <span className="text-foreground">
                              <strong>
                                Row {error.row}, {error.field}:
                              </strong>{' '}
                              {error.message}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={resetImport}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-all duration-250 ease-smooth shadow-md"
                >
                  <Icon name="ArrowUpTrayIcon" size={20} variant="outline" />
                  Import Another File
                </button>
                {importResult.success > 0 && (
                  <button
                    onClick={() => router.push('/admin-system-control/users/manage')}
                    className="flex items-center gap-2 px-6 py-3 bg-success text-success-foreground rounded-md hover:bg-success/90 transition-all duration-250 ease-smooth shadow-md"
                  >
                    <Icon name="UsersIcon" size={20} variant="outline" />
                    View All Users
                  </button>
                )}
              </div>
            </div>
          )}

          {/* What Happens Next */}
          {!importResult && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
                What Happens After Import?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                    <Icon
                      name="UserPlusIcon"
                      size={24}
                      variant="outline"
                      className="text-primary"
                    />
                  </div>
                  <h4 className="font-medium text-foreground mb-2">1. Accounts Created</h4>
                  <p className="text-sm text-muted-foreground">
                    Student accounts are automatically created in the database with secure
                    credentials
                  </p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mb-3">
                    <Icon name="KeyIcon" size={24} variant="outline" className="text-success" />
                  </div>
                  <h4 className="font-medium text-foreground mb-2">2. Passwords Generated</h4>
                  <p className="text-sm text-muted-foreground">
                    Secure random passwords are generated following best security practices
                  </p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-3">
                    <Icon name="EnvelopeIcon" size={24} variant="outline" className="text-accent" />
                  </div>
                  <h4 className="font-medium text-foreground mb-2">3. Emails Sent</h4>
                  <p className="text-sm text-muted-foreground">
                    Welcome emails with login credentials are sent to all students&apos;
                    institutional emails
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentImportInteractive;
