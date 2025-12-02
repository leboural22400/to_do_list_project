<script>
import {
  updateList,
  destroyList,
  createNewList,
} from "@/middleware/listService.js";
import { TaskDataService } from "../../services/taskDataService.js";
import { useToast } from "vue-toastification";
import AuthService from "@/services/authService.js";
import { dateToISOString, parseAndValidateDate } from "@/utils/dateUtils.js";

export default {
  name: "Calendar",
  props: {
    lists: {
      type: Array,
      default: () => [],
    },
    viewMode: {
      type: String,
      default: "month", // 'month', 'week'
    },
  },
  setup() {
    const toast = useToast();
    return { toast };
  },
  data() {
    return {
      currentDate: new Date(),
      selectedDate: null,
      hoveredDate: null,
      calendarTasks: [],
      monthNames: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ],
      dayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      taskModal: {
        open: false,
        date: null,
        tasks: [],
      },
      addTaskModal: {
        open: false,
        mode: "create", // 'create' or 'update'
        date: null,
        editingTask: null,
        form: {
          title: "",
          tag: "",
          priority: "medium",
        },
      },
      deleteModal: {
        open: false,
        taskToDelete: null,
      },
      AuthService: AuthService,
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
          lists: this.getTasksForDate(date),
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
          lists: this.getTasksForDate(date),
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
          lists: this.getTasksForDate(date),
        });
      }

      return days;
    },
    allTasksStats() {
      // Show stats for all tasks
      return {
        total: this.calendarTasks.length,
        completed: this.calendarTasks.filter((task) => task.stateTask === 2)
          .length,
        doing: this.calendarTasks.filter((task) => task.stateTask === 1).length,
        pending: this.calendarTasks.filter((task) => task.stateTask === 0)
          .length,
      };
    },
  },
  methods: {
    openTaskDetail(task) {
      // Emit event to parent component to handle navigation
      this.$emit("open-task-detail", task);
    },

    isToday(date) {
      const today = new Date();
      return date.toDateString() === today.toDateString();
    },

    getTasksForDate(date) {
      // Filter tasks by their due date
      const targetDateStr = date.toISOString().split("T")[0]; // YYYY-MM-DD format

      return this.lists.filter((list) => {
        if (!list.dueDateList) return false;

        // If task.due is already in YYYY-MM-DD format, compare directly
        if (list.dueDateList.includes("-")) {
          return list.dueDateList === targetDateStr;
        }

        // For legacy string dates, convert them
        const taskDate = this.parseLegacyDate(list.dueDateList);
        if (taskDate) {
          return taskDate.toISOString().split("T")[0] === targetDateStr;
        }

        return false;
      });
    },

    parseLegacyDate(dueDateStr) {
      // Helper method to parse legacy date strings like "Today", "Tomorrow", etc.
      const today = new Date();

      switch (dueDateStr.toLowerCase()) {
        case "today":
          return new Date(today);
        case "tomorrow":
          const tomorrow = new Date(today);
          tomorrow.setDate(today.getDate() + 1);
          return tomorrow;
        case "mon":
        case "monday":
          return this.getNextWeekday(1); // Monday
        case "tue":
        case "tuesday":
          return this.getNextWeekday(2); // Tuesday
        case "wed":
        case "wednesday":
          return this.getNextWeekday(3); // Wednesday
        case "thu":
        case "thursday":
          return this.getNextWeekday(4); // Thursday
        case "fri":
        case "friday":
          return this.getNextWeekday(5); // Friday
        case "sat":
        case "saturday":
          return this.getNextWeekday(6); // Saturday
        case "sun":
        case "sunday":
          return this.getNextWeekday(0); // Sunday
        case "next week":
          const nextWeek = new Date(today);
          nextWeek.setDate(today.getDate() + 7);
          return nextWeek;
        default:
          return null;
      }
    },

    getNextWeekday(targetDay) {
      // Get the next occurrence of a specific weekday
      const today = new Date();
      const todayDay = today.getDay();
      let daysUntilTarget = targetDay - todayDay;

      if (daysUntilTarget <= 0) {
        daysUntilTarget += 7; // Next week if day has passed
      }

      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + daysUntilTarget);
      return targetDate;
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
      if (dayData.lists.length > 0) {
        this.showTasksForDate(dayData.date, dayData.lists);
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

    openAddTaskModal(date) {
      this.addTaskModal.mode = "create";
      this.addTaskModal.date = date;
      this.addTaskModal.editingTask = null;
      this.addTaskModal.form = {
        title: "",
        tag: "",
        priority: "medium",
        date: date.toISOString().slice(0, 10),
      };
      this.addTaskModal.open = true;
    },

    updateTask(task) {
      this.addTaskModal.mode = "update";
      this.addTaskModal.date = new Date(task.dueDateList);
      this.addTaskModal.editingTask = task;
      this.addTaskModal.form = {
        title: task.titleList,
        tag: task.descriptionList,
        date: task.dueDateList,
        priority: task.priorityList,
      };
      this.addTaskModal.open = true;
    },

    closeAddTaskModal() {
      this.addTaskModal.open = false;
      this.addTaskModal.mode = "create";
      this.addTaskModal.date = null;
      this.addTaskModal.editingTask = null;
      this.addTaskModal.form = {
        title: "",
        tag: "",
        priority: "medium",
      };
    },

    addNewTask() {
      if (!this.addTaskModal.form.title.trim()) {
        alert("Please enter a task title");
        return;
      }

      if (this.addTaskModal.form.date.trim()) {
        console.log("🔍 Validating date input:", this.addTaskModal.form.date);
        const dateValidation = parseAndValidateDate(
          this.addTaskModal.form.date
        );
        console.log("🔍 Validation result:", dateValidation);

        if (!dateValidation.isValid) {
          console.error("❌ Date validation failed:", dateValidation.error);
          return;
        }

        // Convert to ISO format for storage
        const originalDue = this.addTaskModal.form.date;
        this.addTaskModal.form.date = dateToISOString(dateValidation.date);
        console.log(
          "✅ Date converted from",
          originalDue,
          "to",
          this.addTaskModal.form.date
        );
      }

      if (this.addTaskModal.mode === "update") {
        // Update existing task
        const updates = {
          titleList: this.addTaskModal.form.title.trim(),
          descriptionList: this.addTaskModal.form.tag.trim() || "General",
          priorityList: this.addTaskModal.form.priority,
          dueDateList: this.addTaskModal.form.date,
        };
        updateList(updates, this.addTaskModal.editingTask.idList);
      } else {
        // Create new task
        const newList = {
          titleList: this.addTaskModal.form.title.trim(),
          descriptionList: this.addTaskModal.form.tag.trim() || "General",
          priorityList: this.addTaskModal.form.priority,
          dueDateList: this.addTaskModal.form.date,
          stateList: false,
          idUser: AuthService.user.value,
        };
        createNewList(newList);
      }
      this.closeAddTaskModal();
      location.reload();
    },

    toggleTaskStatus(task) {
      const wasCompleted = task.done;
      TaskDataService.toggleTaskStatus(task.id);
      // Reload tasks to update the calendar
      this.loadTasks();

      // Show toast notification
      if (wasCompleted) {
        this.toast.info(`Task "${task.title}" marked as incomplete`);
      } else {
        this.toast.success(`Task "${task.title}" completed!`);
      }
    },

    deleteTask(task) {
      // Open confirmation modal instead of confirm()
      this.deleteModal.open = true;
      this.deleteModal.taskToDelete = task;
    },

    confirmDelete() {
      const task = this.deleteModal.taskToDelete;
      if (!task) return;
      destroyList(task.idList).then(() => {
        this.closeDeleteModal();
        location.reload();
      });
    },

    closeDeleteModal() {
      this.deleteModal.open = false;
      this.deleteModal.taskToDelete = null;
    },

    getPriorityColor(priority) {
      const colors = {
        high: "#ff5656",
        medium: "#ffc800",
        low: "#00ff88",
      };
      return colors[priority] || "#00b4ff";
    },

    formatDate(date) {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },

    formatTaskDueDate(dueDate) {
      if (!dueDate) return "No due date";

      // If it's already in YYYY-MM-DD format, parse and format it
      if (dueDate.includes("-")) {
        const date = new Date(dueDate + "T00:00:00");
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        // Check if it's today or tomorrow for special formatting
        if (date.toDateString() === today.toDateString()) {
          return "Today";
        } else if (date.toDateString() === tomorrow.toDateString()) {
          return "Tomorrow";
        } else {
          return date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          });
        }
      }

      // For legacy string dates, return as-is (though they should be converted)
      return dueDate;
    },

    getTaskCountClass(count) {
      if (count === 0) return "";

      const thresholds = {
        low: 2,
        medium: 5,
        high: 8,
      };

      if (count <= thresholds.low) return "low-count";
      if (count <= thresholds.medium) return "medium-count";
      if (count <= thresholds.high) return "high-count";
      return "very-high-count"; // Extreme cases
    },

    getPreviewPosition(index) {
      // Calendar has 7 columns, so we can determine the row
      const row = Math.floor(index / 7);
      const totalRows = Math.ceil(this.calendarDays.length / 7);

      // Show above if we're in the last 2 rows
      if (row >= totalRows - 2) {
        return "show-above";
      }
      return "show-below";
    },
  },
};
</script>

