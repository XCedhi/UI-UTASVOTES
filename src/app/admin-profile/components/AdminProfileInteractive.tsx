'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/common/Header';
import Icon from '@/components/ui/AppIcon';
import ProfilePictureUpload from '@/components/common/ProfilePictureUpload';
import { supabase } from '@/lib/supabase';
import { useAdminProfile } from '@/hooks/useAdminProfile';

interface AdminProfile {
  name: string;
  email: string;
  role: string;
  department: string;
  position: string;
  phone: string;
  joinedDate: string;
  lastLogin: string;
  permissions: string[];
  profilePicture?: string;
}

const AdminProfileInteractive = () => {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const { userName, userAvatar, notificationCount, isLoading: profileLoading } = useAdminProfile();
  const [profile, setProfile] = useState<AdminProfile>({
    name: 'System Administrator',
    email: 'admin@cktutas.edu.gh',
    role: 'Administrator',
    department: 'IT & Systems',
    position: 'System Administrator',
    phone: '+233 24 123 4567',
    joinedDate: '2024-01-15',
    lastLogin: new Date().toISOString(),
    profilePicture: undefined,
    permissions: [
      'Manage Users',
      'Manage Elections',
      'View All Results',
      'System Configuration',
      'Import Student Data',
      'Generate Reports',
      'Access Audit Logs',
      'Manage Commission Members',
    ],
  });

  const [editForm, setEditForm] = useState(profile);

  useEffect(() => {
    setIsHydrated(true);
    fetchAdminProfile();
  }, []);

  const fetchAdminProfile = async () => {
    try {
      console.log('🔍 Fetching admin profile from database...');
      setIsLoadingProfile(true);

      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        console.log('❌ No session found');
        setIsLoadingProfile(false);
        return;
      }

      console.log('👤 Session user ID:', session.user.id);

      // Fetch user profile from database
      const { data: profileData, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('❌ Error fetching profile:', error);
        setIsLoadingProfile(false);
        return;
      }

      console.log('✅ Profile data fetched:', profileData);
      console.log('🖼️ Avatar URL from database:', profileData.avatar_url ? `${profileData.avatar_url.substring(0, 50)}...` : 'null');

      // Update profile state with real data
      const updatedProfile: AdminProfile = {
        name: profileData.full_name || 'System Administrator',
        email: profileData.email || session.user.email || 'admin@cktutas.edu.gh',
        role: profileData.role === 'admin' ? 'Administrator' : profileData.role,
        department: profileData.department || 'IT & Systems',
        position: profileData.position || 'System Administrator',
        phone: profileData.phone || '+233 24 123 4567',
        joinedDate: profileData.created_at || '2024-01-15',
        lastLogin: profileData.last_login || new Date().toISOString(),
        profilePicture: profileData.avatar_url || undefined,
        permissions: [
          'Manage Users',
          'Manage Elections',
          'View All Results',
          'System Configuration',
          'Import Student Data',
          'Generate Reports',
          'Access Audit Logs',
          'Manage Commission Members',
        ],
      };

      console.log('🖼️ Profile picture set to:', updatedProfile.profilePicture ? 'Image data present' : 'No image');

      setProfile(updatedProfile);
      setEditForm(updatedProfile);
      setIsLoadingProfile(false);
    } catch (error) {
      console.error('💥 Error in fetchAdminProfile:', error);
      setIsLoadingProfile(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditForm(profile);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm(profile);
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      console.log('💾 Saving profile changes...');

      // Get user ID from localStorage (since we're using mock auth)
      const userEmail = localStorage.getItem('userEmail');
      
      if (!userEmail) {
        console.log('❌ No user email in localStorage');
        alert('Session expired. Please log in again.');
        setIsSaving(false);
        router.push('/login');
        return;
      }

      console.log('✅ User email from localStorage:', userEmail);

      // Get the actual Supabase user ID from the database using email
      const { data: userData, error: userError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('email', userEmail)
        .single();

      if (userError || !userData) {
        console.error('❌ Error getting user ID:', userError);
        alert('Failed to get user information. Please log in again.');
        setIsSaving(false);
        router.push('/login');
        return;
      }

      const userId = userData.id;
      console.log('✅ User ID from database:', userId);
      console.log('📝 Updating profile with data:', {
        fullName: editForm.name,
        phone: editForm.phone,
        department: editForm.department,
        position: editForm.position,
      });

      // Call API route to update profile (bypasses RLS)
      const response = await fetch('/api/admin/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          fullName: editForm.name,
          phone: editForm.phone,
          department: editForm.department,
          position: editForm.position,
        }),
      });

      console.log('📡 API response status:', response.status);

      const result = await response.json();
      console.log('📡 API response data:', result);

      if (!response.ok) {
        console.error('❌ API error:', result.error);
        alert(`Failed to update profile: ${result.error}`);
        setIsSaving(false);
        return;
      }

      console.log('✅ Profile updated successfully via API');
      
      // Update local state with the saved values
      setProfile(editForm);
      setIsEditing(false);
      setIsSaving(false);
      
      // Refresh profile data from database to ensure everything is in sync
      console.log('🔄 Refreshing profile data from database...');
      await fetchAdminProfile();
      
      alert('Profile updated successfully!');
    } catch (error: any) {
      console.error('💥 Error saving profile:', error);
      alert(`Failed to update profile: ${error.message}`);
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof AdminProfile, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleProfilePictureChange = async (croppedImage: string) => {
    try {
      console.log('📸 Updating profile picture...');

      // Get user ID from localStorage (since we're using mock auth)
      const userEmail = localStorage.getItem('userEmail');
      
      if (!userEmail) {
        console.log('❌ No user email in localStorage');
        alert('Session expired. Please log in again.');
        router.push('/login');
        return;
      }

      console.log('✅ User email from localStorage:', userEmail);

      // Get the actual Supabase user ID from the database using email
      const { data: userData, error: userError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('email', userEmail)
        .single();

      if (userError || !userData) {
        console.error('❌ Error getting user ID:', userError);
        alert('Failed to get user information. Please log in again.');
        router.push('/login');
        return;
      }

      const userId = userData.id;
      console.log('✅ User ID from database:', userId);

      // Call API route to update avatar (bypasses RLS)
      const response = await fetch('/api/admin/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          avatarUrl: croppedImage,
        }),
      });

      console.log('📡 API response status:', response.status);

      const result = await response.json();
      console.log('📡 API response data:', result);

      if (!response.ok) {
        console.error('❌ API error:', result.error);
        alert(`Failed to update profile picture: ${result.error}`);
        return;
      }

      console.log('✅ Profile picture updated successfully via API');
      
      // Update local state immediately with the new image
      setProfile(prev => ({
        ...prev,
        profilePicture: croppedImage
      }));
      
      // Also refresh from database to ensure sync
      await fetchAdminProfile();
      
      alert('Profile picture updated successfully!');
    } catch (error: any) {
      console.error('💥 Error updating profile picture:', error);
      alert(`Failed to update profile picture: ${error.message}`);
    }
  };

  if (!isHydrated || profileLoading || isLoadingProfile) {
    return (
      <div className="min-h-screen bg-background">
        <Header userRole="admin" userName={userName} userAvatar={userAvatar} notificationCount={notificationCount} />
        <main className="pt-24 pb-12 px-4 lg:px-6">
          <div className="max-w-5xl mx-auto">
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
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading font-bold text-3xl text-foreground mb-2">
                Administrator Profile
              </h1>
              <p className="text-muted-foreground">Manage your administrator account information</p>
            </div>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-all duration-250"
            >
              <Icon name="ArrowLeftIcon" size={20} variant="outline" />
              Back
            </button>
          </div>

          {/* Profile Card */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            {/* Banner */}
            <div className="h-32 bg-gradient-to-r from-error via-accent to-primary" />

            {/* Profile Info */}
            <div className="px-6 pb-6">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16 mb-6">
                <div className="flex items-end gap-4">
                  <div className="-mt-4">
                    <ProfilePictureUpload
                      currentImage={profile.profilePicture}
                      onSave={handleProfilePictureChange}
                      userName={profile.name}
                    />
                  </div>
                  <div className="mb-4">
                    <h2 className="font-heading font-bold text-2xl text-foreground">
                      {profile.name}
                    </h2>
                    <p className="text-muted-foreground">{profile.position}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-error/10 text-error">
                        Administrator
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
                {!isEditing && (
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-all duration-250 ease-smooth shadow-md mt-4 md:mt-0"
                  >
                    <Icon name="PencilIcon" size={20} variant="outline" />
                    Edit Profile
                  </button>
                )}
              </div>

              {/* Profile Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
                    Personal Information
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-4 py-3 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                      />
                    ) : (
                      <p className="text-foreground font-medium">{profile.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Email Address
                    </label>
                    <p className="text-foreground font-medium font-data">{profile.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-4 py-3 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                      />
                    ) : (
                      <p className="text-foreground font-medium">{profile.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Department
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.department}
                        onChange={(e) => handleInputChange('department', e.target.value)}
                        className="w-full px-4 py-3 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                      />
                    ) : (
                      <p className="text-foreground font-medium">{profile.department}</p>
                    )}
                  </div>
                </div>

                {/* Account Information */}
                <div className="space-y-4">
                  <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
                    Account Information
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Role
                    </label>
                    <p className="text-foreground font-medium">{profile.role}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Position
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.position}
                        onChange={(e) => handleInputChange('position', e.target.value)}
                        className="w-full px-4 py-3 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                      />
                    ) : (
                      <p className="text-foreground font-medium">{profile.position}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Joined Date
                    </label>
                    <p className="text-foreground font-medium">
                      {new Date(profile.joinedDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Last Login
                    </label>
                    <p className="text-foreground font-medium">
                      {new Date(profile.lastLogin).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Edit Actions */}
              {isEditing && (
                <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-border">
                  <button
                    onClick={handleCancel}
                    className="px-6 py-3 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-all duration-250"
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-all duration-250 ease-smooth shadow-md disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Icon name="CheckCircleIcon" size={20} variant="outline" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Permissions Card */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
              Administrator Permissions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {profile.permissions.map((permission) => (
                <div
                  key={permission}
                  className="flex items-center gap-2 p-3 bg-success/5 border border-success/20 rounded-md"
                >
                  <Icon name="CheckCircleIcon" size={20} variant="solid" className="text-success" />
                  <span className="text-sm text-foreground">{permission}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Security Card */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
              Security & Access
            </h3>
            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-4 bg-muted/30 rounded-md hover:bg-muted/50 transition-all duration-250">
                <div className="flex items-center gap-3">
                  <Icon name="KeyIcon" size={24} variant="outline" className="text-primary" />
                  <div className="text-left">
                    <p className="font-medium text-foreground">Change Password</p>
                    <p className="text-sm text-muted-foreground">Update your account password</p>
                  </div>
                </div>
                <Icon
                  name="ChevronRightIcon"
                  size={20}
                  variant="outline"
                  className="text-muted-foreground"
                />
              </button>

              <button className="w-full flex items-center justify-between p-4 bg-muted/30 rounded-md hover:bg-muted/50 transition-all duration-250">
                <div className="flex items-center gap-3">
                  <Icon
                    name="ShieldCheckIcon"
                    size={24}
                    variant="outline"
                    className="text-success"
                  />
                  <div className="text-left">
                    <p className="font-medium text-foreground">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                </div>
                <Icon
                  name="ChevronRightIcon"
                  size={20}
                  variant="outline"
                  className="text-muted-foreground"
                />
              </button>

              <button className="w-full flex items-center justify-between p-4 bg-muted/30 rounded-md hover:bg-muted/50 transition-all duration-250">
                <div className="flex items-center gap-3">
                  <Icon name="ClockIcon" size={24} variant="outline" className="text-accent" />
                  <div className="text-left">
                    <p className="font-medium text-foreground">Activity Log</p>
                    <p className="text-sm text-muted-foreground">
                      View your account activity history
                    </p>
                  </div>
                </div>
                <Icon
                  name="ChevronRightIcon"
                  size={20}
                  variant="outline"
                  className="text-muted-foreground"
                />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminProfileInteractive;
