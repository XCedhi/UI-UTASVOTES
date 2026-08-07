# Candidate Registration - Election-Based Position Selection

## Overview
Updated the candidate registration flow to allow students to select elections first, then positions within those elections. This provides better clarity and ensures students only see elections relevant to their department.

## Changes Made

### 1. Updated PositionSelectionForm Component
**File**: `src/app/candidate-registration/components/PositionSelectionForm.tsx`

**New Features**:
- **Two-step selection process**:
  - Step 1: Select Election
  - Step 2: Select Position (within selected election)
- **Department-based filtering**:
  - University-wide elections: Visible to all students
  - Departmental elections: Only visible to students in that department
- **Enhanced election display**:
  - Election name, type, and status badges
  - Department label for departmental elections
  - Voting date range
  - Number of available positions

**New Props**:
```typescript
interface PositionSelectionFormProps {
  selectedPosition: string;
  positions: Position[];
  elections: Election[];           // NEW: List of elections with positions
  studentDepartment: string;       // NEW: Student's department for filtering
  errors: Record<string, string>;
  onChange: (positionId: string, electionId: string) => void; // UPDATED: Now accepts electionId
}
```

### 2. Updated CandidateRegistrationInteractive Component
**File**: `src/app/candidate-registration/components/CandidateRegistrationInteractive.tsx`

**New State Variables**:
```typescript
const [elections, setElections] = useState<any[]>([]);
const [selectedElectionId, setSelectedElectionId] = useState('');
```

**Updated Data Loading**:
- Fetches elections with status 'active' or 'upcoming'
- Fetches all positions for those elections
- Groups positions by election
- Creates election objects with nested positions array

**Updated Handler**:
```typescript
const handlePositionChange = (positionId: string, electionId: string) => {
  setSelectedPosition(positionId);
  setSelectedElectionId(electionId);
  // Clear errors for both position and election
}
```

**Updated Submission**:
- Uses `selectedElectionId` for the application
- Falls back to `selectedPositionData.electionId` for backward compatibility

## User Experience Flow

### Before:
1. Student sees flat list of all positions
2. No context about which election each position belongs to
3. Confusion when multiple elections have similar positions (e.g., "President")

### After:
1. **Step 1**: Student sees list of eligible elections
   - University-wide elections (all students)
   - Departmental elections (only their department)
   - Each election shows: name, type, department, status, dates, position count
2. **Step 2**: After selecting election, student sees positions for that election only
   - Clear context: "You are applying for [Position] in [Election]"
   - Application fee displayed per position
   - Requirements listed

## Department Filtering Logic

```typescript
const eligibleElections = elections.filter((election) => {
  if (election.election_type === 'university-wide') {
    return true; // All students can see
  }
  if (election.election_type === 'departmental') {
    return election.department === studentDepartment; // Only matching department
  }
  return false;
});
```

## Example Scenarios

### Scenario 1: Computer Science Student
- **Sees**:
  - SRC General Elections 2026 (University-Wide)
  - School of Computing Elections 2026 (Departmental - matches their department)
- **Does NOT see**:
  - School of Agriculture Elections 2026 (Different department)

### Scenario 2: University-Wide Election
- **Election**: SRC General Elections 2026
- **Positions**: President, Vice President, General Secretary, etc.
- **Eligible**: All students regardless of department

### Scenario 3: Departmental Election
- **Election**: School of Computing Elections 2026
- **Positions**: School President, Secretary, etc.
- **Eligible**: Only students in School of Computing departments

## Visual Improvements

1. **Election Cards**:
   - Status badge (Active, Upcoming, Completed)
   - Type badge (University-Wide, Departmental)
   - Department badge (for departmental elections)
   - Date range with calendar icons
   - Position count display

2. **Position Cards**:
   - Only shown after election selection
   - Clear hierarchy: Election → Position
   - Application fee prominently displayed
   - Requirements checklist

3. **Confirmation Message**:
   - Shows both selected position and election
   - Example: "You are applying for President in SRC General Elections 2026"

## Testing Instructions

1. **Clear cache and restart**:
   ```bash
   # Delete .next folder
   Remove-Item -Recurse -Force .next
   
   # Restart dev server
   npm run dev
   ```

2. **Test as student**:
   - Login with student credentials
   - Navigate to Candidate Registration
   - Fill personal information (note your department)
   - Proceed to Position Selection
   - Verify you only see elections for your department + university-wide
   - Select an election
   - Verify positions appear for that election only
   - Complete application

3. **Test department filtering**:
   - Create elections for different departments
   - Login as students from different departments
   - Verify each student only sees their department's elections

## Database Requirements

No schema changes required. The system uses existing tables:
- `elections` table with `election_type` and `department` columns
- `positions` table with `election_id` foreign key

## Benefits

1. **Clarity**: Students know exactly which election they're applying for
2. **Organization**: Positions grouped by election prevent confusion
3. **Relevance**: Department filtering shows only applicable elections
4. **Scalability**: Supports multiple concurrent elections
5. **User Experience**: Two-step process is intuitive and guided

## Future Enhancements

1. Add election descriptions/guidelines
2. Show candidate count per position
3. Display application deadline per election
4. Add "Apply to Multiple Positions" feature
5. Show student's previous applications

---

**Status**: ✅ Complete
**Date**: 2026-05-20
**Files Modified**: 2
- `src/app/candidate-registration/components/PositionSelectionForm.tsx`
- `src/app/candidate-registration/components/CandidateRegistrationInteractive.tsx`
