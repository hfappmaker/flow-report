# Work Report Feature - Date/Holiday Logic Analysis

## Overview
Found multiple files in the work-report feature containing similar date/holiday logic that would benefit from refactoring and consolidation.

## Files with Similar Logic

### 1. **attendance-edit-dialog.tsx** (Component)
**Location:** `/WorkTimeManagementV2/src/features/work-report/components/attendance-edit-dialog.tsx`

**Date/Holiday Logic:**
- **Day Names Array (Line 46):** `const dayNames = ["日", "月", "火", "水", "木", "金", "土"];`
- **Holiday Check Function (Lines 49-52):**
  ```typescript
  function isHoliday(date: Date, holidays: Holiday[]): boolean {
    const dateStr = date.toISOString().split("T")[0]; // YYYY-MM-DD format
    return holidays.some((holiday) => holiday.date === dateStr);
  }
  ```
- **Date Color Class Logic (Lines 55-75):**
  ```typescript
  function getDateColorClass(date: Date, holidays: Holiday[]): string {
    const dayOfWeek = date.getDay();
    
    // Holiday check (red)
    if (isHoliday(date, holidays)) {
      return "text-red-600";
    }
    
    // Sunday (red)
    if (dayOfWeek === 0) {
      return "text-red-600";
    }
    
    // Saturday (blue)
    if (dayOfWeek === 6) {
      return "text-blue-600";
    }
    
    // Weekday (no color)
    return "";
  }
  ```
- **Usage:** Displays date with color-coded day of week indicator in the edit dialog

### 2. **attendance.ts** (Server Action)
**Location:** `/WorkTimeManagementV2/src/features/work-report/actions/attendance.ts`

**Date/Holiday Logic:**
- **Day Names Array (Line 90):** `const dayNames = ["日", "月", "火", "水", "木", "金", "土"];`
- **Calendar Generation (Lines 92-107):**
  ```typescript
  const calendarInfo = Array.from({ length: daysInMonth }, (_, i) => {
    const date = new Date(year, month, i + 1);
    const dayOfWeek = date.getDay();
    const dayName = dayNames[dayOfWeek];
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const dateStr = date.toISOString().split("T")[0];
    const isHoliday = holidays.some((holiday) => holiday.date === dateStr);
    
    return {
      date: i + 1,
      dayName,
      isWeekend,
      isHoliday,
      isWorkday: !isWeekend && !isHoliday,
    };
  });
  ```
- **Holiday Fetching (Line 83):** `const holidays = await fetchHolidays(2025);`
- **Usage:** Generates calendar information for AI prompt with workday determination

### 3. **attendance-utils.ts** (Utilities)
**Location:** `/WorkTimeManagementV2/src/features/work-report/utils/attendance-utils.ts`

**Date/Holiday Logic:**
- **Holiday Checking (Lines 158-164):**
  ```typescript
  if (shouldUpdate && excludeHolidays && holidays) {
    const dateStr = date.toISOString().split("T")[0];
    const isHoliday = holidays.some((holiday) => holiday.date === dateStr);
    if (isHoliday) {
      shouldUpdate = false;
    }
  }
  ```
- **Weekend Checking (Line 147):** `const dayOfWeek = date.getDay();`
- **Function: `shouldUpdateDate` (Lines 139-167):**
  - Checks date range
  - Filters by selected days of week
  - Excludes holidays if specified
- **Date Range Generation (Lines 5-64 - `generateDefaultAttendances`):**
  - Creates dates for a month using `getBillingPeriod` utility
  - Loops through dates incrementing by one day

## Common Patterns Identified

### 1. **Day Names Array**
**Duplicated in:**
- `attendance-edit-dialog.tsx` (Line 46)
- `attendance.ts` (Line 90)

**Pattern:**
```typescript
const dayNames = ["日", "月", "火", "水", "木", "金", "土"];
const dayName = dayNames[date.getDay()];
```

### 2. **Holiday Detection Logic**
**Duplicated in:**
- `attendance-edit-dialog.tsx` (Lines 49-52)
- `attendance.ts` (Line 98)
- `attendance-utils.ts` (Lines 159-160)

**Pattern:**
```typescript
const dateStr = date.toISOString().split("T")[0]; // YYYY-MM-DD format
const isHoliday = holidays.some((holiday) => holiday.date === dateStr);
```

### 3. **Weekend Detection**
**Used in:**
- `attendance-edit-dialog.tsx` (Line 56, implicitly in color logic)
- `attendance.ts` (Line 96)
- `attendance-utils.ts` (Line 147)

**Pattern:**
```typescript
const dayOfWeek = date.getDay();
const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
```

### 4. **Date to YYYY-MM-DD String Conversion**
**Duplicated in:**
- `attendance-edit-dialog.tsx` (Line 50)
- `attendance.ts` (Line 97)
- `attendance-utils.ts` (Line 159)

**Pattern:**
```typescript
const dateStr = date.toISOString().split("T")[0];
```

## Utility Functions That Could Be Extracted

### Suggested Consolidated Utilities:

1. **`getDayName(date: Date): string`**
   - Returns Japanese day name (日/月/火/水/木/金/土)

2. **`isHoliday(date: Date, holidays: Holiday[]): boolean`**
   - Checks if date is a holiday (already exists in attendance-edit-dialog.tsx)

3. **`isWeekend(date: Date): boolean`**
   - Checks if date is Saturday (6) or Sunday (0)

4. **`getDateColorClass(date: Date, holidays?: Holiday[]): string`**
   - Returns Tailwind color class for date (red for Sunday/holiday, blue for Saturday)
   - Already exists in attendance-edit-dialog.tsx

5. **`getWorkdayInfo(date: Date, holidays?: Holiday[]): { dayName: string; isWeekend: boolean; isHoliday: boolean; isWorkday: boolean }`**
   - Returns comprehensive workday information

6. **`formatDateAsYYYYMMDD(date: Date): string`**
   - Returns YYYY-MM-DD format (equivalent to `date.toISOString().split("T")[0]`)

## Files That Could Benefit

All files in work-report feature that handle dates could use these utilities:

1. ✅ **attendance-edit-dialog.tsx** - Component logic
2. ✅ **attendance.ts** - Action/server function
3. ✅ **attendance-utils.ts** - Already in utils but has inline holiday logic
4. **work-report-repository.ts** - Repository functions with date filtering
5. **attendance-repository.ts** - Repository with date handling
6. **Other components** - Any that display dates with day names

## Recommended Action

Create a new utility file: `/WorkTimeManagementV2/src/features/work-report/utils/date-utils.ts`

Export utilities:
- `getDayName(date: Date): string`
- `isHoliday(date: Date, holidays: Holiday[]): boolean`
- `isWeekend(date: Date): boolean`
- `getDateColorClass(date: Date, holidays: Holiday[]): string`
- `getWorkdayInfo(date: Date, holidays?: Holiday[]): WorkdayInfo`
- `formatDateAsYYYYMMDD(date: Date): string`

Then refactor the three main files to use these utilities, reducing duplication and improving maintainability.
