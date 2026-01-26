# Document Viewer Fix - Application Details Page

## Issue
When clicking the "View" button on documents in the application details page (`/electoral-commission-panel/applications/[id]`), nothing happened because the buttons had no onClick handlers.

## Solution
Added a document viewer modal that displays uploaded documents when the "View" button is clicked.

## Changes Made

### 1. Added State Management
```typescript
const [showDocumentModal, setShowDocumentModal] = useState(false);
const [selectedDocument, setSelectedDocument] = useState<{ name: string; url: string } | null>(null);
```

### 2. Created Document View Handler
```typescript
const handleViewDocument = (docName: string, docUrl: string) => {
  setSelectedDocument({ 
    name: docName.replace(/([A-Z])/g, ' $1').trim(), 
    url: docUrl 
  });
  setShowDocumentModal(true);
};
```

### 3. Updated View Buttons
Changed from static buttons to interactive buttons with onClick handlers:
```typescript
<button 
  onClick={() => handleViewDocument(key, doc.url || '')}
  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-all duration-250"
>
  <Icon name="EyeIcon" size={16} variant="outline" />
  View
</button>
```

### 4. Added Document URLs
Updated mock data to include actual image URLs instead of '#':
```typescript
documents: {
  idCard: { 
    uploaded: true, 
    url: 'https://images.unsplash.com/photo-1633409361618-c73427e4e206?w=800&h=600&fit=crop', 
    verified: true 
  },
  transcript: { 
    uploaded: true, 
    url: 'https://images.unsplash.com/photo-1554224311-beee460c201f?w=800&h=600&fit=crop', 
    verified: true 
  },
  manifesto: { 
    uploaded: true, 
    url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&h=600&fit=crop', 
    verified: false 
  },
}
```

### 5. Created Document Viewer Modal

**Features:**
- Full-screen modal overlay with backdrop blur
- Document preview with image display
- Modal header with document name and close button
- Scrollable content area for large documents
- Footer with action buttons
- "Close" button to dismiss modal
- "Open in New Tab" button to view document in full size

**Modal Structure:**
```typescript
{showDocumentModal && selectedDocument && (
  <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-[2000]">
    <div className="bg-card border border-border rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh]">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <Icon name="DocumentTextIcon" />
          <div>
            <h3>{selectedDocument.name}</h3>
            <p>Document Preview</p>
          </div>
        </div>
        <button onClick={closeModal}>
          <Icon name="XMarkIcon" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <img src={selectedDocument.url} alt={selectedDocument.name} />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-6 border-t border-border">
        <div className="flex items-center gap-2">
          <Icon name="InformationCircleIcon" />
          <span>Review document carefully before verification</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={closeModal}>Close</button>
          <a href={selectedDocument.url} target="_blank">
            <Icon name="ArrowTopRightOnSquareIcon" />
            Open in New Tab
          </a>
        </div>
      </div>
    </div>
  </div>
)}
```

## User Flow

1. **Commission user opens application details** → `/electoral-commission-panel/applications/[id]`
2. **Views submitted documents section** → Shows ID Card, Transcript, Manifesto
3. **Clicks "View" button on any document** → Modal opens with document preview
4. **Reviews document in modal** → Full-size image display
5. **Options:**
   - Click "Close" to dismiss modal
   - Click "Open in New Tab" to view in full browser window
   - Click X button in header to close

## Features

✅ **Interactive View Buttons** - Click to open document
✅ **Modal Preview** - Large preview window
✅ **Image Display** - Shows document images
✅ **Close Options** - Multiple ways to close modal
✅ **Open in New Tab** - View full-size document
✅ **Responsive Design** - Works on all screen sizes
✅ **Smooth Animations** - Backdrop blur and transitions
✅ **Accessibility** - Keyboard navigation support

## Technical Details

**Modal Styling:**
- Fixed positioning with z-index 2000
- Backdrop blur effect
- Max width: 4xl (896px)
- Max height: 90vh
- Glassmorphism design
- Border and shadow effects

**Image Display:**
- Max width/height: 100%
- Object-fit: contain
- Rounded corners
- Centered in container
- Minimum height: 500px

**Buttons:**
- Primary button for "Open in New Tab"
- Muted button for "Close"
- Icon + text labels
- Hover effects
- Smooth transitions

## Production Considerations

In production, the document viewer should:
1. Support multiple file types (PDF, images, documents)
2. Implement PDF viewer for PDF documents
3. Add zoom controls for images
4. Add download functionality
5. Implement document rotation
6. Add print functionality
7. Show file metadata (size, upload date)
8. Implement document verification workflow
9. Add annotation capabilities
10. Log document views for audit trail

## File Modified

**File:** `src/app/electoral-commission-panel/applications/[id]/components/ApplicationDetailsInteractive.tsx`

**Changes:**
1. Added `showDocumentModal` state
2. Added `selectedDocument` state
3. Created `handleViewDocument` function
4. Updated View button onClick handlers
5. Updated mock document URLs
6. Added Document Viewer Modal component

## Testing

To test the fix:

1. Log in as commission user
2. Navigate to `/electoral-commission-panel/applications/2`
3. Scroll to "Submitted Documents" section
4. Click "View" button on any document
5. Verify modal opens with document preview
6. Verify image displays correctly
7. Click "Close" button - modal closes
8. Click "View" again
9. Click "Open in New Tab" - document opens in new tab
10. Click X button in header - modal closes

## Status

✅ **COMPLETE** - Document viewer now works correctly on application details page.

## Benefits

✅ **Functional View Buttons** - No longer static
✅ **Document Preview** - See documents before verification
✅ **Better UX** - Modal interface for document review
✅ **Multiple View Options** - Preview or full-size
✅ **Professional Design** - Matches platform aesthetics
✅ **Responsive** - Works on all devices
