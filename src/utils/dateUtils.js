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
}

// Export individual functions
export const formatDisplayDate = (date) => DateUtils.formatDisplayDate(date);
export const getDateString = (daysOffset = 0) => DateUtils.getDateString(daysOffset);
export const getWeekdayDate = (dayName) => DateUtils.getWeekdayDate(dayName);
export const isToday = (date) => DateUtils.isToday(date);
export const isPast = (date) => DateUtils.isPast(date);
export const daysDifference = (date1, date2) => DateUtils.daysDifference(date1, date2);
export const getRelativeTime = (date) => DateUtils.getRelativeTime(date);