<template>
  <div class="calendar-container">
    <!-- Calendar Header -->
    <div class="calendar-header">
      <div class="calendar-nav">
        <button
          class="nav-btn"
          @click="navigateMonth(-1)"
          title="Previous month"
        >
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path
              d="M15 18l-6-6 6-6"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              fill="none"
            />
          </svg>
        </button>

        <h2 class="month-year">{{ monthYear }}</h2>

        <button class="nav-btn" @click="navigateMonth(1)" title="Next month">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path
              d="M9 18l6-6-6-6"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              fill="none"
            />
          </svg>
        </button>
      </div>

      <div class="calendar-actions">
        <button class="today-btn" @click="goToToday">Today</button>
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
            today: dayData.isToday,
            selected:
              selectedDate &&
              dayData.date.toDateString() === selectedDate.toDateString(),
            'has-tasks': dayData.lists.length > 0,
            [getTaskCountClass(dayData.lists.length)]: true,
          }"
          @click="selectDate(dayData)"
          @mouseenter="hoveredDate = dayData.date"
          @mouseleave="hoveredDate = null"
        >
          <div class="day-header">
            <div class="day-number">{{ dayData.day }}</div>
            <button
              v-if="dayData.isCurrentMonth"
              class="add-task-btn"
              @click.stop="openAddTaskModal(dayData.date)"
              title="Add task"
            >
              +
            </button>
          </div>

          <!-- Task indicators -->
          <div class="task-indicators" v-if="dayData.lists.length > 0">
            <div
              v-for="(list, taskIndex) in dayData.lists.slice(0, 3)"
              :key="list.id"
              class="task-dot"
              :style="{ backgroundColor: getPriorityColor(list.priorityList) }"
              :title="list.nameList"
              @click.stop="openTaskDetail(list)"
            ></div>
            <div v-if="dayData.lists.length > 3" class="more-tasks">
              +{{ dayData.lists.length - 3 }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Task Details Modal -->
    <div
      v-if="taskModal.open"
      class="modal-backdrop"
      @click.self="closeTaskModal"
    >
      <div class="task-modal">
        <header class="modal-header">
          <h3>{{ formatDate(taskModal.date) }}</h3>
          <button class="close-btn" @click="closeTaskModal">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </header>

        <div class="modal-content">
          <div class="tasks-list">
            <div
              v-for="list in taskModal.tasks"
              :key="list.idList"
              class="task-item"
              :class="{ completed: list.done }"
            >
              <div
                class="task-priority-bar"
                :style="{
                  backgroundColor: getPriorityColor(list.priorityList),
                }"
              ></div>
              <div class="task-content" @click="openTaskDetail(list)">
                <h4 class="task-title">{{ list.titleList }}</h4>
                <p class="task-category">{{ list.tag }}</p>
                <div class="task-meta">
                  <span
                    class="priority-badge"
                    :data-priority="list.priorityList"
                  >
                    {{ list.priorityList }}
                  </span>
                  <span class="due-date"
                    >Due: {{ formatTaskDueDate(list.dueDateList) }}</span
                  >
                </div>
              </div>
              <div class="task-actions" v-if="list.idUser == AuthService.user">
                <button
                  class="task-action-btn update-btn"
                  @click="updateTask(list)"
                  title="Update task"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path
                      d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
                      stroke="currentColor"
                      stroke-width="2"
                      fill="none"
                    />
                    <path
                      d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                      stroke="currentColor"
                      stroke-width="2"
                      fill="none"
                    />
                  </svg>
                </button>
                <button
                  class="task-action-btn delete-btn"
                  @click="deleteTask(list)"
                  title="Delete task"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path
                      d="M3 6h18m-2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"
                      stroke="currentColor"
                      stroke-width="2"
                      fill="none"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Task Modal -->
    <div
      v-if="addTaskModal.open"
      class="modal-backdrop"
      @click.self="closeAddTaskModal"
    >
      <div class="add-task-modal">
        <header class="modal-head">
          <h2>
            {{
              addTaskModal.mode === "update"
                ? "Update Task for"
                : "Add Task for"
            }}
            {{ formatDate(addTaskModal.date) }}
          </h2>
          <button
            class="close"
            @click="closeAddTaskModal"
            aria-label="Close modal"
          >
            ✕
          </button>
        </header>

        <form @submit.prevent="addNewTask" class="task-form">
          <div class="form-group">
            <label for="taskTitle">Task Title *</label>
            <input
              id="taskTitle"
              type="text"
              v-model="addTaskModal.form.title"
              placeholder="Enter task title..."
              required
              autofocus
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="taskTag">Category</label>
              <input
                id="taskTag"
                type="text"
                v-model="addTaskModal.form.tag"
                placeholder="e.g., Work, School, Personal"
              />
            </div>

            <div class="form-group">
              <label for="taskDue">Due Date</label>
              <input
                id="taskDue"
                type="text"
                value="Selected date"
                v-model="addTaskModal.form.date"
                :placeholder="formatDate(addTaskModal.date)"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="taskPriority">Priority</label>
            <select id="taskPriority" v-model="addTaskModal.form.priority">
              <option value="low">🟢 Low Priority</option>
              <option value="medium">🟡 Medium Priority</option>
              <option value="high">🔴 High Priority</option>
            </select>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-cancel" @click="closeAddTaskModal">
              Cancel
            </button>
            <button type="submit" class="btn-add">
              {{
                addTaskModal.mode === "update" ? "Update Task" : "Create Task"
              }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="deleteModal.open"
      class="modal-backdrop"
      @click.self="closeDeleteModal"
    >
      <div class="delete-modal">
        <header class="modal-head danger">
          <h2><i class="fa-solid fa-trash-arrow-up"></i> Delete Task</h2>
          <button
            class="close"
            @click="closeDeleteModal"
            aria-label="Close modal"
          >
            ✕
          </button>
        </header>

        <div class="delete-content">
          <div class="delete-warning">
            <div class="warning-icon">
              <i class="fa-solid fa-circle-xmark"></i>
            </div>
            <h3>Are you sure?</h3>
            <p>You are about to permanently delete:</p>
            <div class="task-preview">
              <div class="task-title">
                {{ deleteModal.taskToDelete?.title }}
              </div>
              <div class="task-info">
                <span class="task-tag">{{
                  deleteModal.taskToDelete?.tag
                }}</span>
                <span class="task-due"
                  >Due:
                  {{ formatTaskDueDate(deleteModal.taskToDelete?.due) }}</span
                >
                <span
                  class="priority-chip"
                  :data-priority="deleteModal.taskToDelete?.priority"
                >
                  {{ deleteModal.taskToDelete?.priority }}
                </span>
              </div>
            </div>
            <p class="warning-text">This action cannot be undone.</p>
          </div>

          <div class="delete-actions">
            <button type="button" class="btn-cancel" @click="closeDeleteModal">
              Cancel
            </button>
            <button type="button" class="btn-delete" @click="confirmDelete">
              Delete Task
            </button>
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

.day-header {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  z-index: 1;
}

.day-number {
  font-size: 16px;
  font-weight: 600;
  color: #e9edf8;
  z-index: -10;
}

.add-task-btn {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(0, 180, 255, 0.1);
  color: #00b4ff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 180, 255, 0.2);
    border-color: rgba(0, 180, 255, 0.4);
    transform: scale(1.1);
  }
}

