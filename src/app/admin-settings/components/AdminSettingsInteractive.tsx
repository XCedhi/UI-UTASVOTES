'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/common/Header';
import Icon from '@/components/ui/AppIcon';

interface SystemSettings {
  siteName: string;
  siteDescription: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  requireEmailVerification: boolean;
  maxFileUploadSize: number;
  sessionTimeout: number;
  enableNotifications: boolean;
  enableAuditLog: boolean;
}

interface ElectionSettings {
  defaultVotingDuration: number;
  allowLateVoting: boolean;
  requireVoterVerification: boolean;
  showLiveResults: boolean;
  allowResultExport: boolean;
  minimumCandidates: number;
  maximumCandidates: number;
}

interface SecuritySettings {
  enforceStrongPasswords: boolean;
  passwordMinLength: number;
  requireTwoFactor: boolean;
  sessionDuration: number;
  maxLoginAttempts: number;
  lockoutDuration: number;
}

const AdminSettingsInteractive = () => {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState<'system' | 'election' | 'security' | 'notifications'>('system');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    siteName: 'UTASVotes',
    siteDescription: 'University of Technical and Applied Sciences Electoral System',
    maintenanceMode: false,
    allowRegistration: false,
    requireEmailVerification: true,
    maxFileUploadSize: 10,
    sessionTimeout: 30,
    enableNotifications: true,
    enableAuditLog: true,
  });

  const [electionSettings, setElectionSettings] = useState<ElectionSettings>({
    defaultVotingDuration: 7,
    allowLateVoting: false,
    requireVoterVerification: true,
    showLiveResults: true,
    allowResultExport: true,
    minimumCandidates: 2,
    maximumCandidates: 10,
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    enforceStrongPasswords: true,
    passwordMinLength: 12,
    requireTwoFactor: false,
    sessionDuration: 60,
    maxLoginAttempts: 5,
    lockoutDuration: 30,
  });

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handleSaveSettings = async () => {
    setIsSaving(true);

    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);

      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    }, 1500);
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background">
        <Header userRole="admin" userName="Loading..." notificationCount={0} />
        <main className="pt-24 pb-12 px-4 lg:px-6">
          <div className="max-w-6xl mx-auto">
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
        userName="System Administrator"
        userAvatar="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop"
        notificationCount={5}
      />

      <main className="pt-24 pb-12 px-4 lg:px-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading font-bold text-3xl text-foreground mb-2">
                System Settings
              </h1>
              <p className="text-muted-foreground">Configure system-wide settings and preferences</p>
            </div>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-all duration-250"
            >
              <Icon name="ArrowLeftIcon" size={20} variant="outline" />
              Back
            </button>
          </div>

          {/* Success Banner */}
          {saveSuccess && (
            <div className="bg-success/10 border border-success/20 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Icon name="CheckCircleIcon" size={24} variant="solid" className="text-success" />
                <p className="text-success font-medium">Settings saved successfully!</p>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="flex border-b border-border overflow-x-auto">
              {[
                { id: 'system', label: 'System', icon: 'Cog6ToothIcon' },
                { id: 'election', label: 'Elections', icon: 'CheckBadgeIcon' },
                { id: 'security', label: 'Security', icon: 'ShieldCheckIcon' },
                { id: 'notifications', label: 'Notifications', icon: 'BellIcon' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-all duration-250 ${
                    activeTab === tab.id
                      ? 'text-primary border-b-2 border-primary bg-primary/5'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                  }`}
                >
                  <Icon name={tab.icon as any} size={20} variant="outline" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* System Settings Tab */}
              {activeTab === 'system' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
                      General Settings
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Site Name
                        </label>
                        <input
                          type="text"
                          value={systemSettings.siteName}
                          onChange={(e) =>
                            setSystemSettings({ ...systemSettings, siteName: e.target.value })
                          }
                          className="w-full px-4 py-3 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Site Description
                        </label>
                        <textarea
                          value={systemSettings.siteDescription}
                          onChange={(e) =>
                            setSystemSettings({ ...systemSettings, siteDescription: e.target.value })
                          }
                          rows={3}
                          className="w-full px-4 py-3 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Max File Upload Size (MB)
                        </label>
                        <input
                          type="number"
                          value={systemSettings.maxFileUploadSize}
                          onChange={(e) =>
                            setSystemSettings({
                              ...systemSettings,
                              maxFileUploadSize: parseInt(e.target.value),
                            })
                          }
                          min="1"
                          max="100"
                          className="w-full px-4 py-3 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Session Timeout (minutes)
                        </label>
                        <input
                          type="number"
                          value={systemSettings.sessionTimeout}
                          onChange={(e) =>
                            setSystemSettings({
                              ...systemSettings,
                              sessionTimeout: parseInt(e.target.value),
                            })
                          }
                          min="5"
                          max="120"
                          className="w-full px-4 py-3 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
                      System Features
                    </h3>
                    <div className="space-y-4">
                      {[
                        {
                          key: 'maintenanceMode',
                          label: 'Maintenance Mode',
                          description: 'Put the system in maintenance mode (only admins can access)',
                          icon: 'WrenchScrewdriverIcon',
                        },
                        {
                          key: 'allowRegistration',
                          label: 'Allow Registration',
                          description: 'Allow new users to register accounts',
                          icon: 'UserPlusIcon',
                        },
                        {
                          key: 'requireEmailVerification',
                          label: 'Require Email Verification',
                          description: 'Users must verify their email before accessing the system',
                          icon: 'EnvelopeIcon',
                        },
                        {
                          key: 'enableNotifications',
                          label: 'Enable Notifications',
                          description: 'Send email and in-app notifications to users',
                          icon: 'BellIcon',
                        },
                        {
                          key: 'enableAuditLog',
                          label: 'Enable Audit Log',
                          description: 'Log all system activities for security and compliance',
                          icon: 'DocumentTextIcon',
                        },
                      ].map((setting) => (
                        <div
                          key={setting.key}
                          className="flex items-center justify-between p-4 bg-muted/30 rounded-md"
                        >
                          <div className="flex items-center gap-3">
                            <Icon
                              name={setting.icon as any}
                              size={24}
                              variant="outline"
                              className="text-primary"
                            />
                            <div>
                              <p className="font-medium text-foreground">{setting.label}</p>
                              <p className="text-sm text-muted-foreground">{setting.description}</p>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              setSystemSettings({
                                ...systemSettings,
                                [setting.key]: !systemSettings[setting.key as keyof SystemSettings],
                              })
                            }
                            className={`relative w-12 h-6 rounded-full transition-all duration-250 ${
                              systemSettings[setting.key as keyof SystemSettings]
                                ? 'bg-success'
                                : 'bg-muted'
                            }`}
                          >
                            <div
                              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-250 ${
                                systemSettings[setting.key as keyof SystemSettings]
                                  ? 'left-7'
                                  : 'left-1'
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Election Settings Tab */}
              {activeTab === 'election' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
                      Election Configuration
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Default Voting Duration (days)
                        </label>
                        <input
                          type="number"
                          value={electionSettings.defaultVotingDuration}
                          onChange={(e) =>
                            setElectionSettings({
                              ...electionSettings,
                              defaultVotingDuration: parseInt(e.target.value),
                            })
                          }
                          min="1"
                          max="30"
                          className="w-full px-4 py-3 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Minimum Candidates
                          </label>
                          <input
                            type="number"
                            value={electionSettings.minimumCandidates}
                            onChange={(e) =>
                              setElectionSettings({
                                ...electionSettings,
                                minimumCandidates: parseInt(e.target.value),
                              })
                            }
                            min="1"
                            max="10"
                            className="w-full px-4 py-3 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Maximum Candidates
                          </label>
                          <input
                            type="number"
                            value={electionSettings.maximumCandidates}
                            onChange={(e) =>
                              setElectionSettings({
                                ...electionSettings,
                                maximumCandidates: parseInt(e.target.value),
                              })
                            }
                            min="2"
                            max="50"
                            className="w-full px-4 py-3 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
                      Election Features
                    </h3>
                    <div className="space-y-4">
                      {[
                        {
                          key: 'allowLateVoting',
                          label: 'Allow Late Voting',
                          description: 'Allow voting after the official deadline with admin approval',
                          icon: 'ClockIcon',
                        },
                        {
                          key: 'requireVoterVerification',
                          label: 'Require Voter Verification',
                          description: 'Verify voter identity before allowing them to vote',
                          icon: 'IdentificationIcon',
                        },
                        {
                          key: 'showLiveResults',
                          label: 'Show Live Results',
                          description: 'Display real-time results during voting period',
                          icon: 'ChartBarIcon',
                        },
                        {
                          key: 'allowResultExport',
                          label: 'Allow Result Export',
                          description: 'Allow exporting election results to PDF/CSV',
                          icon: 'ArrowDownTrayIcon',
                        },
                      ].map((setting) => (
                        <div
                          key={setting.key}
                          className="flex items-center justify-between p-4 bg-muted/30 rounded-md"
                        >
                          <div className="flex items-center gap-3">
                            <Icon
                              name={setting.icon as any}
                              size={24}
                              variant="outline"
                              className="text-primary"
                            />
                            <div>
                              <p className="font-medium text-foreground">{setting.label}</p>
                              <p className="text-sm text-muted-foreground">{setting.description}</p>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              setElectionSettings({
                                ...electionSettings,
                                [setting.key]: !electionSettings[setting.key as keyof ElectionSettings],
                              })
                            }
                            className={`relative w-12 h-6 rounded-full transition-all duration-250 ${
                              electionSettings[setting.key as keyof ElectionSettings]
                                ? 'bg-success'
                                : 'bg-muted'
                            }`}
                          >
                            <div
                              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-250 ${
                                electionSettings[setting.key as keyof ElectionSettings]
                                  ? 'left-7'
                                  : 'left-1'
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Security Settings Tab */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
                      Password Policy
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Minimum Password Length
                        </label>
                        <input
                          type="number"
                          value={securitySettings.passwordMinLength}
                          onChange={(e) =>
                            setSecuritySettings({
                              ...securitySettings,
                              passwordMinLength: parseInt(e.target.value),
                            })
                          }
                          min="8"
                          max="32"
                          className="w-full px-4 py-3 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-md">
                        <div className="flex items-center gap-3">
                          <Icon name="KeyIcon" size={24} variant="outline" className="text-primary" />
                          <div>
                            <p className="font-medium text-foreground">Enforce Strong Passwords</p>
                            <p className="text-sm text-muted-foreground">
                              Require uppercase, lowercase, numbers, and special characters
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            setSecuritySettings({
                              ...securitySettings,
                              enforceStrongPasswords: !securitySettings.enforceStrongPasswords,
                            })
                          }
                          className={`relative w-12 h-6 rounded-full transition-all duration-250 ${
                            securitySettings.enforceStrongPasswords ? 'bg-success' : 'bg-muted'
                          }`}
                        >
                          <div
                            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-250 ${
                              securitySettings.enforceStrongPasswords ? 'left-7' : 'left-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
                      Session Management
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Session Duration (minutes)
                        </label>
                        <input
                          type="number"
                          value={securitySettings.sessionDuration}
                          onChange={(e) =>
                            setSecuritySettings({
                              ...securitySettings,
                              sessionDuration: parseInt(e.target.value),
                            })
                          }
                          min="15"
                          max="480"
                          className="w-full px-4 py-3 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Max Login Attempts
                          </label>
                          <input
                            type="number"
                            value={securitySettings.maxLoginAttempts}
                            onChange={(e) =>
                              setSecuritySettings({
                                ...securitySettings,
                                maxLoginAttempts: parseInt(e.target.value),
                              })
                            }
                            min="3"
                            max="10"
                            className="w-full px-4 py-3 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Lockout Duration (minutes)
                          </label>
                          <input
                            type="number"
                            value={securitySettings.lockoutDuration}
                            onChange={(e) =>
                              setSecuritySettings({
                                ...securitySettings,
                                lockoutDuration: parseInt(e.target.value),
                              })
                            }
                            min="5"
                            max="120"
                            className="w-full px-4 py-3 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-md">
                        <div className="flex items-center gap-3">
                          <Icon
                            name="ShieldCheckIcon"
                            size={24}
                            variant="outline"
                            className="text-primary"
                          />
                          <div>
                            <p className="font-medium text-foreground">Require Two-Factor Authentication</p>
                            <p className="text-sm text-muted-foreground">
                              Require 2FA for all admin and commission accounts
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            setSecuritySettings({
                              ...securitySettings,
                              requireTwoFactor: !securitySettings.requireTwoFactor,
                            })
                          }
                          className={`relative w-12 h-6 rounded-full transition-all duration-250 ${
                            securitySettings.requireTwoFactor ? 'bg-success' : 'bg-muted'
                          }`}
                        >
                          <div
                            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-250 ${
                              securitySettings.requireTwoFactor ? 'left-7' : 'left-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
                      Email Notifications
                    </h3>
                    <div className="space-y-4">
                      {[
                        'New user registration',
                        'Election created',
                        'Voting period started',
                        'Voting period ended',
                        'Results published',
                        'Candidate application submitted',
                        'System maintenance scheduled',
                        'Security alerts',
                      ].map((notification) => (
                        <div
                          key={notification}
                          className="flex items-center justify-between p-4 bg-muted/30 rounded-md"
                        >
                          <div className="flex items-center gap-3">
                            <Icon name="EnvelopeIcon" size={20} variant="outline" className="text-primary" />
                            <p className="text-foreground">{notification}</p>
                          </div>
                          <button className="relative w-12 h-6 rounded-full bg-success">
                            <div className="absolute top-1 left-7 w-4 h-4 bg-white rounded-full" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
                      In-App Notifications
                    </h3>
                    <div className="space-y-4">
                      {[
                        'System announcements',
                        'Election updates',
                        'User activity',
                        'Security events',
                      ].map((notification) => (
                        <div
                          key={notification}
                          className="flex items-center justify-between p-4 bg-muted/30 rounded-md"
                        >
                          <div className="flex items-center gap-3">
                            <Icon name="BellIcon" size={20} variant="outline" className="text-primary" />
                            <p className="text-foreground">{notification}</p>
                          </div>
                          <button className="relative w-12 h-6 rounded-full bg-success">
                            <div className="absolute top-1 left-7 w-4 h-4 bg-white rounded-full" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => router.back()}
              className="px-6 py-3 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-all duration-250"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveSettings}
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
                  <span>Save All Settings</span>
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminSettingsInteractive;
