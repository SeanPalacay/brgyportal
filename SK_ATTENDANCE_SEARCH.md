# SK Event Attendance Tracking - Participant Search Feature

## Overview
This feature adds a searchable participant dropdown to the SK Event Attendance Tracking system, enabling SK Officials to quickly find and mark attendance for specific participants in events with large registration lists.

## Implementation Summary

### File Modified
**`frontend/src/pages/sk/EventDetails.tsx`**

**Changes Made:**
1. **Imports** (Lines 1-14):
   - Added `useMemo` from React for efficient filtering
   - Added `Search` icon from lucide-react
   - Added `Input` component from UI library

2. **State Management** (Line 52):
   - Added `participantSearchQuery` state for search input

3. **Filtering Logic** (Lines 151-180):
   - `availableParticipants` - Memoized list of participants who haven't attended yet
   - `filteredParticipants` - Memoized filtered list based on search query
   - `handleDialogOpenChange` - Resets search and form when dialog closes

4. **UI Updates** (Lines 466-559):
   - Added search input with magnifying glass icon
   - Enhanced dropdown items to show name and email
   - Added helper text and result counts
   - Added "No results found" state
   - Improved dialog width for better visibility

## Search Implementation Details

### Search Activation
- **Minimum Characters**: 2 characters required
- **Search Fields**: Filters by participant name (first + last) OR email
- **Case Sensitivity**: Case-insensitive search
- **Real-time**: Updates as user types

### Filtering Algorithm
```typescript
// Step 1: Get available participants (not yet attended)
const availableParticipants = registrations.filter(
  reg => !attendance.some(att => att.userId === reg.user.id)
);

// Step 2: Apply search filter (min 2 chars)
const filteredParticipants = availableParticipants.filter(reg => {
  if (query.length < 2) return true; // Show all if < 2 chars

  const fullName = `${reg.user.firstName} ${reg.user.lastName}`.toLowerCase();
  const email = reg.user.email.toLowerCase();

  return fullName.includes(query) || email.includes(query);
});
```

### Performance Optimization
- Uses `useMemo` to prevent unnecessary recalculations
- Only re-filters when:
  - Search query changes
  - Registrations list changes
  - Attendance list changes

## UI Mockup

```
┌─────────────────────────────────────────────────────────┐
│  Mark Attendance                                    [X] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Select Participant                                     │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 🔍 Search by name or email...                   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Type at least 2 characters to search                   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Choose a participant...                    [▼]  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Found 5 participants                                   │
│                                                         │
│  ────────────────────────────────────────────────────   │
│                                                         │
│  Remarks (Optional)                                     │
│  ┌─────────────────────────────────────────────────┐   │
│  │                                                  │   │
│  │ Any additional notes...                          │   │
│  │                                                  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│                           [Cancel]  [Mark Attended]     │
└─────────────────────────────────────────────────────────┘
```

### Dropdown States

**1. Before Search (< 2 characters):**
```
┌─────────────────────────────────────────┐
│ Juan Dela Cruz                          │
│ juan.delacruz@email.com                 │
├─────────────────────────────────────────┤
│ Maria Santos                            │
│ maria.santos@email.com                  │
├─────────────────────────────────────────┤
│ Pedro Garcia                            │
│ pedro.garcia@email.com                  │
└─────────────────────────────────────────┘
```

**2. After Search (e.g., "maria"):**
```
┌─────────────────────────────────────────┐
│ Maria Santos                            │
│ maria.santos@email.com                  │
├─────────────────────────────────────────┤
│ Maria dela Cruz                         │
│ mariadelacruz@email.com                 │
└─────────────────────────────────────────┘

Found 2 participants
```

**3. No Results:**
```
┌─────────────────────────────────────────┐
│                                         │
│        No results found                 │
│                                         │
└─────────────────────────────────────────┘
```

**4. No Available Participants:**
```
┌─────────────────────────────────────────┐
│                                         │
│     No available participants           │
│                                         │
└─────────────────────────────────────────┘
```

## Key Features

### ✅ Search Bar Placement
- Positioned directly above the participant dropdown
- Full-width input field
- Magnifying glass icon on the left
- Placeholder text: "Search by name or email..."

### ✅ Search Activation
- Activates after typing 2+ characters
- Shows helper text when < 2 characters typed
- Real-time filtering as user types

### ✅ Search Filtering
- **Name matching**: Searches full name (first + last name combined)
- **Email matching**: Searches email address
- **Case-insensitive**: "JUAN" matches "Juan Dela Cruz"
- **Partial matching**: "maria" matches "Maria Santos" and "mariadelacruz@email.com"

