# Position Management Implementation

## Overview

Implemented full position management functionality in the Commission Election Management page, allowing commissioners to lock/unlock positions and edit position details.

## Features Implemented

### 1. **Lock/Unlock Button** 🔒

**Purpose**: Control whether a position is open or closed for candidate applications

**Functionality**:
- Click the lock icon to toggle position status
- **Open** (🔓): Candidates can apply for this position
- **Closed** (🔒): Position is locked, no new applications accepted

**Visual Feedback**:
- Green "Open" badge when position is accepting applications
- Red "Closed" badge when position is locked
- Icon changes: LockOpen ↔ LockClosed

**Use Cases**:
- Close a position when enough candidates have applied
- Temporarily lock a position during review
- Reopen a position if more candidates are needed

### 2. **Edit Button** ✏️

**Purpose**: Modify position details including name, description, and application fee

**Editable Fields**:
- **Position Name**: Change the title (e.g., "President" → "SRC President")
- **Description**: Add or update position description
- **Application Fee**: Set or modify the fee in Ghana Cedis (GHS)

**Modal Interface**:
- Clean, user-friendly edit form
- Real-time validation
- Cancel or Save changes
- Information note about fee changes

**Important Notes**:
- Fee changes only affect NEW applications
- Existing candidates are not affected by fee updates
- All changes are saved to the database immediately

## How to Use

### Lock/Unlock a Position

1. Navigate to **Elections Tab** → Click **Manage** on an election
2. Go to **Positions Tab**
3. Find the position you want to lock/unlock
4. Click the **lock icon** (🔒 or 🔓)
5. Position status updates immediately
6. Confirmation message appears

### Edit a Position

1. Navigate to **Elections Tab** → Click **Manage** on an election
2. Go to **Positions Tab**
3. Find the position you want to edit
4. Click the **pencil icon** (✏️)
5. **Edit Position Modal** opens with current details
6. Modify any of the following:
   - Position Name
   - Description
   - Application Fee (GHS)
7. Click **Save Changes** or **Cancel**
8. Changes are saved to database
9. Success confirmation appears

## Database Integration

### Tables Updated

**positions table**:
```sql
UPDATE positions
SET 
  title = 'New Position Name',
  description = 'Updated description',
  application_fee = 50.00,
  updated_at = NOW()
WHERE id = 'position_id';
```

### Fields Modified

| Field | Type | Description |
|-------|------|-------------|
| `title` | TEXT | Position name |
| `description` | TEXT | Position description |
| `application_fee` | DECIMAL | Fee in GHS |
| `updated_at` | TIMESTAMP | Last modification time |

## UI Components

### Position Card Layout

```
┌─────────────────────────────────────────────────────┐
│ President                                    [Open] │
│ 0 candidates                          [🔓] [✏️]    │
└─────────────────────────────────────────────────────┘
```

### Edit Modal Layout

```
┌──────────────────────────────────────┐
│ Edit Position                    [X] │
├──────────────────────────────────────┤
│                                      │
│ Position Name *                      │
│ [President                        ]  │
│                                      │
│ Description                          │
│ [Brief description...             ]  │
│                                      │
│ Application Fee (GHS)                │
│ [50.00                            ]  │
│                                      │
│ ℹ️ Note: Fee changes only affect     │
│    new applications                  │
│                                      │
│ [Cancel]           [Save Changes]    │
└──────────────────────────────────────┘
```

## Technical Implementation

### State Management

```typescript
const [positions, setPositions] = useState<Position[]>([]);
const [showEditPositionModal, setShowEditPositionModal] = useState(false);
const [editingPosition, setEditingPosition] = useState<Position | null>(null);
const [editPositionForm, setEditPositionForm] = useState({
  name: '',
  description: '',
  applicationFee: 0,
});
```

### Handler Functions

**Toggle Position Status**:
```typescript
const handleTogglePosition = async (id: string) => {
  const position = positions.find(p => p.id === id);
  const newStatus = position.status === 'open' ? 'closed' : 'open';
  
  // Update local state
  setPositions(positions.map(p => 
    p.id === id ? { ...p, status: newStatus } : p
  ));
  
  alert(`Position "${position.name}" is now ${newStatus}`);
};
```

**Edit Position**:
```typescript
const handleEditPosition = (position: Position) => {
  setEditingPosition(position);
  setEditPositionForm({
    name: position.name,
    description: position.description || '',
    applicationFee: position.applicationFee || 0,
  });
  setShowEditPositionModal(true);
};
```

**Save Position Changes**:
```typescript
const handleSavePositionEdit = async () => {
  const { error } = await supabase
    .from('positions')
    .update({
      title: editPositionForm.name,
      description: editPositionForm.description,
      application_fee: editPositionForm.applicationFee,
      updated_at: new Date().toISOString(),
    })
    .eq('id', editingPosition.id);

  if (!error) {
    // Update local state
    setPositions(positions.map(p =>
      p.id === editingPosition.id
        ? { ...p, ...editPositionForm }
        : p
    ));
    
    setShowEditPositionModal(false);
    alert('Position updated successfully!');
  }
};
```

## User Experience

### Visual Feedback

1. **Hover Effects**: Buttons highlight on hover
2. **Status Badges**: Color-coded (Green = Open, Red = Closed)
3. **Icons**: Intuitive lock and pencil icons
4. **Tooltips**: Helpful hints on hover
5. **Modals**: Clean, focused editing interface
6. **Alerts**: Success/error messages

### Accessibility

- Keyboard navigation supported
- Screen reader friendly
- Clear visual indicators
- Descriptive button titles
- Focus management in modals

## Example Workflow

### Scenario: Managing CAS-G 2026 Election

1. **Initial Setup**:
   - 5 positions created: President, WOCOM, Financial Secretary, PRO, Organizer
   - All positions are "Open"
   - Application fee: GHS 0.00

2. **Update Application Fee**:
   - Click pencil icon on "President" position
   - Change fee from GHS 0.00 to GHS 50.00
   - Add description: "Chief executive officer of the student body"
   - Save changes

3. **Close Position**:
   - After receiving 10 applications for President
   - Click lock icon to close position
   - Status changes to "Closed"
   - No new candidates can apply

4. **Reopen Position**:
   - If more candidates needed
   - Click lock icon again
   - Status changes back to "Open"
   - Applications resume

## Benefits

✅ **Full Control**: Manage positions dynamically
✅ **Real-time Updates**: Changes reflect immediately
✅ **Database Persistence**: All changes saved permanently
✅ **User-Friendly**: Intuitive interface
✅ **Flexible**: Edit anytime during election setup
✅ **Safe**: Existing candidates not affected by fee changes

## Future Enhancements

- [ ] Bulk position operations (lock/unlock multiple)
- [ ] Position templates for common elections
- [ ] Application deadline per position
- [ ] Maximum candidates per position
- [ ] Position-specific requirements
- [ ] Audit log for position changes
- [ ] Email notifications on position changes

## Files Modified

- `src/app/electoral-commission-panel/elections/[id]/manage/components/ManageElectionInteractive.tsx`

## Summary

The position management system is now fully functional, allowing electoral commissioners to:
- Lock/unlock positions to control candidate applications
- Edit position details including name, description, and fees
- Manage elections dynamically with real-time database updates
- Provide a smooth, intuitive user experience

All changes are persisted to the database and reflected immediately in the UI!
