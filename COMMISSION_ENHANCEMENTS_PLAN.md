# Electoral Commission Panel Enhancements - Implementation Plan

## Overview
Comprehensive enhancements to the Electoral Commission Panel with improved navigation, new features, and better user experience.

## 1. Header Navigation Changes ✅

### Completed
- Changed "Manage Elections" button to "Import Data" for Commission users
- Routes to `/admin-system-control/users/import` for student data import
- Admin still has "Manage Elections" button

## 2. Electoral Commission Panel Tabs

### Current Tabs
- Applications
- Elections  
- Fees
- Reports

### Required Enhancements

#### A. Applications Tab
**Features Needed:**
- View all candidate applications
- Click "View Details" to see full application
- Approve/Reject applications
- Verify documents
- Check payment status
- Filter by position, status, department

**New Page:** `/electoral-commission-panel/applications/[id]`
- Full application details
- Document viewer
- Approval workflow
- Comments/notes section

#### B. Elections Tab
**Features Needed:**
- **Create Election** button → New election creation page
- **View Analytics** → Election analytics dashboard
- **Manage Elections** → Edit existing elections
- List of all elections (active, scheduled, completed)

**New Pages:**
- `/electoral-commission-panel/elections/create` - Create new election
- `/electoral-commission-panel/elections/[id]/analytics` - Election analytics
- `/electoral-commission-panel/elections/[id]/manage` - Manage election

#### C. Fees Tab
**Features Needed:**
- Add/Edit position fees
- Set application fees by position
- Fee history
- Payment tracking
- Bulk fee updates

**Components:**
- Position fee entry form
- Fee structure table
- Edit/Delete actions
- Fee history log

**Data Structure:**
```typescript
interface PositionFee {
  id: string;
  position: string;
  amount: number; // in Ghana Cedis
  currency: 'GHS';
  effectiveDate: string;
  createdBy: string;
  lastUpdated: string;
}
```

#### D. Reports Tab
**Features Needed:**
- Report type selection
- Date range picker
- Generate report button
- Recent reports list
- Download options (PDF, CSV, Excel)

**Report Types:**
1. **Election Summary Report**
   - Total votes cast
   - Turnout percentage
   - Winner by position
   - Vote distribution

2. **Candidate Report**
   - Total applications
   - Approved/Rejected/Pending
   - By department
   - By position

3. **Financial Report**
   - Total fees collected
   - Payment status
   - Outstanding payments
   - Revenue by position

4. **Voter Report**
   - Total registered voters
   - Voted vs Not voted
   - By department
   - By level

5. **Activity Report**
   - Commission actions
   - System events
   - Audit trail

## 3. Profile Picture Upload & Cropping

### Requirements
- Upload profile picture
- Image cropping tool
- Preview before save
- Supported formats: JPG, PNG, WebP
- Max file size: 5MB
- Circular crop for profile
- Save to storage

### Implementation
**Library:** `react-easy-crop` or `react-image-crop`

**Features:**
- Drag & drop upload
- Click to browse
- Zoom in/out
- Rotate image
- Crop to circle
- Preview
- Save/Cancel

**Storage:**
- Supabase Storage bucket
- Public URL generation
- Thumbnail generation

## 4. Dark Mode - Navy Blue Theme

### Current Theme
- Light mode: White/Gray backgrounds
- Dark mode: Dark gray/black backgrounds

### New Dark Mode Theme
**Navy Blue Palette:**
- Primary Background: `#0A1929` (Deep Navy)
- Secondary Background: `#132F4C` (Navy Blue)
- Card Background: `#1A2027` (Dark Navy)
- Border: `#2D3843` (Navy Gray)
- Text Primary: `#E7EBF0` (Light Gray)
- Text Secondary: `#B2BAC2` (Medium Gray)
- Accent: `#3399FF` (Bright Blue)
- Success: `#66BB6A` (Green)
- Warning: `#FFA726` (Orange)
- Error: `#F44336` (Red)

### Implementation
- Update Tailwind config with navy theme
- Add theme toggle in settings
- Persist theme preference
- Smooth transition between themes

## 5. File Structure

```
src/
├── app/
│   ├── electoral-commission-panel/
│   │   ├── applications/
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── components/
│   │   │           └── ApplicationDetailsInteractive.tsx
│   │   ├── elections/
│   │   │   ├── create/
│   │   │   │   ├── page.tsx
│   │   │   │   └── components/
│   │   │   │       └── CreateElectionInteractive.tsx
│   │   │   └── [id]/
│   │   │       ├── analytics/
│   │   │       │   ├── page.tsx
│   │   │       │   └── components/
│   │   │       │       └── ElectionAnalyticsInteractive.tsx
│   │   │       └── manage/
│   │   │           ├── page.tsx
│   │   │           └── components/
│   │   │               └── ManageElectionInteractive.tsx
│   │   └── components/
│   │       ├── FeeManagementTab.tsx
│   │       ├── ReportsTab.tsx
│   │       └── ProfilePictureUpload.tsx
│   └── commission-profile/
│       └── components/
│           └── ProfilePictureUpload.tsx
└── lib/
    ├── image-utils.ts
    └── report-generator.ts
```

## 6. Implementation Priority

