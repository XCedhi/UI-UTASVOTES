# ✅ Numeric Student ID - Quick Reference

## What Changed?

Student IDs are now **numeric only** (no "UTAS" prefix) as per your requirement.

## Valid Student ID Examples

✅ **CORRECT**
- `2024001`
- `123456`
- `20240001`
- `1234`

❌ **INCORRECT**
- `UTAS2024001` (has prefix)
- `UTAS001` (has prefix)
- `ABC123` (has letters)
- `2024-001` (has dash)

## Excel File Format

Your Excel file should look like this:

| Student ID | First Name | Last Name | Email | Department | Level | Program |
|------------|------------|-----------|-------|------------|-------|---------|
| 2024001 | John | Doe | john.doe@cktutas.edu.gh | Computer Science | 300 | BSc CS |
| 2024002 | Jane | Smith | jane.smith@cktutas.edu.gh | Engineering | 200 | BEng ME |
| 123456 | Bob | Wilson | bob.wilson@cktutas.edu.gh | Business | 400 | BSc BA |

## How to Import Students

### Step 1: Prepare Excel File
1. Open Excel or Google Sheets
2. First row = column headers
3. Use numeric student IDs (no prefix)
4. Save as `.xlsx` or `.xls`

### Step 2: Upload File
1. Login as Admin or Electoral Commission
2. Navigate to: **Users → Import Students**
3. Click **"Download Template"** to get the correct format
4. Upload your Excel file

### Step 3: Review Preview
- System will show preview of all students
- Check that student IDs are correct
- Verify all data looks right

### Step 4: Import
- Click **"Import X Students"**
- Accounts will be created automatically
- Passwords generated and logged to console
- (In production, passwords would be emailed)

## Validation Rules

The system checks:
- ✅ Student ID is numeric only
- ✅ Email ends with `@cktutas.edu.gh`
- ✅ Level is 100, 200, 300, or 400
- ✅ All required fields present

## Error Messages

If you see errors:

**"Invalid format. Must be numeric only"**
- Your student ID has letters or special characters
- Fix: Use only numbers (e.g., `2024001`)

**"Must be a valid institutional email"**
- Email doesn't end with `@cktutas.edu.gh`
- Fix: Use institutional email format

**"No valid student data found"**
- Excel file is empty or missing required columns
- Fix: Download template and follow format

## Testing

### Quick Test File

Create a simple Excel file:

```
Row 1: Student ID | First Name | Last Name | Email
Row 2: 2024001 | Test | User | test@cktutas.edu.gh
```

Upload it and verify:
1. Preview shows: `2024001` as Student ID ✅
2. Import creates account successfully ✅
3. Check console for generated password ✅

## Console Output

After import, check browser console (F12) for:

```
=== CREATED STUDENT ACCOUNTS ===
test@cktutas.edu.gh: Abc123!@#XYZ
another@cktutas.edu.gh: Def456$%^ABC
================================
```

## Where to Find Import Feature

### As Admin:
```
Admin Dashboard → System Control → Users → Import Students
```

### As Electoral Commission:
```
Electoral Commission Panel → Import Students
```

## Need Help?

1. **Download Template** - Always use the template for correct format
2. **Check Console** - Press F12 to see detailed logs
3. **Verify Format** - Student IDs must be numeric only
4. **Test Small** - Try importing 1-2 students first

---

**Remember**: Student IDs are now **NUMERIC ONLY** - no prefix, no letters, just numbers! 🎯