.calendar-day:hover .add-task-btn {
  opacity: 1;
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
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.3);
    opacity: 0.8;
  }
}

.more-tasks {
  font-size: 10px;
  color: #a8b3d4;
  font-weight: 600;
  margin-left: 2px;
}

.hover-preview {
  position: absolute;
  opacity: 1;
  left: 0;
  right: 0;
  background: #1a2035;
  border: 1px solid rgba(0, 180, 255, 0.3);
  border-radius: 8px;
  padding: 12px;
  z-index: 1000;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);

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
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 180, 255, 0.1);
  }

  &.done {
    opacity: 0.6;

    .task-title {
      text-decoration: line-through;
    }
  }
}

.priority-dot {
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
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 180, 255, 0.1);
  }

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
  outline: none !important;
  box-shadow: none !important;

  &[data-priority="high"] {
    background: rgba(255, 86, 86, 0.2) !important;
    color: #ffd5d5 !important;
    border: 1px solid rgba(255, 86, 86, 0.3) !important;
    outline: none !important;
  }

  &[data-priority="medium"] {
    background: rgba(255, 195, 0, 0.2) !important;
    color: #ffeec2 !important;
    border: 1px solid rgba(255, 195, 0, 0.3) !important;
    outline: none !important;
  }

  &[data-priority="low"] {
    background: rgba(0, 255, 170, 0.2) !important;
    color: #d2ffe9 !important;
    border: 1px solid rgba(0, 255, 170, 0.3) !important;
    outline: none !important;
  }
}