### Phase 1: Critical Features (Immediate)
1. ✅ Header navigation update
2. Application details page
3. Create election page
4. Fee management interface
5. Basic reports generation

### Phase 2: Enhanced Features (Next)
6. Election analytics dashboard
7. Profile picture upload & crop
8. Advanced report types
9. Navy blue dark mode

### Phase 3: Polish (Final)
10. Report download functionality
11. Bulk operations
12. Advanced filters
13. Performance optimization

## 7. API Endpoints Needed

### Applications
- `GET /api/applications` - List all applications
- `GET /api/applications/[id]` - Get application details
- `PUT /api/applications/[id]/approve` - Approve application
- `PUT /api/applications/[id]/reject` - Reject application

### Elections
- `POST /api/elections` - Create election
- `GET /api/elections/[id]` - Get election details
- `PUT /api/elections/[id]` - Update election
- `GET /api/elections/[id]/analytics` - Get analytics

### Fees
- `GET /api/fees` - List all position fees
- `POST /api/fees` - Create position fee
- `PUT /api/fees/[id]` - Update position fee
- `DELETE /api/fees/[id]` - Delete position fee

### Reports
- `POST /api/reports/generate` - Generate report
- `GET /api/reports` - List recent reports
- `GET /api/reports/[id]/download` - Download report

### Profile
- `POST /api/profile/upload-picture` - Upload profile picture
- `PUT /api/profile/picture` - Update profile picture

## 8. Database Schema Updates

```sql
-- Position Fees Table
CREATE TABLE position_fees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  position VARCHAR(100) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'GHS',
  effective_date TIMESTAMP NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Reports Table
CREATE TABLE generated_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  file_url TEXT,
  file_format VARCHAR(10),
  date_range_start TIMESTAMP,
  date_range_end TIMESTAMP,
  generated_by UUID REFERENCES users(id),
  generated_at TIMESTAMP DEFAULT NOW(),
  download_count INTEGER DEFAULT 0
);

-- Profile Pictures
ALTER TABLE users ADD COLUMN profile_picture_url TEXT;
ALTER TABLE users ADD COLUMN profile_picture_thumbnail_url TEXT;
```

## 9. Testing Checklist

### Applications
- [ ] View all applications
- [ ] Click "View Details" opens detail page
- [ ] Approve application workflow
- [ ] Reject application workflow
- [ ] Document verification
- [ ] Payment status check

### Elections
- [ ] Click "Create Election" opens form
- [ ] Fill and submit election form
- [ ] View analytics page
- [ ] Manage election page
- [ ] Edit election details

### Fees
- [ ] Add new position fee
- [ ] Edit existing fee
- [ ] Delete fee
- [ ] View fee history
- [ ] Fees reflect in application forms

### Reports
- [ ] Select report type
- [ ] Set date range
- [ ] Generate report
- [ ] View recent reports
- [ ] Download report (PDF/CSV)

### Profile Picture
- [ ] Upload image
- [ ] Crop image
- [ ] Preview cropped image
- [ ] Save profile picture
- [ ] Picture displays in header

### Dark Mode
- [ ] Toggle dark mode
- [ ] Navy blue theme applies
- [ ] All pages support dark mode
- [ ] Theme persists on refresh

## 10. Implementation Status

### ✅ Phase 1 Completed
1. ✅ Header navigation update - "Manage Elections" → "Import Data" for Commission
2. ✅ Application details page with approve/reject workflow
3. ✅ Create election page with 3-step wizard
4. ✅ Enhanced Reports Tab with generation and export
5. ✅ Election Analytics page with charts and insights
6. ✅ Manage Election page with control panel
7. ✅ Electoral Commission Panel routing updates

**Files Created:**
- `/electoral-commission-panel/applications/[id]/page.tsx`
- `/electoral-commission-panel/applications/[id]/components/ApplicationDetailsInteractive.tsx`
- `/electoral-commission-panel/elections/create/page.tsx`
- `/electoral-commission-panel/elections/create/components/CreateElectionInteractive.tsx`
- `/electoral-commission-panel/elections/[id]/analytics/page.tsx`
- `/electoral-commission-panel/elections/[id]/analytics/components/ElectionAnalyticsInteractive.tsx`
- `/electoral-commission-panel/elections/[id]/manage/page.tsx`
- `/electoral-commission-panel/elections/[id]/manage/components/ManageElectionInteractive.tsx`

**Files Updated:**
- `src/components/common/Header.tsx` - Commission navigation
- `src/app/electoral-commission-panel/components/ElectoralCommissionInteractive.tsx` - Enhanced reports, routing

### 📋 Phase 2 Pending
6. Profile picture upload & crop tool
7. Navy blue dark mode theme
8. Fee management enhancements (if needed)
9. Candidate management in Manage Election
10. Advanced filters and bulk operations

### 🎯 Next Steps
1. Implement Profile Picture Upload with cropping tool
2. Create Navy Blue Dark Mode theme
3. Add advanced filtering to applications
4. Implement bulk operations for candidates
5. Add report download functionality (PDF/CSV generation)

---

**Status**: Phase 1 Complete ✅ | Phase 2 Ready to Start
**Date**: January 25, 2026
