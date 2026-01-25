'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/common/Header';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

interface ProfileData {
  fullName: string;
  studentId: string;
  email: string;
  phone: string;
  department: string;
  level: string;
  avatar: string;
}

const ProfileInteractive = () => {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile');
  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: 'John Mensah',
    studentId: 'UTAS/2023/001234',
    email: 'john.mensah@cktutas.edu.gh',
    phone: '+233 24 123 4567',
    department: 'Computer Science',
    level: '300',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSaving(false);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background">
        <Header userRole="student" userName="Loading..." notificationCount={0} />
        <main className="pt-24 pb-12 px-4 lg:px-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="h-64 bg-muted animate-pulse rounded-lg" />
            <div className="h-96 bg-muted animate-pulse rounded-lg" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        userRole="student"
        userName={profileData.fullName}
        userAvatar={profileData.avatar}
        notificationCount={3}
        electionStatus={{
          isActive: true,
          name: 'Student Council Elections 2026',
          endTime: '2026-02-15T23:59:59',
        }}
      />

      <main className="pt-24 pb-12 px-4 lg:px-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading font-bold text-3xl text-foreground mb-2">My Profile</h1>
              <p className="text-muted-foreground">Manage your account information and settings</p>
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
            <div className="h-32 bg-gradient-to-r from-primary to-accent" />
            <div className="px-6 pb-6">
              <div className="flex items-end gap-6 -mt-16 mb-6">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-4 border-card overflow-hidden bg-muted">
                    <AppImage
                      src={profileData.avatar}
                      alt={profileData.fullName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {isEditing && (
                    <button className="absolute bottom-0 right-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-all duration-250">
                      <Icon name="CameraIcon" size={20} variant="outline" />
                    </button>
                  )}
                </div>
                <div className="flex-1 pt-4">
                  <h2 className="font-heading font-bold text-2xl text-foreground mb-1">
                    {profileData.fullName}
                  </h2>
                  <p className="text-muted-foreground mb-2">{profileData.studentId}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Icon name="AcademicCapIcon" size={16} variant="outline" />
                      {profileData.department}
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="BookOpenIcon" size={16} variant="outline" />
                      Level {profileData.level}
                    </div>
                  </div>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-all duration-250 ease-smooth hover:-translate-y-0.5 shadow-md"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              {/* Tabs */}
              <div className="border-b border-border mb-6">
                <div className="flex gap-6">
                  {[
                    { id: 'profile', label: 'Profile Information', icon: 'UserIcon' },
                    { id: 'security', label: 'Security', icon: 'LockClosedIcon' },
                    { id: 'preferences', label: 'Preferences', icon: 'Cog6ToothIcon' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-all duration-250 ${
                        activeTab === tab.id
                          ? 'border-primary text-primary'
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Icon name={tab.icon as any} size={20} variant="outline" />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Profile Information Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profileData.fullName}
                        onChange={(e) =>
                          setProfileData({ ...profileData, fullName: e.target.value })
                        }
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-250 ${
                          !isEditing ? 'opacity-60 cursor-not-allowed' : ''
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Student ID
                      </label>
                      <input
                        type="text"
                        value={profileData.studentId}
                        disabled
                        className="w-full px-4 py-3 bg-muted border border-input rounded-md text-muted-foreground cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        disabled
                        className="w-full px-4 py-3 bg-muted border border-input rounded-md text-muted-foreground cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-250 ${
                          !isEditing ? 'opacity-60 cursor-not-allowed' : ''
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Department
                      </label>
                      <input
                        type="text"
                        value={profileData.department}
                        disabled
                        className="w-full px-4 py-3 bg-muted border border-input rounded-md text-muted-foreground cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Level
                      </label>
                      <input
                        type="text"
                        value={profileData.level}
                        disabled
                        className="w-full px-4 py-3 bg-muted border border-input rounded-md text-muted-foreground cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex items-center gap-4 pt-4">
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-all duration-250 ease-smooth disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={isSaving}
                        className="px-6 py-3 bg-muted text-foreground rounded-md font-medium hover:bg-muted/80 transition-all duration-250"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div className="bg-warning/10 border border-warning/20 rounded-md p-4 flex items-start gap-3">
                    <Icon name="ShieldExclamationIcon" size={24} variant="outline" className="text-warning" />
                    <div>
                      <h3 className="font-medium text-foreground mb-1">Password Security</h3>
                      <p className="text-sm text-muted-foreground">
                        For security reasons, password changes must be done through the forgot password flow.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push('/forgot-password')}
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-all duration-250 ease-smooth"
                  >
                    Change Password
                  </button>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-md">
                    <div>
                      <h3 className="font-medium text-foreground mb-1">Email Notifications</h3>
                      <p className="text-sm text-muted-foreground">
                        Receive updates about elections and results
                      </p>
                    </div>
                    <button className="w-12 h-6 bg-primary rounded-full relative">
                      <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-md">
                    <div>
                      <h3 className="font-medium text-foreground mb-1">SMS Notifications</h3>
                      <p className="text-sm text-muted-foreground">
                        Get text messages for important updates
                      </p>
                    </div>
                    <button className="w-12 h-6 bg-muted rounded-full relative">
                      <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfileInteractive;