### ✅ Enhanced Dropdown Display
- **Two-line format**:
  - Line 1: Full name (bold)
  - Line 2: Email address (smaller, muted)
- Better readability for large lists
- Clear identification of participants

### ✅ User Feedback
- Helper text when < 2 characters
- Result count when search active
- "No results found" when no matches
- "No available participants" when all attended

### ✅ State Management
- Search query resets when dialog closes
- Form data resets when dialog closes
- Maintains existing attendance marking functionality
- No changes to backend API

### ✅ Accessibility
- Clear labels and placeholders
- Keyboard navigable
- Screen reader friendly
- Visual feedback for all states

## Test Participant Data

For testing purposes, use this sample data structure:

```json
{
  "registrations": [
    {
      "id": "reg-001",
      "user": {
        "id": "user-001",
        "firstName": "Juan",
        "lastName": "Dela Cruz",
        "email": "juan.delacruz@email.com",
        "contactNumber": "09171234567"
      }
    },
    {
      "id": "reg-002",
      "user": {
        "id": "user-002",
        "firstName": "Maria",
        "lastName": "Santos",
        "email": "maria.santos@email.com",
        "contactNumber": "09181234567"
      }
    },
    {
      "id": "reg-003",
      "user": {
        "id": "user-003",
        "firstName": "Pedro",
        "lastName": "Garcia",
        "email": "pedro.garcia@email.com",
        "contactNumber": "09191234567"
      }
    },
    {
      "id": "reg-004",
      "user": {
        "id": "user-004",
        "firstName": "Anna",
        "lastName": "Martinez",
        "email": "anna.martinez@email.com",
        "contactNumber": "09201234567"
      }
    },
    {
      "id": "reg-005",
      "user": {
        "id": "user-005",
        "firstName": "Carlos",
        "lastName": "Reyes",
        "email": "carlos.reyes@email.com",
        "contactNumber": "09211234567"
      }
    }
  ]
}
```

## Verification Steps

### Prerequisites
```bash
cd frontend
npm run dev  # Start development server
```

### Manual Testing Checklist

#### 1. Initial State Testing
- [ ] Navigate to any published event details page
- [ ] Click "Mark Attendance" button
- [ ] Verify dialog opens with search bar visible
- [ ] Search bar has magnifying glass icon on the left
- [ ] Placeholder reads "Search by name or email..."
- [ ] Search input is empty
- [ ] Dropdown shows all available participants

#### 2. Search Activation Testing

**Test Case 2.1: Type 1 character**
- [ ] Type "j" in search bar
- [ ] Helper text appears: "Type at least 2 characters to search"
- [ ] Dropdown still shows all participants (no filtering)

**Test Case 2.2: Type 2 characters**
- [ ] Type "ju" in search bar
- [ ] Helper text disappears
- [ ] Dropdown filters to show only matching participants
- [ ] Result count appears below dropdown

**Test Case 2.3: Clear search**
- [ ] Clear search bar
- [ ] Helper text disappears
- [ ] Dropdown shows all participants again
- [ ] Result count disappears

#### 3. Name Search Testing

**Test Case 3.1: Search by first name**
- Input: "juan"
- Expected: Shows "Juan Dela Cruz"
- [ ] Case-insensitive match works
- [ ] Partial match works

**Test Case 3.2: Search by last name**
- Input: "santos"
- Expected: Shows "Maria Santos"
- [ ] Last name matching works

**Test Case 3.3: Search by full name**
- Input: "maria santos"
- Expected: Shows "Maria Santos"
- [ ] Full name matching works with space

**Test Case 3.4: Search with different case**
- Input: "PEDRO"
- Expected: Shows "Pedro Garcia"
- [ ] Case-insensitive search confirmed

**Test Case 3.5: Search with partial name**
- Input: "ped"
- Expected: Shows "Pedro Garcia"
- [ ] Partial matching works

#### 4. Email Search Testing

**Test Case 4.1: Search by full email**
- Input: "anna.martinez@email.com"
- Expected: Shows "Anna Martinez"
- [ ] Full email matching works

**Test Case 4.2: Search by email prefix**
- Input: "carlos.reyes"
- Expected: Shows "Carlos Reyes"
- [ ] Partial email matching works

**Test Case 4.3: Search by domain**
- Input: "@email.com"
- Expected: Shows all participants with @email.com
- [ ] Domain matching works

**Test Case 4.4: Mixed case email search**
- Input: "MARIA.SANTOS"
- Expected: Shows "Maria Santos"
- [ ] Case-insensitive email search works

