'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/common/Header';
import Icon from '@/components/ui/AppIcon';
import ProfilePictureUpload from '@/components/common/ProfilePictureUpload';
import { getUserSession } from '@/lib/auth-utils';

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
  const [profile, setProfile] = useState<AdminProfile>({
    name: 'System Administrator',
    email: 'admin@cktutas.edu.gh',
    role: 'Administrator',
    department: 'IT & Systems',
    position: 'System Administrator',
    phone: '+233 24 123 4567',
    joinedDate: '2024-01-15',
    lastLogin: new Date().toISOString(),
    profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
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
    const session = getUserSession();
    if (session) {
      setProfile((prev) => ({
        ...prev,
        name: session.name,
        email: session.email,
      }));
      setEditForm((prev) => ({
        ...prev,
        name: session.name,
        email: session.email,
      }));
    }
  }, []);

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

    // Simulate API call
    setTimeout(() => {
      setProfile(editForm);
      setIsEditing(false);
      setIsSaving(false);
    }, 1500);
  };

  const handleInputChange = (field: keyof AdminProfile, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleProfilePictureChange = (croppedImage: string) => {
    setProfile((prev) => ({ ...prev, profilePicture: croppedImage }));
    setEditForm((prev) => ({ ...prev, profilePicture: croppedImage }));
    console.log('Profile picture updated');
    // In production, upload to Supabase Storage here
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background">
        <Header userRole="admin" userName="Loading..." notificationCount={0} />
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
        userName={profile.name}
        userAvatar="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop"
        notificationCount={5}
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
                    <h2 className="font-heading font-bold text-2xl text-foreground">{profile.name}</h2>
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
                <Icon name="ChevronRightIcon" size={20} variant="outline" className="text-muted-foreground" />
              </button>

              <button className="w-full flex items-center justify-between p-4 bg-muted/30 rounded-md hover:bg-muted/50 transition-all duration-250">
                <div className="flex items-center gap-3">
                  <Icon name="ShieldCheckIcon" size={24} variant="outline" className="text-success" />
                  <div className="text-left">
                    <p className="font-medium text-foreground">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                </div>
                <Icon name="ChevronRightIcon" size={20} variant="outline" className="text-muted-foreground" />
              </button>

              <button className="w-full flex items-center justify-between p-4 bg-muted/30 rounded-md hover:bg-muted/50 transition-all duration-250">
                <div className="flex items-center gap-3">
                  <Icon name="ClockIcon" size={24} variant="outline" className="text-accent" />
                  <div className="text-left">
                    <p className="font-medium text-foreground">Activity Log</p>
                    <p className="text-sm text-muted-foreground">View your account activity history</p>
                  </div>
                </div>
                <Icon name="ChevronRightIcon" size={20} variant="outline" className="text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminProfileInteractive;
