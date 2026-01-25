'use client';

import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import RegistrationProgress from './RegistrationProgress';
import PersonalInformationForm from './PersonalInformationForm';
import PositionSelectionForm from './PositionSelectionForm';
import EligibilityChecklistForm from './EligibilityChecklistForm';
import DocumentUploadForm from './DocumentUploadForm';
import PaymentForm from './PaymentForm';
import ApplicationReview from './ApplicationReview';

interface Position {
  id: string;
  title: string;
  description: string;
  fee: number;
  requirements: string[];
}

const CandidateRegistrationInteractive = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    studentId: '',
    email: '',
    phone: '',
    department: '',
    level: '',
    cgpa: '',
  });
  const [selectedPosition, setSelectedPosition] = useState('');
  const [eligibilityChecklist, setEligibilityChecklist] = useState<Record<string, boolean>>({});
  const [uploads, setUploads] = useState<{
    photo: { name: string; size: number; preview?: string } | null;
    manifesto: { name: string; size: number } | null;
    studentId: { name: string; size: number } | null;
    transcript: { name: string; size: number } | null;
  }>({
    photo: null,
    manifesto: null,
    studentId: null,
    transcript: null,
  });
  const [transactionId, setTransactionId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const steps = [
    { id: 1, label: 'Personal Information', description: 'Basic details and contact information' },
    { id: 2, label: 'Position Selection', description: 'Choose your desired position' },
    {
      id: 3,
      label: 'Eligibility Verification',
      description: 'Confirm constitutional requirements',
    },
    { id: 4, label: 'Document Upload', description: 'Submit required documents' },
    { id: 5, label: 'Payment', description: 'Process application fee' },
    { id: 6, label: 'Review & Submit', description: 'Final review before submission' },
  ];

  const positions: Position[] = [
    {
      id: 'president',
      title: 'Student Union President',
      description: 'Lead the entire student body and represent students at the highest level',
      fee: 150,
      requirements: [
        'Minimum CGPA of 3.0',
        'Level 300 or above',
        'Previous leadership experience',
        'No disciplinary record',
      ],
    },
    {
      id: 'vicepresident',
      title: 'Vice President',
      description: 'Support the President and oversee specific portfolios',
      fee: 120,
      requirements: [
        'Minimum CGPA of 2.8',
        'Level 200 or above',
        'Strong organizational skills',
        'Clean academic record',
      ],
    },
    {
      id: 'secretary',
      title: 'General Secretary',
      description: 'Manage administrative affairs and official communications',
      fee: 100,
      requirements: [
        'Minimum CGPA of 2.5',
        'Level 200 or above',
        'Excellent communication skills',
        'Good standing with university',
      ],
    },
    {
      id: 'treasurer',
      title: 'Financial Secretary',
      description: 'Oversee student union finances and budget management',
      fee: 100,
      requirements: [
        'Minimum CGPA of 2.5',
        'Level 200 or above',
        'Financial management knowledge',
        'Transparent record keeping',
      ],
    },
    {
      id: 'welfare',
      title: 'Welfare Officer',
      description: 'Address student welfare concerns and quality of life issues',
      fee: 80,
      requirements: [
        'Minimum CGPA of 2.5',
        'Level 100 or above',
        'Empathy and problem-solving skills',
        'Active student engagement',
      ],
    },
    {
      id: 'sports',
      title: 'Sports Director',
      description: 'Coordinate sports activities and inter-university competitions',
      fee: 80,
      requirements: [
        'Minimum CGPA of 2.5',
        'Level 100 or above',
        'Sports background preferred',
        'Event management experience',
      ],
    },
  ];

  const handleFormChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handlePositionChange = (positionId: string) => {
    setSelectedPosition(positionId);
    if (errors.position) {
      setErrors({ ...errors, position: '' });
    }
  };

  const handleEligibilityChange = (field: string, value: boolean) => {
    setEligibilityChecklist({ ...eligibilityChecklist, [field]: value });
    if (errors.eligibility) {
      setErrors({ ...errors, eligibility: '' });
    }
  };

  const handleFileUpload = (field: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const uploadData = {
        name: file.name,
        size: file.size,
        preview: field === 'photo' ? (reader.result as string) : undefined,
      };
      setUploads({ ...uploads, [field]: uploadData });
      if (errors[field]) {
        setErrors({ ...errors, [field]: '' });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileRemove = (field: string) => {
    setUploads({ ...uploads, [field]: null });
  };

  const handlePaymentComplete = (txnId: string) => {
    setTransactionId(txnId);
    setCurrentStep(6);
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
      if (!formData.studentId.trim()) newErrors.studentId = 'Student ID is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!formData.email.endsWith('@cktutas.edu.gh'))
        newErrors.email = 'Must use institutional email (@cktutas.edu.gh)';
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
      if (!formData.department) newErrors.department = 'Department is required';
      if (!formData.level) newErrors.level = 'Level is required';
      if (!formData.cgpa.trim()) newErrors.cgpa = 'CGPA is required';
      else if (parseFloat(formData.cgpa) < 2.5) newErrors.cgpa = 'Minimum CGPA of 2.5 required';
    }

    if (step === 2) {
      if (!selectedPosition) newErrors.position = 'Please select a position';
    }

    if (step === 3) {
      const requiredChecks = [
        'studentStatus',
        'cgpaRequirement',
        'disciplinaryRecord',
        'constitutionalCompliance',
        'campaignEthics',
        'documentAuthenticity',
      ];
      const allChecked = requiredChecks.every((check) => eligibilityChecklist[check]);
      if (!allChecked) newErrors.eligibility = 'All eligibility requirements must be verified';
    }

    if (step === 4) {
      if (!uploads.photo) newErrors.photo = 'Passport photograph is required';
      if (!uploads.manifesto) newErrors.manifesto = 'Campaign manifesto is required';
      if (!uploads.studentId) newErrors.studentId = 'Student ID card is required';
      if (!uploads.transcript) newErrors.transcript = 'Academic transcript is required';
    }

    if (step === 5) {
      if (!transactionId) newErrors.payment = 'Payment must be completed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = () => {
    console.log('Application submitted:', {
      formData,
      selectedPosition,
      eligibilityChecklist,
      uploads,
      transactionId,
    });

    alert('Application submitted successfully! You will receive a confirmation email shortly.');
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-muted rounded-md w-1/3" />
            <div className="h-96 bg-muted rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  const selectedPositionData = positions.find((p) => p.id === selectedPosition);

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-card border border-border rounded-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-heading font-semibold text-2xl text-foreground">
                {steps[currentStep - 1].label}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {steps[currentStep - 1].description}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                Step {currentStep} of {steps.length}
              </p>
              <div className="w-32 h-2 bg-muted rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-250 ease-smooth"
                  style={{ width: `${(currentStep / steps.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {currentStep === 1 && (
            <PersonalInformationForm
              formData={formData}
              errors={errors}
              onChange={handleFormChange}
            />
          )}

          {currentStep === 2 && (
            <PositionSelectionForm
              selectedPosition={selectedPosition}
              positions={positions}
              errors={errors}
              onChange={handlePositionChange}
            />
          )}

          {currentStep === 3 && (
            <EligibilityChecklistForm
              checklist={eligibilityChecklist}
              errors={errors}
              onChange={handleEligibilityChange}
            />
          )}

          {currentStep === 4 && (
            <DocumentUploadForm
              uploads={uploads}
              errors={errors}
              onUpload={handleFileUpload}
              onRemove={handleFileRemove}
            />
          )}

          {currentStep === 5 && selectedPositionData && (
            <PaymentForm
              amount={selectedPositionData.fee}
              positionTitle={selectedPositionData.title}
              onPaymentComplete={handlePaymentComplete}
              errors={errors}
            />
          )}

          {currentStep === 6 && selectedPositionData && (
            <ApplicationReview
              formData={formData}
              selectedPosition={selectedPosition}
              positionTitle={selectedPositionData.title}
              applicationFee={selectedPositionData.fee}
              uploads={uploads}
              transactionId={transactionId}
            />
          )}

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="px-6 py-3 bg-muted text-foreground rounded-md font-medium hover:bg-muted/80 transition-all duration-250 ease-smooth disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Icon name="ChevronLeftIcon" size={20} variant="outline" />
              <span>Previous</span>
            </button>

            {currentStep < 6 ? (
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-all duration-250 ease-smooth flex items-center gap-2"
              >
                <span>Next Step</span>
                <Icon name="ChevronRightIcon" size={20} variant="outline" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-6 py-3 bg-success text-success-foreground rounded-md font-medium hover:bg-success/90 transition-all duration-250 ease-smooth flex items-center gap-2"
              >
                <Icon name="CheckIcon" size={20} variant="solid" />
                <span>Submit Application</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <RegistrationProgress currentStep={currentStep} steps={steps} />
      </div>
    </div>
  );
};

export default CandidateRegistrationInteractive;
