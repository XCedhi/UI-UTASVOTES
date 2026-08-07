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
import { supabase } from '@/lib/supabase';

interface Position {
  id: string;
  electionId: string; // The actual election ID for foreign key
  title: string;
  description: string;
  fee: number;
  requirements: string[];
}

interface CandidateRegistrationInteractiveProps {
  onDeadlineLoad?: (deadline: string) => void;
}

const CandidateRegistrationInteractive = ({ onDeadlineLoad }: CandidateRegistrationInteractiveProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPositions, setLoadingPositions] = useState(true);
  const [positions, setPositions] = useState<Position[]>([]);
  const [elections, setElections] = useState<any[]>([]);
  const [selectedElectionId, setSelectedElectionId] = useState('');
  const [applicationDeadline, setApplicationDeadline] = useState<string>('');
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
    loadUserProfile();
    loadAvailablePositions();
  }, []);

  const loadAvailablePositions = async () => {
    try {
      // Fetch active elections with their positions
      const { data: electionsData, error: electionsError } = await supabase
        .from('elections')
        .select('*')
        .in('status', ['active', 'upcoming']);

      if (electionsError) {
        console.error('Error fetching elections:', electionsError);
        setLoadingPositions(false);
        return;
      }

      if (!electionsData || electionsData.length === 0) {
        setPositions([]);
        setLoadingPositions(false);
        return;
      }

      // Set application deadline from the first active election
      if (electionsData[0]) {
        const deadline = electionsData[0].nomination_deadline || 
                        electionsData[0].application_deadline || 
                        electionsData[0].start_date;
        if (deadline) {
          setApplicationDeadline(deadline);
          if (onDeadlineLoad) {
            onDeadlineLoad(deadline);
          }
        }
      }

      // Fetch all positions for these elections
      const electionIds = electionsData.map((e: any) => e.id);
      const { data: positionsData, error: positionsError } = await supabase
        .from('positions')
        .select('*')
        .in('election_id', electionIds);

      if (positionsError) {
        console.error('Error fetching positions:', positionsError);
      }

      // Group positions by election
      const electionsWithPositions = electionsData.map((election: any) => {
        const electionPositions = (positionsData || [])
          .filter((p: any) => p.election_id === election.id)
          .map((p: any) => ({
            id: p.id,
            electionId: p.election_id,
            title: p.name || p.title || 'Position',
            description: p.description || `Apply for ${p.name || 'this position'}`,
            fee: p.application_fee || p.fee || 100,
            requirements: p.requirements || [
              'Must be a registered UTAS student',
              'Minimum CGPA of 2.5 required',
              'No active disciplinary actions',
              'Valid student ID and institutional email',
            ],
            electionName: election.name || election.title,
          }));

        return {
          id: election.id,
          name: election.name || election.title || 'Election',
          election_type: election.election_type || 'university-wide',
          department: election.department,
          status: election.status,
          voting_start: election.voting_start || election.start_date,
          voting_end: election.voting_end || election.end_date,
          positions: electionPositions,
        };
      });

      // Store elections for the position selection form
      setElections(electionsWithPositions);

      // Also create a flat list of all positions for backward compatibility
      const allPositions = electionsWithPositions.flatMap((e: any) => e.positions);
      setPositions(allPositions);

      setLoadingPositions(false);
    } catch (error) {
      console.error('Error loading positions:', error);
      setLoadingPositions(false);
    }
  };

  const loadUserProfile = async () => {
    try {
      // Get user credentials from localStorage
      const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
      const userEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null;

      if (!userId && !userEmail) {
        setLoadingProfile(false);
        return;
      }

      // Fetch user profile
      let profile = null;
      if (userId) {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (!error && data) {
          profile = data;
        }
      }

      // Fallback to email if userId didn't work
      if (!profile && userEmail) {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('email', userEmail)
          .single();

        if (!error && data) {
          profile = data;
        }
      }

      // Auto-fill form with user profile data
      if (profile) {
        setFormData({
          fullName: profile.full_name || '',
          studentId: profile.student_id || '',
          email: profile.email || '',
          phone: profile.phone || '',
          department: profile.department || '',
          level: profile.level || '',
          cgpa: profile.cgpa || '',
        });
      }

      setLoadingProfile(false);
    } catch (error) {
      console.error('Error loading user profile:', error);
      setLoadingProfile(false);
    }
  };

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

  const handleFormChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handlePositionChange = (positionId: string, electionId: string) => {
    setSelectedPosition(positionId);
    setSelectedElectionId(electionId);
    if (errors.position) {
      setErrors({ ...errors, position: '' });
    }
    if (errors.election) {
      setErrors({ ...errors, election: '' });
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

  const handleSubmit = async () => {
    try {
      // Get user ID from localStorage
      const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

      console.log('=== STARTING APPLICATION SUBMISSION ===');
      console.log('User ID:', userId);
      console.log('Selected Position ID:', selectedPosition);
      console.log('Selected Election ID:', selectedElectionId);

      if (!userId) {
        alert('User session not found. Please log in again.');
        return;
      }

      // Get the selected position data
      const selectedPositionData = positions.find((p) => p.id === selectedPosition);
      console.log('Selected Position Data:', selectedPositionData);
      
      if (!selectedPositionData) {
        alert('Selected position not found.');
        return;
      }

      // Check if payment was completed
      if (!transactionId) {
        alert('Payment not completed. Please complete the payment step first.');
        return;
      }

      // Prepare application data
      const applicationData = {
        userId,
        electionId: selectedElectionId || selectedPositionData.electionId, // Use the selected election ID
        positionId: selectedPosition, // This is the position ID
        positionTitle: selectedPositionData.title,
        fullName: formData.fullName,
        studentId: formData.studentId,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        level: formData.level,
        cgpa: formData.cgpa,
        transactionId,
        applicationFee: selectedPositionData.fee,
        // For now, we'll store file names. In production, these would be uploaded to storage
        photoUrl: uploads.photo?.name || null,
        manifestoUrl: uploads.manifesto?.name || null,
        studentIdUrl: uploads.studentId?.name || null,
        transcriptUrl: uploads.transcript?.name || null,
      };

      console.log('📤 Submitting application data:', JSON.stringify(applicationData, null, 2));

      // Submit application to API
      const response = await fetch('/api/candidate-application/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData),
      });

      const result = await response.json();

      console.log('📥 API Response Status:', response.status);
      console.log('📥 API Response Data:', result);

      if (!response.ok) {
        console.error('❌ API Error Response:', result);
        alert(`Failed to submit application: ${result.error || result.details || 'Unknown error'}\n\nPlease check the console for more details.`);
        throw new Error(result.error || result.details || 'Failed to submit application');
      }

      console.log('✅ Application submitted successfully:', result);

      // Success!
      alert(
        'Application submitted successfully! Your application is now under review by the Electoral Commission. You will receive a confirmation email shortly.'
      );

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.href = '/student-dashboard';
        }
      }, 2000);
    } catch (error) {
      console.error('Error submitting application:', error);
      alert(
        'Failed to submit application. Please try again or contact support if the problem persists.'
      );
    }
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
              elections={elections}
              studentDepartment={formData.department}
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
              userPhone={formData.phone}
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
