// This service manages the task data for the to-do list application.
import { reactive } from 'vue';
import { getDateString, getWeekdayDate } from '../utils/dateUtils.js';

const taskData = reactive({
    tasks: [
        { 
            id: 1, 
            title: "Use Git and GitHub", 
            tag: "Version Control", 
            due: getWeekdayDate('Fri'), 
            priority: "medium", 
            done: false, 
            imageUrl: "https://images.unsplash.com/photo-1618401479427-c8ef9465fbe1?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1443", 
            imagePosition: { x: 50, y: 50 } 
        },
        { 
            id: 2, 
            title: "Submit C Lab", 
            tag: "EFREI", 
            due: getDateString(1), // Tomorrow
            priority: "high", 
            done: false, 
            imageUrl: "", 
            imagePosition: { x: 50, y: 50 } 
        },
        { 
            id: 3, 
            title: "Review binary systems", 
            tag: "Digital Systems", 
            due: getWeekdayDate('Fri'), 
            priority: "medium", 
            done: false, 
            imageUrl: "", 
            imagePosition: { x: 50, y: 50 } 
        },
        { 
            id: 4, 
            title: "Fix linked list", 
            tag: "C Project", 
            due: getDateString(0), // Today
            priority: "high", 
            done: true, 
            imageUrl: "", 
            imagePosition: { x: 50, y: 50 } 
        },
        { 
            id: 5, 
            title: "Prepare democracy slides", 
            tag: "Humanities", 
            due: getWeekdayDate('Mon'), 
            priority: "low", 
            done: false, 
            imageUrl: "", 
            imagePosition: { x: 50, y: 50 } 
        },
        { 
            id: 6, 
            title: "Probability exercises", 
            tag: "Maths", 
            due: getWeekdayDate('Wed'), 
            priority: "medium", 
            done: false, 
            imageUrl: "", 
            imagePosition: { x: 50, y: 50 } 
        },
        { 
            id: 7, 
            title: "Dockerize mini-app", 
            tag: "Tooling", 
            due: getWeekdayDate('Tue'), 
            priority: "high", 
            done: false, 
            imageUrl: "", 
            imagePosition: { x: 50, y: 50 } 
        },
        { 
            id: 8, 
            title: "Read about REST APIs", 
            tag: "Web", 
            due: getDateString(7), // Next week
            priority: "low", 
            done: false, 
            imageUrl: "", 
            imagePosition: { x: 50, y: 50 } 
        },
        { 
            id: 9, 
            title: "Review algorithms", 
            tag: "Computer Science", 
            due: getDateString(8), // Next week
            priority: "medium", 
            done: false, 
            imageUrl: "", 
            imagePosition: { x: 50, y: 50 } 
        },
        { 
            id: 10, 
            title: "Practice coding problems", 
            tag: "Programming", 
            due: getDateString(1), // Tomorrow
            priority: "high", 
            done: false, 
            imageUrl: "", 
            imagePosition: { x: 50, y: 50 } 
        }
    ]
});

