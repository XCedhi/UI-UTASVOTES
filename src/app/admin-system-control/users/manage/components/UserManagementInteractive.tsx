'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/common/Header';
import Icon from '@/components/ui/AppIcon';
import { supabase } from '@/lib/supabase';
import { useAdminProfile } from '@/hooks/useAdminProfile';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'candidate' | 'commission' | 'admin';
  status: 'active' | 'inactive' | 'pending';
  invitedAt?: string;
  lastLogin?: string;
  accessStartDate?: string;
  accessEndDate?: string;
  position?: string;
}

interface InviteFormData {
  firstName: string;
  lastName: string;
  email: string;
  role: 'commission' | 'admin';
  department?: string;
  position?: string;
  accessStartDate?: string;
  accessEndDate?: string;
}

const UserManagementInteractive = () => {
  const router = useRouter();
  
  // Use the admin profile hook to get real data from database
  const { userName, userAvatar, notificationCount, isLoading: profileLoading } = useAdminProfile();
  
  const [isHydrated, setIsHydrated] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [formData, setFormData] = useState<InviteFormData>({
    firstName: '',
    lastName: '',
    email: '',
    role: 'commission',
    department: '',
    position: '',
    accessStartDate: new Date().toISOString().split('T')[0], // Today's date
    accessEndDate: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<InviteFormData>>({});

  useEffect(() => {
    setIsHydrated(true);
    fetchUsers();
  }, []);

  // Filter users based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query) ||
        user.status.toLowerCase().includes(query)
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Fetching users from database...');
      
      // Fetch all user profiles from database
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching users:', error);
        return;
      }

      console.log('✅ Fetched users:', data?.length || 0);

      // Transform database data to match User interface
      const transformedUsers: User[] = (data || []).map((user: any) => ({
        id: user.id,
        name: user.full_name || 'Unknown User',
        email: user.email,
        role: user.role as 'student' | 'candidate' | 'commission' | 'admin',
        status: user.status as 'active' | 'inactive' | 'pending',
        lastLogin: user.last_login,
        invitedAt: user.created_at,
        accessStartDate: user.access_start_date,
        accessEndDate: user.access_end_date,
        position: user.position,
      }));

      console.log('✅ Setting users state with', transformedUsers.length, 'users');
      console.log('📊 User data:', transformedUsers);
      setUsers(transformedUsers);
      setFilteredUsers(transformedUsers);
      setRefreshKey(prev => prev + 1); // Force re-render
    } catch (error) {
      console.error('❌ Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<InviteFormData> = {};
    const emailRegex = /^[a-zA-Z0-9._%+-]+@cktutas\.edu\.gh$/;

    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Must be a valid institutional email (@cktutas.edu.gh)';
    }

    if (formData.role === 'commission' && !formData.position?.trim()) {
      errors.position = 'Position is required for commission members';
    }

    if (formData.role === 'commission') {
      if (!formData.accessStartDate) {
        errors.accessStartDate = 'Access start date is required for commission members';
      }
      if (!formData.accessEndDate) {
        errors.accessEndDate = 'Access end date is required for commission members';
      }
      if (formData.accessStartDate && formData.accessEndDate) {
        const startDate = new Date(formData.accessStartDate);
        const endDate = new Date(formData.accessEndDate);
        if (endDate <= startDate) {
          errors.accessEndDate = 'End date must be after start date';
        }
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleExtendAccess = (user: User) => {
    // Open edit modal with focus on access dates
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleDeactivateUser = async (user: User) => {
    if (
      confirm(
        `Are you sure you want to deactivate ${user.name}? They will lose access to the system.`
      )
    ) {
      try {
        console.log('🔄 Deactivating user:', user.id);
        
        // Call API route to update user status
        const response = await fetch('/api/admin/update-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            role: user.role, // Keep existing role
            status: 'inactive', // Change status to inactive
            accessStartDate: user.accessStartDate || null,
            accessEndDate: user.accessEndDate || null,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          console.error('❌ API error:', result.error);
          alert(`Failed to deactivate user: ${result.error}`);
          return;
        }

        console.log('✅ User deactivated successfully via API');
        
        // Refresh user list
        console.log('🔄 Refreshing user list...');
        await fetchUsers();
        alert(`User ${user.name} has been deactivated successfully!`);
      } catch (error: any) {
        console.error('❌ Error deactivating user:', error);
        alert(`Failed to deactivate user: ${error.message}`);
      }
    }
  };

  const handleActivateUser = async (user: User) => {
    if (
      confirm(
        `Are you sure you want to activate ${user.name}? They will regain access to the system.`
      )
    ) {
      try {
        console.log('🔄 Activating user:', user.id);
        
        // Call API route to update user status
        const response = await fetch('/api/admin/update-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            role: user.role, // Keep existing role
            status: 'active', // Change status to active
            accessStartDate: user.accessStartDate || null,
            accessEndDate: user.accessEndDate || null,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          console.error('❌ API error:', result.error);
          alert(`Failed to activate user: ${result.error}`);
          return;
        }

        console.log('✅ User activated successfully via API');
        
        // Refresh user list
        console.log('🔄 Refreshing user list...');
        await fetchUsers();
        alert(`User ${user.name} has been activated successfully!`);
      } catch (error: any) {
        console.error('❌ Error activating user:', error);
        alert(`Failed to activate user: ${error.message}`);
      }
    }
  };

  const handleSaveUserEdit = async () => {
    if (!selectedUser) return;

    setIsSubmitting(true);

    try {
      console.log('🔄 Updating user:', selectedUser.id);
      console.log('📝 New role:', selectedUser.role);
      console.log('📝 New status:', selectedUser.status);
      console.log('📝 Access dates:', selectedUser.accessStartDate, '-', selectedUser.accessEndDate);
      
      // Call API route that uses service role key to bypass RLS
      const response = await fetch('/api/admin/update-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          role: selectedUser.role,
          status: selectedUser.status,
          accessStartDate: selectedUser.accessStartDate || null,
          accessEndDate: selectedUser.accessEndDate || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('❌ API error:', result.error);
        alert(`Failed to update user: ${result.error}`);
        setIsSubmitting(false);
        return;
      }

      console.log('✅ User updated successfully via API:', result.user);

      // Refresh user list from database
      console.log('🔄 Refreshing user list from database...');
      await fetchUsers();
      
      console.log('✅ User list refreshed!');

      // Close modal and show success
      setShowEditModal(false);
      setSelectedUser(null);
      setIsSubmitting(false);
      
      alert('User updated successfully!');
    } catch (error: any) {
      console.error('❌ Unexpected error:', error);
      alert(`Failed to update user: ${error.message}`);
      setIsSubmitting(false);
    }
  };

  const handleInviteUser = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Call API to send invitation email via Supabase Auth
      const response = await fetch('/api/invite-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: formData.role,
          accessStartDate: formData.accessStartDate || null,
          accessEndDate: formData.accessEndDate || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send invitation');
      }

      // Success!
      setIsSubmitting(false);
      setInviteSuccess(true);

      // Refresh user list to show new invitation
      await fetchUsers();

      // Reset after 3 seconds
      setTimeout(() => {
        setShowInviteModal(false);
        setInviteSuccess(false);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          role: 'commission',
          department: '',
          position: '',
          accessStartDate: new Date().toISOString().split('T')[0],
          accessEndDate: '',
        });
        setFormErrors({});
      }, 3000);
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      setIsSubmitting(false);
      alert(`Failed to send invitation: ${error.message}\n\nPlease check:\n1. SUPABASE_SERVICE_ROLE_KEY is set in .env\n2. Email is configured in Supabase Dashboard\n3. Check browser console for details`);
    }
  };

  const handleInputChange = (field: keyof InviteFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-error/10 text-error';
      case 'commission':
        return 'bg-primary/10 text-primary';
      case 'candidate':
        return 'bg-accent/10 text-accent';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success/10 text-success';
      case 'pending':
        return 'bg-warning/10 text-warning';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background">
        <Header userRole="admin" userName="Loading..." notificationCount={0} />
        <main className="pt-24 pb-12 px-4 lg:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="h-96 bg-muted animate-pulse rounded-lg" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        userRole="admin"
        userName={userName}
        userAvatar={userAvatar}
        notificationCount={notificationCount}
      />

      <main className="pt-24 pb-12 px-4 lg:px-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading font-bold text-3xl text-foreground mb-2">
                User Management
              </h1>
              <p className="text-muted-foreground">Manage user accounts and permissions</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-all duration-250"
              >
                <Icon name="ArrowLeftIcon" size={20} variant="outline" />
                Back
              </button>
              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-all duration-250 ease-smooth shadow-md"
              >
                <Icon name="UserPlusIcon" size={20} variant="outline" />
                Invite User
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Total Users', value: users.length, icon: 'UsersIcon', color: 'primary' },
              {
                label: 'Commission Members',
                value: users.filter((u) => u.role === 'commission').length,
                icon: 'ShieldCheckIcon',
                color: 'accent',
              },
              {
                label: 'Active Users',
                value: users.filter((u) => u.status === 'active').length,
                icon: 'CheckCircleIcon',
                color: 'success',
              },
              {
                label: 'Pending Invites',
                value: users.filter((u) => u.status === 'pending').length,
                icon: 'ClockIcon',
                color: 'warning',
              },
            ].map((stat) => (
              <div key={stat.label} className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <Icon
                    name={stat.icon as any}
                    size={24}
                    variant="outline"
                    className={`text-${stat.color}`}
                  />
                </div>
                <p className="text-2xl font-heading font-bold text-foreground mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-semibold text-xl text-foreground">All Users</h2>
                <div className="text-sm text-muted-foreground">
                  Showing {filteredUsers.length} of {users.length} users
                </div>
              </div>
              
              {/* Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Icon name="MagnifyingGlassIcon" size={20} variant="outline" className="text-muted-foreground" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email, role, or status..."
                  className="w-full pl-12 pr-4 py-3 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground transition-all duration-250"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    <Icon name="XMarkIcon" size={20} variant="outline" className="text-muted-foreground hover:text-foreground transition-colors" />
                  </button>
                )}
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading users...</p>
                </div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Icon
                  name="UserGroupIcon"
                  size={48}
                  variant="outline"
                  className="mx-auto text-muted-foreground mb-4 opacity-50"
                />
                <p className="text-muted-foreground mb-2">
                  {searchQuery ? 'No users found matching your search' : 'No users found'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? 'Try a different search term' : 'Invite users to get started'}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-all duration-250"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
            <div className="overflow-x-auto" key={refreshKey}>
              <table className="w-full">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                      Last Activity
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-muted/20 transition-colors duration-200">
                      <td className="px-6 py-4 text-sm font-medium text-foreground">{user.name}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground font-data">
                        {user.email}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getRoleBadgeColor(user.role)}`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadgeColor(user.status)}`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {user.lastLogin
                          ? new Date(user.lastLogin).toLocaleDateString()
                          : user.invitedAt
                            ? `Invited ${new Date(user.invitedAt).toLocaleDateString()}`
                            : '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-primary hover:text-primary/80 transition-colors duration-200 text-sm font-medium"
                          >
                            Edit Role
                          </button>
                          {user.role === 'commission' && user.status === 'active' && (
                            <button
                              onClick={() => handleExtendAccess(user)}
                              className="text-success hover:text-success/80 transition-colors duration-200 text-sm font-medium"
                            >
                              Extend
                            </button>
                          )}
                          {user.status === 'active' && user.role !== 'admin' && (
                            <button
                              onClick={() => handleDeactivateUser(user)}
                              className="text-error hover:text-error/80 transition-colors duration-200 text-sm font-medium"
                            >
                              Deactivate
                            </button>
                          )}
                          {user.status === 'inactive' && (
                            <button
                              onClick={() => handleActivateUser(user)}
                              className="text-success hover:text-success/80 transition-colors duration-200 text-sm font-medium"
                            >
                              Activate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}
          </div>
        </div>
      </main>

      {/* Invite User Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {!inviteSuccess ? (
              <>
                {/* Modal Header */}
                <div className="p-6 border-b border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-heading font-semibold text-2xl text-foreground mb-1">
                        Invite New User
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Send an invitation to join as Electoral Commission member or Admin
                      </p>
                    </div>
                    <button
                      onClick={() => setShowInviteModal(false)}
                      className="p-2 hover:bg-muted rounded-md transition-all duration-250"
                      disabled={isSubmitting}
                    >
                      <Icon
                        name="XMarkIcon"
                        size={24}
                        variant="outline"
                        className="text-muted-foreground"
                      />
                    </button>
                  </div>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-6">
                  {/* Role Selection */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-3">
                      User Role <span className="text-error">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => handleInputChange('role', 'commission')}
                        className={`p-4 border-2 rounded-lg transition-all duration-250 ${
                          formData.role === 'commission'
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon
                            name="ShieldCheckIcon"
                            size={24}
                            variant="outline"
                            className={
                              formData.role === 'commission'
                                ? 'text-primary'
                                : 'text-muted-foreground'
                            }
                          />
                          <div className="text-left">
                            <p className="font-medium text-foreground">Electoral Commission</p>
                            <p className="text-xs text-muted-foreground">
                              Manage elections & candidates
                            </p>
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={() => handleInputChange('role', 'admin')}
                        className={`p-4 border-2 rounded-lg transition-all duration-250 ${
                          formData.role === 'admin'
                            ? 'border-error bg-error/5'
                            : 'border-border hover:border-error/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon
                            name="KeyIcon"
                            size={24}
                            variant="outline"
                            className={
                              formData.role === 'admin' ? 'text-error' : 'text-muted-foreground'
                            }
                          />
                          <div className="text-left">
                            <p className="font-medium text-foreground">Administrator</p>
                            <p className="text-xs text-muted-foreground">Full system access</p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        First Name <span className="text-error">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        placeholder="Enter first name"
                        className={`w-full px-4 py-3 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground transition-all duration-250 ${
                          formErrors.firstName ? 'border-error' : 'border-input'
                        }`}
                        disabled={isSubmitting}
                      />
                      {formErrors.firstName && (
                        <p className="mt-1 text-sm text-error flex items-center gap-1">
                          <Icon name="ExclamationCircleIcon" size={14} variant="solid" />
                          {formErrors.firstName}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Last Name <span className="text-error">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        placeholder="Enter last name"
                        className={`w-full px-4 py-3 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground transition-all duration-250 ${
                          formErrors.lastName ? 'border-error' : 'border-input'
                        }`}
                        disabled={isSubmitting}
                      />
                      {formErrors.lastName && (
                        <p className="mt-1 text-sm text-error flex items-center gap-1">
                          <Icon name="ExclamationCircleIcon" size={14} variant="solid" />
                          {formErrors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Institutional Email <span className="text-error">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="user@cktutas.edu.gh"
                      className={`w-full px-4 py-3 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground transition-all duration-250 ${
                        formErrors.email ? 'border-error' : 'border-input'
                      }`}
                      disabled={isSubmitting}
                    />
                    {formErrors.email && (
                      <p className="mt-1 text-sm text-error flex items-center gap-1">
                        <Icon name="ExclamationCircleIcon" size={14} variant="solid" />
                        {formErrors.email}
                      </p>
                    )}
                  </div>

                  {/* Position (for Commission) */}
                  {formData.role === 'commission' && (
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Position/Title <span className="text-error">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.position}
                        onChange={(e) => handleInputChange('position', e.target.value)}
                        placeholder="e.g., Electoral Commissioner, Deputy Commissioner"
                        className={`w-full px-4 py-3 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground transition-all duration-250 ${
                          formErrors.position ? 'border-error' : 'border-input'
                        }`}
                        disabled={isSubmitting}
                      />
                      {formErrors.position && (
                        <p className="mt-1 text-sm text-error flex items-center gap-1">
                          <Icon name="ExclamationCircleIcon" size={14} variant="solid" />
                          {formErrors.position}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Department (Optional) */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Department <span className="text-muted-foreground text-xs">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      placeholder="e.g., Computer Science, Administration"
                      className="w-full px-4 py-3 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground transition-all duration-250"
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Access Period (Commission Only) */}
                  {formData.role === 'commission' && (
                    <div className="p-4 bg-warning/5 border border-warning/20 rounded-md space-y-4">
                      <div className="flex items-start gap-3">
                        <Icon
                          name="ClockIcon"
                          size={20}
                          variant="outline"
                          className="text-warning flex-shrink-0 mt-0.5"
                        />
                        <div>
                          <p className="font-medium text-foreground mb-1">Time-Bound Access</p>
                          <p className="text-sm text-muted-foreground">
                            Commission access is temporary. After the end date, the user will
                            automatically be downgraded to student role.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Access Start Date <span className="text-error">*</span>
                          </label>
                          <input
                            type="date"
                            value={formData.accessStartDate}
                            onChange={(e) => handleInputChange('accessStartDate', e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className={`w-full px-4 py-3 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground transition-all duration-250 ${
                              formErrors.accessStartDate ? 'border-error' : 'border-input'
                            }`}
                            disabled={isSubmitting}
                          />
                          {formErrors.accessStartDate && (
                            <p className="mt-1 text-sm text-error flex items-center gap-1">
                              <Icon name="ExclamationCircleIcon" size={14} variant="solid" />
                              {formErrors.accessStartDate}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Access End Date <span className="text-error">*</span>
                          </label>
                          <input
                            type="date"
                            value={formData.accessEndDate}
                            onChange={(e) => handleInputChange('accessEndDate', e.target.value)}
                            min={
                              formData.accessStartDate ||
                              new Date(Date.now() + 86400000).toISOString().split('T')[0]
                            }
                            className={`w-full px-4 py-3 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground transition-all duration-250 ${
                              formErrors.accessEndDate ? 'border-error' : 'border-input'
                            }`}
                            disabled={isSubmitting}
                          />
                          {formErrors.accessEndDate && (
                            <p className="mt-1 text-sm text-error flex items-center gap-1">
                              <Icon name="ExclamationCircleIcon" size={14} variant="solid" />
                              {formErrors.accessEndDate}
                            </p>
                          )}
                        </div>
                      </div>

                      {formData.accessStartDate && formData.accessEndDate && (
                        <div className="text-sm text-foreground">
                          <p className="font-medium mb-1">Access Duration:</p>
                          <p className="text-muted-foreground">
                            {Math.ceil(
                              (new Date(formData.accessEndDate).getTime() -
                                new Date(formData.accessStartDate).getTime()) /
                                (1000 * 60 * 60 * 24)
                            )}{' '}
                            days
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Info Box */}
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-md">
                    <div className="flex items-start gap-3">
                      <Icon
                        name="InformationCircleIcon"
                        size={20}
                        variant="outline"
                        className="text-primary flex-shrink-0 mt-0.5"
                      />
                      <div className="text-sm text-foreground">
                        <p className="font-medium mb-1">What happens next?</p>
                        <ul className="space-y-1 text-muted-foreground">
                          <li>• Invitation email sent to the provided address</li>
                          <li>• User clicks secure link to set their password</li>
                          <li>• Account activated upon password creation</li>
                          <li>• Invitation expires in 7 days if not accepted</li>
                          {formData.role === 'commission' && (
                            <li className="text-warning font-medium">
                              • Commission access automatically expires on{' '}
                              {formData.accessEndDate
                                ? new Date(formData.accessEndDate).toLocaleDateString()
                                : 'end date'}
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-border flex items-center justify-end gap-3">
                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="px-6 py-3 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-all duration-250"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleInviteUser}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-all duration-250 ease-smooth shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        <span>Sending Invitation...</span>
                      </>
                    ) : (
                      <>
                        <Icon name="PaperAirplaneIcon" size={20} variant="outline" />
                        <span>Send Invitation</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              /* Success State */
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Icon name="CheckCircleIcon" size={48} variant="solid" className="text-success" />
                </div>
                <h3 className="font-heading font-semibold text-2xl text-foreground mb-2">
                  Invitation Sent Successfully!
                </h3>
                <p className="text-muted-foreground mb-6">
                  An invitation email has been sent to <strong>{formData.email}</strong>
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-center justify-center gap-2">
                    <Icon
                      name="CheckCircleIcon"
                      size={16}
                      variant="solid"
                      className="text-success"
                    />
                    Secure invitation link generated
                  </p>
                  <p className="flex items-center justify-center gap-2">
                    <Icon
                      name="CheckCircleIcon"
                      size={16}
                      variant="solid"
                      className="text-success"
                    />
                    Email sent to institutional address
                  </p>
                  <p className="flex items-center justify-center gap-2">
                    <Icon
                      name="CheckCircleIcon"
                      size={16}
                      variant="solid"
                      className="text-success"
                    />
                    User will appear as &quot;Pending&quot; until they accept
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {!editSuccess ? (
              <>
                {/* Modal Header */}
                <div className="p-6 border-b border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-heading font-semibold text-2xl text-foreground mb-1">
                        Edit User
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Update user information and access settings
                      </p>
                    </div>
                    <button
                      onClick={() => setShowEditModal(false)}
                      className="p-2 hover:bg-muted rounded-md transition-all duration-250"
                      disabled={isSubmitting}
                    >
                      <Icon
                        name="XMarkIcon"
                        size={24}
                        variant="outline"
                        className="text-muted-foreground"
                      />
                    </button>
                  </div>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-6">
                  {/* User Info Display */}
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Current Name</p>
                        <p className="font-medium text-foreground">{selectedUser.name}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Email</p>
                        <p className="font-medium text-foreground font-data">
                          {selectedUser.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Current Role</p>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ${getRoleBadgeColor(selectedUser.role)}`}
                        >
                          {selectedUser.role}
                        </span>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Status</p>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadgeColor(selectedUser.status)}`}
                        >
                          {selectedUser.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Role Change (Admin only) */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-3">
                      Change Role
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      {['student', 'commission', 'admin'].map((role) => (
                        <button
                          key={role}
                          onClick={() => setSelectedUser({ ...selectedUser, role: role as any })}
                          className={`p-4 border-2 rounded-lg transition-all duration-250 text-left ${
                            selectedUser.role === role
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                          disabled={isSubmitting}
                        >
                          <div className="flex items-center gap-3">
                            <Icon
                              name={
                                role === 'admin'
                                  ? 'KeyIcon'
                                  : role === 'commission'
                                    ? 'ShieldCheckIcon'
                                    : 'UserIcon'
                              }
                              size={20}
                              variant="outline"
                              className={
                                selectedUser.role === role
                                  ? 'text-primary'
                                  : 'text-muted-foreground'
                              }
                            />
                            <div>
                              <p className="font-medium text-foreground capitalize">{role}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Access Period (Commission Only) */}
                  {selectedUser.role === 'commission' && (
                    <div className="p-4 bg-warning/5 border border-warning/20 rounded-md space-y-4">
                      <div className="flex items-start gap-3">
                        <Icon
                          name="ClockIcon"
                          size={20}
                          variant="outline"
                          className="text-warning flex-shrink-0 mt-0.5"
                        />
                        <div>
                          <p className="font-medium text-foreground mb-1">Access Period</p>
                          <p className="text-sm text-muted-foreground">
                            Set or extend the commission access period
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Access Start Date
                          </label>
                          <input
                            type="date"
                            value={selectedUser.accessStartDate?.split('T')[0] || ''}
                            onChange={(e) =>
                              setSelectedUser({ ...selectedUser, accessStartDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })
                            }
                            className="w-full px-4 py-3 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground transition-all duration-250"
                            disabled={isSubmitting}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Access End Date
                          </label>
                          <input
                            type="date"
                            value={selectedUser.accessEndDate?.split('T')[0] || ''}
                            onChange={(e) =>
                              setSelectedUser({ ...selectedUser, accessEndDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })
                            }
                            min={selectedUser.accessStartDate?.split('T')[0] || ''}
                            className="w-full px-4 py-3 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground transition-all duration-250"
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Status Change */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-3">
                      Account Status
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      {['active', 'inactive', 'pending'].map((status) => (
                        <button
                          key={status}
                          onClick={() =>
                            setSelectedUser({ ...selectedUser, status: status as any })
                          }
                          className={`p-3 border-2 rounded-lg transition-all duration-250 ${
                            selectedUser.status === status
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                          disabled={isSubmitting}
                        >
                          <p className="font-medium text-foreground capitalize text-sm">{status}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Warning Box */}
                  <div className="p-4 bg-warning/5 border border-warning/20 rounded-md">
                    <div className="flex items-start gap-3">
                      <Icon
                        name="ExclamationTriangleIcon"
                        size={20}
                        variant="outline"
                        className="text-warning flex-shrink-0 mt-0.5"
                      />
                      <div className="text-sm text-foreground">
                        <p className="font-medium mb-1">Important Notes</p>
                        <ul className="space-y-1 text-muted-foreground">
                          <li>
                            • Changing role will affect user&apos;s access permissions immediately
                          </li>
                          <li>• Deactivating a user will revoke all access</li>
                          <li>• Commission members need valid access period</li>
                          <li>• User will receive notification email about changes</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-border flex items-center justify-end gap-3">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="px-6 py-3 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-all duration-250"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveUserEdit}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-all duration-250 ease-smooth shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <>
                        <Icon name="CheckCircleIcon" size={20} variant="outline" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              /* Success State */
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Icon name="CheckCircleIcon" size={48} variant="solid" className="text-success" />
                </div>
                <h3 className="font-heading font-semibold text-2xl text-foreground mb-2">
                  Changes Saved Successfully!
                </h3>
                <p className="text-muted-foreground mb-6">
                  User information has been updated for <strong>{selectedUser.name}</strong>
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-center justify-center gap-2">
                    <Icon
                      name="CheckCircleIcon"
                      size={16}
                      variant="solid"
                      className="text-success"
                    />
                    User record updated in database
                  </p>
                  <p className="flex items-center justify-center gap-2">
                    <Icon
                      name="CheckCircleIcon"
                      size={16}
                      variant="solid"
                      className="text-success"
                    />
                    Notification email sent to user
                  </p>
                  <p className="flex items-center justify-center gap-2">
                    <Icon
                      name="CheckCircleIcon"
                      size={16}
                      variant="solid"
                      className="text-success"
                    />
                    Changes logged in audit trail
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementInteractive;
