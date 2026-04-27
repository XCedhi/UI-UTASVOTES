'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/common/Header';
import Icon from '@/components/ui/AppIcon';
import { supabase } from '@/lib/supabase';
import { useAdminProfile } from '@/hooks/useAdminProfile';

interface ElectionFormData {
  name: string;
  description: string;
  election_type: 'departmental' | 'university-wide';
  department?: string;
  nomination_start: string;
  nomination_end: string;
  voting_start: string;
  voting_end: string;
  positions: string[];
}

const CreateElectionInteractive = () => {
  const router = useRouter();
  const { userName, userAvatar, notificationCount } = useAdminProfile();
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ElectionFormData>({
    name: '',
    description: '',
    election_type: 'university-wide',
    department: '',
    nomination_start: '',
    nomination_end: '',
    voting_start: '',
    voting_end: '',
    positions: [''],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const departments = [
    'Computer Science',
    'Information Technology',
    'Software Engineering',
    'Cyber Security',
    'Data Science',
    'Business Administration',
    'Accounting',
    'Marketing',
  ];

  const handleInputChange = (field: keyof ElectionFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePositionChange = (index: number, value: string) => {
    const newPositions = [...formData.positions];
    newPositions[index] = value;
    setFormData(prev => ({ ...prev, positions: newPositions }));
  };

  const addPosition = () => {
    setFormData(prev => ({ ...prev, positions: [...prev.positions, ''] }));
  };

  const removePosition = (index: number) => {
    if (formData.positions.length > 1) {
      const newPositions = formData.positions.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, positions: newPositions }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'Election name is required';
      if (!formData.description.trim()) newErrors.description = 'Description is required';
      if (formData.election_type === 'departmental' && !formData.department) {
        newErrors.department = 'Department is required for departmental elections';
      }
    }

    if (step === 2) {
      if (!formData.nomination_start) newErrors.nomination_start = 'Nomination start date is required';
      if (!formData.nomination_end) newErrors.nomination_end = 'Nomination end date is required';
      if (!formData.voting_start) newErrors.voting_start = 'Voting start date is required';
      if (!formData.voting_end) newErrors.voting_end = 'Voting end date is required';

      // Validate date sequence
      const nomStart = new Date(formData.nomination_start);
      const nomEnd = new Date(formData.nomination_end);
      const voteStart = new Date(formData.voting_start);
      const voteEnd = new Date(formData.voting_end);

      if (nomEnd <= nomStart) {
        newErrors.nomination_end = 'Nomination end must be after start';
      }
      if (voteStart <= nomEnd) {
        newErrors.voting_start = 'Voting must start after nominations end';
      }
      if (voteEnd <= voteStart) {
        newErrors.voting_end = 'Voting end must be after start';
      }
    }

    if (step === 3) {
      const validPositions = formData.positions.filter(p => p.trim());
      if (validPositions.length === 0) {
        newErrors.positions = 'At least one position is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setIsSubmitting(true);

    try {
      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();
      
      let userId: string | null = null;
      
      if (user) {
        userId = user.id;
      } else {
        const userEmail = localStorage.getItem('userEmail');
        if (userEmail) {
          const { data: userData } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('email', userEmail)
            .single();
          userId = userData?.id || null;
        }
      }

      if (!userId) {
        alert('Session expired. Please log in again.');
        router.push('/login');
        return;
      }

      // Call API route to create election (uses service role key server-side)
      const response = await fetch('/api/elections/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          election_type: formData.election_type,
          department: formData.department,
          nomination_start: formData.nomination_start,
          nomination_end: formData.nomination_end,
          voting_start: formData.voting_start,
          voting_end: formData.voting_end,
          positions: formData.positions.filter(p => p.trim()),
          userId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create election');
      }

      console.log('✅ Election created successfully:', result.election);
      alert('Election created successfully!');
      router.push('/electoral-commission-panel/election-management');
    } catch (error: any) {
      console.error('❌ Error creating election:', error);
      alert(`Failed to create election: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background">
        <Header userRole="admin" userName={userName} userAvatar={userAvatar} notificationCount={notificationCount} />
        <main className="pt-24 pb-12 px-4 lg:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="h-96 bg-muted animate-pulse rounded-lg" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header userRole="admin" userName={userName} userAvatar={userAvatar} notificationCount={notificationCount} />

      <main className="pt-24 pb-12 px-4 lg:px-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading font-bold text-3xl text-foreground mb-2">
                Create New Election
              </h1>
              <p className="text-muted-foreground">Set up a new election for the university</p>
            </div>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-all duration-250"
            >
              <Icon name="ArrowLeftIcon" size={20} variant="outline" />
              Back
            </button>
          </div>

          {/* Progress Steps */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-8">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-250 ${
                        currentStep >= step
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {step}
                    </div>
                    <span className="text-sm mt-2 text-center">
                      {step === 1 && 'Basic Info'}
                      {step === 2 && 'Schedule'}
                      {step === 3 && 'Positions'}
                    </span>
                  </div>
                  {step < 3 && (
                    <div
                      className={`h-1 flex-1 mx-4 transition-all duration-250 ${
                        currentStep > step ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Election Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Student Council Elections 2026"
                    className={`w-full px-4 py-3 bg-background border ${
                      errors.name ? 'border-error' : 'border-input'
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground`}
                  />
                  {errors.name && <p className="mt-1 text-sm text-error">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe the purpose and scope of this election"
                    rows={4}
                    className={`w-full px-4 py-3 bg-background border ${
                      errors.description ? 'border-error' : 'border-input'
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground`}
                  />
                  {errors.description && <p className="mt-1 text-sm text-error">{errors.description}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Election Type *
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => handleInputChange('election_type', 'university-wide')}
                      className={`p-4 border-2 rounded-md transition-all duration-250 ${
                        formData.election_type === 'university-wide'
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Icon name="AcademicCapIcon" size={24} variant="outline" className="mx-auto mb-2" />
                      <p className="font-medium">University-Wide</p>
                      <p className="text-sm text-muted-foreground mt-1">All students can participate</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInputChange('election_type', 'departmental')}
                      className={`p-4 border-2 rounded-md transition-all duration-250 ${
                        formData.election_type === 'departmental'
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Icon name="BuildingOfficeIcon" size={24} variant="outline" className="mx-auto mb-2" />
                      <p className="font-medium">Departmental</p>
                      <p className="text-sm text-muted-foreground mt-1">Specific department only</p>
                    </button>
                  </div>
                </div>

                {formData.election_type === 'departmental' && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Department *
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      className={`w-full px-4 py-3 bg-background border ${
                        errors.department ? 'border-error' : 'border-input'
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground`}
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                    {errors.department && <p className="mt-1 text-sm text-error">{errors.department}</p>}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Schedule */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Nomination Start *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.nomination_start}
                      onChange={(e) => handleInputChange('nomination_start', e.target.value)}
                      className={`w-full px-4 py-3 bg-background border ${
                        errors.nomination_start ? 'border-error' : 'border-input'
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground`}
                    />
                    {errors.nomination_start && <p className="mt-1 text-sm text-error">{errors.nomination_start}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Nomination End *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.nomination_end}
                      onChange={(e) => handleInputChange('nomination_end', e.target.value)}
                      className={`w-full px-4 py-3 bg-background border ${
                        errors.nomination_end ? 'border-error' : 'border-input'
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground`}
                    />
                    {errors.nomination_end && <p className="mt-1 text-sm text-error">{errors.nomination_end}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Voting Start *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.voting_start}
                      onChange={(e) => handleInputChange('voting_start', e.target.value)}
                      className={`w-full px-4 py-3 bg-background border ${
                        errors.voting_start ? 'border-error' : 'border-input'
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground`}
                    />
                    {errors.voting_start && <p className="mt-1 text-sm text-error">{errors.voting_start}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Voting End *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.voting_end}
                      onChange={(e) => handleInputChange('voting_end', e.target.value)}
                      className={`w-full px-4 py-3 bg-background border ${
                        errors.voting_end ? 'border-error' : 'border-input'
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground`}
                    />
                    {errors.voting_end && <p className="mt-1 text-sm text-error">{errors.voting_end}</p>}
                  </div>
                </div>

                <div className="bg-muted/30 border border-border rounded-md p-4">
                  <div className="flex items-start gap-3">
                    <Icon name="InformationCircleIcon" size={20} variant="solid" className="text-primary flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium text-foreground mb-1">Timeline Guidelines:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Nominations must end before voting starts</li>
                        <li>Allow sufficient time for candidate verification</li>
                        <li>Recommended: 1-2 weeks for nominations, 3-5 days for voting</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Positions */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Election Positions *
                  </label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add the positions students can run for in this election
                  </p>

                  <div className="space-y-3">
                    {formData.positions.map((position, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <input
                          type="text"
                          value={position}
                          onChange={(e) => handlePositionChange(index, e.target.value)}
                          placeholder={`Position ${index + 1} (e.g., President, Vice President)`}
                          className="flex-1 px-4 py-3 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                        />
                        {formData.positions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePosition(index)}
                            className="p-3 text-error hover:bg-error/10 rounded-md transition-all duration-250"
                          >
                            <Icon name="TrashIcon" size={20} variant="outline" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {errors.positions && <p className="mt-2 text-sm text-error">{errors.positions}</p>}

                  <button
                    type="button"
                    onClick={addPosition}
                    className="mt-4 flex items-center gap-2 px-4 py-2 text-primary hover:bg-primary/10 rounded-md transition-all duration-250"
                  >
                    <Icon name="PlusIcon" size={20} variant="outline" />
                    <span>Add Another Position</span>
                  </button>
                </div>

                {/* Summary */}
                <div className="bg-muted/30 border border-border rounded-md p-6">
                  <h3 className="font-semibold text-foreground mb-4">Election Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">{formData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-medium capitalize">{formData.election_type}</span>
                    </div>
                    {formData.department && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Department:</span>
                        <span className="font-medium">{formData.department}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nominations:</span>
                      <span className="font-medium">
                        {formData.nomination_start && new Date(formData.nomination_start).toLocaleDateString()} - {formData.nomination_end && new Date(formData.nomination_end).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Voting:</span>
                      <span className="font-medium">
                        {formData.voting_start && new Date(formData.voting_start).toLocaleDateString()} - {formData.voting_end && new Date(formData.voting_end).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Positions:</span>
                      <span className="font-medium">{formData.positions.filter(p => p.trim()).length}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <button
                onClick={handleBack}
                disabled={currentStep === 1}
                className="flex items-center gap-2 px-6 py-3 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-all duration-250 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icon name="ChevronLeftIcon" size={20} variant="outline" />
                Back
              </button>

              {currentStep < 3 ? (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-all duration-250"
                >
                  Next
                  <Icon name="ChevronRightIcon" size={20} variant="outline" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-all duration-250 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Icon name="CheckIcon" size={20} variant="outline" />
                      Create Election
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateElectionInteractive;
