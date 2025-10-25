<script>
import { TaskDataService } from '../../services/taskDataService.js';

export default {
    name: 'Calendar',
    props: {
        tasks: {
            type: Array,
            default: () => []
        },
        viewMode: {
            type: String,
            default: 'month' // 'month', 'week'
        }
    },
    data() {
        return {
            currentDate: new Date(),
            selectedDate: null,
            hoveredDate: null,
            calendarTasks: [],
            monthNames: [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ],
            dayNames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            taskModal: {
                open: false,
                date: null,
                tasks: []
            }
        };
    },
    computed: {
        currentMonth() {
            return this.currentDate.getMonth();
        },
        currentYear() {
            return this.currentDate.getFullYear();
        },
        monthYear() {
            return `${this.monthNames[this.currentMonth]} ${this.currentYear}`;
        },
        calendarDays() {
            const firstDay = new Date(this.currentYear, this.currentMonth, 1);
            const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
            const firstDayWeek = firstDay.getDay();
            const daysInMonth = lastDay.getDate();
            
            const days = [];
            
            // Previous month's days
            for (let i = firstDayWeek - 1; i >= 0; i--) {
                const date = new Date(this.currentYear, this.currentMonth, -i);
                days.push({
                    date: date,
                    day: date.getDate(),
                    isCurrentMonth: false,
                    isPrevMonth: true,
                    tasks: this.getTasksForDate(date)
                });
            }
            
            // Current month's days
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(this.currentYear, this.currentMonth, day);
                days.push({
                    date: date,
                    day: day,
                    isCurrentMonth: true,
                    isToday: this.isToday(date),
                    tasks: this.getTasksForDate(date)
                });
            }
            
            // Next month's days to fill the grid
            const remainingDays = 42 - days.length; // 6 weeks * 7 days
            for (let day = 1; day <= remainingDays; day++) {
                const date = new Date(this.currentYear, this.currentMonth + 1, day);
                days.push({
                    date: date,
                    day: day,
                    isCurrentMonth: false,
                    isNextMonth: true,
                    tasks: this.getTasksForDate(date)
                });
            }
            
            return days;
        },
        allTasksStats() {
            // Show stats for all tasks
            return {
                total: this.calendarTasks.length,
                completed: this.calendarTasks.filter(task => task.done).length,
                pending: this.calendarTasks.filter(task => !task.done).length
            };
        }
    },
    mounted() {
        this.loadTasks();
    },
    methods: {
        loadTasks() {
            this.calendarTasks = TaskDataService.getAllTasks();
        },
        
        isToday(date) {
            const today = new Date();
            return date.toDateString() === today.toDateString();
        },
        
        getTasksForDate(date) {
            // Mock data - in real app, this would filter tasks by due date
            const dateStr = date.toDateString();
            const mockTasks = this.calendarTasks.filter(task => {
                // Simple mock: assign tasks to dates based on ID
                const taskDate = new Date();
                taskDate.setDate(taskDate.getDate() + (task.id % 30) - 15);
                return taskDate.toDateString() === dateStr;
            });
            
            return mockTasks;
        },
        
        navigateMonth(direction) {
            const newDate = new Date(this.currentDate);
            newDate.setMonth(this.currentDate.getMonth() + direction);
            this.currentDate = newDate;
        },
        
        goToToday() {
            this.currentDate = new Date();
            this.selectedDate = new Date();
        },
        
        selectDate(dayData) {
            this.selectedDate = dayData.date;
            if (dayData.tasks.length > 0) {
                this.showTasksForDate(dayData.date, dayData.tasks);
            }
        },
        
        showTasksForDate(date, tasks) {
            this.taskModal.date = date;
            this.taskModal.tasks = tasks;
            this.taskModal.open = true;
        },
        
        closeTaskModal() {
            this.taskModal.open = false;
            this.taskModal.date = null;
            this.taskModal.tasks = [];
        },
        
        getPriorityColor(priority) {
            const colors = {
                high: '#ff5656',
                medium: '#ffc800',
                low: '#00ff88'
            };
            return colors[priority] || '#00b4ff';
        },
        
        formatDate(date) {
            return date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        },
        
        getTaskCountClass(count) {
            if (count === 0) return '';
            
            const thresholds = {
                low: 2,
                medium: 5,
                high: 8
            };
            
            if (count <= thresholds.low) return 'low-count';
            if (count <= thresholds.medium) return 'medium-count';
            if (count <= thresholds.high) return 'high-count';
            return 'very-high-count'; // Extreme cases
        },
        
        getPreviewPosition(index) {
            // Calendar has 7 columns, so we can determine the row
            const row = Math.floor(index / 7);
            const totalRows = Math.ceil(this.calendarDays.length / 7);
            
            // Show above if we're in the last 2 rows
            if (row >= totalRows - 2) {
                return 'show-above';
            }
            return 'show-below';
        }
    }
};
</script>

