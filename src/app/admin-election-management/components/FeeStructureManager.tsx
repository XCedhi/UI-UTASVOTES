'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface FeeStructure {
  id: string;
  position: string;
  amount: number;
  lastUpdated: string;
}

interface FeeStructureManagerProps {
  feeStructures: FeeStructure[];
  onUpdateFee: (id: string, newAmount: number) => void;
}

const FeeStructureManager = ({ feeStructures, onUpdateFee }: FeeStructureManagerProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<string>('');

  const handleEdit = (fee: FeeStructure) => {
    setEditingId(fee.id);
    setEditAmount(fee.amount.toString());
  };

  const handleSave = (id: string) => {
    const amount = parseFloat(editAmount);
    if (!isNaN(amount) && amount > 0) {
      onUpdateFee(id, amount);
      setEditingId(null);
      setEditAmount('');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditAmount('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-card border border-border rounded-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-heading font-semibold text-lg text-foreground">
            Fee Structure Management
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Configure application fees for each position
          </p>
        </div>
        <Icon name="CurrencyDollarIcon" size={24} variant="outline" className="text-primary" />
      </div>

      <div className="space-y-3">
        {feeStructures.map((fee) => (
          <div
            key={fee.id}
            className="flex items-center justify-between p-4 bg-muted rounded-md hover:bg-muted/80 transition-all duration-250 ease-smooth"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground">{fee.position}</p>
              <p className="text-xs text-muted-foreground font-caption mt-1">
                Last updated: {formatDate(fee.lastUpdated)}
              </p>
            </div>

            {editingId === fee.id ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-background border border-border rounded-md px-3 py-2">
                  <span className="text-sm text-muted-foreground">GHS</span>
                  <input
                    type="number"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="w-20 bg-transparent text-foreground font-data text-sm outline-none"
                    min="0"
                    step="0.01"
                  />
                </div>

                <button
                  onClick={() => handleSave(fee.id)}
                  className="p-2 bg-success text-success-foreground rounded-md hover:bg-success/90 transition-all duration-250 ease-smooth"
                  aria-label="Save changes"
                >
                  <Icon name="CheckIcon" size={16} variant="outline" />
                </button>

                <button
                  onClick={handleCancel}
                  className="p-2 bg-error text-error-foreground rounded-md hover:bg-error/90 transition-all duration-250 ease-smooth"
                  aria-label="Cancel editing"
                >
                  <Icon name="XMarkIcon" size={16} variant="outline" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-lg font-data font-semibold text-foreground">
                  GHS {fee.amount.toFixed(2)}
                </span>
                <button
                  onClick={() => handleEdit(fee)}
                  className="p-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-all duration-250 ease-smooth"
                  aria-label="Edit fee"
                >
                  <Icon name="PencilIcon" size={16} variant="outline" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeeStructureManager;
