'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/common/Header';
import Icon from '@/components/ui/AppIcon';

interface Position {
  id: string;
  name: string;
  description: string;
  maxCandidates: number;
}

const CreateElectionInteractive = () => {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [electionData, setElectionData] = useState({
    name: '',
    description: '',
    type: 'university-wide' as 'university-wide' | 'departmental' | 'faculty',
    department: '',
    startDate: '',
    endDate: '',
    votingStartTime: '08:00',
    votingEndTime: '18:00',
  });
  const [positions, setPositions] = useState<Position[]>([]);
  const [newPosition, setNewPosition] = useState({
    name: '',
    description: '',
    maxCandidates: 5,
  });

  React.useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const handleAddPosition = () => {
    if (!newPosition.name.trim()) {
      alert('Please enter a position name');
      return;
    }

    const position: Position = {
      id: Date.now().toString(),
      name: newPosition.name,
      description: newPosition.description,
      maxCandidates: newPosition.maxCandidates,
    };

    setPositions([...positions, position]);
    setNewPosition({ name: '', description: '', maxCandidates: 5 });
  };

  const handleRemovePosition = (id: string) => {
    setPositions(positions.filter((p) => p.id !== id));
  };

  const handleCreateElection = () => {
    if (!electionData.name || !electionData.startDate || !electionData.endDate) {
      alert('Please fill in all required fields');
      return;
    }

    if (positions.length === 0) {
      alert('Please add at least one position');
      return;
    }

    console.log('Creating election:', { electionData, positions });
    alert('Election created successfully!');
    router.push('/electoral-commission-panel');
  };

  const steps = [
    { number: 1, title: 'Basic Info', icon: 'InformationCircleIcon' },
    { number: 2, title: 'Positions', icon: 'UserGroupIcon' },
    { number: 3, title: 'Review', icon: 'CheckCircleIcon' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header
        userRole="commission"
        userName="Dr. Akosua Boateng"
        userAvatar="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg"
        notificationCount={0}
        electionStatus={{ isActive: false, name: 'No Active Election' }}
      />

      <main className="pt-24 pb-12 px-4 lg:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-muted rounded-md transition-all duration-250 ease-smooth"
            >
              <Icon name="ArrowLeftIcon" size={24} variant="outline" className="text-foreground" />
            </button>
            <div>
              <h1 className="text-3xl font-heading font-semibold text-foreground">
                Create New Election
              </h1>
              <p className="text-muted-foreground mt-1">
                Set up a new election with positions and voting schedule
              </p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="bg-card border border-border rounded-md p-6 mb-6">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <React.Fragment key={step.number}>
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-250 ease-smooth ${
                        currentStep >= step.number
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <Icon name={step.icon as any} size={24} variant="outline" />
                    </div>
                    <p
                      className={`text-sm font-medium ${
                        currentStep >= step.number ? 'text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-1 flex-1 mx-4 rounded-full transition-all duration-250 ease-smooth ${
                        currentStep > step.number ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-card border border-border rounded-md p-6">
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-heading font-semibold text-foreground mb-4">
                  Election Information
                </h2>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Election Name <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={electionData.name}
                    onChange={(e) => setElectionData({ ...electionData, name: e.target.value })}
                    placeholder="e.g., Student Council 2026"
                    className="w-full px-4 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Description
                  </label>
                  <textarea
                    value={electionData.description}
                    onChange={(e) =>
                      setElectionData({ ...electionData, description: e.target.value })
                    }
                    placeholder="Brief description of the election"
                    rows={3}
                    className="w-full px-4 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Election Type <span className="text-error">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      {
                        value: 'university-wide',
                        label: 'University-Wide',
                        icon: 'BuildingLibraryIcon',
                      },
                      { value: 'faculty', label: 'Faculty Level', icon: 'AcademicCapIcon' },
                      { value: 'departmental', label: 'Departmental', icon: 'UserGroupIcon' },
                    ].map((type) => (
                      <button
                        key={type.value}
                        onClick={() =>
                          setElectionData({ ...electionData, type: type.value as any })
                        }
                        className={`flex flex-col items-center gap-2 p-4 rounded-md border-2 transition-all duration-250 ease-smooth ${
                          electionData.type === type.value
                            ? 'border-primary bg-primary/10'
                            : 'border-border bg-background hover:border-primary/50'
                        }`}
                      >
                        <Icon
                          name={type.icon as any}
                          size={24}
                          variant="outline"
                          className={
                            electionData.type === type.value
                              ? 'text-primary'
                              : 'text-muted-foreground'
                          }
                        />
                        <span
                          className={`text-sm font-medium ${
                            electionData.type === type.value ? 'text-primary' : 'text-foreground'
                          }`}
                        >
                          {type.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {electionData.type === 'departmental' && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Department <span className="text-error">*</span>
                    </label>
                    <select
                      value={electionData.department}
                      onChange={(e) =>
                        setElectionData({ ...electionData, department: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select Department</option>
                      <option value="computer-science">Computer Science</option>
                      <option value="engineering">Engineering</option>
                      <option value="business">Business Administration</option>
                      <option value="arts">Arts & Humanities</option>
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Start Date <span className="text-error">*</span>
                    </label>
                    <input
                      type="date"
                      value={electionData.startDate}
                      onChange={(e) =>
                        setElectionData({ ...electionData, startDate: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      End Date <span className="text-error">*</span>
                    </label>
                    <input
                      type="date"
                      value={electionData.endDate}
                      onChange={(e) =>
                        setElectionData({ ...electionData, endDate: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Voting Start Time
                    </label>
                    <input
                      type="time"
                      value={electionData.votingStartTime}
                      onChange={(e) =>
                        setElectionData({ ...electionData, votingStartTime: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Voting End Time
                    </label>
                    <input
                      type="time"
                      value={electionData.votingEndTime}
                      onChange={(e) =>
                        setElectionData({ ...electionData, votingEndTime: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-heading font-semibold text-foreground mb-4">
                  Add Positions
                </h2>

                <div className="bg-muted rounded-md p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Position Name <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      value={newPosition.name}
                      onChange={(e) => setNewPosition({ ...newPosition, name: e.target.value })}
                      placeholder="e.g., SRC President"
                      className="w-full px-4 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Description
                    </label>
                    <textarea
                      value={newPosition.description}
                      onChange={(e) =>
                        setNewPosition({ ...newPosition, description: e.target.value })
                      }
                      placeholder="Brief description of the position"
                      rows={2}
                      className="w-full px-4 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Maximum Candidates
                    </label>
                    <input
                      type="number"
                      value={newPosition.maxCandidates}
                      onChange={(e) =>
                        setNewPosition({ ...newPosition, maxCandidates: parseInt(e.target.value) })
                      }
                      min="1"
                      max="20"
                      className="w-full px-4 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <button
                    onClick={handleAddPosition}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-all duration-250 ease-smooth"
                  >
                    <Icon name="PlusIcon" size={16} variant="outline" />
                    <span className="font-medium">Add Position</span>
                  </button>
                </div>

                {positions.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-medium text-foreground">
                      Added Positions ({positions.length})
                    </h3>
                    {positions.map((position) => (
                      <div
                        key={position.id}
                        className="flex items-center justify-between p-4 bg-background border border-border rounded-md"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{position.name}</p>
                          {position.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {position.description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            Max Candidates: {position.maxCandidates}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemovePosition(position.id)}
                          className="p-2 text-error hover:bg-error/10 rounded-md transition-all duration-250 ease-smooth"
                        >
                          <Icon name="TrashIcon" size={20} variant="outline" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-heading font-semibold text-foreground mb-4">
                  Review & Confirm
                </h2>

                <div className="space-y-4">
                  <div className="bg-muted rounded-md p-4">
                    <h3 className="font-medium text-foreground mb-3">Election Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="text-foreground font-medium">{electionData.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <span className="text-foreground font-medium capitalize">
                          {electionData.type.replace('-', ' ')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="text-foreground font-medium">
                          {electionData.startDate} to {electionData.endDate}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Voting Hours:</span>
                        <span className="text-foreground font-medium">
                          {electionData.votingStartTime} - {electionData.votingEndTime}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted rounded-md p-4">
                    <h3 className="font-medium text-foreground mb-3">
                      Positions ({positions.length})
                    </h3>
                    <div className="space-y-2">
                      {positions.map((position, index) => (
                        <div key={position.id} className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">{index + 1}.</span>
                          <span className="text-foreground">{position.name}</span>
                          <span className="text-muted-foreground text-xs">
                            (Max: {position.maxCandidates})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <button
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
                className="flex items-center gap-2 px-6 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-250 ease-smooth"
              >
                <Icon name="ArrowLeftIcon" size={16} variant="outline" />
                <span className="font-medium">Previous</span>
              </button>

              {currentStep < 3 ? (
                <button
                  onClick={() => setCurrentStep(Math.min(3, currentStep + 1))}
                  className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-all duration-250 ease-smooth"
                >
                  <span className="font-medium">Next</span>
                  <Icon name="ArrowRightIcon" size={16} variant="outline" />
                </button>
              ) : (
                <button
                  onClick={handleCreateElection}
                  className="flex items-center gap-2 px-6 py-2 bg-success text-success-foreground rounded-md hover:bg-success/90 transition-all duration-250 ease-smooth"
                >
                  <Icon name="CheckCircleIcon" size={16} variant="outline" />
                  <span className="font-medium">Create Election</span>
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