<template>
    <div class="calendar-container">
        <!-- Calendar Header -->
        <div class="calendar-header">
            <div class="calendar-nav">
                <button class="nav-btn" @click="navigateMonth(-1)" title="Previous month">
                    <svg viewBox="0 0 24 24" width="20" height="20">
                        <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                    </svg>
                </button>
                
                <h2 class="month-year">{{ monthYear }}</h2>
                
                <button class="nav-btn" @click="navigateMonth(1)" title="Next month">
                    <svg viewBox="0 0 24 24" width="20" height="20">
                        <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                    </svg>
                </button>
            </div>
            
            <div class="calendar-actions">
                <button class="today-btn" @click="goToToday">Today</button>
                
                <!-- Quick Stats -->
                <div class="quick-stats">
                    <div class="stat-item">
                        <span class="stat-number">{{ allTasksStats.total }}</span>
                        <span class="stat-label">Total</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number completed">{{ allTasksStats.completed }}</span>
                        <span class="stat-label">Done</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number pending">{{ allTasksStats.pending }}</span>
                        <span class="stat-label">Pending</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Calendar Grid -->
        <div class="calendar-grid">
            <!-- Day headers -->
            <div class="day-headers">
                <div v-for="day in dayNames" :key="day" class="day-header">
                    {{ day }}
                </div>
            </div>
            
            <!-- Calendar days -->
            <div class="calendar-days">
                <div 
                    v-for="(dayData, index) in calendarDays" 
                    :key="index"
                    class="calendar-day"
                    :class="{
                        'other-month': !dayData.isCurrentMonth,
                        'today': dayData.isToday,
                        'selected': selectedDate && dayData.date.toDateString() === selectedDate.toDateString(),
                        'has-tasks': dayData.tasks.length > 0,
                        [getTaskCountClass(dayData.tasks.length)]: true
                    }"
                    @click="selectDate(dayData)"
                    @mouseenter="hoveredDate = dayData.date"
                    @mouseleave="hoveredDate = null"
                >
                    <div class="day-number">{{ dayData.day }}</div>
                    
                    <!-- Task indicators -->
                    <div class="task-indicators" v-if="dayData.tasks.length > 0">
                        <div 
                            v-for="(task, taskIndex) in dayData.tasks.slice(0, 3)" 
                            :key="task.id"
                            class="task-dot"
                            :style="{ backgroundColor: getPriorityColor(task.priority) }"
                            :title="task.title"
                        ></div>
                        <div v-if="dayData.tasks.length > 3" class="more-tasks">
                            +{{ dayData.tasks.length - 3 }}
                        </div>
                    </div>
                    
                    <!-- Hover preview -->
                    <div 
                        v-if="hoveredDate && dayData.date.toDateString() === hoveredDate.toDateString() && dayData.tasks.length > 0"
                        class="hover-preview"
                        :class="getPreviewPosition(index)"
                    >
                        <div class="preview-header">{{ dayData.tasks.length }} task{{ dayData.tasks.length !== 1 ? 's' : '' }}</div>
                        <div class="preview-tasks">
                            <div 
                                v-for="task in dayData.tasks.slice(0, 2)" 
                                :key="task.id" 
                                class="preview-task"
                                :class="{ done: task.done }"
                            >
                                <div class="task-priority" :style="{ backgroundColor: getPriorityColor(task.priority) }"></div>
                                <span class="task-title">{{ task.title }}</span>
                            </div>
                            <div v-if="dayData.tasks.length > 2" class="preview-more">
                                and {{ dayData.tasks.length - 2 }} more...
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Task Details Modal -->
        <div v-if="taskModal.open" class="modal-backdrop" @click.self="closeTaskModal">
            <div class="task-modal">
                <header class="modal-header">
                    <h3>{{ formatDate(taskModal.date) }}</h3>
                    <button class="close-btn" @click="closeTaskModal">
                        <svg viewBox="0 0 24 24" width="18" height="18">
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </button>
                </header>
                
                <div class="modal-content">
                    <div class="tasks-list">
                        <div 
                            v-for="task in taskModal.tasks" 
                            :key="task.id" 
                            class="task-item"
                            :class="{ completed: task.done }"
                        >
                            <div class="task-priority-bar" :style="{ backgroundColor: getPriorityColor(task.priority) }"></div>
                            <div class="task-content">
                                <h4 class="task-title">{{ task.title }}</h4>
                                <p class="task-category">{{ task.tag }}</p>
                                <div class="task-meta">
                                    <span class="priority-badge" :data-priority="task.priority">
                                        {{ task.priority }}
                                    </span>
                                    <span class="due-date">Due: {{ task.due }}</span>
                                </div>
                            </div>
                            <div class="task-status" :class="{ done: task.done }">
                                <svg v-if="task.done" viewBox="0 0 24 24" width="16" height="16">
                                    <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.calendar-container {
    background: #14192b;
    border-radius: 16px;
    padding: 24px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 20px;
}

