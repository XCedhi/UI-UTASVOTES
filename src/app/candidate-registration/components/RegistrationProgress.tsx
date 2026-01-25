'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface RegistrationProgressProps {
  currentStep: number;
  steps: {
    id: number;
    label: string;
    description: string;
  }[];
}

const RegistrationProgress = ({ currentStep, steps }: RegistrationProgressProps) => {
  return (
    <div className="bg-card border border-border rounded-md p-6">
      <h3 className="font-heading font-semibold text-lg text-foreground mb-6">
        Application Progress
      </h3>

      <div className="space-y-4">
        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isUpcoming = step.id > currentStep;

          return (
            <div key={step.id} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-250 ease-smooth ${
                    isCompleted
                      ? 'bg-success text-success-foreground'
                      : isCurrent
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isCompleted ? (
                    <Icon name="CheckIcon" size={20} variant="solid" />
                  ) : (
                    <span className="font-caption font-medium">{step.id}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-0.5 h-12 mt-2 transition-all duration-250 ease-smooth ${
                      isCompleted ? 'bg-success' : 'bg-border'
                    }`}
                  />
                )}
              </div>

              <div className="flex-1 pb-4">
                <p
                  className={`font-medium transition-all duration-250 ease-smooth ${
                    isCurrent
                      ? 'text-primary'
                      : isCompleted
                        ? 'text-success'
                        : 'text-muted-foreground'
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RegistrationProgress;
