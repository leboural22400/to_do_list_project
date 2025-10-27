import { DateUtils } from '../utils/dateUtils.js';

export function useDateUtils() {
    return {
        formatDisplayDate: DateUtils.formatDisplayDate,
        getDateString: DateUtils.getDateString,
        getWeekdayDate: DateUtils.getWeekdayDate,
        isToday: DateUtils.isToday,
        isPast: DateUtils.isPast,
        daysDifference: DateUtils.daysDifference,
        getRelativeTime: DateUtils.getRelativeTime
    };
}