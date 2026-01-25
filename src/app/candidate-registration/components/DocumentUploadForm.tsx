'use client';

import React, { useRef } from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

interface UploadedFile {
  name: string;
  size: number;
  preview?: string;
}

interface DocumentUploadFormProps {
  uploads: {
    photo: UploadedFile | null;
    manifesto: UploadedFile | null;
    studentId: UploadedFile | null;
    transcript: UploadedFile | null;
  };
  errors: Record<string, string>;
  onUpload: (field: string, file: File) => void;
  onRemove: (field: string) => void;
}

const DocumentUploadForm = ({ uploads, errors, onUpload, onRemove }: DocumentUploadFormProps) => {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const manifestoInputRef = useRef<HTMLInputElement>(null);
  const studentIdInputRef = useRef<HTMLInputElement>(null);
  const transcriptInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleFileSelect = (field: string, file: File | null) => {
    if (!file) return;
    onUpload(field, file);
  };

  const uploadFields = [
    {
      id: 'photo',
      label: 'Passport Photograph',
      description: 'Professional photo (JPEG/PNG, max 2MB)',
      accept: 'image/jpeg,image/png',
      icon: 'PhotoIcon',
      ref: photoInputRef,
      required: true,
    },
    {
      id: 'manifesto',
      label: 'Campaign Manifesto',
      description: 'Detailed manifesto document (PDF, max 5MB)',
      accept: 'application/pdf',
      icon: 'DocumentTextIcon',
      ref: manifestoInputRef,
      required: true,
    },
    {
      id: 'studentId',
      label: 'Student ID Card',
      description: 'Clear copy of your student ID (JPEG/PNG/PDF, max 2MB)',
      accept: 'image/jpeg,image/png,application/pdf',
      icon: 'IdentificationIcon',
      ref: studentIdInputRef,
      required: true,
    },
    {
      id: 'transcript',
      label: 'Academic Transcript',
      description: 'Latest semester transcript (PDF, max 3MB)',
      accept: 'application/pdf',
      icon: 'AcademicCapIcon',
      ref: transcriptInputRef,
      required: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-primary/5 border border-primary/20 rounded-md p-4">
        <div className="flex items-start gap-3">
          <Icon
            name="CloudArrowUpIcon"
            size={20}
            variant="solid"
            className="text-primary flex-shrink-0 mt-0.5"
          />
          <div>
            <p className="text-sm text-foreground font-medium mb-1">Document Upload Requirements</p>
            <p className="text-sm text-muted-foreground">
              All documents must be clear, legible, and in the specified formats. Ensure file sizes
              do not exceed the maximum limits.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {uploadFields.map((field) => {
          const uploadedFile = uploads[field.id as keyof typeof uploads];

          return (
            <div key={field.id}>
              <label className="block text-sm font-medium text-foreground mb-2">
                {field.label} {field.required && <span className="text-error">*</span>}
              </label>
              <p className="text-xs text-muted-foreground mb-3">{field.description}</p>

              {!uploadedFile ? (
                <button
                  type="button"
                  onClick={() => field.ref.current?.click()}
                  className="w-full p-6 border-2 border-dashed border-border rounded-md hover:border-primary hover:bg-primary/5 transition-all duration-250 ease-smooth"
                >
                  <div className="flex flex-col items-center gap-3">
                    <Icon
                      name={field.icon as any}
                      size={32}
                      variant="outline"
                      className="text-muted-foreground"
                    />
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground">Click to upload</p>
                      <p className="text-xs text-muted-foreground mt-1">or drag and drop</p>
                    </div>
                  </div>
                </button>
              ) : (
                <div className="p-4 bg-card border border-border rounded-md">
                  {field.id === 'photo' && uploadedFile.preview ? (
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                        <AppImage
                          src={uploadedFile.preview}
                          alt="Uploaded passport photograph"
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {uploadedFile.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatFileSize(uploadedFile.size)}
                        </p>
                        <button
                          type="button"
                          onClick={() => onRemove(field.id)}
                          className="text-xs text-error hover:underline mt-2"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <Icon
                        name="DocumentIcon"
                        size={24}
                        variant="outline"
                        className="text-primary flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {uploadedFile.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatFileSize(uploadedFile.size)}
                        </p>
                        <button
                          type="button"
                          onClick={() => onRemove(field.id)}
                          className="text-xs text-error hover:underline mt-2"
                        >
                          Remove
                        </button>
                      </div>
                      <Icon
                        name="CheckCircleIcon"
                        size={20}
                        variant="solid"
                        className="text-success flex-shrink-0"
                      />
                    </div>
                  )}
                </div>
              )}

              <input
                ref={field.ref}
                type="file"
                accept={field.accept}
                onChange={(e) => handleFileSelect(field.id, e.target.files?.[0] || null)}
                className="hidden"
              />

              {errors[field.id] && <p className="text-sm text-error mt-2">{errors[field.id]}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DocumentUploadForm;
