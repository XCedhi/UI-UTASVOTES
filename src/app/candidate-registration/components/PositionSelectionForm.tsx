'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface Position {
  id: string;
  title: string;
  description: string;
  fee: number;
  requirements: string[];
}

interface PositionSelectionFormProps {
  selectedPosition: string;
  positions: Position[];
  errors: Record<string, string>;
  onChange: (positionId: string) => void;
}

const PositionSelectionForm = ({
  selectedPosition,
  positions,
  errors,
  onChange,
}: PositionSelectionFormProps) => {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-foreground mb-4">
          Select Position <span className="text-error">*</span>
        </label>
        <div className="grid grid-cols-1 gap-4">
          {positions.map((position) => (
            <button
              key={position.id}
              type="button"
              onClick={() => onChange(position.id)}
              className={`text-left p-6 rounded-md border-2 transition-all duration-250 ease-smooth ${
                selectedPosition === position.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-250 ease-smooth ${
                        selectedPosition === position.id
                          ? 'border-primary bg-primary'
                          : 'border-muted-foreground'
                      }`}
                    >
                      {selectedPosition === position.id && (
                        <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                      )}
                    </div>
                    <h3 className="font-heading font-semibold text-lg text-foreground">
                      {position.title}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{position.description}</p>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Key Requirements:</p>
                    <ul className="space-y-1">
                      {position.requirements.map((req, index) => (
                        <li
                          key={index}
                          className="text-sm text-muted-foreground flex items-start gap-2"
                        >
                          <Icon
                            name="CheckCircleIcon"
                            size={16}
                            variant="solid"
                            className="text-success mt-0.5 flex-shrink-0"
                          />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="px-4 py-2 bg-accent/10 rounded-md">
                    <p className="text-xs text-muted-foreground font-caption">Application Fee</p>
                    <p className="text-xl font-heading font-semibold text-accent">
                      GHS {position.fee}
                    </p>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
        {errors.position && <p className="text-sm text-error mt-2">{errors.position}</p>}
      </div>

      {selectedPosition && (
        <div className="bg-primary/5 border border-primary/20 rounded-md p-4">
          <div className="flex items-start gap-3">
            <Icon
              name="InformationCircleIcon"
              size={20}
              variant="solid"
              className="text-primary flex-shrink-0 mt-0.5"
            />
            <div>
              <p className="text-sm text-foreground font-medium mb-1">Position Selected</p>
              <p className="text-sm text-muted-foreground">
                You have selected{' '}
                <span className="font-medium text-primary">
                  {positions.find((p) => p.id === selectedPosition)?.title}
                </span>
                . Please ensure you meet all requirements before proceeding.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PositionSelectionForm;
