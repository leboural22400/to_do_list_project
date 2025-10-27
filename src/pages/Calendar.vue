<script>
import Calendar from '../components/Calendar/Calendar.vue';
import { TaskDataService } from '../services/taskDataService.js';

export default {
    name: 'CalendarPage',
    components: {
        Calendar
    },
    data() {
        return {
            tasks: [],
            pageTitle: 'Task Calendar',
            showBackButton: true
        };
    },
    computed: {
        completedTasks() {
            return this.tasks.filter(task => task.done).length;
        },
        pendingTasks() {
            return this.tasks.filter(task => !task.done).length;
        },
        highPriorityTasks() {
            return this.tasks.filter(task => task.priority === 'high').length;
        }
    },
    mounted() {
        this.loadTasks();
    },
    methods: {
        loadTasks() {
            this.tasks = TaskDataService.getAllTasks();
        },
        goBack() {
            this.$router.go(-1);
        },
        goHome() {
            this.$router.push('/');
        },
        shareCalendar() {
            if (navigator.share) {
                navigator.share({
                    title: 'My Task Calendar',
                    text: `Check out my task calendar with ${this.tasks.length} tasks!`,
                    url: window.location.href
                }).catch(console.error);
            } else {
                // Fallback: copy to clipboard
                navigator.clipboard.writeText(window.location.href).then(() => {
                    alert('Calendar link copied to clipboard!');
                }).catch(() => {
                    alert('Could not copy link. Please copy manually: ' + window.location.href);
                });
            }
        },
        exportCalendar() {
            const data = {
                exportDate: new Date().toISOString(),
                totalTasks: this.tasks.length,
                completedTasks: this.completedTasks,
                pendingTasks: this.pendingTasks,
                tasks: this.tasks.map(task => ({
                    id: task.id,
                    title: task.title,
                    tag: task.tag,
                    due: task.due,
                    priority: task.priority,
                    done: task.done,
                    exportDate: new Date().toLocaleDateString()
                }))
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `task-calendar-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    }
};
</script>

<template>
    <div class="calendar-page">
        <!-- Header -->
        <header class="page-header">
            <div class="header-content">
                <div class="header-left">
                    <button class="back-btn" @click="goBack" title="Go back">
                        <svg viewBox="0 0 24 24" width="20" height="20">
                            <path d="M19 12H5m7-7l-7 7 7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                        </svg>
                        Back
                    </button>
                    
                    <h1 class="page-title">{{ pageTitle }}</h1>
                </div>
                
                <div class="header-actions">
                    <button class="action-btn home-btn" @click="goHome" title="Go to home">
                        <svg viewBox="0 0 24 24" width="18" height="18">
                            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" stroke-width="2" fill="none"/>
                            <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" stroke-width="2" fill="none"/>
                        </svg>
                        Home
                    </button>
                    
                    <button class="action-btn share-btn" @click="shareCalendar" title="Share calendar">
                        <svg viewBox="0 0 24 24" width="18" height="18">
                            <circle cx="18" cy="5" r="3" stroke="currentColor" stroke-width="2" fill="none"/>
                            <circle cx="6" cy="12" r="3" stroke="currentColor" stroke-width="2" fill="none"/>
                            <circle cx="18" cy="19" r="3" stroke="currentColor" stroke-width="2" fill="none"/>
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke="currentColor" stroke-width="2"/>
                            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke="currentColor" stroke-width="2"/>
                        </svg>
                        Share
                    </button>
                    
                    <button class="action-btn export-btn" @click="exportCalendar" title="Export calendar">
                        <svg viewBox="0 0 24 24" width="18" height="18">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" stroke-width="2" fill="none"/>
                            <polyline points="7,10 12,15 17,10" stroke="currentColor" stroke-width="2" fill="none"/>
                            <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2"/>
                        </svg>
                        Export
                    </button>
                </div>
            </div>
        </header>

        <!-- Calendar Content -->
        <main class="calendar-content">
            <div class="container">
                <!-- Calendar Statistics -->
                <div class="calendar-stats">
                    <div class="stat-card">
                        <div class="stat-icon">
                            <svg viewBox="0 0 24 24" width="24" height="24">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
                                <polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="2" fill="none"/>
                            </svg>
                        </div>
                        <div class="stat-content">
                            <div class="stat-number">{{ tasks.length }}</div>
                            <div class="stat-label">Total Tasks</div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon completed">
                            <svg viewBox="0 0 24 24" width="24" height="24">
                                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="currentColor" stroke-width="2" fill="none"/>
                                <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" stroke-width="2" fill="none"/>
                            </svg>
                        </div>
                        <div class="stat-content">
                            <div class="stat-number">{{ completedTasks }}</div>
                            <div class="stat-label">Completed</div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon pending">
                            <svg viewBox="0 0 24 24" width="24" height="24">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
                                <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="2"/>
                                <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" stroke-width="2"/>
                            </svg>
                        </div>
                        <div class="stat-content">
                            <div class="stat-number">{{ pendingTasks }}</div>
                            <div class="stat-label">Pending</div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon high-priority">
                            <svg viewBox="0 0 24 24" width="24" height="24">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
                                <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="2"/>
                                <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" stroke-width="2"/>
                            </svg>
                        </div>
                        <div class="stat-content">
                            <div class="stat-number">{{ highPriorityTasks }}</div>
                            <div class="stat-label">High Priority</div>
                        </div>
                    </div>
                </div>

                <!-- Calendar Component -->
                <div class="calendar-wrapper">
                    <Calendar :tasks="tasks" />
                </div>
            </div>
        </main>
    </div>
</template>

<style scoped lang="scss">
.calendar-page {
    min-height: 100vh;
    background: #0f1525 radial-gradient(1200px 400px at 50% -10%, rgba(0, 180, 255, 0.08), transparent 60%);
    color: #e9edf8;
}

.page-header {
    background: rgba(20, 25, 43, 0.8);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding: 20px 0;
    position: sticky;
    top: 0;
    z-index: 100;

    @media (max-width: 768px) {
        z-index: 0; // Otherwise it will overlap with the navbar
    }
}

.header-content {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 24px;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 20px;
}

.back-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 10px;
    color: #e9edf8;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(255, 255, 255, 0.1);
        transform: translateX(-2px);
        border-color: rgba(255, 255, 255, 0.2);
    }

    svg {
        flex-shrink: 0;
    }
}

.page-title {
    font-size: 28px;
    font-weight: 800;
    color: #6ae8ff;
    text-shadow: 0 0 8px rgba(0, 240, 255, .35);
    margin: 0;
}

.header-actions {
    display: flex;
    gap: 12px;
}

.action-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    background: rgba(255, 255, 255, 0.05);
    color: #e9edf8;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(255, 255, 255, 0.1);
        transform: translateY(-1px);
        border-color: rgba(255, 255, 255, 0.2);
    }

    &.home-btn:hover {
        background: rgba(0, 180, 255, 0.15);
        border-color: rgba(0, 180, 255, 0.3);
        color: #00b4ff;
    }

    &.share-btn:hover {
        background: rgba(255, 200, 0, 0.15);
        border-color: rgba(255, 200, 0, 0.3);
        color: #ffc800;
    }

    &.export-btn:hover {
        background: rgba(0, 255, 136, 0.15);
        border-color: rgba(0, 255, 136, 0.3);
        color: #00ff88;
    }

    svg {
        flex-shrink: 0;
    }
}

.calendar-content {
    padding: 40px 0;
}

.container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 24px;
}

.calendar-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 40px;
}

.stat-card {
    background: #1a2035;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 24px;
    display: flex;
    align-items: center;
    gap: 16px;
    transition: all 0.2s ease;

    &:hover {
        border-color: rgba(255, 255, 255, 0.12);
        transform: translateY(-2px);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    }
}

.stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.08);
    color: #e9edf8;
    flex-shrink: 0;

    &.completed {
        background: rgba(0, 255, 136, 0.15);
        color: #00ff88;
    }

    &.pending {
        background: rgba(255, 200, 0, 0.15);
        color: #ffc800;
    }

    &.high-priority {
        background: rgba(255, 86, 86, 0.15);
        color: #ff5656;
    }
}

.stat-content {
    flex: 1;
}

.stat-number {
    font-size: 24px;
    font-weight: 800;
    color: #e9edf8;
    margin-bottom: 4px;
}

.stat-label {
    font-size: 14px;
    color: #a8b3d4;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 600;
}

.calendar-wrapper {
    animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Responsive Design */
@media (max-width: 1024px) {
    .header-content {
        padding: 0 20px;
    }

    .container {
        padding: 0 20px;
    }

    .calendar-stats {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
    }
}

@media (max-width: 768px) {
    .header-content {
        flex-direction: column;
        gap: 16px;
        text-align: center;
    }

    .header-left {
        flex-direction: column;
        gap: 12px;
    }

    .header-actions {
        width: 100%;
        justify-content: center;
        flex-wrap: wrap;
    }

    .page-title {
        font-size: 24px;
    }

    .calendar-content {
        padding: 24px 0;
    }

    .container {
        padding: 0 16px;
    }

    .calendar-stats {
        grid-template-columns: 1fr;
        gap: 12px;
        margin-bottom: 24px;
    }

    .stat-card {
        padding: 20px;
    }

    .stat-number {
        font-size: 20px;
    }

    .action-btn {
        flex: 1;
        justify-content: center;
        min-width: 120px;
    }
}

@media (max-width: 480px) {
    .header-content {
        padding: 0 12px;
    }

    .container {
        padding: 0 12px;
    }

    .stat-card {
        padding: 16px;
        gap: 12px;
    }

    .stat-icon {
        width: 40px;
        height: 40px;

        svg {
            width: 20px;
            height: 20px;
        }
    }

    .stat-number {
        font-size: 18px;
    }

    .stat-label {
        font-size: 12px;
    }

    .action-btn {
        padding: 8px 12px;
        font-size: 13px;

        svg {
            width: 16px;
            height: 16px;
        }
    }
}
</style>