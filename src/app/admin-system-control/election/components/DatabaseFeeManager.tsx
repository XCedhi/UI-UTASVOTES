'use client';

import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import { supabase } from '@/lib/supabase';

interface Election {
  id: string;
  name: string;
  election_type: string;
  department: string | null;
}

interface Position {
  id: string;
  election_id: string;
  title: string;
  application_fee: number;
  updated_at: string;
}

interface ElectionWithPositions extends Election {
  positions: Position[];
}

const DatabaseFeeManager = () => {
  const [elections, setElections] = useState<ElectionWithPositions[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<string>('');
  const [selectedElection, setSelectedElection] = useState<string>('all');

  useEffect(() => {
    fetchElectionsAndPositions();
  }, []);

  const fetchElectionsAndPositions = async () => {
    try {
      setLoading(true);

      // Fetch all elections
      const { data: electionsData, error: electionsError } = await supabase
        .from('elections')
        .select('id, name, election_type, department')
        .order('created_at', { ascending: false });

      if (electionsError) throw electionsError;

      // Fetch all positions
      const { data: positionsData, error: positionsError } = await supabase
        .from('positions')
        .select('*')
        .order('created_at', { ascending: false });

      if (positionsError) throw positionsError;

      // Group positions by election
      const electionsWithPositions: ElectionWithPositions[] = (electionsData || []).map(election => ({
        ...election,
        positions: (positionsData || []).filter(pos => pos.election_id === election.id),
      }));

      setElections(electionsWithPositions);
    } catch (error) {
      console.error('Error fetching elections and positions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (position: Position) => {
    setEditingId(position.id);
    setEditAmount(position.application_fee?.toString() || '0');
  };

  const handleSave = async (positionId: string) => {
    const amount = parseFloat(editAmount);
    if (isNaN(amount) || amount < 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      const { error } = await supabase
        .from('positions')
        .update({
          application_fee: amount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', positionId);

      if (error) throw error;

      console.log('✅ Fee updated successfully');
      await fetchElectionsAndPositions();
      setEditingId(null);
      setEditAmount('');
    } catch (error: any) {
      console.error('❌ Error updating fee:', error);
      alert(`Failed to update fee: ${error.message}`);
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

  const filteredElections = selectedElection === 'all'
    ? elections
    : elections.filter(e => e.id === selectedElection);

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-md p-6">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card border border-border rounded-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-heading font-semibold text-lg text-foreground">
              Application Fee Management
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Set application fees for each position in your elections
            </p>
          </div>
        </div>

        {/* Election Filter */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-foreground">Filter by Election:</label>
          <select
            value={selectedElection}
            onChange={(e) => setSelectedElection(e.target.value)}
            className="px-4 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Elections</option>
            {elections.map((election) => (
              <option key={election.id} value={election.id}>
                {election.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Elections and Positions */}
      {filteredElections.length === 0 ? (
        <div className="bg-card border border-border rounded-md p-12 text-center">
          <Icon name="BanknotesIcon" size={48} variant="outline" className="mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold text-foreground mb-2">No Elections Found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create an election first to set application fees for positions
          </p>
        </div>
      ) : (
        filteredElections.map((election) => (
          <div key={election.id} className="bg-card border border-border rounded-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-heading font-semibold text-foreground">{election.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full capitalize">
                    {election.election_type}
                  </span>
                  {election.department && (
                    <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-full">
                      {election.department}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-sm text-muted-foreground">
                {election.positions.length} {election.positions.length === 1 ? 'Position' : 'Positions'}
              </span>
            </div>

            {election.positions.length === 0 ? (
              <div className="py-8 text-center">
                <Icon name="InformationCircleIcon" size={32} variant="outline" className="mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No positions created for this election</p>
              </div>
            ) : (
              <div className="space-y-3">
                {election.positions.map((position) => (
                  <div
                    key={position.id}
                    className="flex items-center justify-between p-4 bg-muted rounded-md hover:bg-muted/80 transition-all duration-250"
                  >
                    {editingId === position.id ? (
                      <>
                        <div className="flex-1 min-w-0 mr-4">
                          <p className="font-medium text-foreground">{position.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Last updated: {formatDate(position.updated_at)}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 bg-background border border-border rounded-md px-3 py-2">
                            <span className="text-sm text-muted-foreground">GHS</span>
                            <input
                              type="number"
                              value={editAmount}
                              onChange={(e) => setEditAmount(e.target.value)}
                              className="w-24 bg-transparent text-foreground font-data text-sm outline-none"
                              min="0"
                              step="0.01"
                              autoFocus
                            />
                          </div>

                          <button
                            onClick={() => handleSave(position.id)}
                            className="p-2 bg-success text-success-foreground rounded-md hover:bg-success/90 transition-all duration-250"
                            aria-label="Save changes"
                          >
                            <Icon name="CheckIcon" size={16} variant="outline" />
                          </button>

                          <button
                            onClick={handleCancel}
                            className="p-2 bg-error text-error-foreground rounded-md hover:bg-error/90 transition-all duration-250"
                            aria-label="Cancel editing"
                          >
                            <Icon name="XMarkIcon" size={16} variant="outline" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground">{position.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Last updated: {formatDate(position.updated_at)}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-lg font-data font-semibold text-foreground">
                            GHS {(position.application_fee || 0).toFixed(2)}
                          </span>
                          <button
                            onClick={() => handleEdit(position)}
                            className="p-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-all duration-250"
                            aria-label="Edit fee"
                          >
                            <Icon name="PencilIcon" size={16} variant="outline" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}

      {/* Info Box */}
      <div className="bg-muted/30 border border-border rounded-md p-4">
        <div className="flex items-start gap-3">
          <Icon name="InformationCircleIcon" size={20} variant="solid" className="text-primary flex-shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">How Application Fees Work:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Fees are set per position for each election</li>
              <li>Candidates pay the fee when applying for a position</li>
              <li>Fees are in Ghana Cedis (GHS)</li>
              <li>You can update fees anytime before candidates apply</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseFeeManager;
