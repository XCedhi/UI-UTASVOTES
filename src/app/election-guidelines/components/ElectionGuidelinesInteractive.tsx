'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/common/Header';
import Icon from '@/components/ui/AppIcon';

const ElectionGuidelinesInteractive = () => {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const sections = [
    { id: 'overview', label: 'Overview', icon: 'InformationCircleIcon' },
    { id: 'eligibility', label: 'Eligibility', icon: 'UserGroupIcon' },
    { id: 'voting', label: 'Voting Process', icon: 'CheckBadgeIcon' },
    { id: 'candidates', label: 'For Candidates', icon: 'DocumentTextIcon' },
    { id: 'conduct', label: 'Code of Conduct', icon: 'ShieldCheckIcon' },
    { id: 'faq', label: 'FAQ', icon: 'QuestionMarkCircleIcon' },
  ];

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background">
        <Header userRole="student" userName="Loading..." notificationCount={0} />
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
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-heading font-bold text-3xl text-foreground mb-2">
                Election Guidelines
              </h1>
              <p className="text-muted-foreground">
                Official rules and regulations for UTAS student elections
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

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-lg p-4 sticky top-24">
                <nav className="space-y-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-left transition-all duration-250 ${
                        activeSection === section.id
                          ? 'bg-primary text-primary-foreground'
                          : 'text-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon name={section.icon as any} size={20} variant="outline" />
                      <span className="font-medium">{section.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-3">
              <div className="bg-card border border-border rounded-lg p-8 space-y-8">
                {activeSection === 'overview' && (
                  <div>
                    <h2 className="font-heading font-bold text-2xl text-foreground mb-4">
                      Overview
                    </h2>
                    <div className="prose prose-slate max-w-none">
                      <p className="text-muted-foreground mb-4">
                        The UTASVotes electoral system is designed to facilitate free, fair, and
                        transparent elections for student leadership positions at the University of
                        Technical and Applied Sciences.
                      </p>
                      <h3 className="font-heading font-semibold text-lg text-foreground mt-6 mb-3">
                        Key Principles
                      </h3>
                      <ul className="space-y-2 text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <Icon
                            name="CheckCircleIcon"
                            size={20}
                            variant="solid"
                            className="text-success mt-0.5"
                          />
                          <span>One student, one vote per position</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Icon
                            name="CheckCircleIcon"
                            size={20}
                            variant="solid"
                            className="text-success mt-0.5"
                          />
                          <span>Secret ballot to ensure voter privacy</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Icon
                            name="CheckCircleIcon"
                            size={20}
                            variant="solid"
                            className="text-success mt-0.5"
                          />
                          <span>Transparent counting and result publication</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Icon
                            name="CheckCircleIcon"
                            size={20}
                            variant="solid"
                            className="text-success mt-0.5"
                          />
                          <span>Equal opportunity for all eligible candidates</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}

                {activeSection === 'eligibility' && (
                  <div>
                    <h2 className="font-heading font-bold text-2xl text-foreground mb-4">
                      Voter Eligibility
                    </h2>
                    <div className="space-y-4">
                      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                        <h3 className="font-semibold text-foreground mb-2">Who Can Vote?</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li>• All registered UTAS students with valid student ID</li>
                          <li>• Must have active institutional email (@cktutas.edu.gh)</li>
                          <li>• Must be in good academic standing</li>
                          <li>• No disciplinary sanctions at time of voting</li>
                        </ul>
                      </div>
                      <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
                        <h3 className="font-semibold text-foreground mb-2">
                          Candidate Eligibility
                        </h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li>• Minimum CGPA of 2.5 (varies by position)</li>
                          <li>• Must be enrolled for at least one academic year</li>
                          <li>• Clean disciplinary record</li>
                          <li>• Payment of application fee</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'voting' && (
                  <div>
                    <h2 className="font-heading font-bold text-2xl text-foreground mb-4">
                      Voting Process
                    </h2>
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-heading font-semibold text-lg text-foreground mb-3">
                          Step-by-Step Guide
                        </h3>
                        <div className="space-y-4">
                          {[
                            {
                              step: 1,
                              title: 'Login',
                              desc: 'Access the system with your institutional email',
                            },
                            {
                              step: 2,
                              title: 'Review Candidates',
                              desc: 'Read manifestos and campaign materials',
                            },
                            {
                              step: 3,
                              title: 'Cast Your Vote',
                              desc: 'Select your preferred candidate for each position',
                            },
                            {
                              step: 4,
                              title: 'Review Ballot',
                              desc: 'Confirm your selections before submission',
                            },
                            {
                              step: 5,
                              title: 'Submit',
                              desc: 'Finalize your vote and receive confirmation',
                            },
                          ].map((item) => (
                            <div key={item.step} className="flex gap-4">
                              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                                {item.step}
                              </div>
                              <div>
                                <h4 className="font-semibold text-foreground mb-1">{item.title}</h4>
                                <p className="text-sm text-muted-foreground">{item.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'candidates' && (
                  <div>
                    <h2 className="font-heading font-bold text-2xl text-foreground mb-4">
                      For Candidates
                    </h2>
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-heading font-semibold text-lg text-foreground mb-3">
                          Application Process
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          Candidates must complete the registration process through the candidate
                          portal.
                        </p>
                        <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Icon
                              name="DocumentTextIcon"
                              size={16}
                              variant="outline"
                              className="text-primary"
                            />
                            <span className="text-foreground">Submit application form</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Icon
                              name="CameraIcon"
                              size={16}
                              variant="outline"
                              className="text-primary"
                            />
                            <span className="text-foreground">Upload profile photo</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Icon
                              name="DocumentCheckIcon"
                              size={16}
                              variant="outline"
                              className="text-primary"
                            />
                            <span className="text-foreground">Provide manifesto</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Icon
                              name="CreditCardIcon"
                              size={16}
                              variant="outline"
                              className="text-primary"
                            />
                            <span className="text-foreground">Pay application fee</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'conduct' && (
                  <div>
                    <h2 className="font-heading font-bold text-2xl text-foreground mb-4">
                      Code of Conduct
                    </h2>
                    <div className="space-y-4">
                      <div className="bg-error/10 border border-error/20 rounded-lg p-4">
                        <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                          <Icon
                            name="XCircleIcon"
                            size={20}
                            variant="solid"
                            className="text-error"
                          />
                          Prohibited Activities
                        </h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li>• Vote buying or selling</li>
                          <li>• Intimidation or coercion of voters</li>
                          <li>• Spreading false information</li>
                          <li>• Tampering with the electoral system</li>
                          <li>• Campaigning on election day</li>
                        </ul>
                      </div>
                      <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                        <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                          <Icon
                            name="CheckCircleIcon"
                            size={20}
                            variant="solid"
                            className="text-success"
                          />
                          Expected Behavior
                        </h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li>• Respect for all candidates and voters</li>
                          <li>• Honest and truthful campaigning</li>
                          <li>• Adherence to campaign spending limits</li>
                          <li>• Acceptance of election results</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'faq' && (
                  <div>
                    <h2 className="font-heading font-bold text-2xl text-foreground mb-4">
                      Frequently Asked Questions
                    </h2>
                    <div className="space-y-4">
                      {[
                        {
                          q: 'Can I change my vote after submission?',
                          a: 'No, votes are final once submitted. Please review carefully before confirming.',
                        },
                        {
                          q: 'What if I forget my password?',
                          a: 'Use the "Forgot Password" link on the login page to reset your password.',
                        },
                        {
                          q: 'How do I know my vote was counted?',
                          a: 'You will receive a confirmation receipt with a unique transaction ID.',
                        },
                        {
                          q: 'When will results be announced?',
                          a: 'Results are published within 24 hours after voting closes.',
                        },
                      ].map((faq, index) => (
                        <div key={index} className="bg-muted/30 rounded-lg p-4">
                          <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
                          <p className="text-sm text-muted-foreground">{faq.a}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ElectionGuidelinesInteractive;
