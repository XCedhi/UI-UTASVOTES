'use client';

import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import { supabase } from '@/lib/supabase';

interface Position {
  id: string;
  title: string;
  description: string;
  application_fee: number;
  election_id: string;
  updated_at: string;
}

interface Election {
  id: string;
  name: string;
  election_type: string;
  department: string | null;
  status: string;
}

interface ElectionWithPositions {
  election: Election;
  positions: Position[];
}

const ElectionBasedFeeManager = () => {
  const [electionsWithPositions, setElectionsWithPositions] = useState<ElectionWithPositions[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    application_fee: 0,
  });

  useEffect(() => {
    fetchElectionsWithPositions();
  }, []);

  const fetchElectionsWithPositions = async () => {
    try {
      setIsLoading(true);

      // Fetch all elections
      const { data: elections, error: electionsError } = await supabase
        .from('elections')
        .select('*')
        .order('created_at', { ascending: false });

      if (electionsError) {
        console.error('Error fetching elections:', electionsError);
        return;
      }

      // For each election, fetch its positions
      const electionsWithPos: ElectionWithPositions[] = await Promise.all(
        (elections || []).map(async (election) => {
          const { data: positions, error: positionsError } = await supabase
            .from('positions')
            .select('*')
            .eq('election_id', election.id)
            .order('title');

          if (positionsError) {
            console.error('Error fetching positions:', positionsError);
            return { election, positions: [] };
          }

          return { election, positions: positions || [] };
        })
      );

      setElectionsWithPositions(electionsWithPos);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPosition = (position: Position) => {
    setEditingPosition(position);
    setEditForm({
      title: position.title,
      description: position.description || '',
      application_fee: position.application_fee || 0,
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingPosition) return;

    try {
      const { error } = await supabase
        .from('positions')
        .update({
          title: editForm.title,
          description: editForm.description,
          application_fee: editForm.application_fee,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingPosition.id);

      if (error) {
        console.error('Error updating position:', error);
        alert('Failed to update position. Please try again.');
        return;
      }

      // Refresh data
      await fetchElectionsWithPositions();
      setShowEditModal(false);
      setEditingPosition(null);
      alert('Position updated successfully!');
    } catch (error) {
      console.error('Error saving position:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const handleDeletePosition = async (positionId: string, positionTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${positionTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('positions')
        .delete()
        .eq('id', positionId);

      if (error) {
        console.error('Error deleting position:', error);
        alert('Failed to delete position. Please try again.');
        return;
      }

      // Refresh data
      await fetchElectionsWithPositions();
      alert('Position deleted successfully!');
    } catch (error) {
      console.error('Error deleting position:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success/20 text-success';
      case 'upcoming':
        return 'bg-warning/20 text-warning';
      case 'completed':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading fee structures...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-heading font-semibold text-foreground">
            Fee Structure Management
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage application fees for positions across all elections
          </p>
        </div>
      </div>

      {electionsWithPositions.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-md border border-border">
          <Icon
            name="CurrencyDollarIcon"
            size={48}
            variant="outline"
            className="mx-auto text-muted-foreground mb-4 opacity-50"
          />
          <p className="text-muted-foreground">No elections found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Create an election to manage position fees
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {electionsWithPositions.map(({ election, positions }) => (
            <div key={election.id} className="bg-card border border-border rounded-md overflow-hidden">
              {/* Election Header */}
              <div className="bg-muted/30 border-b border-border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-heading font-semibold text-lg text-foreground">
                      {election.name}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-muted-foreground">
                        {election.election_type === 'departmental' 
                          ? `Departmental - ${election.department}` 
                          : 'University-Wide'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(election.status)}`}>
                        {election.status.charAt(0).toUpperCase() + election.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                      {positions.length} {positions.length === 1 ? 'Position' : 'Positions'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Positions List */}
              <div className="p-4">
                {positions.length === 0 ? (
                  <div className="text-center py-8">
                    <Icon
                      name="BriefcaseIcon"
                      size={32}
                      variant="outline"
                      className="mx-auto text-muted-foreground mb-2 opacity-50"
                    />
                    <p className="text-sm text-muted-foreground">No positions created for this election</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {positions.map((position) => (
                      <div
                        key={position.id}
                        className="flex items-center justify-between p-4 bg-muted/30 rounded-md hover:bg-muted/50 transition-all duration-250"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{position.title}</p>
                          {position.description && (
                            <p className="text-sm text-muted-foreground mt-1">{position.description}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            Last updated: {formatDate(position.updated_at)}
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-2xl font-heading font-semibold text-foreground font-data">
                              GHS {position.application_fee.toFixed(2)}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditPosition(position)}
                              className="p-2 hover:bg-background rounded-md transition-all duration-250"
                              title="Edit position"
                            >
                              <Icon
                                name="PencilIcon"
                                size={18}
                                variant="outline"
                                className="text-primary"
                              />
                            </button>
                            <button
                              onClick={() => handleDeletePosition(position.id, position.title)}
                              className="p-2 hover:bg-background rounded-md transition-all duration-250"
                              title="Delete position"
                            >
                              <Icon
                                name="TrashIcon"
                                size={18}
                                variant="outline"
                                className="text-error"
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingPosition && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[1200] flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-md p-6 max-w-lg w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-heading font-semibold text-foreground">Edit Position Fee</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingPosition(null);
                }}
                className="p-2 hover:bg-muted rounded-md transition-all duration-250"
              >
                <Icon name="XMarkIcon" size={20} variant="outline" className="text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Position Name *
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Application Fee (GHS) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editForm.application_fee}
                  onChange={(e) => setEditForm({ ...editForm, application_fee: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="bg-muted/30 border border-border rounded-md p-3">
                <div className="flex items-start gap-2">
                  <Icon name="InformationCircleIcon" size={20} variant="solid" className="text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    Fee changes will only affect new candidate applications. Existing candidates are not affected.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingPosition(null);
                }}
                className="flex-1 px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-all duration-250"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-all duration-250"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ElectionBasedFeeManager;
