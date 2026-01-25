'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface EligibilityChecklistFormProps {
  checklist: Record<string, boolean>;
  errors: Record<string, string>;
  onChange: (field: string, value: boolean) => void;
}

const EligibilityChecklistForm = ({
  checklist,
  errors,
  onChange,
}: EligibilityChecklistFormProps) => {
  const eligibilityItems = [
    {
      id: 'studentStatus',
      label: 'I am a currently registered UTAS student in good standing',
      description: 'You must be actively enrolled with no pending registration issues',
    },
    {
      id: 'cgpaRequirement',
      label: 'I have a minimum CGPA of 2.5 or above',
      description: 'Academic performance requirement as per electoral constitution',
    },
    {
      id: 'disciplinaryRecord',
      label: 'I have no active disciplinary actions or sanctions',
      description: 'Clean disciplinary record is mandatory for candidacy',
    },
    {
      id: 'constitutionalCompliance',
      label: 'I have read and agree to comply with the UTAS Electoral Constitution',
      description: 'Understanding and adherence to electoral rules and regulations',
    },
    {
      id: 'campaignEthics',
      label: 'I commit to ethical campaigning and fair electoral practices',
      description: 'No vote buying, intimidation, or fraudulent activities',
    },
    {
      id: 'documentAuthenticity',
      label: 'All documents and information provided are authentic and accurate',
      description: 'False information may lead to disqualification and disciplinary action',
    },
  ];

  const allChecked = eligibilityItems.every((item) => checklist[item.id]);

  return (
    <div className="space-y-6">
      <div className="bg-warning/10 border border-warning/20 rounded-md p-4">
        <div className="flex items-start gap-3">
          <Icon
            name="ExclamationTriangleIcon"
            size={20}
            variant="solid"
            className="text-warning flex-shrink-0 mt-0.5"
          />
          <div>
            <p className="text-sm text-foreground font-medium mb-1">Constitutional Requirements</p>
            <p className="text-sm text-muted-foreground">
              You must verify all eligibility criteria below. Failure to meet any requirement will
              result in automatic disqualification.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {eligibilityItems.map((item) => (
          <div
            key={item.id}
            className={`p-4 rounded-md border-2 transition-all duration-250 ease-smooth ${
              checklist[item.id] ? 'border-success bg-success/5' : 'border-border bg-card'
            }`}
          >
            <label className="flex items-start gap-3 cursor-pointer">
              <div className="relative flex items-center justify-center mt-1">
                <input
                  type="checkbox"
                  checked={checklist[item.id] || false}
                  onChange={(e) => onChange(item.id, e.target.checked)}
                  className="w-5 h-5 rounded border-2 border-input appearance-none checked:bg-success checked:border-success cursor-pointer transition-all duration-250 ease-smooth"
                />
                {checklist[item.id] && (
                  <Icon
                    name="CheckIcon"
                    size={16}
                    variant="solid"
                    className="absolute text-success-foreground pointer-events-none"
                  />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
              </div>
            </label>
          </div>
        ))}
      </div>

      {errors.eligibility && <p className="text-sm text-error">{errors.eligibility}</p>}

      <div
        className={`p-4 rounded-md border-2 transition-all duration-250 ease-smooth ${
          allChecked ? 'border-success bg-success/5' : 'border-border bg-muted/30'
        }`}
      >
        <div className="flex items-center gap-3">
          <Icon
            name={allChecked ? 'CheckBadgeIcon' : 'ShieldExclamationIcon'}
            size={24}
            variant="solid"
            className={allChecked ? 'text-success' : 'text-muted-foreground'}
          />
          <div>
            <p
              className={`text-sm font-medium ${allChecked ? 'text-success' : 'text-muted-foreground'}`}
            >
              {allChecked ? 'All Requirements Verified' : 'Complete All Verifications'}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {allChecked
                ? 'You meet all constitutional requirements to proceed'
                : 'Check all boxes above to confirm your eligibility'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EligibilityChecklistForm;
