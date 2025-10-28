export class DateUtils {
    /**
     * Format a date for display in the UI
     */
    static formatDisplayDate(date) {
        if (!date) return 'No due date';
        
        const targetDate = typeof date === 'string' ? new Date(date + 'T00:00:00') : date;
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        
        // Check for special cases
        if (targetDate.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (targetDate.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow';
        } else if (targetDate.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        }
        
        // Check if it's within this week
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        if (targetDate >= startOfWeek && targetDate <= endOfWeek) {
            return targetDate.toLocaleDateString('en-US', { weekday: 'long' });
        }
        
        // Default format for other dates
        return targetDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    }
    
    /**
     * Get date string in YYYY-MM-DD format
     */
    static getDateString(daysOffset = 0) {
        const date = new Date();
        date.setDate(date.getDate() + daysOffset);
        return date.toISOString().split('T')[0];
    }
    
    /**
     * Get the next occurrence of a specific weekday
     */
    static getWeekdayDate(dayName) {
        const today = new Date();
        const todayIndex = today.getDay();
        
        const dayIndex = {
            'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6
        }[dayName];
        
        if (dayIndex === undefined) return this.getDateString(0);
        
        let daysUntilTarget = dayIndex - todayIndex;
        if (daysUntilTarget <= 0) {
            daysUntilTarget += 7; // Next week if day has passed
        }
        
        return this.getDateString(daysUntilTarget);
    }
    
    /**
     * Check if a date is today
     */
    static isToday(date) {
        const targetDate = typeof date === 'string' ? new Date(date + 'T00:00:00') : date;
        const today = new Date();
        return targetDate.toDateString() === today.toDateString();
    }
    
    /**
     * Check if a date is in the past
     */
    static isPast(date) {
        const targetDate = typeof date === 'string' ? new Date(date + 'T00:00:00') : date;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return targetDate < today;
    }
    
    /**
     * Get the number of days between two dates
     */
    static daysDifference(date1, date2 = new Date()) {
        const d1 = typeof date1 === 'string' ? new Date(date1 + 'T00:00:00') : date1;
        const d2 = typeof date2 === 'string' ? new Date(date2 + 'T00:00:00') : date2;
        
        const timeDiff = d1.getTime() - d2.getTime();
        return Math.ceil(timeDiff / (1000 * 3600 * 24));
    }
    
    /**
     * Get a relative time string (e.g., "2 days ago", "in 3 days")
     */
    static getRelativeTime(date) {
        const days = this.daysDifference(date);
        
        if (days === 0) return 'Today';
        if (days === 1) return 'Tomorrow';
        if (days === -1) return 'Yesterday';
        if (days > 0) return `In ${days} days`;
        return `${Math.abs(days)} days ago`;
    }

    /**
     * Parse and validate a date input string
     * Returns { isValid: boolean, date: Date|null, error: string|null }
     */
    static parseAndValidateDate(input) {
        if (!input || typeof input !== 'string') {
            return { isValid: false, date: null, error: 'Date input is required' };
        }

        const trimmedInput = input.trim().toLowerCase();
        
        // Handle natural language dates first
        const naturalDate = this.parseNaturalDate(trimmedInput);
        if (naturalDate.isValid) {
            return naturalDate;
        }

        // Handle ISO format dates (YYYY-MM-DD)
        const isoDate = this.parseISODate(trimmedInput);
        if (isoDate.isValid) {
            return isoDate;
        }
        // If it looked like an ISO date but was invalid, return that specific error
        if (isoDate.error) {
            return isoDate;
        }

        // Handle other common formats
        const commonDate = this.parseCommonFormats(trimmedInput);
        if (commonDate.isValid) {
            return commonDate;
        }

        return { 
            isValid: false, 
            date: null, 
            error: `Invalid date format: "${input}". Try "Today", "Tomorrow", weekday names, or YYYY-MM-DD format.` 
        };
    }

    /**
     * Parse natural language dates
     */
    static parseNaturalDate(input) {
        const today = new Date();
        
        switch (input) {
            case 'today':
                return { isValid: true, date: new Date(today), error: null };
                
            case 'tomorrow':
                const tomorrow = new Date(today);
                tomorrow.setDate(today.getDate() + 1);
                return { isValid: true, date: tomorrow, error: null };
                
            case 'yesterday':
                const yesterday = new Date(today);
                yesterday.setDate(today.getDate() - 1);
                return { isValid: true, date: yesterday, error: null };
                
            case 'next week':
                const nextWeek = new Date(today);
                nextWeek.setDate(today.getDate() + 7);
                return { isValid: true, date: nextWeek, error: null };
        }

        // Check for weekday names
        const weekdays = {
            'monday': 1, 'mon': 1,
            'tuesday': 2, 'tue': 2, 'tues': 2,
            'wednesday': 3, 'wed': 3,
            'thursday': 4, 'thu': 4, 'thur': 4, 'thurs': 4,
            'friday': 5, 'fri': 5,
            'saturday': 6, 'sat': 6,
            'sunday': 0, 'sun': 0
        };

        if (weekdays.hasOwnProperty(input)) {
            const targetDay = weekdays[input];
            const currentDay = today.getDay();
            let daysUntilTarget = targetDay - currentDay;
            
            if (daysUntilTarget <= 0) {
                daysUntilTarget += 7; // Next occurrence
            }
            
            const targetDate = new Date(today);
            targetDate.setDate(today.getDate() + daysUntilTarget);
            return { isValid: true, date: targetDate, error: null };
        }

        return { isValid: false, date: null, error: null };
    }

    /**
     * Parse ISO format dates (YYYY-MM-DD) with strict validation
     */
    static parseISODate(input) {
        // Check if it matches YYYY-MM-DD pattern
        const isoPattern = /^\d{4}-\d{2}-\d{2}$/;
        if (!isoPattern.test(input)) {
            return { isValid: false, date: null, error: null };
        }

        const [year, month, day] = input.split('-').map(num => parseInt(num, 10));
        
        // Validate ranges
        if (year < 1900 || year > 2100) {
            return { 
                isValid: false, 
                date: null, 
                error: `Invalid year: ${year}. Year must be between 1900 and 2100.` 
            };
        }
        
        if (month < 1 || month > 12) {
            return { 
                isValid: false, 
                date: null, 
                error: `Invalid month: ${month}. Month must be between 1 and 12.` 
            };
        }
        
        // Get the maximum days for this month
        const maxDays = new Date(year, month, 0).getDate();
        if (day < 1 || day > maxDays) {
            return { 
                isValid: false, 
                date: null, 
                error: `Invalid day: ${day}. ${this.getMonthName(month)} ${year} only has ${maxDays} days.` 
            };
        }
        
        // Create date and verify it wasn't auto-corrected
        const date = new Date(year, month - 1, day);
        if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
            return { 
                isValid: false, 
                date: null, 
                error: `Invalid date: ${input}. This date does not exist.` 
            };
        }
        
        return { isValid: true, date, error: null };
    }

    /**
     * Parse other common date formats
     */
    static parseCommonFormats(input) {
        // Handle formats like "Dec 25", "12/25", "25/12", etc.
        // For now, we'll keep this simple and just return invalid
        // This can be extended later if needed
        return { isValid: false, date: null, error: null };
    }

    /**
     * Get month name from number
     */
    static getMonthName(monthNum) {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return months[monthNum - 1] || 'Unknown';
    }

    /**
     * Convert a validated date to YYYY-MM-DD format (local timezone)
     */
    static dateToISOString(date) {
        if (!date || !(date instanceof Date)) return null;
        
        // Use local timezone instead of UTC to avoid date shifts
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    }
}

// Export individual functions
export const formatDisplayDate = (date) => DateUtils.formatDisplayDate(date);
export const getDateString = (daysOffset = 0) => DateUtils.getDateString(daysOffset);
export const getWeekdayDate = (dayName) => DateUtils.getWeekdayDate(dayName);
export const isToday = (date) => DateUtils.isToday(date);
export const isPast = (date) => DateUtils.isPast(date);
export const daysDifference = (date1, date2) => DateUtils.daysDifference(date1, date2);
export const getRelativeTime = (date) => DateUtils.getRelativeTime(date);
export const parseAndValidateDate = (input) => DateUtils.parseAndValidateDate(input);
export const dateToISOString = (date) => DateUtils.dateToISOString(date);