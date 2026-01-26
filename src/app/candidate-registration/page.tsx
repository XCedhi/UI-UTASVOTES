import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import CandidateRegistrationInteractive from './components/CandidateRegistrationInteractive';
import ApplicationGuidelines from './components/ApplicationGuidelines';
import ProtectedRoute from '@/components/common/ProtectedRoute';

export const metadata: Metadata = {
  title: 'Candidate Registration - UTASVotes',
  description:
    'Apply for electoral positions through our comprehensive candidate registration system with constitutional requirement verification, document submission, and secure payment processing.',
};

export default function CandidateRegistrationPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header
          userRole="student"
          userName="John Mensah"
          userAvatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop"
          notificationCount={3}
          electionStatus={{
            isActive: true,
            name: 'Student Council 2026',
            endTime: '2026-02-15T23:59:59',
          }}
        />

        <main className="pt-24 pb-16 px-4">
          <div className="max-w-7xl mx-auto mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2L4 6V12C4 16.52 7.02 20.52 12 22C16.98 20.52 20 16.52 20 12V6L12 2Z"
                    fill="var(--color-primary)"
                  />
                  <path
                    d="M10 14L7 11L8.41 9.59L10 11.17L15.59 5.58L17 7L10 14Z"
                    fill="var(--color-primary-foreground)"
                  />
                </svg>
              </div>
              <div>
                <h1 className="font-heading font-bold text-3xl text-foreground">
                  Candidate Registration
                </h1>
                <p className="text-muted-foreground mt-1">
                  Apply for electoral positions and join the democratic process
                </p>
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-md p-4">
              <div className="flex items-start gap-3">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="flex-shrink-0 mt-0.5"
                >
                  <path
                    d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM11 15H9V13H11V15ZM11 11H9V5H11V11Z"
                    fill="var(--color-primary)"
                  />
                </svg>
                <div>
                  <p className="text-sm text-foreground font-medium">Application Deadline</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Submit your application before{' '}
                    <span className="font-medium text-primary">25th January 2026, 11:59 PM</span>.
                    Late applications will not be accepted.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <CandidateRegistrationInteractive />
            </div>

            <div>
              <ApplicationGuidelines
                deadline="2026-01-25T23:59:59"
                supportEmail="electoral.commission@cktutas.edu.gh"
                supportPhone="+233 24 123 4567"
              />
            </div>
          </div>
        </main>

        <footer className="bg-card border-t border-border py-8 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} University of Technical and Applied Sciences. All rights
              reserved.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              UTASVotes Electoral System - Secure, Transparent, Democratic
            </p>
          </div>
        </footer>
      </div>
    </ProtectedRoute>
  );
}
