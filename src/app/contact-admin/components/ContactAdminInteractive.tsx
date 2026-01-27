'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';

interface ContactForm {
  name: string;
  email: string;
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
    name: '',
    email: '',
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
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    if (formData.message.trim().length < 20)
      newErrors.message = 'Message must be at least 20 characters';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit support ticket to API
      const response = await fetch('/api/submit-support-ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: formData.subject.trim(),
          category: formData.category,
          priority: formData.priority,
          message: formData.message.trim(),
          userEmail: formData.email.trim(),
          userName: formData.name.trim(),
          userId: null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit support ticket');
      }

      console.log('✅ Support ticket submitted:', result.ticket.ticket_number);
      
      setIsSubmitting(false);
      setIsSuccess(true);
      
      // Store ticket number for display
      if (result.ticket?.ticket_number) {
        setFormData(prev => ({ ...prev, subject: result.ticket.ticket_number }));
      }
    } catch (error: any) {
      console.error('❌ Error submitting support ticket:', error);
      console.error('Error details:', error);
      setIsSubmitting(false);
      
      // Show detailed error message
      const errorMessage = error.message || 'Failed to submit support ticket. Please try again or contact support@cktutas.edu.gh directly.';
      console.error('Error message shown to user:', errorMessage);
      
      setErrors({ 
        message: errorMessage
      });
      
      // Also alert for visibility
      alert(`Error: ${errorMessage}\n\nCheck browser console (F12) for details.`);
    }
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-4xl w-full mx-auto px-4">
          <div className="h-96 bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Simple Header - No Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <Icon name="AcademicCapIcon" size={24} variant="solid" className="text-white" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-lg text-foreground">UTASVotes</h1>
              <p className="text-xs text-muted-foreground">Support Center</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/login')}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-all duration-250"
          >
            <Icon name="ArrowLeftIcon" size={20} variant="outline" />
            Back to Login
          </button>
        </div>
      </header>

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
                <form
                  onSubmit={handleSubmit}
                  className="bg-card border border-border rounded-lg p-6 space-y-6"
                >
                  {errors.message && !errors.subject && !errors.name && !errors.email && (
                    <div className="p-4 bg-error/10 border border-error rounded-md flex items-start gap-3">
                      <Icon
                        name="ExclamationTriangleIcon"
                        size={20}
                        variant="solid"
                        className="text-error flex-shrink-0 mt-0.5"
                      />
                      <p className="text-sm text-error">{errors.message}</p>
                    </div>
                  )}
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Your Name <span className="text-error">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter your full name"
                        className={`w-full px-4 py-3 bg-background border ${
                          errors.name ? 'border-error' : 'border-input'
                        } rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground transition-all duration-250`}
                      />
                      {errors.name && (
                        <p className="mt-2 text-sm text-error flex items-center gap-2">
                          <Icon name="ExclamationCircleIcon" size={16} variant="solid" />
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Email Address <span className="text-error">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="your.email@cktutas.edu.gh"
                        className={`w-full px-4 py-3 bg-background border ${
                          errors.email ? 'border-error' : 'border-input'
                        } rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground transition-all duration-250`}
                      />
                      {errors.email && (
                        <p className="mt-2 text-sm text-error flex items-center gap-2">
                          <Icon name="ExclamationCircleIcon" size={16} variant="solid" />
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>
                  
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
                      Subject <span className="text-error">*</span>
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
                      Message <span className="text-error">*</span>
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
                        <Icon
                          name="ArrowPathIcon"
                          size={20}
                          variant="outline"
                          className="animate-spin"
                        />
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
                      <Icon
                        name="EnvelopeIcon"
                        size={20}
                        variant="outline"
                        className="text-primary mt-1"
                      />
                      <div>
                        <p className="text-sm font-medium text-foreground">Email</p>
                        <p className="text-sm text-muted-foreground">support@cktutas.edu.gh</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Icon
                        name="PhoneIcon"
                        size={20}
                        variant="outline"
                        className="text-primary mt-1"
                      />
                      <div>
                        <p className="text-sm font-medium text-foreground">Phone</p>
                        <p className="text-sm text-muted-foreground">+233 30 123 4567</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Icon
                        name="ClockIcon"
                        size={20}
                        variant="outline"
                        className="text-primary mt-1"
                      />
                      <div>
                        <p className="text-sm font-medium text-foreground">Support Hours</p>
                        <p className="text-sm text-muted-foreground">Mon-Fri: 8AM - 5PM GMT</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-primary/10 border border-primary/20 rounded-lg p-6">
                  <div className="flex items-start gap-3">
                    <Icon
                      name="InformationCircleIcon"
                      size={24}
                      variant="outline"
                      className="text-primary"
                    />
                    <div>
                      <h3 className="font-medium text-foreground mb-2">Quick Tip</h3>
                      <p className="text-sm text-muted-foreground">
                        For faster resolution, include your student ID and any relevant screenshots
                        or error messages.
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
                Support Ticket Submitted Successfully
              </h2>
              <div className="inline-block bg-primary/10 border border-primary/20 rounded-lg px-6 py-3 mb-4">
                <p className="text-sm text-muted-foreground mb-1">Your Ticket Number</p>
                <p className="text-2xl font-heading font-bold text-primary">
                  {formData.subject}
                </p>
              </div>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Thank you for contacting us. Our support team has been notified and will review your ticket. 
                You will receive a response via email within 24 hours.
              </p>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6 max-w-md mx-auto">
                <div className="flex items-start gap-3 text-left">
                  <Icon
                    name="InformationCircleIcon"
                    size={20}
                    variant="outline"
                    className="text-primary flex-shrink-0 mt-0.5"
                  />
                  <div className="text-sm">
                    <p className="font-medium text-foreground mb-1">What happens next?</p>
                    <ul className="text-muted-foreground space-y-1">
                      <li>• Admin team has been notified via email</li>
                      <li>• Your ticket is now in the support queue</li>
                      <li>• You'll receive updates via email</li>
                      <li>• Save your ticket number for reference</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => {
                    setIsSuccess(false);
                    setFormData({
                      name: '',
                      email: '',
                      subject: '',
                      category: 'general',
                      priority: 'medium',
                      message: '',
                    });
                  }}
                  className="px-6 py-3 bg-muted text-foreground rounded-md font-medium hover:bg-muted/80 transition-all duration-250"
                >
                  Submit Another Ticket
                </button>
                <button
                  onClick={() => router.push('/login')}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-all duration-250 ease-smooth"
                >
                  Back to Login
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
