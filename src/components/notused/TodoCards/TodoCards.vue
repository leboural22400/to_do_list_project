<script>
// Toast notification
import { useToast } from "vue-toastification";
import UnsplashImages from "../UnsplashImages/UnsplashImages.vue";
import Calendar from "../Calendar/Calendar.vue";
import { TaskDataService } from "../../services/taskDataService.js";
import {
  parseAndValidateDate,
  dateToISOString,
} from "../../utils/dateUtils.js";

export default {
  name: "TodoCards",
  components: {
    UnsplashImages,
    Calendar,
  },
  setup() {
    const toast = useToast();
    return { toast };
  },
  data() {
    return {
      // View mode toggle
      viewMode: "cards", // 'cards' or 'calendar'

      // Use a centralized data service
      items: TaskDataService.getAllTasks(),
      gallery: {
        open: false,
        forItemId: null,
      },
      editingImageId: null,

      // Task creation/editing modal
      taskModal: {
        open: false,
        mode: "create", // 'create' or 'edit'
        editingId: null,
        form: {
          title: "",
          tag: "",
          due: "",
          priority: "medium",
        },
      },

      // Delete confirmation modal
      deleteModal: {
        open: false,
        taskToDelete: null,
      },

      // Export menu
      exportMenu: {
        open: false,
      },

      // Date help visibility
      showDateHelp: false,
    };
  },
  created() {
    // Check URL parameters to set initial view mode
    const viewParam = this.$route.query.view;
    if (viewParam === "calendar" || viewParam === "cards") {
      this.viewMode = viewParam;
    }
  },
  computed: {
    completedTasks() {
      return this.items.filter((task) => task.done).length;
    },
    pendingTasks() {
      return this.items.filter((task) => !task.done).length;
    },
    highPriorityTasks() {
      return this.items.filter((task) => task.priority === "high").length;
    },
    mediumPriorityTasks() {
      return this.items.filter((task) => task.priority === "medium").length;
    },
    lowPriorityTasks() {
      return this.items.filter((task) => task.priority === "low").length;
    },
    tasksWithDueDate() {
      return this.items.filter((task) => task.due && task.due.trim()).length;
    },
    overdueTasks() {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return this.items.filter((task) => {
        if (!task.due || task.done) return false;
        const dueDate = new Date(task.due);
        return dueDate < today;
      }).length;
    },
  },
  mounted() {
    // Add the listener for the ESC key
    document.addEventListener("keydown", this.handleKeydown);
    // Add click outside listener for export menu
    document.addEventListener("click", this.handleClickOutside);
  },
  beforeUnmount() {
    // Clean up the listener when the component is destroyed
    document.removeEventListener("keydown", this.handleKeydown);
    document.removeEventListener("click", this.handleClickOutside);
  },
  methods: {
    toggle(id) {
      TaskDataService.toggleTaskStatus(id);
    },

    openGallery(item) {
      this.gallery.open = true;
      this.gallery.forItemId = item.id;
    },
    closeGallery() {
      this.gallery.open = false;
      this.gallery.forItemId = null;
    },

    // ---------- Pick a default image (zero API calls) ----------
    selectDefault(url) {
      TaskDataService.updateTaskImage(this.gallery.forItemId, url);
      this.toast.success("Default background image applied!");
      this.closeGallery();
    },

    selectImage(photo) {
      // Use the service to update the task image
      TaskDataService.updateTaskImage(
        this.gallery.forItemId,
        photo?.urls?.regular || photo?.urls?.small || photo
      );
      this.toast.success("Background image applied!");
      this.closeGallery();
    },
    removeImage(item) {
      TaskDataService.updateTaskImage(item.id, "");
      this.toast.info("Background image removed.");
    },

    handleKeydown(event) {
      if (event.key === "Escape" && this.taskModal.open) {
        this.closeTaskModal();
      }

      if (event.key === "Escape" && this.deleteModal.open) {
        this.closeDeleteModal();
      }
    },

    startImageEdit(item, event) {
      event.stopPropagation();
      this.editingImageId = item.id;

      // Initialize position if not set
      if (!item.imagePosition) {
        item.imagePosition = { x: 50, y: 50 };
      }
    },

    finishImageEdit(event) {
      if (event) {
        event.stopPropagation();
      }
      this.editingImageId = null;
      this.toast.success("Image position updated.");
    },

    updateImagePosition(item, event) {
      if (this.editingImageId !== item.id) return;

      const rect = event.currentTarget.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;

      // Clamp values between 0 and 100
      const newPosition = {
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y)),
      };

      // Update position in the data service
      TaskDataService.updateTaskImagePosition(item.id, newPosition);
    },

    // ---------- Task Modal Management ----------
    openTaskModal(mode = "create", item = null) {
      this.taskModal.mode = mode;
      this.taskModal.open = true;

      if (mode === "edit" && item) {
        this.taskModal.editingId = item.id;
        this.taskModal.form = {
          title: item.title,
          tag: item.tag,
          due: item.due,
          priority: item.priority,
        };
      } else {
        this.taskModal.editingId = null;
        this.taskModal.form = {
          title: "",
          tag: "",
          due: "",
          priority: "medium",
        };
      }
    },

    closeTaskModal() {
      this.taskModal.open = false;
      this.taskModal.editingId = null;
      this.taskModal.form = {
        title: "",
        tag: "",
        due: "",
        priority: "medium",
      };
    },

    submitTask() {
      const form = this.taskModal.form;

      // Validation
      if (!form.title.trim()) {
        this.toast.error("Task title is required.");
        return;
      }

      // Validate date if provided
      if (form.due.trim()) {
        console.log("🔍 Validating date input:", form.due);
        const dateValidation = parseAndValidateDate(form.due);
        console.log("🔍 Validation result:", dateValidation);

        if (!dateValidation.isValid) {
          console.error("❌ Date validation failed:", dateValidation.error);
          this.toast.error(dateValidation.error);
          return;
        }

        // Convert to ISO format for storage
        const originalDue = form.due;
        form.due = dateToISOString(dateValidation.date);
        console.log("✅ Date converted from", originalDue, "to", form.due);
      }

      if (this.taskModal.mode === "create") {
        this.createTask(form);
      } else if (this.taskModal.mode === "edit") {
        this.updateTask(form);
      }

      this.closeTaskModal();
    },

    createTask(form) {
      const newTodo = {
        title: form.title.trim(),
        tag: form.tag.trim() || "General",
        due: form.due || "TBD", // form.due is already processed by validation
        priority: form.priority,
        done: false,
        imageUrl: "",
        imagePosition: { x: 50, y: 50 },
      };

      // Use TaskDataService to add the task (includes localStorage save)
      TaskDataService.addTask(newTodo);
      this.toast.success(`Task "${form.title}" created successfully!`);
    },

    updateTask(form) {
      const updates = {
        title: form.title.trim(),
        tag: form.tag.trim() || "General",
        due: form.due || "TBD", // form.due is already processed by validation
        priority: form.priority,
      };

      // Use TaskDataService to update the task (includes localStorage save)
      TaskDataService.updateTask(this.taskModal.editingId, updates);
      this.toast.success("Task updated successfully!");
    },

    deleteTodo(item, event) {
      event.stopPropagation();

      // Open confirmation modal instead of confirm()
      this.deleteModal.open = true;
      this.deleteModal.taskToDelete = item;
    },

    confirmDelete() {
      const item = this.deleteModal.taskToDelete;
      if (!item) return;

      // Use TaskDataService to delete the task (includes localStorage save)
      TaskDataService.deleteTask(item.id);
      this.toast.success(`Task "${item.title}" deleted successfully!`);

      this.closeDeleteModal();
    },

    closeDeleteModal() {
      this.deleteModal.open = false;
      this.deleteModal.taskToDelete = null;
    },

    // Detail view methods
    openTaskDetail(item, event) {
      // If called from calendar (no event), navigate directly with context
      if (!event) {
        this.$router.push({
          path: `/task/${item.id}`,
          query: { from: "calendar" },
        });
        return;
      }

      // Prevent navigation if clicking on controls (only for card view)
      if (
        event.target.closest(".card-control") ||
        event.target.closest(".check") ||
        event.target.closest(".image-controls") ||
        event.target.closest(".img-btn")
      ) {
        return;
      }

      // Prevent navigation if we're in image editing mode
      if (this.editingImageId === item.id) {
        return;
      }

      // Navigate to task detail route with context
      this.$router.push({
        path: `/task/${item.id}`,
        query: { from: "cards" },
      });
    },

    duplicateTodo(item, event) {
      event.stopPropagation();

      // Generate a smart duplicate title
      let duplicateTitle = item.title;
      const existingTitles = this.items.map((task) => task.title);

      // Check if title already has a number suffix
      const numberMatch = duplicateTitle.match(/^(.+?) (\d+)$/);
      if (numberMatch) {
        // Title already has a number, increment it
        const baseTitle = numberMatch[1];
        let nextNumber = parseInt(numberMatch[2]) + 1;
        duplicateTitle = `${baseTitle} ${nextNumber}`;

        // Make sure this new title doesn't exist
        while (existingTitles.includes(duplicateTitle)) {
          nextNumber++;
          duplicateTitle = `${baseTitle} ${nextNumber}`;
        }
      } else {
        // Add number suffix starting with 2
        let counter = 2;
        let candidateTitle = `${duplicateTitle} ${counter}`;

        while (existingTitles.includes(candidateTitle)) {
          counter++;
          candidateTitle = `${duplicateTitle} ${counter}`;
        }
        duplicateTitle = candidateTitle;
      }

      // Use TaskDataService to add the new task
      const duplicatedTodo = {
        title: duplicateTitle,
        tag: item.tag,
        due: item.due,
        priority: item.priority,
        done: false,
        imageUrl: item.imageUrl,
        imagePosition: item.imagePosition,
      };

      TaskDataService.addTask(duplicatedTodo);
      this.toast.success(`Task duplicated successfully!`);
    },

    // View mode methods
    toggleViewMode() {
      this.viewMode = this.viewMode === "cards" ? "calendar" : "cards";
      this.toast.info(`Switched to ${this.viewMode} view`);
    },

    // Date format examples
    formatExample(type) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);

      const formatDate = (date) => {
        return date.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        });
      };

      switch (type) {
        case "today":
          return formatDate(today);
        case "tomorrow":
          return formatDate(tomorrow);
        case "nextweek":
          return formatDate(nextWeek);
        default:
          return "";
      }
    },

    // Export and sharing functionality
    shareTaskList() {
      if (navigator.share) {
        navigator
          .share({
            title: "My Task List",
            text: `Check out my task list with ${this.items.length} tasks!`,
            url: window.location.href,
          })
          .catch(console.error);
      } else {
        // Fallback: copy to clipboard
        navigator.clipboard
          .writeText(window.location.href)
          .then(() => {
            this.toast.success("Task list link copied to clipboard!");
          })
          .catch(() => {
            this.toast.error(
              "Could not copy link. Please copy manually: " +
                window.location.href
            );
          });
      }
    },

    toggleExportMenu() {
      this.exportMenu.open = !this.exportMenu.open;
    },

    closeExportMenu() {
      this.exportMenu.open = false;
    },

    exportAsJSON() {
      try {
        const exportData = TaskDataService.downloadAsJSON(
          `tasks-export-${new Date().toISOString().split("T")[0]}.json`
        );
        this.closeExportMenu();
        this.toast.success("Tasks exported as JSON!");
        return exportData;
      } catch (error) {
        console.error("JSON export failed:", error);
        this.toast.error("Failed to export tasks as JSON.");
      }
    },

    exportAsPlainText() {
      try {
        const exportData = TaskDataService.downloadAsPlainText(
          `tasks-${new Date().toISOString().split("T")[0]}.txt`
        );
        this.closeExportMenu();
        this.toast.success("Tasks exported as text file!");
        return exportData;
      } catch (error) {
        console.error("Plain text export failed:", error);
        this.toast.error("Failed to export tasks as text.");
      }
    },

    exportAsICalendar() {
      try {
        const exportData = TaskDataService.downloadAsICalendar(
          `tasks-${new Date().toISOString().split("T")[0]}.ics`
        );
        this.closeExportMenu();
        this.toast.success("Tasks exported as calendar file!");
        return exportData;
      } catch (error) {
        console.error("iCalendar export failed:", error);
        this.toast.error("Failed to export tasks as calendar.");
      }
    },

    handleClickOutside(event) {
      if (this.exportMenu.open && !event.target.closest(".export-dropdown")) {
        this.closeExportMenu();
      }
    },
  },
};
</script>