.calendar-nav {
    display: flex;
    align-items: center;
    gap: 16px;
}

.nav-btn {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    background: rgba(255, 255, 255, 0.05);
    color: #e9edf8;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        background: rgba(0, 180, 255, 0.15);
        border-color: rgba(0, 180, 255, 0.3);
        color: #00b4ff;
        transform: translateY(-1px);
    }
}

.month-year {
    font-size: 24px;
    font-weight: 700;
    color: #e9edf8;
    margin: 0;
    min-width: 200px;
    text-align: center;
}

.calendar-actions {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
}

.today-btn {
    padding: 8px 16px;
    border-radius: 8px;
    border: 1px solid rgba(0, 180, 255, 0.3);
    background: rgba(0, 180, 255, 0.1);
    color: #00b4ff;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(0, 180, 255, 0.2);
        transform: translateY(-1px);
    }
}

.quick-stats {
    display: flex;
    gap: 16px;
}

.stat-item {
    text-align: center;
    
    .stat-number {
        display: block;
        font-size: 18px;
        font-weight: 700;
        color: #e9edf8;
        
        &.completed {
            color: #00ff88;
        }
        
        &.pending {
            color: #ffc800;
        }
    }
    
    .stat-label {
        display: block;
        font-size: 12px;
        color: #a8b3d4;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
}

.calendar-grid {
    background: rgba(255, 255, 255, 0.02);
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.05);
}

.day-headers {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    background: rgba(0, 180, 255, 0.08);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.day-header {
    padding: 12px 8px;
    text-align: center;
    font-weight: 700;
    font-size: 14px;
    color: #00b4ff;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.calendar-days {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
}

.calendar-day {
    min-height: 100px;
    border-right: 1px solid rgba(255, 255, 255, 0.05);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    padding: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    background: transparent;

    &:nth-child(7n) {
        border-right: none;
    }

    &.other-month {
        opacity: 0.3;
        .day-number {
            color: #6a7488;
        }
    }

    &.today {
        background: rgba(0, 180, 255, 0.1);
        
        .day-number {
            background: #00b4ff;
            color: white;
            border-radius: 50%;
            width: 28px;
            height: 28px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
        }
    }

    &.selected {
        background: rgba(0, 180, 255, 0.15);
        border-color: rgba(0, 180, 255, 0.3);
    }

    &:hover {
        background: rgba(255, 255, 255, 0.05);
        transform: translateY(-1px);
    }

    &.has-tasks:hover {
        background: rgba(0, 180, 255, 0.08);
    }

    &.low-count {
        background: rgba(0, 255, 136, 0.05);
    }

    &.medium-count {
        background: rgba(255, 200, 0, 0.05);
    }

    &.high-count {
        background: rgba(255, 86, 86, 0.05);
    }
    
    &.very-high-count {
        background: rgba(255, 0, 0, 0.1);
        border: 1px solid rgba(255, 0, 0, 0.2);
    }
}

.day-number {
    font-size: 16px;
    font-weight: 600;
    color: #e9edf8;
    margin-bottom: 8px;
}

.task-indicators {
    display: flex;
    flex-wrap: wrap;
    gap: 3px;
    align-items: center;
}

.task-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #00b4ff;
}

