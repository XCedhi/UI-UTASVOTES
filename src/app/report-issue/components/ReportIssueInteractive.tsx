'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/common/Header';
import Icon from '@/components/ui/AppIcon';
import { useUserProfile } from '@/hooks/useUserProfile';

interface IssueForm {
  title: string;
  category: string;
  severity: string;
  description: string;
  stepsToReproduce: string;
  expectedBehavior: string;
  actualBehavior: string;
  browserInfo: string;
}

const ReportIssueInteractive = () => {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const { profile, loading: profileLoading } = useUserProfile();
  const [formData, setFormData] = useState<IssueForm>({
    title: '',
    category: 'bug',
    severity: 'medium',
    description: '',
    stepsToReproduce: '',
    expectedBehavior: '',
    actualBehavior: '',
    browserInfo: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setIsHydrated(true);
    // Auto-detect browser info
    if (typeof window !== 'undefined') {
      const browserInfo = `${navigator.userAgent}`;
      setFormData((prev) => ({ ...prev, browserInfo }));
    }
  }, []);

  const categories = [
    { value: 'bug', label: 'Bug/Error', icon: 'BugAntIcon', color: 'error' },
    { value: 'performance', label: 'Performance', icon: 'BoltIcon', color: 'warning' },
    { value: 'ui', label: 'UI/UX Issue', icon: 'PaintBrushIcon', color: 'accent' },
    { value: 'security', label: 'Security', icon: 'ShieldExclamationIcon', color: 'error' },
    { value: 'feature', label: 'Feature Request', icon: 'LightBulbIcon', color: 'primary' },
    { value: 'other', label: 'Other', icon: 'EllipsisHorizontalIcon', color: 'muted' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.description.trim().length < 20)
      newErrors.description = 'Description must be at least 20 characters';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setTicketNumber(
      `ISSUE-${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, '0')}`
    );
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  if (!isHydrated || profileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          userRole={(profile?.role as 'student' | 'candidate' | 'commission' | 'admin') || 'student'} 
          userName={profile?.full_name || 'Loading...'} 
          userAvatar={profile?.avatar_url}
          notificationCount={0} 
        />
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
        userRole={(profile?.role as 'student' | 'candidate' | 'commission' | 'admin') || 'student'}
        userName={profile?.full_name || 'Student'}
        userAvatar={profile?.avatar_url}
        notificationCount={3}
        electionStatus={{
          isActive: true,
          name: 'Student Council Elections 2026',
          endTime: '2026-02-15T23:59:59',
        }}
      />

      <main className="pt-24 pb-12 px-4 lg:px-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading font-bold text-3xl text-foreground mb-2">
                Report an Issue
              </h1>
              <p className="text-muted-foreground">
                Help us improve UTASVotes by reporting bugs, issues, or suggesting features
              </p>
            </div>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-all duration-250"
            >
              <Icon name="ArrowLeftIcon" size={20} variant="outline" />
              Back
            </button>
          </div>

          {!isSuccess ? (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Issue Form */}
              <div className="lg:col-span-2">
                <form
                  onSubmit={handleSubmit}
                  className="bg-card border border-border rounded-lg p-6 space-y-6"
                >
                  {/* Category Selection */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-3">
                      Issue Category
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {categories.map((cat) => (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, category: cat.value })}
                          className={`p-3 border-2 rounded-md transition-all duration-250 ${
                            formData.category === cat.value
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <Icon
                            name={cat.icon as any}
                            size={24}
                            variant="outline"
                            className={`mx-auto mb-2 ${formData.category === cat.value ? 'text-primary' : 'text-muted-foreground'}`}
                          />
                          <p className="text-xs font-medium text-foreground">{cat.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Severity */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Severity Level
                    </label>
                    <select
                      value={formData.severity}
                      onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                      className="w-full px-4 py-3 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-250"
                    >
                      <option value="low">Low - Minor inconvenience</option>
                      <option value="medium">Medium - Affects functionality</option>
                      <option value="high">High - Major feature broken</option>
                      <option value="critical">Critical - System unusable</option>
                    </select>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Issue Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Brief summary of the issue"
                      className={`w-full px-4 py-3 bg-background border ${
                        errors.title ? 'border-error' : 'border-input'
                      } rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground transition-all duration-250`}
                    />
                    {errors.title && (
                      <p className="mt-2 text-sm text-error flex items-center gap-2">
                        <Icon name="ExclamationCircleIcon" size={16} variant="solid" />
                        {errors.title}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Detailed Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe the issue in detail..."
                      rows={4}
                      className={`w-full px-4 py-3 bg-background border ${
                        errors.description ? 'border-error' : 'border-input'
                      } rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground transition-all duration-250 resize-none`}
                    />
                    {errors.description && (
                      <p className="mt-2 text-sm text-error flex items-center gap-2">
                        <Icon name="ExclamationCircleIcon" size={16} variant="solid" />
                        {errors.description}
                      </p>
                    )}
                  </div>

                  {/* Steps to Reproduce */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Steps to Reproduce (Optional)
                    </label>
                    <textarea
                      value={formData.stepsToReproduce}
                      onChange={(e) =>
                        setFormData({ ...formData, stepsToReproduce: e.target.value })
                      }
                      placeholder="1. Go to...&#10;2. Click on...&#10;3. See error..."
                      rows={4}
                      className="w-full px-4 py-3 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground transition-all duration-250 resize-none"
                    />
                  </div>

                  {/* Expected vs Actual Behavior */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Expected Behavior
                      </label>
                      <textarea
                        value={formData.expectedBehavior}
                        onChange={(e) =>
                          setFormData({ ...formData, expectedBehavior: e.target.value })
                        }
                        placeholder="What should happen..."
                        rows={3}
                        className="w-full px-4 py-3 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground transition-all duration-250 resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Actual Behavior
                      </label>
                      <textarea
                        value={formData.actualBehavior}
                        onChange={(e) =>
                          setFormData({ ...formData, actualBehavior: e.target.value })
                        }
                        placeholder="What actually happens..."
                        rows={3}
                        className="w-full px-4 py-3 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground transition-all duration-250 resize-none"
                      />
                    </div>
                  </div>

                  {/* Browser Info */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Browser Information
                    </label>
                    <input
                      type="text"
                      value={formData.browserInfo}
                      disabled
                      className="w-full px-4 py-3 bg-muted border border-input rounded-md text-muted-foreground text-sm cursor-not-allowed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-all duration-250 ease-smooth hover:-translate-y-0.5 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <Icon
                          name="ArrowPathIcon"
                          size={20}
                          variant="outline"
                          className="animate-spin"
                        />
                        Submitting...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Icon name="PaperAirplaneIcon" size={20} variant="outline" />
                        Submit Issue Report
                      </span>
                    )}
                  </button>
                </form>
              </div>

              {/* Guidelines Sidebar */}
              <div className="space-y-6">
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Icon
                      name="InformationCircleIcon"
                      size={24}
                      variant="outline"
                      className="text-primary"
                    />
                    <h3 className="font-heading font-semibold text-lg text-foreground">
                      Reporting Guidelines
                    </h3>
                  </div>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Icon
                        name="CheckCircleIcon"
                        size={16}
                        variant="solid"
                        className="text-success mt-0.5"
                      />
                      <span>Be specific and detailed in your description</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon
                        name="CheckCircleIcon"
                        size={16}
                        variant="solid"
                        className="text-success mt-0.5"
                      />
                      <span>Include steps to reproduce the issue</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon
                        name="CheckCircleIcon"
                        size={16}
                        variant="solid"
                        className="text-success mt-0.5"
                      />
                      <span>Attach screenshots if possible</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon
                        name="CheckCircleIcon"
                        size={16}
                        variant="solid"
                        className="text-success mt-0.5"
                      />
                      <span>Check if the issue has been reported before</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-warning/10 border border-warning/20 rounded-lg p-6">
                  <div className="flex items-start gap-3">
                    <Icon
                      name="ExclamationTriangleIcon"
                      size={24}
                      variant="outline"
                      className="text-warning"
                    />
                    <div>
                      <h3 className="font-medium text-foreground mb-2">Security Issues</h3>
                      <p className="text-sm text-muted-foreground">
                        For security vulnerabilities, please contact us directly at
                        security@cktutas.edu.gh
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg p-12 text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon name="CheckCircleIcon" size={32} variant="solid" className="text-success" />
              </div>
              <h2 className="font-heading font-semibold text-2xl text-foreground mb-3">
                Issue Reported Successfully
              </h2>
              <p className="text-muted-foreground mb-2">
                Your issue has been logged and assigned ticket number:
              </p>
              <p className="text-2xl font-data font-bold text-primary mb-6">{ticketNumber}</p>
              <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
                Our technical team will review your report and work on a resolution. You&apos;ll
                receive updates via email.
              </p>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => {
                    setIsSuccess(false);
                    setFormData({
                      title: '',
                      category: 'bug',
                      severity: 'medium',
                      description: '',
                      stepsToReproduce: '',
                      expectedBehavior: '',
                      actualBehavior: '',
                      browserInfo: formData.browserInfo,
                    });
                  }}
                  className="px-6 py-3 bg-muted text-foreground rounded-md font-medium hover:bg-muted/80 transition-all duration-250"
                >
                  Report Another Issue
                </button>
                <button
                  onClick={() => router.push('/student-dashboard')}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-all duration-250 ease-smooth"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ReportIssueInteractive;