#### 5. No Results Testing

**Test Case 5.1: Search with no matches**
- Input: "xyz123"
- Expected: "No results found" message
- [ ] Message displays correctly
- [ ] No participants shown in dropdown
- [ ] Result count not displayed

**Test Case 5.2: Search after all attended**
- Mark all participants as attended
- Click "Mark Attendance"
- Expected: "No available participants" message
- [ ] Correct message for empty list

#### 6. Display Format Testing

**Dropdown Item Format:**
- [ ] Participant name is bold/medium weight
- [ ] Email is smaller font size
- [ ] Email is muted color (gray)
- [ ] Two-line layout displays correctly
- [ ] Text doesn't overflow/truncate unexpectedly

**Result Count:**
- [ ] "Found X participant" (singular) when 1 result
- [ ] "Found X participants" (plural) when 2+ results
- [ ] Count matches actual filtered results
- [ ] Count only shows when search ≥ 2 characters

#### 7. State Persistence Testing

**Test Case 7.1: Dialog close and reopen**
- [ ] Type "maria" in search
- [ ] Close dialog (Cancel button)
- [ ] Reopen dialog
- [ ] Search bar is cleared
- [ ] All participants visible again

**Test Case 7.2: After marking attendance**
- [ ] Search for "juan"
- [ ] Select and mark Juan's attendance
- [ ] Dialog closes automatically
- [ ] Reopen dialog
- [ ] Search is cleared
- [ ] Juan no longer appears in list

#### 8. Filtering Logic Testing

**Test Case 8.1: Multiple matches**
- Input: "a"
- Expected: Shows all names containing "a"
- [ ] Multiple results display correctly
- [ ] Count is accurate

**Test Case 8.2: Single match**
- Input: "pedro garcia"
- Expected: Shows only "Pedro Garcia"
- [ ] Single result displays
- [ ] Count shows "Found 1 participant"

**Test Case 8.3: Leading/trailing spaces**
- Input: "  maria  "
- Expected: Spaces are trimmed, shows "Maria Santos"
- [ ] Trim functionality works

#### 9. Performance Testing

**Test Case 9.1: Small list (1-10 participants)**
- [ ] Search is instant
- [ ] No lag or delay

**Test Case 9.2: Medium list (11-50 participants)**
- [ ] Search remains responsive
- [ ] Results update smoothly

**Test Case 9.3: Large list (51-100 participants)**
- [ ] Search performs well
- [ ] No noticeable lag
- [ ] UI remains responsive

**Test Case 9.4: Rapid typing**
- Type quickly: "juandelacruz"
- [ ] Filtering keeps up with typing
- [ ] No race conditions
- [ ] Final results are correct

#### 10. Integration Testing

**Test Case 10.1: Mark attendance with search**
- [ ] Search for "maria"
- [ ] Select Maria Santos from filtered list
- [ ] Add remarks
- [ ] Submit form
- [ ] Attendance marked successfully
- [ ] Maria no longer in available list

**Test Case 10.2: Maximum limit reached**
- Mark 100 attendees (if possible)
- Click "Mark Attendance"
- [ ] Search bar still functional
- [ ] Dropdown shows "Maximum limit reached"
- [ ] Submit button disabled

**Test Case 10.3: Form validation**
- [ ] Search and filter participants
- [ ] Try to submit without selecting
- [ ] Submit button is disabled
- [ ] Select participant
- [ ] Submit button becomes enabled

#### 11. Edge Cases

**Test Case 11.1: Special characters in name**
- Name: "José Ñ. dela Cruz"
- Input: "jose"
- [ ] Special characters handled correctly
- [ ] Matching still works

**Test Case 11.2: Hyphenated names**
- Name: "Mary-Ann Smith"
- Input: "mary ann"
- [ ] Hyphen doesn't break search

**Test Case 11.3: Very long names**
- Name: "Christopher Alexander Benjamin Johnson"
- [ ] Name displays without breaking layout
- [ ] Search works on full name

**Test Case 11.4: Email without @**
- Input: "username"
- [ ] Partial email matching works

#### 12. Browser Compatibility

Test in multiple browsers:
- [ ] Chrome (latest) - All features work
- [ ] Firefox (latest) - All features work
- [ ] Edge (latest) - All features work
- [ ] Safari (if available) - All features work

#### 13. Responsive Design

Test at different screen sizes:
- [ ] Desktop (1920x1080) - Dialog and search render properly
- [ ] Laptop (1366x768) - Layout adjusts correctly
- [ ] Tablet (768px) - Dialog is readable
- [ ] Mobile (375px) - Search bar is full width