.due-date {
  font-size: 12px;
  color: #a8b3d4;
}

.task-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-shrink: 0;
}

.task-action-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.05);
  color: #e9edf8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  &.toggle-btn {
    &:hover {
      background: rgba(0, 255, 136, 0.15);
      border-color: rgba(0, 255, 136, 0.3);
      color: #00ff88;
    }

    &.completed {
      background: #00ff88;
      border-color: #00ff88;
      color: white;
    }
  }

  &.update-btn:hover {
    background: rgba(0, 180, 255, 0.15);
    border-color: rgba(0, 180, 255, 0.3);
    color: #00b4ff;
  }

  &.delete-btn:hover {
    background: rgba(255, 86, 86, 0.15);
    border-color: rgba(255, 86, 86, 0.3);
    color: #ff5656;
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

/* Add Task Modal Styles */
.add-task-modal {
  width: min(520px, 95vw);
  max-height: min(80vh, 700px);
  background: linear-gradient(145deg, #14192b, #16213a);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(0, 180, 255, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  overflow: hidden;
  animation: slideInModal 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
}

@keyframes slideInModal {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: linear-gradient(135deg, #1e2750, #1a2447);
  border-bottom: 1px solid rgba(0, 180, 255, 0.15);
  position: relative;

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(0, 180, 255, 0.3),
      transparent
    );
  }

  h2 {
    margin: 0;
    font-size: 20px;
    color: #e1f0ff;
    font-weight: 700;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .close {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: #e1f0ff;
    font-size: 18px;
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    transition: all 0.2s ease;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;

    &:hover {
      background: rgba(255, 86, 86, 0.15);
      border-color: rgba(255, 86, 86, 0.3);
      color: #ff9999;
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0);
    }
  }
}

.task-form {
  padding: 24px 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-height: calc(80vh - 160px);
  overflow-y: auto;

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 180, 255, 0.3);
    border-radius: 3px;

    &:hover {
      background: rgba(0, 180, 255, 0.5);
    }
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
}

