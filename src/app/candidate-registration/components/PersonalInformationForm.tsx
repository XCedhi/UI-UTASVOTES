'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface PersonalInformationFormProps {
  formData: {
    fullName: string;
    studentId: string;
    email: string;
    phone: string;
    department: string;
    level: string;
    cgpa: string;
  };
  errors: Record<string, string>;
  onChange: (field: string, value: string) => void;
}

const PersonalInformationForm = ({ formData, errors, onChange }: PersonalInformationFormProps) => {
  // UTAS Schools and Departments
  const departmentsBySchool = {
    'School of Environment and Life Sciences': [
      'Department of Environmental Science',
      'Department of Applied Biology',
    ],
    'School of Physical Sciences': [
      'Department of Applied Physics',
      'Department of Earth Science',
      'Department of Material Science',
      'Department of Geo-Informatics and Spatial Development',
    ],
    'School of Chemical and Biochemical Sciences': [
      'Department of Applied Chemistry',
      'Department of Biochemistry and Forensic Sciences',
      'Department of Pharmaceutical Technology',
      'Department of Industrial Chemistry & Laboratory Technology',
    ],
    'School of Mathematical Sciences': [
      'Department of Mathematics',
      'Department of Statistics & Actuarial Science',
      'Department of Industrial Mathematics',
      'Department of Biometry',
    ],
    'School of Computing and Information Sciences': [
      'Department of Computer Science',
      'Department of Information Systems and Technology',
      'Department of Business Computing',
      'Department of Cyber Security and Computer Engineering Technology',
    ],
    'School of Public Health': [
      'Department of Population, Family & Reproductive Health (PFR)',
      'Department of Epidemiology and Biostatistics (EPB)',
    ],
    'School of Science, Mathematics & Technology Education': [
      'Department of Mathematics & ICT Education',
      'Department of Basic Education',
      'Department of Science Education',
    ],
    'School of Medical Sciences': [
      'Department of Anaesthesia & Intensive Care',
      'Department of Clinical Microbiology & Immunology',
    ],
    'School of Nursing & Midwifery': [
      'Department of Maternal and Child Health Nursing',
      'Department of General and Preventive Health Nursing',
    ],
    'School of Agriculture': [
      'Department of Crop Science and Biotechnology',
      'Department of Fisheries and Aquaculture',
    ],
  };

  // Flatten all departments for the dropdown
  const allDepartments: string[] = [];
  Object.entries(departmentsBySchool).forEach(([school, depts]) => {
    allDepartments.push(school); // Add school as optgroup label
    depts.forEach(dept => allDepartments.push(dept));
  });

  const levels = ['100', '200', '300', '400'];

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-2">
          Full Name <span className="text-error">*</span>
        </label>
        <div className="relative">
          <Icon
            name="UserIcon"
            size={20}
            variant="outline"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            id="fullName"
            value={formData.fullName}
            onChange={(e) => onChange('fullName', e.target.value)}
            className={`w-full pl-10 pr-4 py-3 bg-background border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-250 ease-smooth ${
              errors.fullName ? 'border-error' : 'border-input'
            }`}
            placeholder="Enter your full name as per student records"
          />
        </div>
        {errors.fullName && <p className="text-sm text-error mt-1">{errors.fullName}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="studentId" className="block text-sm font-medium text-foreground mb-2">
            Student ID <span className="text-error">*</span>
          </label>
          <div className="relative">
            <Icon
              name="IdentificationIcon"
              size={20}
              variant="outline"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              id="studentId"
              value={formData.studentId}
              onChange={(e) => onChange('studentId', e.target.value)}
              className={`w-full pl-10 pr-4 py-3 bg-background border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-250 ease-smooth ${
                errors.studentId ? 'border-error' : 'border-input'
              }`}
              placeholder="e.g., UTAS/2023/12345"
            />
          </div>
          {errors.studentId && <p className="text-sm text-error mt-1">{errors.studentId}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
            Institutional Email <span className="text-error">*</span>
          </label>
          <div className="relative">
            <Icon
              name="EnvelopeIcon"
              size={20}
              variant="outline"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => onChange('email', e.target.value)}
              className={`w-full pl-10 pr-4 py-3 bg-background border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-250 ease-smooth ${
                errors.email ? 'border-error' : 'border-input'
              }`}
              placeholder="your.name@cktutas.edu.gh"
            />
          </div>
          {errors.email && <p className="text-sm text-error mt-1">{errors.email}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
            Phone Number <span className="text-error">*</span>
          </label>
          <div className="relative">
            <Icon
              name="PhoneIcon"
              size={20}
              variant="outline"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => onChange('phone', e.target.value)}
              className={`w-full pl-10 pr-4 py-3 bg-background border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-250 ease-smooth ${
                errors.phone ? 'border-error' : 'border-input'
              }`}
              placeholder="+233 XX XXX XXXX"
            />
          </div>
          {errors.phone && <p className="text-sm text-error mt-1">{errors.phone}</p>}
        </div>

        <div>
          <label htmlFor="department" className="block text-sm font-medium text-foreground mb-2">
            Department <span className="text-error">*</span>
          </label>
          <div className="relative">
            <Icon
              name="AcademicCapIcon"
              size={20}
              variant="outline"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <select
              id="department"
              value={formData.department}
              onChange={(e) => onChange('department', e.target.value)}
              className={`w-full pl-10 pr-4 py-3 bg-background border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-250 ease-smooth appearance-none ${
                errors.department ? 'border-error' : 'border-input'
              }`}
            >
              <option value="">Select your department</option>
              {Object.entries(departmentsBySchool).map(([school, depts]) => (
                <optgroup key={school} label={school}>
                  {depts.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <Icon
              name="ChevronDownIcon"
              size={20}
              variant="outline"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
          </div>
          {errors.department && <p className="text-sm text-error mt-1">{errors.department}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="level" className="block text-sm font-medium text-foreground mb-2">
            Current Level <span className="text-error">*</span>
          </label>
          <div className="relative">
            <Icon
              name="BookOpenIcon"
              size={20}
              variant="outline"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <select
              id="level"
              value={formData.level}
              onChange={(e) => onChange('level', e.target.value)}
              className={`w-full pl-10 pr-4 py-3 bg-background border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-250 ease-smooth appearance-none ${
                errors.level ? 'border-error' : 'border-input'
              }`}
            >
              <option value="">Select your level</option>
              {levels.map((level) => (
                <option key={level} value={level}>
                  Level {level}
                </option>
              ))}
            </select>
            <Icon
              name="ChevronDownIcon"
              size={20}
              variant="outline"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
          </div>
          {errors.level && <p className="text-sm text-error mt-1">{errors.level}</p>}
        </div>

        <div>
          <label htmlFor="cgpa" className="block text-sm font-medium text-foreground mb-2">
            Current CGPA <span className="text-error">*</span>
          </label>
          <div className="relative">
            <Icon
              name="ChartBarIcon"
              size={20}
              variant="outline"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              id="cgpa"
              value={formData.cgpa}
              onChange={(e) => onChange('cgpa', e.target.value)}
              className={`w-full pl-10 pr-4 py-3 bg-background border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-250 ease-smooth ${
                errors.cgpa ? 'border-error' : 'border-input'
              }`}
              placeholder="e.g., 3.25"
            />
          </div>
          {errors.cgpa && <p className="text-sm text-error mt-1">{errors.cgpa}</p>}
          <p className="text-xs text-muted-foreground mt-1">Minimum CGPA of 2.5 required</p>
        </div>
      </div>
    </div>
  );
};

export default PersonalInformationForm;
