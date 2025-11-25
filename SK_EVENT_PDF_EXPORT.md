# SK Event Attendee List PDF Export Feature

## Overview
This feature allows SK Officials to export event attendee lists as professionally formatted PDF documents for record-keeping and distribution purposes.

## Implementation Summary

### Files Modified

1. **`frontend/src/lib/exportUtils.ts`**
   - Added `exportEventAttendeesToPDF()` function
   - Added `EventAttendeeData` interface for type safety
   - Implements PDF generation with jsPDF and jspdf-autotable

2. **`frontend/src/pages/sk/EventDetails.tsx`**
   - Added PDF export button to Attendance Records section
   - Added `handleExportAttendeesToPDF()` handler function
   - Imported `FileDown` icon from lucide-react
   - Imported `exportEventAttendeesToPDF` utility function

## PDF Layout Specification

### Header Section
```
┌─────────────────────────────────────────────────────┐
│        BARANGAY MANAGEMENT SYSTEM                   │
│     TheyCare Portal - SK Event Management           │
├─────────────────────────────────────────────────────┤
│        EVENT ATTENDANCE LIST                        │
└─────────────────────────────────────────────────────┘
```

### Event Information Section
```
Event Information:
  Event Name: [Event Title]
  Date: [Full formatted date - e.g., "Monday, November 25, 2025"]
  Category: [Event Category] (if available)
  Location: [Event Location]
  Total Attendees: [Count]
  Generated on: [Timestamp]
```

### Attendee Table Format
```
┌────┬──────────────────┬────────────────────┬────────────────┬──────────────────┐
│ #  │ Full Name        │ Email              │ Contact Number │ Attendance Time  │
├────┼──────────────────┼────────────────────┼────────────────┼──────────────────┤
│ 1  │ Juan Dela Cruz   │ juan@example.com   │ 09171234567    │ Nov 25, 2025...  │
│ 2  │ Maria Santos     │ maria@example.com  │ N/A            │ Nov 25, 2025...  │
└────┴──────────────────┴────────────────────┴────────────────┴──────────────────┘
```

### Footer Section
```
This is a system-generated document.
TheyCare Portal - Barangay Management System
```

## PDF Styling Details

### Colors
- **Header background**: RGB(41, 128, 185) - Professional blue
- **Header text**: White (RGB 255, 255, 255)
- **Alternate rows**: Light gray (RGB 245, 245, 245)
- **Body text**: Black (RGB 0, 0, 0)
- **Footer text**: Gray (RGB 100, 100, 100)

### Typography
- **Main title**: 16pt Helvetica Bold
- **Subtitle**: 12pt Helvetica Normal
- **Section title**: 14pt Helvetica Bold
- **Event info labels**: 11pt Helvetica Bold
- **Event info values**: 10pt Helvetica Normal
- **Table content**: 9pt with 3pt cell padding
- **Timestamp**: 9pt Gray
- **Footer**: 8pt Gray

### Column Widths
- **#**: 15pt (centered)
- **Full Name**: 45pt
- **Email**: 50pt
- **Contact Number**: 35pt
- **Attendance Time**: 40pt

## Filename Format

The exported PDF follows this naming convention:
```
{EventName}_Attendees_{YYYYMMDD}.pdf
```

**Examples:**
- `Youth_Summit_2024_Attendees_20251125.pdf`
- `Basketball_Tournament_Attendees_20251125.pdf`
- `Community_Clean_Up_Drive_Attendees_20251125.pdf`

**Notes:**
- Event name is sanitized (special characters replaced with underscores)
- Limited to 30 characters for file system compatibility
- Date uses ISO format without hyphens (YYYYMMDD)

## User Interface

### Export Button Location
- **Position**: Top-right of "Attendance Records" card
- **Visibility**: Only shown when attendance.length > 0
- **Style**: Outline variant button with icon
- **Icon**: FileDown from lucide-react
- **Text**: "Export to PDF"

### Button Behavior
- **Enabled state**: Shows when there are attendance records
- **Disabled state**: Hidden when no attendance records exist
- **Click action**: Generates and downloads PDF immediately
- **Error handling**: Shows alert if no records available

## Verification Steps

### 1. Prerequisites Check
```bash
# Ensure you're in the frontend directory
cd frontend

# Verify jsPDF and jspdf-autotable are installed
npm list jspdf jspdf-autotable

# Expected output:
# jspdf@3.0.3
# jspdf-autotable@5.0.2
```