.form-group label {
  font-size: 13px;
  font-weight: 700;
  color: #b8d4ff;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 2px;
  display: flex;
  align-items: center;
  gap: 6px;

  &::before {
    content: "";
    width: 3px;
    height: 3px;
    background: rgba(0, 180, 255, 0.6);
    border-radius: 50%;
  }
}

.form-group input,
.form-group select {
  padding: 12px 16px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: linear-gradient(145deg, #0d1420, #111929);
  color: #f0f5ff;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);

  &:focus {
    outline: none;
    border-color: rgba(0, 180, 255, 0.6);
    box-shadow: 0 0 0 3px rgba(0, 180, 255, 0.15),
      inset 0 1px 3px rgba(0, 0, 0, 0.2), 0 4px 12px rgba(0, 180, 255, 0.1);
    background: linear-gradient(145deg, #0f1525, #141d2e);
    transform: translateY(-1px);
  }

  &::placeholder {
    color: #8494b8;
    opacity: 0.9;
    font-weight: 400;
  }

  &:hover:not(:focus) {
    border-color: rgba(255, 255, 255, 0.2);
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
  }
}

.form-group select {
  cursor: pointer;

  option {
    background: #1a2035;
    color: #f0f5ff;
    padding: 8px 12px;

    &[value="high"] {
      background: rgba(255, 86, 86, 0.1);
      color: #ffd5d5;
    }

    &[value="medium"] {
      background: rgba(255, 200, 0, 0.1);
      color: #ffeec2;
    }

    &[value="low"] {
      background: rgba(0, 255, 136, 0.1);
      color: #d2ffe9;
    }
  }
}

.form-actions {
  display: flex;
  gap: 14px;
  margin-top: 12px;
  padding-top: 20px;
  border-top: 1px solid rgba(0, 180, 255, 0.12);
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(0, 180, 255, 0.4),
      transparent
    );
  }
}