#### 14. Accessibility Testing

**Keyboard Navigation:**
- [ ] Tab to search input
- [ ] Type to filter
- [ ] Tab to dropdown
- [ ] Arrow keys navigate options
- [ ] Enter selects option
- [ ] Tab to remarks field
- [ ] Tab to buttons
- [ ] Enter submits form

**Screen Reader:**
- [ ] Search input has proper label
- [ ] Dropdown announces results
- [ ] Helper text is announced
- [ ] Result count is announced
- [ ] "No results" message is announced

#### 15. Error Handling

**Test Case 15.1: Network error during fetch**
- Simulate network error
- [ ] Graceful degradation
- [ ] No console errors

**Test Case 15.2: Malformed participant data**
- [ ] Missing firstName handled
- [ ] Missing email handled
- [ ] Null values don't break search

## Success Criteria

Feature is considered successfully implemented when:

1. ✅ Search bar appears above participant dropdown
2. ✅ Magnifying glass icon visible on left
3. ✅ Search activates after typing 2+ characters
4. ✅ Filters by name OR email, case-insensitive
5. ✅ Shows "No results found" when no matches
6. ✅ Displays name and email in dropdown items
7. ✅ Result count shows when filtering active
8. ✅ Helper text guides user (< 2 chars)
9. ✅ Search resets when dialog closes
10. ✅ Maintains existing attendance functionality
11. ✅ No backend API changes required
12. ✅ Works with 1-100 participants smoothly
13. ✅ All edge cases handled gracefully
14. ✅ Keyboard accessible
15. ✅ Cross-browser compatible

## Code Quality Checklist

- [ ] Uses `useMemo` for performance optimization
- [ ] Search query trimmed to handle whitespace
- [ ] Case-insensitive comparison via `.toLowerCase()`
- [ ] Properly resets state on dialog close
- [ ] TypeScript types are correct
- [ ] No console warnings or errors
- [ ] Follows existing code patterns
- [ ] Component remains readable and maintainable

## Troubleshooting

### Issue: Search doesn't filter
**Solution:**
- Check browser console for errors
- Verify `filteredParticipants` is computed correctly
- Ensure `participantSearchQuery` state updates
- Check that registrations data has correct structure

### Issue: "Type at least 2 characters" always shows
**Solution:**
- Verify condition: `query.trim().length < 2`
- Check that helper text has correct conditional logic
- Ensure state updates properly on input change

### Issue: Dropdown items don't show email
**Solution:**
- Check SelectItem contains nested div structure
- Verify email field exists in registration data
- Check Tailwind classes are applied correctly

### Issue: Search doesn't reset on close
**Solution:**
- Verify `handleDialogOpenChange` is called
- Check `onOpenChange` prop on Dialog
- Ensure `setParticipantSearchQuery('')` executes

### Issue: Performance lag with large lists
**Solution:**
- Verify `useMemo` dependencies are correct
- Check if component re-renders unnecessarily
- Consider adding debouncing if needed (currently not required)

## Future Enhancements

Potential improvements for future iterations:

1. **Advanced Filtering:**
   - Filter by contact number
   - Multiple search terms (AND logic)
   - Regular expression support

2. **Search Highlighting:**
   - Highlight matching text in results
   - Bold matched portions of name/email

3. **Keyboard Shortcuts:**
   - Ctrl+F to focus search
   - Esc to clear search
   - Up/Down arrows to navigate without opening dropdown

4. **Recent Searches:**
   - Store recent search queries
   - Quick access to common searches

5. **Bulk Operations:**
   - Select multiple from search results
   - Mark multiple attendees at once

6. **Export Filtered List:**
   - Export current search results to CSV
   - Print filtered participant list

## Related Files

- **Component**: `frontend/src/pages/sk/EventDetails.tsx`
- **UI Components**:
  - `frontend/src/components/ui/input.tsx`
  - `frontend/src/components/ui/select.tsx`
  - `frontend/src/components/ui/dialog.tsx`
- **Types**: `frontend/src/types/index.ts`
- **Main Documentation**: `CLAUDE.md`

## API Reference

No changes to backend API required. Feature uses existing endpoints:
- `GET /api/events/:id/registrations?status=APPROVED`
- `GET /api/events/:id/attendance`
- `POST /api/events/attendance`

## Support

For issues or questions:
1. Review test participant data format
2. Check browser console for errors
3. Verify TypeScript compilation succeeds
4. Test in different browsers
5. Check that event has registered participants
