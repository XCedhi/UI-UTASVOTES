import React from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

interface ApplicationReviewProps {
  formData: {
    fullName: string;
    studentId: string;
    email: string;
    phone: string;
    department: string;
    level: string;
    cgpa: string;
  };
  selectedPosition: string;
  positionTitle: string;
  applicationFee: number;
  uploads: {
    photo: { name: string; preview?: string } | null;
    manifesto: { name: string } | null;
    studentId: { name: string } | null;
    transcript: { name: string } | null;
  };
  transactionId: string;
}

const ApplicationReview = ({
  formData,
  selectedPosition,
  positionTitle,
  applicationFee,
  uploads,
  transactionId,
}: ApplicationReviewProps) => {
  return (
    <div className="space-y-6">
      <div className="bg-success/10 border border-success/20 rounded-md p-6">
        <div className="flex items-start gap-4">
          <Icon
            name="CheckBadgeIcon"
            size={32}
            variant="solid"
            className="text-success flex-shrink-0"
          />
          <div>
            <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
              Application Summary
            </h3>
            <p className="text-sm text-muted-foreground">
              Please review all information carefully before submitting your application. Once
              submitted, changes cannot be made.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-md p-6">
        <h4 className="font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
          <Icon name="UserIcon" size={20} variant="outline" />
          Personal Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Full Name</p>
            <p className="text-sm font-medium text-foreground">{formData.fullName}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Student ID</p>
            <p className="text-sm font-medium text-foreground">{formData.studentId}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="text-sm font-medium text-foreground">{formData.email}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Phone</p>
            <p className="text-sm font-medium text-foreground">{formData.phone}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Department</p>
            <p className="text-sm font-medium text-foreground">{formData.department}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Level</p>
            <p className="text-sm font-medium text-foreground">Level {formData.level}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">CGPA</p>
            <p className="text-sm font-medium text-foreground">{formData.cgpa}</p>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-md p-6">
        <h4 className="font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
          <Icon name="BriefcaseIcon" size={20} variant="outline" />
          Position Details
        </h4>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Applied Position</p>
            <p className="text-lg font-heading font-semibold text-foreground">{positionTitle}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Application Fee</p>
            <p className="text-lg font-heading font-semibold text-accent">GHS {applicationFee}</p>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-md p-6">
        <h4 className="font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
          <Icon name="DocumentIcon" size={20} variant="outline" />
          Uploaded Documents
        </h4>
        <div className="space-y-3">
          {uploads.photo && (
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-md">
              {uploads.photo.preview && (
                <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                  <AppImage
                    src={uploads.photo.preview}
                    alt="Candidate passport photograph"
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">Passport Photograph</p>
                <p className="text-xs text-muted-foreground truncate">{uploads.photo.name}</p>
              </div>
              <Icon
                name="CheckCircleIcon"
                size={20}
                variant="solid"
                className="text-success flex-shrink-0"
              />
            </div>
          )}
          {uploads.manifesto && (
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-md">
              <Icon
                name="DocumentTextIcon"
                size={24}
                variant="outline"
                className="text-primary flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">Campaign Manifesto</p>
                <p className="text-xs text-muted-foreground truncate">{uploads.manifesto.name}</p>
              </div>
              <Icon
                name="CheckCircleIcon"
                size={20}
                variant="solid"
                className="text-success flex-shrink-0"
              />
            </div>
          )}
          {uploads.studentId && (
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-md">
              <Icon
                name="IdentificationIcon"
                size={24}
                variant="outline"
                className="text-primary flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">Student ID Card</p>
                <p className="text-xs text-muted-foreground truncate">{uploads.studentId.name}</p>
              </div>
              <Icon
                name="CheckCircleIcon"
                size={20}
                variant="solid"
                className="text-success flex-shrink-0"
              />
            </div>
          )}
          {uploads.transcript && (
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-md">
              <Icon
                name="AcademicCapIcon"
                size={24}
                variant="outline"
                className="text-primary flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">Academic Transcript</p>
                <p className="text-xs text-muted-foreground truncate">{uploads.transcript.name}</p>
              </div>
              <Icon
                name="CheckCircleIcon"
                size={20}
                variant="solid"
                className="text-success flex-shrink-0"
              />
            </div>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-md p-6">
        <h4 className="font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
          <Icon name="CreditCardIcon" size={20} variant="outline" />
          Payment Confirmation
        </h4>
        <div className="flex items-center justify-between p-4 bg-success/10 border border-success/20 rounded-md">
          <div>
            <p className="text-sm font-medium text-success">Payment Successful</p>
            <p className="text-xs text-muted-foreground mt-1">Transaction ID: {transactionId}</p>
          </div>
          <Icon name="CheckBadgeIcon" size={32} variant="solid" className="text-success" />
        </div>
      </div>

      <div className="bg-warning/10 border border-warning/20 rounded-md p-4">
        <div className="flex items-start gap-3">
          <Icon
            name="ExclamationTriangleIcon"
            size={20}
            variant="solid"
            className="text-warning flex-shrink-0 mt-0.5"
          />
          <div>
            <p className="text-sm text-foreground font-medium">Important Notice</p>
            <p className="text-xs text-muted-foreground mt-1">
              By submitting this application, you confirm that all information provided is accurate
              and complete. The Electoral Commission will review your application within 3-5
              business days. You will receive an email notification regarding your application
              status.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationReview;