.btn-cancel,
.btn-add {
  flex: 1;
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      45deg,
      transparent 30%,
      rgba(255, 255, 255, 0.1) 50%,
      transparent 70%
    );
    transform: translateX(-100%);
    transition: transform 0.6s ease;
  }

  &:hover::before {
    transform: translateX(100%);
  }
}

.btn-cancel {
  background: rgba(255, 255, 255, 0.06);
  color: #d5e4ff;
  border-color: rgba(255, 255, 255, 0.2);

  &:hover {
    background: rgba(255, 255, 255, 0.12);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 255, 255, 0.3);
  }

  &:active {
    transform: translateY(-1px);
  }
}

.btn-add {
  background: linear-gradient(
    135deg,
    rgba(0, 180, 255, 0.25),
    rgba(0, 140, 255, 0.2)
  );
  border-color: rgba(0, 180, 255, 0.4);
  color: #4dd0ff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  position: relative;

  &:hover {
    background: linear-gradient(
      135deg,
      rgba(0, 180, 255, 0.4),
      rgba(0, 140, 255, 0.3)
    );
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 180, 255, 0.25),
      0 0 20px rgba(0, 180, 255, 0.15);
    border-color: rgba(0, 180, 255, 0.6);
    color: #66d9ff;
  }

  &:active {
    transform: translateY(-1px);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(0, 180, 255, 0.3),
      0 8px 25px rgba(0, 180, 255, 0.25);
  }
}

/* Delete Modal Styles */
.delete-modal {
  width: min(450px, 90vw);
  background: #14192b;
  border-radius: 14px;
  border: 1px solid rgba(255, 86, 86, 0.2);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
  overflow: hidden;
  animation: slideInModal 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-head.danger {
  background: linear-gradient(
    135deg,
    rgba(255, 86, 86, 0.15),
    rgba(200, 60, 60, 0.1)
  );
  border-bottom: 1px solid rgba(255, 86, 86, 0.2);

  &::after {
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 86, 86, 0.3),
      transparent
    );
  }

  h2 {
    color: #ff9999;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 18px;
  }
}

.delete-content {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.delete-warning {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.warning-icon {
  font-size: 48px;
  margin-bottom: 8px;
}

.delete-warning h3 {
  color: #ff9999;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.delete-warning p {
  color: #c8d4ff;
  margin: 0;
  font-size: 14px;
}

.warning-text {
  color: #ff9999 !important;
  font-weight: 600;
  font-size: 13px !important;
}

.task-preview {
  background: rgba(255, 86, 86, 0.05);
  border: 1px solid rgba(255, 86, 86, 0.2);
  border-radius: 10px;
  padding: 16px;
  margin: 8px 0;
}

.task-title {
  font-size: 16px;
  font-weight: 600;
  color: #eef3ff;
  margin-bottom: 8px;
}

.task-info {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  font-size: 12px;
}

.task-tag,
.task-due {
  color: #98a3d4;
  background: rgba(255, 255, 255, 0.05);
  padding: 2px 8px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.priority-chip {
  padding: 2px 8px;
  border-radius: 12px;
  text-transform: uppercase;
  font-weight: 600;
  font-size: 11px;
  display: inline-flex;
  align-items: center;
  line-height: 1.2;
  box-sizing: border-box;
  border: 1px solid transparent;

  &[data-priority="high"] {
    background: rgba(255, 86, 86, 0.2);
    color: #ffd5d5;
    border-color: rgba(255, 86, 86, 0.3);
  }

  &[data-priority="medium"] {
    background: rgba(255, 195, 0, 0.2);
    color: #ffeec2;
    border-color: rgba(255, 195, 0, 0.3);
  }

  &[data-priority="low"] {
    background: rgba(0, 255, 170, 0.2);
    color: #d2ffe9;
    border-color: rgba(0, 255, 170, 0.3);
  }
}

.delete-actions {
  display: flex;
  gap: 12px;
}

.btn-delete {
  flex: 1;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid rgba(255, 86, 86, 0.3);
  background: linear-gradient(
    135deg,
    rgba(255, 86, 86, 0.2),
    rgba(200, 60, 60, 0.15)
  );
  color: #ff9999;

  &:hover {
    background: linear-gradient(
      135deg,
      rgba(255, 86, 86, 0.3),
      rgba(200, 60, 60, 0.2)
    );
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 86, 86, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
}
</style>