### 2. Code Compilation Check
```bash
# Type check the updated files
npx tsc --noEmit

# Expected: No type errors related to EventDetails or exportUtils
```

### 3. Start Development Server
```bash
# Start frontend development server
npm run dev

# Server should start on http://localhost:5173
```

### 4. Manual Testing Steps

#### Step 4.1: Navigate to Event Details
1. Login as SK Official or SK Chairman
2. Navigate to "SK Engagement" → "Event Management"
3. Click on any published event to view details
4. Scroll to the "Attendance Records" section

#### Step 4.2: Verify Button Display
✓ Export button should be visible if attendance.length > 0
✓ Export button should have FileDown icon
✓ Export button text should read "Export to PDF"
✓ Button should be in the top-right of the card header
✓ Button should NOT appear if no attendance records exist

#### Step 4.3: Test PDF Generation
1. Click "Export to PDF" button
2. Verify PDF download starts immediately
3. Check browser Downloads folder for the PDF file

#### Step 4.4: Verify PDF Content

**Header Section:**
- ✓ "BARANGAY MANAGEMENT SYSTEM" centered at top
- ✓ "TheyCare Portal - SK Event Management" subtitle
- ✓ Horizontal line separator
- ✓ "EVENT ATTENDANCE LIST" title

**Event Information:**
- ✓ Event Name matches actual event title
- ✓ Date formatted as "Day, Month DD, YYYY"
- ✓ Category displayed (if event has category)
- ✓ Location matches event location
- ✓ Total Attendees count is accurate
- ✓ "Generated on:" timestamp is present and current

**Attendee Table:**
- ✓ Table headers: #, Full Name, Email, Contact Number, Attendance Time
- ✓ Row numbering starts at 1 and increments correctly
- ✓ Full names concatenated properly (First Last)
- ✓ Email addresses display correctly
- ✓ Contact numbers show "N/A" if not available
- ✓ Attendance time formatted as "MMM DD, YYYY HH:MM AM/PM"
- ✓ Alternating row colors for readability
- ✓ All rows contain correct data matching the UI

**Footer:**
- ✓ "This is a system-generated document." message
- ✓ "TheyCare Portal - Barangay Management System" text
- ✓ Footer positioned at bottom of page

**Styling:**
- ✓ Professional blue header background (RGB 41, 128, 185)
- ✓ White header text
- ✓ Alternating gray row backgrounds
- ✓ Proper margins and padding
- ✓ Text is readable and properly aligned

#### Step 4.5: Verify Filename Format
Check the downloaded file name:
- ✓ Format: `{EventName}_Attendees_{YYYYMMDD}.pdf`
- ✓ Event name sanitized (no special characters)
- ✓ Date in YYYYMMDD format
- ✓ File opens correctly in PDF reader

#### Step 4.6: Test Edge Cases

**Empty Attendance List:**
1. Navigate to event with no attendance records
2. Verify Export button is NOT displayed
3. Verify no console errors

**Single Attendee:**
1. Mark only one attendee
2. Click Export to PDF
3. Verify PDF generates correctly with 1 row
4. Verify "Total Attendees: 1" is correct

**Maximum Attendees (100):**
1. Navigate to event with 100 attendees (if available)
2. Click Export to PDF
3. Verify all 100 records appear in PDF
4. Verify table formatting remains intact
5. Check if pagination works (jsPDF autotable handles this)

**Missing Contact Numbers:**
1. Verify attendees without contact numbers show "N/A"
2. Verify no undefined or null values appear

**Long Event Names:**
1. Test with event title > 30 characters
2. Verify filename truncates appropriately
3. Verify full title appears in PDF header

**Special Characters in Event Name:**
1. Test with event containing spaces, hyphens, apostrophes
2. Verify filename replaces special chars with underscores
3. Verify original title displays correctly in PDF

### 5. Browser Compatibility Testing

Test PDF export in multiple browsers:
- ✓ Google Chrome (latest)
- ✓ Mozilla Firefox (latest)
- ✓ Microsoft Edge (latest)
- ✓ Safari (if available)

Verify:
- PDF downloads correctly
- PDF opens in browser's PDF viewer
- Content is properly formatted
- No console errors

### 6. Performance Testing

**Small Events (1-10 attendees):**
- ✓ PDF generates in < 1 second
- ✓ No UI freezing