export const TaskDataService = {
    // Initialize data from localStorage
    initializeFromStorage() {
        const savedTasks = localStorage.getItem('todoItems');
        if (savedTasks) {
            try {
                const parsedTasks = JSON.parse(savedTasks);
                taskData.tasks = parsedTasks;
            } catch (error) {
                console.error('Error parsing saved tasks:', error);
            }
        }
    },

    // Save tasks to localStorage
    saveToStorage() {
        try {
            localStorage.setItem('todoItems', JSON.stringify(taskData.tasks));
        } catch (error) {
            console.error('Error saving tasks to storage:', error);
        }
    },

    // Get all tasks
    getAllTasks() {
        return taskData.tasks;
    },

    // Get task by ID
    getTaskById(id) {
        return taskData.tasks.find(task => task.id === id);
    },

    // Update task details
    updateTask(id, updates) {
        const task = taskData.tasks.find(task => task.id === id);
        if (task) {
            Object.assign(task, updates);
            this.saveToStorage(); 
        }
        return task;
    },

    // Update task image URL and optionally position
    updateTaskImage(id, imageUrl, imagePosition = null) {
        const task = taskData.tasks.find(task => task.id === id);
        if (task) {
            task.imageUrl = imageUrl;
            if (imagePosition) {
                task.imagePosition = imagePosition;
            }
            this.saveToStorage(); 
        }
        return task;
    },

    // Update task image position
    updateTaskImagePosition(id, position) {
        const task = taskData.tasks.find(task => task.id === id);
        if (task) {
            task.imagePosition = position;
            this.saveToStorage(); 
        }
        return task;
    },

    // Toggle task completion status
    toggleTaskStatus(id) {
        const task = taskData.tasks.find(task => task.id === id);
        if (task) {
            task.done = !task.done;
            this.saveToStorage(); 
        }
        return task;
    },

    // Add a new task
    addTask(newTaskData) {
        const maxId = Math.max(...taskData.tasks.map(task => task.id), 0);
        const newTask = {
            id: maxId + 1,
            imagePosition: { x: 50, y: 50 },
            ...newTaskData
        };
        taskData.tasks.push(newTask);
        this.saveToStorage(); 
        return newTask;
    },

    // Delete a task
    deleteTask(id) {
        const index = taskData.tasks.findIndex(task => task.id === id);
        if (index > -1) {
            const deletedTask = taskData.tasks[index];
            taskData.tasks.splice(index, 1);
            this.saveToStorage(); 
            return deletedTask;
        }
        return null;
    },

    // Import tasks from JSON 
    importFromJSON(jsonData) {
        try {
            const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
            
            if (!data.tasks || !Array.isArray(data.tasks)) {
                throw new Error('Invalid JSON format: missing tasks array');
            }

            const importResults = {
                imported: 0,
                updated: 0,
                duplicates: 0,
                errors: []
            };

            data.tasks.forEach((importTask, index) => {
                try {
                    if (!importTask.title) {
                        importResults.errors.push(`Task ${index + 1}: Missing title`);
                        return;
                    }

                    // Check for existing task by ID or title
                    const existingTaskById = importTask.id ? this.getTaskById(importTask.id) : null;
                    const existingTaskByTitle = taskData.tasks.find(task => 
                        task.title.toLowerCase().trim() === importTask.title.toLowerCase().trim()
                    );

                    if (existingTaskById || existingTaskByTitle) {
                        // Update existing task
                        const existingTask = existingTaskById || existingTaskByTitle;
                        const updates = {
                            title: importTask.title,
                            tag: importTask.tag || existingTask.tag || '',
                            due: importTask.due || existingTask.due,
                            priority: importTask.priority || existingTask.priority || 'medium',
                            done: importTask.done !== undefined ? importTask.done : existingTask.done,
                            imageUrl: importTask.imageUrl || existingTask.imageUrl || '',
                            imagePosition: importTask.imagePosition || existingTask.imagePosition || { x: 50, y: 50 }
                        };
                        
                        this.updateTask(existingTask.id, updates);
                        importResults.updated++;
                    } else {
                        // Add new task
                        const newTaskData = {
                            title: importTask.title,
                            tag: importTask.tag || '',
                            due: importTask.due || '',
                            priority: importTask.priority || 'medium',
                            done: importTask.done || false,
                            imageUrl: importTask.imageUrl || '',
                            imagePosition: importTask.imagePosition || { x: 50, y: 50 }
                        };
                        
                        this.addTask(newTaskData);
                        importResults.imported++;
                    }
                } catch (error) {
                    importResults.errors.push(`Task ${index + 1}: ${error.message}`);
                }
            });

            return importResults;
        } catch (error) {
            throw new Error(`JSON import failed: ${error.message}`);
        }
    },

    exportToJSON() {
        const exportData = {
            exportDate: new Date().toISOString(),
            version: '1.0',
            metadata: {
                totalTasks: taskData.tasks.length,
                completedTasks: taskData.tasks.filter(task => task.done).length,
                pendingTasks: taskData.tasks.filter(task => !task.done).length,
                tasksByPriority: {
                    high: taskData.tasks.filter(task => task.priority === 'high').length,
                    medium: taskData.tasks.filter(task => task.priority === 'medium').length,
                    low: taskData.tasks.filter(task => task.priority === 'low').length
                }
            },
            tasks: taskData.tasks.map(task => ({
                id: task.id,
                title: task.title,
                tag: task.tag,
                due: task.due,
                priority: task.priority,
                done: task.done,
                imageUrl: task.imageUrl,
                imagePosition: task.imagePosition,
                exportedAt: new Date().toISOString()
            }))
        };
        
        return exportData;
    },

    // Download tasks as JSON file
    downloadAsJSON(filename = null) {
        const data = this.exportToJSON();
        const jsonString = JSON.stringify(data, null, 2);
        
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || `tasks-export-${new Date().toISOString().split('T')[0]}.json`;
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        
        return data;
    },

    // Export tasks as plain text
    exportAsPlainText() {
        const tasks = taskData.tasks;
        const exportDate = new Date().toLocaleDateString('en-CA');
        
        let textContent = `TASK LIST - ${exportDate}\n`;
        textContent += `${'='.repeat(50)}\n\n`;
        
        // Group tasks by status
        const completedTasks = tasks.filter(task => task.done);
        const pendingTasks = tasks.filter(task => !task.done);
        
        // Statistics
        textContent += `SUMMARY:\n`;
        textContent += `- Total tasks: ${tasks.length}\n`;
        textContent += `- Completed: ${completedTasks.length}\n`;
        textContent += `- In progress: ${pendingTasks.length}\n\n`;
        
        // Pending tasks
        if (pendingTasks.length > 0) {
            textContent += `IN PROGRESS (${pendingTasks.length}):\n`;
            textContent += `${'-'.repeat(30)}\n`;
            
            pendingTasks.forEach((task, index) => {
                const priority = task.priority ? `[${task.priority.toUpperCase()}]` : '';
                const due = task.due ? `Due: ${task.due}` : '';
                const tag = task.tag ? `Category: ${task.tag}` : '';
                
                textContent += `${index + 1}. [ ] ${task.title} ${priority}\n`;
                if (due || tag) {
                    const details = [due, tag].filter(Boolean).join(' | ');
                    textContent += `    ${details}\n`;
                }
                textContent += '\n';
            });
        }
        
        // Completed tasks
        if (completedTasks.length > 0) {
            textContent += `COMPLETED (${completedTasks.length}):\n`;
            textContent += `${'-'.repeat(30)}\n`;
            
            completedTasks.forEach((task, index) => {
                const tag = task.tag ? `Category: ${task.tag}` : '';
                textContent += `${index + 1}. [X] ${task.title}\n`;
                if (tag) {
                    textContent += `    ${tag}\n`;
                }
                textContent += '\n';
            });
        }
        
        textContent += `\n${'='.repeat(50)}\n`;
        textContent += `Generated: ${new Date().toLocaleDateString('en-CA')} ${new Date().toLocaleTimeString('en-CA', { hour12: false })}\n`;
        
        return textContent;
    },

    // Download tasks as plain text file
    downloadAsPlainText(filename = null) {
        const textContent = this.exportAsPlainText();
        
        const blob = new Blob([textContent], { type: 'text/plain; charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || `tasks-${new Date().toISOString().split('T')[0]}.txt`;
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        
        return {
            content: textContent,
            totalTasks: taskData.tasks.length,
            completedTasks: taskData.tasks.filter(task => task.done).length,
            pendingTasks: taskData.tasks.filter(task => !task.done).length
        };
    },

    // Export tasks as iCalendar format (VEVENT for Google Calendar compatibility)
    exportAsICalendar() {
        const tasks = taskData.tasks;
        const now = new Date();
        const timestamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        
        let icalContent = 'BEGIN:VCALENDAR\n';
        icalContent += 'VERSION:2.0\n';
        icalContent += 'PRODID:-//MyToDoList//Task Calendar//EN\n';
        icalContent += 'CALSCALE:GREGORIAN\n';
        icalContent += 'METHOD:PUBLISH\n';
        icalContent += 'X-WR-CALNAME:My Tasks\n';
        icalContent += 'X-WR-CALDESC:Tasks exported from MyToDoList\n\n';
        
        tasks.forEach(task => {
            const uid = `task-${task.id}-${timestamp}@mytodolist.app`;
            const created = timestamp;
            const lastModified = timestamp;
            
            // Parse due date
            let dtstamp = timestamp;
            let dtstart = '';
            let dtend = '';
            
            if (task.due) {
                try {
                    const dueDate = new Date(task.due);
                    if (!isNaN(dueDate.getTime())) {
                        // For events, set start time to 9 AM on the due date
                        dueDate.setHours(9, 0, 0, 0);
                        dtstart = dueDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
                        // Set end time 1 hour after start
                        const endDate = new Date(dueDate.getTime() + 60 * 60 * 1000);
                        dtend = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
                    }
                } catch (e) {
                    console.warn('Invalid date format for task:', task.title, task.due);
                }
            }
            
            // If no due date, create an event for today
            if (!dtstart) {
                const today = new Date();
                today.setHours(9, 0, 0, 0); // Set to 9 AM
                dtstart = today.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
                const endTime = new Date(today.getTime() + 60 * 60 * 1000); // 1 hour duration
                dtend = endTime.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
            }
            
            // Use VEVENT instead of VTODO for Google Calendar compatibility
            icalContent += 'BEGIN:VEVENT\n';
            icalContent += `UID:${uid}\n`;
            icalContent += `DTSTAMP:${dtstamp}\n`;
            icalContent += `CREATED:${created}\n`;
            icalContent += `LAST-MODIFIED:${lastModified}\n`;
            
            // Add task title with completion status
            const statusPrefix = task.done ? '[COMPLETED] ' : '';
            const escapedTitle = `${statusPrefix}${task.title}`.replace(/[,;\\]/g, '\\$&').replace(/\n/g, '\\n');
            icalContent += `SUMMARY:${escapedTitle}\n`;
            
            // Add start and end times (required for VEVENT)
            icalContent += `DTSTART:${dtstart}\n`;
            icalContent += `DTEND:${dtend}\n`;
            
            // Add categories (tags)
            if (task.tag) {
                icalContent += `CATEGORIES:${task.tag.replace(/[,;\\]/g, '\\$&')}\n`;
            }
            
            // Build description with task details
            let description = '';
            description += `Title: ${task.title}\\n`;
            description += `Status: ${task.done ? 'Completed' : 'In Progress'}\\n`;
            if (task.tag) description += `Category: ${task.tag}\\n`;
            if (task.priority) description += `Priority: ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}\\n`;
            if (task.due) description += `Due Date: ${task.due}\\n`;
            description += `\\nExported: ${new Date().toLocaleDateString('en-CA')} ${new Date().toLocaleTimeString('en-CA', { hour12: false })}`;
            
            icalContent += `DESCRIPTION:${description}\n`;
            
            // Add priority as location for visibility
            if (task.priority) {
                icalContent += `LOCATION:Priority ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}\n`;
            }
            
            icalContent += 'END:VEVENT\n\n';
        });
        
        icalContent += 'END:VCALENDAR\n';
        
        return icalContent;
    },

    // Download tasks as iCalendar file
    downloadAsICalendar(filename = null) {
        const icalContent = this.exportAsICalendar();
        
        const blob = new Blob([icalContent], { type: 'text/calendar; charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || `tasks-${new Date().toISOString().split('T')[0]}.ics`;
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        
        return {
            content: icalContent,
            totalTasks: taskData.tasks.length,
            completedTasks: taskData.tasks.filter(task => task.done).length,
            pendingTasks: taskData.tasks.filter(task => !task.done).length
        };
    }
};

// Initialize from localStorage on module load
TaskDataService.initializeFromStorage();

// Export the reactive task data for direct access if needed
export { taskData };