<template>
  <!-- Main Cards View -->
  <section class="page">
    <!-- Centered Title -->
    <div class="header-title">
      <h1 class="neon-title">MY TO-DOs</h1>
    </div>

    <!-- Controls Row -->
    <div class="header-controls">
      <!-- View Mode Switch -->
      <div class="view-switch">
        <button
          class="switch-btn"
          :class="{ active: viewMode === 'cards' }"
          @click="viewMode = 'cards'"
          title="Cards view"
        >
          <svg viewBox="0 0 24 24" width="18" height="18">
            <rect
              x="3"
              y="3"
              width="7"
              height="7"
              rx="2"
              stroke="currentColor"
              stroke-width="2"
              fill="none"
            />
            <rect
              x="14"
              y="3"
              width="7"
              height="7"
              rx="2"
              stroke="currentColor"
              stroke-width="2"
              fill="none"
            />
            <rect
              x="3"
              y="14"
              width="7"
              height="7"
              rx="2"
              stroke="currentColor"
              stroke-width="2"
              fill="none"
            />
            <rect
              x="14"
              y="14"
              width="7"
              height="7"
              rx="2"
              stroke="currentColor"
              stroke-width="2"
              fill="none"
            />
          </svg>
          Cards
        </button>

        <button
          class="switch-btn"
          :class="{ active: viewMode === 'calendar' }"
          @click="viewMode = 'calendar'"
          title="Calendar view"
        >
          <svg viewBox="0 0 24 24" width="18" height="18">
            <rect
              x="3"
              y="4"
              width="18"
              height="18"
              rx="2"
              ry="2"
              stroke="currentColor"
              stroke-width="2"
              fill="none"
            />
            <line
              x1="16"
              y1="2"
              x2="16"
              y2="6"
              stroke="currentColor"
              stroke-width="2"
            />
            <line
              x1="8"
              y1="2"
              x2="8"
              y2="6"
              stroke="currentColor"
              stroke-width="2"
            />
            <line
              x1="3"
              y1="10"
              x2="21"
              y2="10"
              stroke="currentColor"
              stroke-width="2"
            />
          </svg>
          Calendar
        </button>
      </div>

      <!-- Task Statistics (Calendar mode only) -->
      <div v-if="viewMode === 'calendar'" class="task-stats-inline">
        <div class="stat-card">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="2"
                fill="none"
              />
              <polyline
                points="12,6 12,12 16,14"
                stroke="currentColor"
                stroke-width="2"
                fill="none"
              />
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ items.length }}</div>
            <div class="stat-label">Total</div>
          </div>
        </div>

        <div class="stat-card completed">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path
                d="M22 11.08V12a10 10 0 11-5.93-9.14"
                stroke="currentColor"
                stroke-width="2"
                fill="none"
              />
              <polyline
                points="22,4 12,14.01 9,11.01"
                stroke="currentColor"
                stroke-width="2"
                fill="none"
              />
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ completedTasks }}</div>
            <div class="stat-label">Done</div>
          </div>
        </div>

        <div class="stat-card pending">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="2"
                fill="none"
              />
              <line
                x1="12"
                y1="8"
                x2="12"
                y2="12"
                stroke="currentColor"
                stroke-width="2"
              />
              <line
                x1="12"
                y1="16"
                x2="12.01"
                y2="16"
                stroke="currentColor"
                stroke-width="2"
              />
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ pendingTasks }}</div>
            <div class="stat-label">Todo</div>
          </div>
        </div>

        <div class="stat-card high-priority">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <polygon
                points="13,2 3,14 12,14 11,22 21,10 12,10"
                stroke="currentColor"
                stroke-width="2"
                fill="none"
              />
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ highPriorityTasks }}</div>
            <div class="stat-label">High</div>
          </div>
        </div>

        <div class="stat-card overdue" v-if="overdueTasks > 0">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="2"
                fill="none"
              />
              <line
                x1="4.93"
                y1="4.93"
                x2="19.07"
                y2="19.07"
                stroke="currentColor"
                stroke-width="2"
              />
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ overdueTasks }}</div>
            <div class="stat-label">Late</div>
          </div>
        </div>
      </div>

      <!-- Action buttons (Calendar mode only) and New Task button -->
      <div class="action-buttons">
        <template v-if="viewMode === 'calendar'">
          <button
            class="action-btn share-btn"
            @click="shareTaskList"
            title="Share task list"
          >
            <svg viewBox="0 0 24 24" width="18" height="18">
              <circle
                cx="18"
                cy="5"
                r="3"
                stroke="currentColor"
                stroke-width="2"
                fill="none"
              />
              <circle
                cx="6"
                cy="12"
                r="3"
                stroke="currentColor"
                stroke-width="2"
                fill="none"
              />
              <circle
                cx="18"
                cy="19"
                r="3"
                stroke="currentColor"
                stroke-width="2"
                fill="none"
              />
              <line
                x1="8.59"
                y1="13.51"
                x2="15.42"
                y2="17.49"
                stroke="currentColor"
                stroke-width="2"
              />
              <line
                x1="15.41"
                y1="6.51"
                x2="8.59"
                y2="10.49"
                stroke="currentColor"
                stroke-width="2"
              />
            </svg>
            Share
          </button>

          <div class="export-dropdown" :class="{ active: exportMenu.open }">
            <button
              class="action-btn export-btn"
              @click="toggleExportMenu"
              title="Export tasks"
            >
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path
                  d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"
                  stroke="currentColor"
                  stroke-width="2"
                  fill="none"
                />
                <polyline
                  points="7,10 12,15 17,10"
                  stroke="currentColor"
                  stroke-width="2"
                  fill="none"
                />
                <line
                  x1="12"
                  y1="15"
                  x2="12"
                  y2="3"
                  stroke="currentColor"
                  stroke-width="2"
                />
              </svg>
              Export
              <svg
                class="dropdown-arrow"
                viewBox="0 0 24 24"
                width="14"
                height="14"
                :style="{
                  transform: exportMenu.open
                    ? 'rotate(180deg)'
                    : 'rotate(0deg)',
                }"
              >
                <polyline
                  points="6,9 12,15 18,9"
                  stroke="currentColor"
                  stroke-width="2"
                  fill="none"
                />
              </svg>
            </button>

            <div v-if="exportMenu.open" class="export-menu">
              <button class="export-option json-export" @click="exportAsJSON">
                <div class="export-icon">
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path
                      d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                      stroke="currentColor"
                      stroke-width="2"
                      fill="none"
                    />
                    <polyline
                      points="14,2 14,8 20,8"
                      stroke="currentColor"
                      stroke-width="2"
                      fill="none"
                    />
                    <path d="M10 12h4" stroke="currentColor" stroke-width="2" />
                    <path d="M10 16h4" stroke="currentColor" stroke-width="2" />
                  </svg>
                </div>
                <div class="export-info">
                  <div class="export-title">JSON Format</div>
                  <div class="export-desc">Complete data with metadata</div>
                </div>
              </button>

              <button
                class="export-option text-export"
                @click="exportAsPlainText"
              >
                <div class="export-icon">
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path
                      d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                      stroke="currentColor"
                      stroke-width="2"
                      fill="none"
                    />
                    <polyline
                      points="14,2 14,8 20,8"
                      stroke="currentColor"
                      stroke-width="2"
                      fill="none"
                    />
                    <line
                      x1="16"
                      y1="13"
                      x2="8"
                      y2="13"
                      stroke="currentColor"
                      stroke-width="2"
                    />
                    <line
                      x1="16"
                      y1="17"
                      x2="8"
                      y2="17"
                      stroke="currentColor"
                      stroke-width="2"
                    />
                  </svg>
                </div>
                <div class="export-info">
                  <div class="export-title">Plain Text</div>
                  <div class="export-desc">Human-readable format</div>
                </div>
              </button>

              <button
                class="export-option ical-export"
                @click="exportAsICalendar"
              >
                <div class="export-icon">
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <rect
                      x="3"
                      y="4"
                      width="18"
                      height="18"
                      rx="2"
                      ry="2"
                      stroke="currentColor"
                      stroke-width="2"
                      fill="none"
                    />
                    <line
                      x1="16"
                      y1="2"
                      x2="16"
                      y2="6"
                      stroke="currentColor"
                      stroke-width="2"
                    />
                    <line
                      x1="8"
                      y1="2"
                      x2="8"
                      y2="6"
                      stroke="currentColor"
                      stroke-width="2"
                    />
                    <line
                      x1="3"
                      y1="10"
                      x2="21"
                      y2="10"
                      stroke="currentColor"
                      stroke-width="2"
                    />
                  </svg>
                </div>
                <div class="export-info">
                  <div class="export-title">iCalendar (.ics)</div>
                  <div class="export-desc">Import into calendar apps</div>
                </div>
              </button>
            </div>
          </div>
        </template>

        <button
          class="create-btn"
          @click="openTaskModal('create')"
          title="Create new task"
        >
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path
              d="M12 5v14m-7-7h14"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
          New Task
        </button>
      </div>
    </div>

    <!-- Cards View -->
    <div v-if="viewMode === 'cards'" class="grid">
      <article
        v-for="item in items"
        :key="item.id"
        class="card"
        :aria-pressed="item.done ? 'true' : 'false'"
        @click="openTaskDetail(item, $event)"
      >
        <!-- Card controls -->
        <div class="card-controls">
          <button
            class="card-control edit"
            @click="openTaskModal('edit', item)"
            title="Edit task"
          >
            <svg viewBox="0 0 24 24" width="14" height="14">
              <path
                d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                stroke="currentColor"
                stroke-width="2"
                fill="none"
              />
              <path
                d="m18.5 2.5-8 8v4h4l8-8a2 2 0 0 0 0-3z"
                stroke="currentColor"
                stroke-width="2"
                fill="none"
              />
            </svg>
          </button>
          <button
            class="card-control duplicate"
            @click="duplicateTodo(item, $event)"
            title="Duplicate task"
          >
            <svg viewBox="0 0 24 24" width="14" height="14">
              <rect
                x="9"
                y="9"
                width="13"
                height="13"
                rx="2"
                ry="2"
                stroke="currentColor"
                stroke-width="2"
                fill="none"
              />
              <path
                d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
                stroke="currentColor"
                stroke-width="2"
                fill="none"
              />
            </svg>
          </button>
          <button
            class="card-control delete"
            @click="deleteTodo(item, $event)"
            title="Delete task"
          >
            <svg viewBox="0 0 24 24" width="14" height="14">
              <path
                d="M3 6h18m-2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"
                stroke="currentColor"
                stroke-width="2"
                fill="none"
              />
            </svg>
          </button>
        </div>

        <div
          class="thumb"
          :style="
            item.imageUrl
              ? {
                  backgroundImage: `url(${item.imageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: `${item.imagePosition?.x || 50}% ${
                    item.imagePosition?.y || 50
                  }%`,
                }
              : {}
          "
          @click="editingImageId === item.id ? finishImageEdit($event) : null"
          @mousemove="updateImagePosition(item, $event)"
          :class="{ 'editing-image': editingImageId === item.id }"
          :aria-label="`Task background for ${item.title}`"
          tabindex="0"
        >
          <span class="chip" :data-priority="item.priority">{{
            item.priority
          }}</span>
          <span class="due">Due: {{ item.due }}</span>

          <button
            class="check"
            :class="{ on: item.done }"
            aria-label="Mark done"
            @click.stop="toggle(item.id)"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path
                d="M20 6L9 17l-5-5"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>

          <!-- Image Control Toolbar -->
          <div class="image-controls" v-if="editingImageId !== item.id">
            <button
              class="img-btn add-img"
              title="Add/Change image"
              @click.stop="openGallery(item)"
            >
              <svg viewBox="0 0 24 24" width="14" height="14">
                <rect
                  x="3"
                  y="3"
                  width="18"
                  height="18"
                  rx="2"
                  ry="2"
                  stroke="currentColor"
                  stroke-width="2"
                  fill="none"
                />
                <circle
                  cx="8.5"
                  cy="8.5"
                  r="1.5"
                  stroke="currentColor"
                  stroke-width="2"
                  fill="none"
                />
                <path
                  d="M21 15l-5-5L5 21"
                  stroke="currentColor"
                  stroke-width="2"
                  fill="none"
                />
              </svg>
            </button>

            <button
              v-if="item.imageUrl"
              class="img-btn remove-img"
              title="Remove image"
              @click.stop="removeImage(item)"
            >
              <svg viewBox="0 0 24 24" width="14" height="14">
                <path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </button>

            <button
              v-if="item.imageUrl"
              class="img-btn reposition-img"
              title="Adjust position"
              @click.stop="startImageEdit(item, $event)"
            >
              <svg viewBox="0 0 24 24" width="14" height="14">
                <path
                  d="M12 2l3 3-3 3M2 12l3-3 3 3M12 22l-3-3 3-3M22 12l-3 3-3-3"
                  stroke="currentColor"
                  stroke-width="2"
                  fill="none"
                />
              </svg>
            </button>
          </div>

          <!-- Editing overlay -->
          <div v-if="editingImageId === item.id" class="edit-overlay">
            <span class="edit-hint"
              >Move cursor to reposition • Click to finish</span
            >
            <div class="crosshair"></div>
          </div>
        </div>

        <div class="label">
          <div class="title" :class="{ done: item.done }">{{ item.title }}</div>
          <div class="tag">{{ item.tag }}</div>
        </div>
      </article>
    </div>

    <!-- Calendar View -->
    <div v-else-if="viewMode === 'calendar'" class="calendar-view">
      <Calendar :tasks="items" @open-task-detail="openTaskDetail" />
    </div>

    <!-- Image Gallery Modal -->
    <UnsplashImages
      :open="gallery.open"
      @selectDefault="selectDefault"
      @selectImage="selectImage"
      @close="closeGallery"
    />

    <!-- Task Creation/Editing Modal -->
    <div
      v-if="taskModal.open"
      class="modal-backdrop"
      @click.self="closeTaskModal"
    >
      <div class="task-modal">
        <header class="modal-head">
          <h2>
            {{ taskModal.mode === "create" ? "Create New Task" : "Edit Task" }}
          </h2>
          <button
            class="close"
            @click="closeTaskModal"
            aria-label="Close modal"
          >
            ✕
          </button>
        </header>

        <form @submit.prevent="submitTask" class="task-form">
          <div class="form-group">
            <label for="taskTitle">Task Title *</label>
            <input
              id="taskTitle"
              type="text"
              v-model="taskModal.form.title"
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
                v-model="taskModal.form.tag"
                placeholder="e.g., Work, School, Personal"
              />
            </div>

            <div class="form-group">
              <label for="taskDue">
                Due Date
                <button
                  type="button"
                  class="help-btn"
                  @click="showDateHelp = !showDateHelp"
                  title="Show date format examples"
                >
                  <svg viewBox="0 0 24 24" width="14" height="14">
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="2"
                      fill="none"
                    />
                    <path
                      d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      fill="none"
                    />
                    <circle cx="12" cy="17" r="1" fill="currentColor" />
                  </svg>
                </button>
              </label>
              <input
                id="taskDue"
                type="text"
                v-model="taskModal.form.due"
                placeholder="Today, Tomorrow, Friday, 2024-12-25..."
                @focus="showDateHelp = true"
                @blur="showDateHelp = false"
              />

              <!-- Date format help -->
              <div v-if="showDateHelp" class="date-help">
                <h4>
                  <svg
                    class="icon icon-calendar"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <title>Supported Date Formats</title>
                    <rect
                      x="3"
                      y="4"
                      width="18"
                      height="18"
                      rx="3"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    />
                    <path d="M3 9h18" stroke="currentColor" stroke-width="2" />
                    <path
                      d="M8 3v4M16 3v4"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                    />
                    <!-- Header bar glow -->
                    <rect
                      x="3"
                      y="4"
                      width="18"
                      height="5"
                      rx="3"
                      fill="currentColor"
                      opacity="0.12"
                    />
                  </svg>
                </h4>
                <div class="format-section">
                  <strong>Quick Options:</strong>
                  <ul>
                    <li><code>Today</code> - {{ formatExample("today") }}</li>
                    <li>
                      <code>Tomorrow</code> - {{ formatExample("tomorrow") }}
                    </li>
                  </ul>
                </div>
                <div class="format-section">
                  <strong>Weekdays:</strong>
                  <ul>
                    <li><code>Monday</code>, <code>Mon</code> - Next Monday</li>
                    <li><code>Friday</code>, <code>Fri</code> - Next Friday</li>
                    <li>Any weekday name works!</li>
                  </ul>
                </div>
                <div class="format-section">
                  <strong>Specific Dates:</strong>
                  <ul>
                    <li>
                      <code>YYYY-MM-DD</code> - e.g., <code>2024-12-25</code>
                    </li>
                    <li>
                      <code>Next week</code> - {{ formatExample("nextweek") }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="taskPriority">Priority</label>
            <select id="taskPriority" v-model="taskModal.form.priority">
              <option value="low">🟢 Low Priority</option>
              <option value="medium">🟡 Medium Priority</option>
              <option value="high">🔴 High Priority</option>
            </select>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-cancel" @click="closeTaskModal">
              Cancel
            </button>
            <button type="submit" class="btn-submit">
              {{ taskModal.mode === "create" ? "Create Task" : "Update Task" }}
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
                  >Due: {{ deleteModal.taskToDelete?.due }}</span
                >
                <span
                  class="task-priority"
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
  </section>
</template>

<style scoped lang="scss">
.page {
  min-height: 100dvh;
  background: #0f1525
    radial-gradient(
      1200px 400px at 50% -10%,
      rgba(0, 180, 255, 0.08),
      transparent 60%
    );
  color: #e9edf8;
  padding: 32px 24px 56px;
}

.neon-title {
  text-align: center;
  font-size: clamp(28px, 6vw, 64px);
  font-weight: 800;
  letter-spacing: 0.04em;
  color: #6ae8ff;
  text-shadow: 0 0 8px rgba(0, 240, 255, 0.35), 0 0 26px rgba(0, 180, 255, 0.25);
  margin: 8px 0 20px;
}

.grid {
  display: grid;
  gap: 22px;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  align-items: start;
}

.card {
  position: relative;
  overflow: hidden;
  border-radius: 18px;
  background: #1a2035;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06),
    0 14px 40px rgba(0, 0, 0, 0.45);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
  isolation: isolate;
}

.card::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    120deg,
    transparent 60%,
    rgba(255, 255, 255, 0.06) 70%,
    transparent 78%
  );
  transform: translateX(-8%);
  pointer-events: none;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08),
    0 18px 50px rgba(0, 0, 0, 0.55), 0 0 22px rgba(0, 220, 255, 0.06);
}

.thumb {
  position: relative;
  height: 160px;
  background: radial-gradient(
      200px 80px at 30% 20%,
      rgba(0, 255, 255, 0.18),
      transparent 60%
    ),
    linear-gradient(180deg, #232a46, #161b2d 65%);
  cursor: pointer;
}

.chip {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 10px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(6px);
}

.chip[data-priority="high"] {
  color: #ffd5d5;
  box-shadow: 0 0 12px rgba(255, 86, 86, 0.25) inset;
}

.chip[data-priority="medium"] {
  color: #ffeec2;
  box-shadow: 0 0 12px rgba(255, 195, 0, 0.18) inset;
}

.chip[data-priority="low"] {
  color: #d2ffe9;
  box-shadow: 0 0 12px rgba(0, 255, 170, 0.18) inset;
}

.card:hover .chip[data-priority] {
  opacity: 0;
  visibility: hidden;
}

.due {
  position: absolute;
  bottom: 12px;
  left: 12px;
  font-size: 12px;
  opacity: 0.85;
  color: #c8d4ff;
}

.check {
  position: absolute;
  top: 10px;
  right: 10px;
  height: 28px;
  width: 28px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  color: #93fbff;
  background: linear-gradient(180deg, #1e2a3d, #12192a);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.35);
  transition: transform 0.15s ease, box-shadow 0.15s ease,
    background-color 0.2s ease;
}

.check:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 18px rgba(0, 0, 0, 0.4);
}

.check.on {
  color: #b7ffd9;
  background: linear-gradient(180deg, #203b2b, #13281c);
}

.label {
  background: linear-gradient(180deg, #2b2f4d, #242743);
  padding: 16px 16px 18px;
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 -1px 0 rgba(255, 255, 255, 0.04) inset,
    0 8px 24px rgba(0, 0, 0, 0.35);
}

.title {
  font-weight: 700;
  font-size: 16px;
  color: #eef3ff;
  text-shadow: 0 0 14px rgba(0, 220, 255, 0.15);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.title.done {
  color: #a9ffcf;
  text-decoration: line-through;
  text-decoration-thickness: 2px;
}

.tag {
  margin-top: 6px;
  font-size: 12px;
  color: #98a3d4;
  opacity: 0.9;
}

/* Image Controls Toolbar */
.image-controls {
  position: absolute;
  right: 10px;
  bottom: 10px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease, transform 0.2s ease;
  transform: translateY(10px);
}

.card:hover .image-controls {
  opacity: 1;
  transform: translateY(0);
}

.img-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  font-size: 11px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: #e9edf8;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(6px);
  white-space: nowrap;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }

  span {
    font-weight: 500;
    letter-spacing: 0.02em;
  }

  &.add-img:hover {
    background: rgba(0, 180, 255, 0.3);
    border-color: rgba(0, 180, 255, 0.5);
    color: #00b4ff;
  }

  &.reposition-img:hover {
    background: rgba(255, 200, 0, 0.3);
    border-color: rgba(255, 200, 0, 0.5);
    color: #ffc800;
  }

  &.remove-img:hover {
    background: rgba(255, 86, 86, 0.3);
    border-color: rgba(255, 86, 86, 0.5);
    color: #ff5656;
  }
}

/* Task Modal Styles */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  display: grid;
  place-items: center;
  z-index: 1000;
  padding: 16px;
  animation: fadeInBackdrop 0.2s ease-out;
}

@keyframes fadeInBackdrop {
  from {
    opacity: 0;
    backdrop-filter: blur(0px);
  }
  to {
    opacity: 1;
    backdrop-filter: blur(4px);
  }
}

.thumb.editing-image {
  cursor: crosshair;
  box-shadow: 0 0 0 2px #00b4ff, 0 0 20px rgba(0, 180, 255, 0.3);

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: rgba(0, 180, 255, 0.1);
    pointer-events: none;
  }
}

.edit-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  pointer-events: none;
}

.edit-hint {
  background: rgba(0, 0, 0, 0.8);
  color: #00b4ff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  text-align: center;
  border: 1px solid rgba(0, 180, 255, 0.3);
}

.crosshair {
  position: absolute;
  width: 20px;
  height: 20px;

  &::before,
  &::after {
    content: "";
    position: absolute;
    background: #00b4ff;
    box-shadow: 0 0 4px rgba(0, 180, 255, 0.6);
  }

  &::before {
    width: 20px;
    height: 1px;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
  }

  &::after {
    width: 1px;
    height: 20px;
    left: 50%;
    top: 0;
    transform: translateX(-50%);
  }
}

/* Header Title - Centered */
.header-title {
  text-align: center;
  margin-bottom: 24px;

  .neon-title {
    margin: 0;
  }
}

/* Header Controls */
.header-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
  gap: 24px;
  position: relative;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }

  @media (min-width: 769px) and (max-width: 1200px) {
    gap: 16px;
  }
}

/* View Mode Switch */
.view-switch {
  display: flex;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 4px;
  backdrop-filter: blur(10px);
}

.switch-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #a8b3d4;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
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

  &:hover {
    color: #e1f0ff;
    background: rgba(255, 255, 255, 0.08);
    transform: translateY(-1px);

    &::before {
      transform: translateX(100%);
    }
  }

  &.active {
    background: linear-gradient(
      135deg,
      rgba(0, 180, 255, 0.25),
      rgba(0, 140, 255, 0.2)
    );
    color: #4dd0ff;
    border: 1px solid rgba(0, 180, 255, 0.3);
    box-shadow: 0 4px 12px rgba(0, 180, 255, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);

    &:hover {
      background: linear-gradient(
        135deg,
        rgba(0, 180, 255, 0.35),
        rgba(0, 140, 255, 0.3)
      );
      color: #66d9ff;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 180, 255, 0.25),
        inset 0 1px 0 rgba(255, 255, 255, 0.15);
    }
  }

  svg {
    flex-shrink: 0;
  }
}

/* Action buttons container */
.action-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }

  svg {
    flex-shrink: 0;
    opacity: 0.8;
  }
}

/* Export dropdown */
.export-dropdown {
  position: relative;

  .export-btn {
    position: relative;

    .dropdown-arrow {
      transition: transform 0.2s ease;
      margin-left: 2px;
    }
  }

  .export-menu {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    background: rgba(20, 20, 30, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    min-width: 240px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    z-index: 1000;
    overflow: hidden;
    animation: slideDown 0.2s ease-out;
  }

  .export-option {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 12px 16px;
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.9);
    text-align: left;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    &:not(:last-child) {
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .export-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.1);

      svg {
        opacity: 0.8;
      }
    }

    .export-info {
      flex: 1;

      .export-title {
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 2px;
      }

      .export-desc {
        font-size: 12px;
        opacity: 0.7;
      }
    }

    &.json-export:hover .export-icon {
      background: rgba(255, 193, 7, 0.2);
      color: #ffc107;
    }

    &.text-export:hover .export-icon {
      background: rgba(108, 117, 125, 0.2);
      color: #6c757d;
    }

    &.ical-export:hover .export-icon {
      background: rgba(40, 167, 69, 0.2);
      color: #28a745;
    }
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

/* Task Statistics - Inline version */
.task-stats-inline {
  display: flex;
  gap: 12px;
  align-items: center;

  @media (max-width: 1200px) {
    gap: 8px;
  }

  @media (max-width: 768px) {
    display: none; // Hide on mobile to avoid clutter
  }
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: fit-content;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  transition: all 0.3s ease;
  flex-shrink: 0;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }

  .stat-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.8);

    svg {
      flex-shrink: 0;
    }
  }

  .stat-content {
    .stat-number {
      font-size: 16px;
      font-weight: 700;
      color: #e9edf8;
      line-height: 1;
      margin-bottom: 2px;
    }

    .stat-label {
      font-size: 10px;
      color: rgba(255, 255, 255, 0.7);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
  }

  // Color variants
  &.completed {
    .stat-icon {
      background: rgba(34, 197, 94, 0.2);
      color: #22c55e;
    }
    .stat-number {
      color: #22c55e;
    }
  }

  &.pending {
    .stat-icon {
      background: rgba(59, 130, 246, 0.2);
      color: #3b82f6;
    }
    .stat-number {
      color: #3b82f6;
    }
  }

  &.high-priority {
    .stat-icon {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
    }
    .stat-number {
      color: #ef4444;
    }
  }

  &.overdue {
    .stat-icon {
      background: rgba(245, 101, 101, 0.2);
      color: #f56565;
    }
    .stat-number {
      color: #f56565;
    }
    border-color: rgba(245, 101, 101, 0.3);

    &:hover {
      border-color: rgba(245, 101, 101, 0.5);
      box-shadow: 0 8px 25px rgba(245, 101, 101, 0.15);
    }
  }

  @media (max-width: 768px) {
    min-width: 120px;
    padding: 12px;
    gap: 10px;

    .stat-icon {
      width: 36px;
      height: 36px;

      svg {
        width: 18px;
        height: 18px;
      }
    }

    .stat-content {
      .stat-number {
        font-size: 20px;
      }

      .stat-label {
        font-size: 11px;
      }
    }
  }
}

.create-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 10px;
  background: linear-gradient(
    135deg,
    rgba(0, 180, 255, 0.15),
    rgba(0, 140, 255, 0.1)
  );
  border: 1px solid rgba(0, 180, 255, 0.3);
  color: #00b4ff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 180, 255, 0.1);

  &:hover {
    background: linear-gradient(
      135deg,
      rgba(0, 180, 255, 0.25),
      rgba(0, 140, 255, 0.15)
    );
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(0, 180, 255, 0.2);
  }
}

/* Card Controls */
.card-controls {
  position: absolute;
  top: 8px;
  left: 8px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 10;
}

.card:hover .card-controls {
  opacity: 1;
}

.card-control {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(0, 0, 0, 0.4);
  color: #e9edf8;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(6px);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }

  &.edit:hover {
    background: rgba(0, 180, 255, 0.2);
    border-color: rgba(0, 180, 255, 0.4);
    color: #00b4ff;
  }

  &.duplicate:hover {
    background: rgba(255, 200, 0, 0.2);
    border-color: rgba(255, 200, 0, 0.4);
    color: #ffc800;
  }

  &.delete:hover {
    background: rgba(255, 86, 86, 0.2);
    border-color: rgba(255, 86, 86, 0.4);
    color: #ff5656;
  }
}

/* Task Modal */
.task-modal {
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

  /* Specific styling for priority select */
  &#taskPriority {
    option {
      background: #1a2035;
      color: #f0f5ff;
      padding: 8px 12px;

      &[value="high"] {
        background: linear-gradient(135deg, #2a1f1f, #1a2035);
        color: #ffb3b3;
      }

      &[value="medium"] {
        background: linear-gradient(135deg, #2a2519, #1a2035);
        color: #ffd699;
      }

      &[value="low"] {
        background: linear-gradient(135deg, #1f2a22, #1a2035);
        color: #b3ffcc;
      }
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
.btn-submit {
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

.btn-submit {
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
}

.modal-head.danger {
  background: linear-gradient(
    135deg,
    rgba(255, 86, 86, 0.15),
    rgba(200, 60, 60, 0.1)
  );
  border-bottom: 1px solid rgba(255, 86, 86, 0.2);

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

.task-priority {
  padding: 2px 8px;
  border-radius: 12px;
  text-transform: uppercase;
  font-weight: 600;

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

/* Calendar View */
.calendar-view {
  margin-top: 20px;
  animation: fadeInUp 0.4s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive adjustments for calendar */
@media (max-width: 768px) {
  .header-left {
    align-items: center;

    .view-switch {
      width: 100%;
      justify-content: center;
    }
  }

  .switch-btn {
    flex: 1;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .view-switch {
    padding: 3px;
  }

  .switch-btn {
    padding: 6px 12px;
    font-size: 13px;

    svg {
      width: 16px;
      height: 16px;
    }
  }
}

/* Date Help Styles */
.help-btn {
  background: none;
  border: none;
  color: rgba(0, 180, 255, 0.7);
  cursor: pointer;
  margin-left: 6px;
  padding: 2px;
  border-radius: 50%;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #00b4ff;
    background: rgba(0, 180, 255, 0.1);
    transform: scale(1.1);
  }

  svg {
    stroke-width: 2;
  }
}

.date-help {
  background: linear-gradient(135deg, #1a2447, #1e2855);
  border: 1px solid rgba(0, 180, 255, 0.3);
  border-radius: 12px;
  padding: 16px;
  margin-top: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  animation: slideDown 0.3s ease;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: -6px;
    left: 20px;
    width: 12px;
    height: 12px;
    background: linear-gradient(135deg, #1a2447, #1e2855);
    border: 1px solid rgba(0, 180, 255, 0.3);
    border-bottom: none;
    border-right: none;
    transform: rotate(45deg);
  }

  h4 {
    margin: 0 0 12px 0;
    color: #4dd0ff;
    font-size: 14px;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .format-section {
    margin-bottom: 12px;

    strong {
      color: #b8d4ff;
      font-size: 13px;
      display: block;
      margin-bottom: 6px;
    }

    ul {
      margin: 0;
      padding-left: 16px;

      li {
        color: #e1f0ff;
        font-size: 12px;
        margin-bottom: 3px;
        line-height: 1.4;

        code {
          background: rgba(0, 180, 255, 0.15);
          color: #4dd0ff;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: "Courier New", monospace;
          font-size: 11px;
          font-weight: 600;
          border: 1px solid rgba(0, 180, 255, 0.2);
        }
      }
    }
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
</style>
