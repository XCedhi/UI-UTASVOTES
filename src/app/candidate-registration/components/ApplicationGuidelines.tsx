import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface ApplicationGuidelinesProps {
  deadline: string;
  supportEmail: string;
  supportPhone: string;
}

const ApplicationGuidelines = ({
  deadline,
  supportEmail,
  supportPhone,
}: ApplicationGuidelinesProps) => {
  const guidelines = [
    {
      icon: 'DocumentTextIcon',
      title: 'Eligibility Requirements',
      items: [
        'Must be a registered UTAS student',
        'Minimum CGPA of 2.5 required',
        'No active disciplinary actions',
        'Valid student ID and institutional email',
      ],
    },
    {
      icon: 'PhotoIcon',
      title: 'Required Documents',
      items: [
        'Professional passport photograph (JPEG/PNG, max 2MB)',
        'Detailed manifesto document (PDF, max 5MB)',
        'Student ID card copy',
        'Academic transcript (latest semester)',
      ],
    },
    {
      icon: 'CurrencyDollarIcon',
      title: 'Application Fees',
      items: [
        'President: GHS 150',
        'Vice President: GHS 120',
        'Secretary: GHS 100',
        'Other positions: GHS 80',
      ],
    },
    {
      icon: 'ClockIcon',
      title: 'Important Dates',
      items: [
        `Application deadline: ${new Date(deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`,
        'Verification period: 3-5 business days',
        'Campaign period: 2 weeks after approval',
        'Election date: To be announced',
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-md p-6">
        <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
          Application Guidelines
        </h3>

        <div className="space-y-6">
          {guidelines.map((section, index) => (
            <div key={index}>
              <div className="flex items-center gap-2 mb-3">
                <Icon
                  name={section.icon as any}
                  size={20}
                  variant="outline"
                  className="text-primary"
                />
                <h4 className="font-medium text-foreground">{section.title}</h4>
              </div>
              <ul className="space-y-2 ml-7">
                {section.items.map((item, itemIndex) => (
                  <li
                    key={itemIndex}
                    className="text-sm text-muted-foreground flex items-start gap-2"
                  >
                    <span className="text-primary mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-accent/10 border border-accent/20 rounded-md p-6">
        <div className="flex items-start gap-3">
          <Icon
            name="InformationCircleIcon"
            size={24}
            variant="solid"
            className="text-accent flex-shrink-0"
          />
          <div>
            <h4 className="font-medium text-foreground mb-2">Need Help?</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Contact the Electoral Commission for assistance with your application.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Icon
                  name="EnvelopeIcon"
                  size={16}
                  variant="outline"
                  className="text-muted-foreground"
                />
                <a href={`mailto:${supportEmail}`} className="text-sm text-primary hover:underline">
                  {supportEmail}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Icon
                  name="PhoneIcon"
                  size={16}
                  variant="outline"
                  className="text-muted-foreground"
                />
                <a href={`tel:${supportPhone}`} className="text-sm text-primary hover:underline">
                  {supportPhone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationGuidelines;
