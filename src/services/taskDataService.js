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
        }
        return task;
    },

    // Update task image position
    updateTaskImagePosition(id, position) {
        const task = taskData.tasks.find(task => task.id === id);
        if (task) {
            task.imagePosition = position;
        }
        return task;
    },

    // Toggle task completion status
    toggleTaskStatus(id) {
        const task = taskData.tasks.find(task => task.id === id);
        if (task) {
            task.done = !task.done;
        }
        return task;
    },

    // Add a new task
    addTask(newTaskData) {
        const maxId = Math.max(...taskData.tasks.map(task => task.id));
        const newTask = {
            id: maxId + 1,
            imagePosition: { x: 50, y: 50 },
            ...newTaskData
        };
        taskData.tasks.push(newTask);
        return newTask;
    },

    // Delete a task
    deleteTask(id) {
        const index = taskData.tasks.findIndex(task => task.id === id);
        if (index > -1) {
            const deletedTask = taskData.tasks[index];
            taskData.tasks.splice(index, 1);
            return deletedTask;
        }
        return null;
    }
};

// Export the reactive task data for direct access if needed
export { taskData };