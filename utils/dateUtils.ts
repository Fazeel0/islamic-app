// ============================================
// Date Utility Functions
// ============================================

/**
 * Get today's date in YYYY-MM-DD format
 */
export const getTodayDate = (): string => {
  const today = new Date();
  return formatDate(today);
};

/**
 * Format a Date object to YYYY-MM-DD string
 */
export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Parse a YYYY-MM-DD string to Date object
 */
export const parseDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Get a date N days ago
 */
export const getDaysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return formatDate(date);
};

/**
 * Get a date N days in the future
 */
export const getDaysFromNow = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return formatDate(date);
};

/**
 * Get the start of the week (Sunday)
 */
export const getWeekStart = (date: Date = new Date()): Date => {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Get the start of the month
 */
export const getMonthStart = (date: Date = new Date()): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

/**
 * Get an array of dates for the past N days
 */
export const getPastNDays = (n: number): string[] => {
  const dates: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    dates.push(getDaysAgo(i));
  }
  return dates;
};

/**
 * Get day of week name (e.g., "Sunday", "Mon")
 */
export const getDayName = (dateString: string, short: boolean = false): string => {
  const date = parseDate(dateString);
  const days = short 
    ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
};

/**
 * Get month name (e.g., "January", "Jan")
 */
export const getMonthName = (dateString: string, short: boolean = false): string => {
  const date = parseDate(dateString);
  const months = short
    ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return months[date.getMonth()];
};

/**
 * Format date for display (e.g., "January 15, 2026")
 */
export const formatDisplayDate = (dateString: string): string => {
  const date = parseDate(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format date for short display (e.g., "Jan 15")
 */
export const formatShortDate = (dateString: string): string => {
  const date = parseDate(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Check if two dates are the same day
 */
export const isSameDay = (date1: string, date2: string): boolean => {
  return date1 === date2;
};

/**
 * Check if date is today
 */
export const isToday = (dateString: string): boolean => {
  return dateString === getTodayDate();
};

/**
 * Check if date is yesterday
 */
export const isYesterday = (dateString: string): boolean => {
  return dateString === getDaysAgo(1);
};

/**
 * Get relative date label (Today, Yesterday, or formatted date)
 */
export const getRelativeDateLabel = (dateString: string): string => {
  if (isToday(dateString)) return 'Today';
  if (isYesterday(dateString)) return 'Yesterday';
  return formatShortDate(dateString);
};

/**
 * Calculate days between two dates
 */
export const daysBetween = (startDate: string, endDate: string): number => {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Check if a date is before another date
 */
export const isDateBefore = (date: string, compareDate: string): boolean => {
  return parseDate(date) < parseDate(compareDate);
};