**Medium Events (11-50 attendees):**
- ✓ PDF generates in < 2 seconds
- ✓ Minimal UI delay

**Large Events (51-100 attendees):**
- ✓ PDF generates in < 3 seconds
- ✓ Progress indication (browser download)

### 7. Data Accuracy Verification

Compare PDF data with UI display:
1. Open event details page
2. Take note of first 5 attendees' information
3. Export to PDF
4. Verify each field matches exactly:
   - Names (first and last)
   - Email addresses
   - Contact numbers (or N/A)
   - Attendance timestamps
5. Verify count matches: UI count = PDF "Total Attendees"

### 8. Security and Privacy Considerations

- ✓ PDF only generated for authenticated SK Officials
- ✓ No sensitive data exposed beyond what's in UI
- ✓ Contact numbers optional (displayed if available)
- ✓ Export action logged in user activity (if applicable)
- ✓ PDF contains only public event information

### 9. Error Handling Verification

**Test these scenarios:**

1. **Network Issues:**
   - Simulate offline mode
   - Verify graceful error if attendance data missing

2. **Empty Event Object:**
   - Artificially set event to null
   - Verify alert: "No attendance records to export."

3. **Malformed Data:**
   - Test with attendee missing firstName/lastName
   - Verify empty strings handled gracefully

4. **Browser PDF Support:**
   - Test in older browser versions
   - Verify fallback behavior

### 10. Accessibility Testing

- ✓ Export button keyboard accessible (Tab + Enter)
- ✓ Button has proper ARIA labels
- ✓ Color contrast meets WCAG standards
- ✓ Focus indicator visible on button

## Success Criteria

The feature is considered successfully implemented when:

1. ✅ Export button appears in Attendance Records section
2. ✅ Button only visible when attendance records exist
3. ✅ PDF generates with correct barangay header
4. ✅ Event information section displays all required fields
5. ✅ Attendee table formatted with proper columns and styling
6. ✅ All attendee data accurate and complete
7. ✅ Filename follows specified format
8. ✅ Export timestamp included in PDF
9. ✅ Professional styling with blue header theme
10. ✅ Works across all major browsers
11. ✅ No console errors or warnings
12. ✅ PDF opens correctly in all PDF readers
13. ✅ Edge cases handled gracefully
14. ✅ Performance acceptable for 100 attendees
15. ✅ Code follows existing patterns in exportUtils.ts

## Troubleshooting

### Issue: PDF not downloading
**Solution:**
- Check browser popup blocker settings
- Verify browser allows downloads from localhost
- Check console for JavaScript errors

### Issue: PDF content missing or malformed
**Solution:**
- Verify event object contains all required fields
- Check attendance array has user objects populated
- Ensure API includes user details in attendance response

### Issue: Filename has undefined or incorrect format
**Solution:**
- Verify event.title is defined
- Check Date object initialization
- Validate filename sanitization regex

### Issue: Table columns misaligned
**Solution:**
- Check columnStyles widths in autoTable config
- Verify pageWidth calculation
- Adjust margin values if needed

### Issue: Export button not appearing
**Solution:**
- Verify attendance.length > 0
- Check conditional rendering logic
- Ensure component re-renders after attendance fetch

## Future Enhancements

Potential improvements for future iterations:

1. **Export Options:**
   - Excel export format
   - CSV export for data processing
   - Print-friendly HTML view

2. **Customization:**
   - Custom barangay logo upload
   - Configurable header text
   - Additional fields (remarks, registration date)

3. **Bulk Operations:**
   - Export multiple events at once
   - Batch PDF generation
   - Zip file download

4. **Advanced Filtering:**
   - Export by date range
   - Filter by attendance status
   - Search and export subset

5. **Templates:**
   - Different PDF layouts (portrait/landscape)
   - Certificate-style attendance lists
   - Summary reports with statistics

## Related Documentation

- **Main Documentation**: `CLAUDE.md`
- **Export Utilities**: `frontend/src/lib/exportUtils.ts`
- **Event Details Component**: `frontend/src/pages/sk/EventDetails.tsx`
- **Type Definitions**: `frontend/src/types/index.ts`

## Support

For issues or questions related to this feature:
1. Check existing SK event management documentation
2. Review console logs for error messages
3. Verify all dependencies are installed correctly
4. Test in different browser environments
