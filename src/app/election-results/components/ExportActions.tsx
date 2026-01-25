'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface ExportActionsProps {
  electionName: string;
  onGenerateCertificate: () => void;
  onExportExcel: () => void;
  onExportPDF: () => void;
  onEmailResults: () => void;
}

const ExportActions = ({
  electionName,
  onGenerateCertificate,
  onExportExcel,
  onExportPDF,
  onEmailResults,
}: ExportActionsProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleGenerateCertificate = async () => {
    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    onGenerateCertificate();
    setIsGenerating(false);
  };

  const handleExport = async (type: 'excel' | 'pdf') => {
    setIsExporting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    if (type === 'excel') {
      onExportExcel();
    } else {
      onExportPDF();
    }
    setIsExporting(false);
  };

  return (
    <div className="bg-card border border-border rounded-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon name="DocumentArrowDownIcon" size={24} variant="outline" className="text-primary" />
        <h3 className="text-lg font-heading font-semibold text-foreground">Export & Share</h3>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleGenerateCertificate}
          disabled={isGenerating}
          className="w-full flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-all duration-250 ease-smooth disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center gap-3">
            <Icon name="ShieldCheckIcon" size={20} variant="solid" />
            <span className="font-medium">Generate Certified Results</span>
          </div>
          {isGenerating && (
            <Icon name="ArrowPathIcon" size={20} variant="outline" className="animate-spin" />
          )}
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => handleExport('excel')}
            disabled={isExporting}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-success text-success-foreground rounded-md hover:bg-success/90 transition-all duration-250 ease-smooth disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon name="TableCellsIcon" size={20} variant="outline" />
            <span className="font-medium">Export Excel</span>
          </button>

          <button
            onClick={() => handleExport('pdf')}
            disabled={isExporting}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-error text-error-foreground rounded-md hover:bg-error/90 transition-all duration-250 ease-smooth disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon name="DocumentTextIcon" size={20} variant="outline" />
            <span className="font-medium">Export PDF</span>
          </button>
        </div>

        <button
          onClick={onEmailResults}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 transition-all duration-250 ease-smooth"
        >
          <Icon name="EnvelopeIcon" size={20} variant="outline" />
          <span className="font-medium">Email Results to Stakeholders</span>
        </button>
      </div>

      <div className="mt-4 p-3 bg-muted rounded-md">
        <div className="flex items-start gap-2">
          <Icon
            name="InformationCircleIcon"
            size={20}
            variant="outline"
            className="text-primary flex-shrink-0 mt-0.5"
          />
          <div>
            <p className="text-sm text-foreground font-medium mb-1">Official Results</p>
            <p className="text-xs text-muted-foreground">
              Certified results will be automatically distributed to all registered stakeholders and
              published on the official portal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportActions;