.more-tasks {
    font-size: 10px;
    color: #a8b3d4;
    font-weight: 600;
    margin-left: 2px;
}

.hover-preview {
    position: absolute;
    left: 0;
    right: 0;
    background: #1a2035;
    border: 1px solid rgba(0, 180, 255, 0.3);
    border-radius: 8px;
    padding: 12px;
    z-index: 10;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    animation: slideDown 0.2s ease;
    
    &.show-above {
        bottom: 100%;
        top: auto;
    }
    
    &.show-below {
        top: 100%;
        bottom: auto;
    }
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.preview-header {
    font-size: 12px;
    font-weight: 700;
    color: #00b4ff;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.preview-tasks {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.preview-task {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    
    &.done {
        opacity: 0.6;
        
        .task-title {
            text-decoration: line-through;
        }
    }
}

.task-priority {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
}

.task-title {
    color: #e9edf8;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.preview-more {
    font-size: 11px;
    color: #a8b3d4;
    font-style: italic;
    margin-top: 4px;
}

/* Modal Styles */
.modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
}

.task-modal {
    background: #14192b;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.7);
    width: min(600px, 95vw);
    max-height: 80vh;
    overflow: hidden;
    animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
    from {
        opacity: 0;
        transform: translateY(-20px) scale(0.95);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    background: linear-gradient(135deg, #1e2750, #1a2447);
    border-bottom: 1px solid rgba(0, 180, 255, 0.15);

    h3 {
        margin: 0;
        font-size: 18px;
        color: #e1f0ff;
        font-weight: 700;
    }
}

.close-btn {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.08);
    color: #e1f0ff;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        background: rgba(255, 86, 86, 0.15);
        border-color: rgba(255, 86, 86, 0.3);
        color: #ff9999;
    }
}

.modal-content {
    padding: 24px;
    max-height: 60vh;
    overflow-y: auto;
}

.tasks-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.task-item {
    background: #1a2035;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 16px;
    display: flex;
    gap: 16px;
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;

    &:hover {
        border-color: rgba(255, 255, 255, 0.12);
        transform: translateY(-1px);
    }

    &.completed {
        opacity: 0.7;
        
        .task-title {
            text-decoration: line-through;
            color: #a9ffcf;
        }
    }
}

.task-priority-bar {
    width: 4px;
    border-radius: 2px;
    background: #00b4ff;
    flex-shrink: 0;
}

.task-content {
    flex: 1;
    
    .task-title {
        font-size: 16px;
        font-weight: 600;
        color: #e9edf8;
        margin: 0 0 4px 0;
    }
    
    .task-category {
        font-size: 14px;
        color: #a8b3d4;
        margin: 0 0 8px 0;
    }
}

.task-meta {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
}

.priority-badge {
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;

    &[data-priority="high"] {
        background: rgba(255, 86, 86, 0.2);
        color: #ffd5d5;
        border: 1px solid rgba(255, 86, 86, 0.3);
    }

    &[data-priority="medium"] {
        background: rgba(255, 195, 0, 0.2);
        color: #ffeec2;
        border: 1px solid rgba(255, 195, 0, 0.3);
    }

    &[data-priority="low"] {
        background: rgba(0, 255, 170, 0.2);
        color: #d2ffe9;
        border: 1px solid rgba(0, 255, 170, 0.3);
    }
}

.due-date {
    font-size: 12px;
    color: #a8b3d4;
}

.task-status {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    &.done {
        background: #00ff88;
        border-color: #00ff88;
        color: white;
    }
}

/* Responsive Design */
@media (max-width: 768px) {
    .calendar-container {
        padding: 16px;
    }

    .calendar-header {
        flex-direction: column;
        gap: 16px;
        text-align: center;
    }

    .quick-stats {
        justify-content: center;
    }

    .calendar-day {
        min-height: 80px;
        padding: 6px;
    }

    .month-year {
        font-size: 20px;
        min-width: auto;
    }

    .task-modal {
        margin: 10px;
    }

    .hover-preview {
        display: none; // Hide on mobile for better UX
    }
}

@media (max-width: 480px) {
    .day-header {
        padding: 8px 4px;
        font-size: 12px;
    }

    .calendar-day {
        min-height: 60px;
        padding: 4px;
    }

    .day-number {
        font-size: 14px;
    }

    .task-dot {
        width: 4px;
        height: 4px;
    }
}
</style>