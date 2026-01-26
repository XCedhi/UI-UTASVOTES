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
  onUpdateFee: (id: string, newAmount: number, newPosition?: string) => void;
  onAddFee: (position: string, amount: number) => void;
  onDeleteFee?: (id: string) => void;
}

const FeeStructureManager = ({ feeStructures, onUpdateFee, onAddFee, onDeleteFee }: FeeStructureManagerProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<string>('');
  const [editPosition, setEditPosition] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPosition, setNewPosition] = useState<string>('');
  const [newAmount, setNewAmount] = useState<string>('');

  const handleEdit = (fee: FeeStructure) => {
    setEditingId(fee.id);
    setEditAmount(fee.amount.toString());
    setEditPosition(fee.position);
  };

  const handleSave = (id: string) => {
    const amount = parseFloat(editAmount);
    if (!isNaN(amount) && amount > 0 && editPosition.trim()) {
      onUpdateFee(id, amount, editPosition.trim());
      setEditingId(null);
      setEditAmount('');
      setEditPosition('');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditAmount('');
    setEditPosition('');
  };

  const handleAddNew = () => {
    const amount = parseFloat(newAmount);
    if (!isNaN(amount) && amount > 0 && newPosition.trim()) {
      onAddFee(newPosition.trim(), amount);
      setNewPosition('');
      setNewAmount('');
      setShowAddForm(false);
    }
  };

  const handleCancelAdd = () => {
    setNewPosition('');
    setNewAmount('');
    setShowAddForm(false);
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
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-all duration-250 ease-smooth"
        >
          <Icon name="PlusIcon" size={20} variant="outline" />
          Add Position
        </button>
      </div>

      {/* Add New Position Form */}
      {showAddForm && (
        <div className="mb-4 p-4 bg-primary/5 border border-primary/20 rounded-md">
          <h4 className="font-medium text-foreground mb-3">Add New Position</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Position Name
              </label>
              <input
                type="text"
                value={newPosition}
                onChange={(e) => setNewPosition(e.target.value)}
                placeholder="e.g., SRC President"
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Application Fee (GHS)
              </label>
              <input
                type="number"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground font-data outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleAddNew}
                className="flex items-center gap-2 px-4 py-2 bg-success text-success-foreground rounded-md hover:bg-success/90 transition-all duration-250 ease-smooth"
              >
                <Icon name="CheckIcon" size={16} variant="outline" />
                Add Position
              </button>
              <button
                onClick={handleCancelAdd}
                className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-all duration-250 ease-smooth"
              >
                <Icon name="XMarkIcon" size={16} variant="outline" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {feeStructures.map((fee) => (
          <div
            key={fee.id}
            className="flex items-center justify-between p-4 bg-muted rounded-md hover:bg-muted/80 transition-all duration-250 ease-smooth"
          >
            {editingId === fee.id ? (
              <>
                <div className="flex-1 min-w-0 mr-4">
                  <input
                    type="text"
                    value={editPosition}
                    onChange={(e) => setEditPosition(e.target.value)}
                    className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground font-medium outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Position name"
                  />
                  <p className="text-xs text-muted-foreground font-caption mt-1">
                    Last updated: {formatDate(fee.lastUpdated)}
                  </p>
                </div>

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
              </>
            ) : (
              <>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{fee.position}</p>
                  <p className="text-xs text-muted-foreground font-caption mt-1">
                    Last updated: {formatDate(fee.lastUpdated)}
                  </p>
                </div>

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
                  {onDeleteFee && (
                    <button
                      onClick={() => onDeleteFee(fee.id)}
                      className="p-2 bg-error text-error-foreground rounded-md hover:bg-error/90 transition-all duration-250 ease-smooth"
                      aria-label="Delete position"
                    >
                      <Icon name="TrashIcon" size={16} variant="outline" />
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeeStructureManager;
