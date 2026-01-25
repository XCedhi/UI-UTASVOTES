'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/common/Header';
import Icon from '@/components/ui/AppIcon';

interface ContactForm {
  subject: string;
  category: string;
  priority: string;
  message: string;
}

const ContactAdminInteractive = () => {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState<ContactForm>({
    subject: '',
    category: 'general',
    priority: 'medium',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const categories = [
    { value: 'general', label: 'General Inquiry', icon: 'QuestionMarkCircleIcon' },
    { value: 'technical', label: 'Technical Issue', icon: 'WrenchScrewdriverIcon' },
    { value: 'account', label: 'Account Problem', icon: 'UserIcon' },
    { value: 'election', label: 'Election Related', icon: 'CheckBadgeIcon' },
    { value: 'security', label: 'Security Concern', icon: 'ShieldCheckIcon' },
    { value: 'other', label: 'Other', icon: 'EllipsisHorizontalIcon' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    if (formData.message.trim().length < 20)
      newErrors.message = 'Message must be at least 20 characters';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background">
        <Header userRole="student" userName="Loading..." notificationCount={0} />
        <main className="pt-24 pb-12 px-4 lg:px-6">
          <div className="max-w-4xl mx-auto">
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
        userName="John Mensah"
        userAvatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop"
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
              <h1 className="font-heading font-bold text-3xl text-foreground mb-2">
                Contact Administrator
              </h1>
              <p className="text-muted-foreground">
                Get help from our support team. We typically respond within 24 hours.
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
              {/* Contact Form */}
              <div className="lg:col-span-2">
                <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Category
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

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Priority Level
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-4 py-3 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-250"
                    >
                      <option value="low">Low - General question</option>
                      <option value="medium">Medium - Need assistance</option>
                      <option value="high">High - Urgent issue</option>
                      <option value="critical">Critical - System blocking</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Brief description of your issue"
                      className={`w-full px-4 py-3 bg-background border ${
                        errors.subject ? 'border-error' : 'border-input'
                      } rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground transition-all duration-250`}
                    />
                    {errors.subject && (
                      <p className="mt-2 text-sm text-error flex items-center gap-2">
                        <Icon name="ExclamationCircleIcon" size={16} variant="solid" />
                        {errors.subject}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Message
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Provide detailed information about your inquiry or issue..."
                      rows={8}
                      className={`w-full px-4 py-3 bg-background border ${
                        errors.message ? 'border-error' : 'border-input'
                      } rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground transition-all duration-250 resize-none`}
                    />
                    {errors.message && (
                      <p className="mt-2 text-sm text-error flex items-center gap-2">
                        <Icon name="ExclamationCircleIcon" size={16} variant="solid" />
                        {errors.message}
                      </p>
                    )}
                    <p className="mt-2 text-sm text-muted-foreground">
                      {formData.message.length} / 500 characters
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-all duration-250 ease-smooth hover:-translate-y-0.5 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <Icon name="ArrowPathIcon" size={20} variant="outline" className="animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Icon name="PaperAirplaneIcon" size={20} variant="outline" />
                        Send Message
                      </span>
                    )}
                  </button>
                </form>
              </div>

              {/* Contact Info Sidebar */}
              <div className="space-y-6">
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
                    Contact Information
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Icon name="EnvelopeIcon" size={20} variant="outline" className="text-primary mt-1" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Email</p>
                        <p className="text-sm text-muted-foreground">support@cktutas.edu.gh</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Icon name="PhoneIcon" size={20} variant="outline" className="text-primary mt-1" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Phone</p>
                        <p className="text-sm text-muted-foreground">+233 30 123 4567</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Icon name="ClockIcon" size={20} variant="outline" className="text-primary mt-1" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Support Hours</p>
                        <p className="text-sm text-muted-foreground">Mon-Fri: 8AM - 5PM GMT</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-primary/10 border border-primary/20 rounded-lg p-6">
                  <div className="flex items-start gap-3">
                    <Icon name="InformationCircleIcon" size={24} variant="outline" className="text-primary" />
                    <div>
                      <h3 className="font-medium text-foreground mb-2">Quick Tip</h3>
                      <p className="text-sm text-muted-foreground">
                        For faster resolution, include your student ID and any relevant screenshots or error messages.
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
                Message Sent Successfully
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Thank you for contacting us. Our support team will review your message and respond within 24 hours.
              </p>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setIsSuccess(false)}
                  className="px-6 py-3 bg-muted text-foreground rounded-md font-medium hover:bg-muted/80 transition-all duration-250"
                >
                  Send Another Message
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

export default ContactAdminInteractive;
