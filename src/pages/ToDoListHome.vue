<script>
import { getAllListByUserID, getListByID } from "@/middleware/listService";
import { createNewList } from "@/middleware/listService";
import { updateList } from "@/middleware/listService";
import { destroyList } from "@/middleware/listService";

import Button from "@/components/Button.vue";
import Pill from "@/components/Pill.vue";
import Card from "@/components/Card.vue";
import Input from "@/components/Input.vue";
import Select from "@/components/Select.vue";

import { useToast } from "vue-toastification";
import UnsplashImages from "@/components/UnsplashImages/UnsplashImages.vue";
import Calendar from "@/components/Calendar/Calendar.vue";
import { parseAndValidateDate, dateToISOString } from "@/utils/dateUtils.js";
import AuthService from "@/services/authService";
import {
  destroyShared,
  findAllSharedByOtherUserID,
} from "@/middleware/sharedService";

export default {
  name: "TodoCards",
  components: {
    UnsplashImages,
    Calendar,
    Button,
    Pill,
    Card,
    Input,
    Select,
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
      items: null,
      listSharedWithMe: [],
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
      return this.items.filter((task) => task.stateList).length;
    },
    pendingTasks() {
      return this.items.filter((task) => !task.stateList).length;
    },
    highPriorityTasks() {
      return this.items.filter((task) => task.priorityList === "high").length;
    },
    mediumPriorityTasks() {
      return this.items.filter((task) => task.priorityList === "medium").length;
    },
    lowPriorityTasks() {
      return this.items.filter((task) => task.priorityList === "low").length;
    },
    tasksWithDueDate() {
      return this.items.filter(
        (task) => task.dueDateList && task.dueDateList.trim()
      ).length;
    },
    overdueTasks() {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return this.items.filter((task) => {
        if (!task.dueDateList || task.stateList) return false;
        const dueDate = new Date(task.dueDateList);
        return dueDate < today;
      }).length;
    },
  },
  mounted() {
    // Add the listener for the ESC key
    document.addEventListener("keydown", this.handleKeydown);
    // Add click outside listener for export menu
    document.addEventListener("click", this.handleClickOutside);
    this.getList();
    this.getListSharedWithMe();
  },
  beforeUnmount() {
    // Clean up the listener when the component is destroyed
    document.removeEventListener("keydown", this.handleKeydown);
    document.removeEventListener("click", this.handleClickOutside);
  },
  methods: {
    async getListSharedWithMe() {
      await findAllSharedByOtherUserID(AuthService.user.value).then(
        async (resp) => {
          const response = resp;
          console.log(response);
          for (let link of response) {
            await getListByID(link.idList).then((resp) => {
              this.listSharedWithMe.push(resp);
              console.log(this.listSharedWithMe);
            });
          }
        }
      );
    },
    async getList() {
      try {
        this.items = await getAllListByUserID(AuthService.user.value);
        console.log(AuthService.user.value);
      } catch (err) {
        console.log(err);
      }
    },
    async toggle(item) {
      item.stateList = !item.stateList;
      await updateList({ stateList: item.stateList }, item.idList);
    },

    openGallery(item) {
      this.gallery.open = true;
      this.gallery.forItemId = item.idList;
    },
    closeGallery() {
      this.gallery.open = false;
      this.gallery.forItemId = null;
    },

    // ---------- Pick a default image (zero API calls) ----------
    selectDefault(url) {
      this.selectImage(url);
    },

    selectImage(photo) {
      console.log(this.gallery.forItemId);
      updateList(
        {
          imageSrcLinkList: photo?.urls?.regular || photo?.urls?.small || photo,
        },
        this.gallery.forItemId
      ).then(() => {
        this.closeGallery();
        location.reload();
      });
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
    },

    // ---------- Task Modal Management ----------
    openTaskModal(mode = "create", item = null) {
      this.taskModal.mode = mode;
      this.taskModal.open = true;

      if (mode === "edit" && item) {
        this.taskModal.editingId = item.idList;
        this.taskModal.form = {
          title: item.titleList,
          tag: item.descriptionList,
          due: item.dueDateList,
          priority: item.priorityList,
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

    async createTask(form) {
      const newTodo = {
        titleList: form.title.trim(),
        descriptionList: form.tag.trim() || "General",
        dueDateList: form.due || Date.now() + 86400000,
        priorityList: form.priority,
        stateList: false,
        idUser: AuthService.user.value,
      };
      await createNewList(newTodo).then(() => {
        location.reload();
      });
    },

    async updateTask(form) {
      const updates = {
        titleList: form.title.trim(),
        descriptionList: form.tag.trim() || "General",
        dueDateList: form.due || "TBD", // form.due is already processed by validation
        priorityList: form.priority,
      };
      await updateList(updates, this.taskModal.editingId).then(() =>
        location.reload()
      );
    },

    deleteTodo(item, event) {
      event.stopPropagation();

      // Open confirmation modal instead of confirm()
      this.deleteModal.open = true;
      this.deleteModal.taskToDelete = item;
    },

    async confirmDelete() {
      const item = this.deleteModal.taskToDelete;
      if (!item) return;
      await destroyList(item.idList).then(() => {
        this.closeDeleteModal();
        location.reload();
      });
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
          path: `/task/${item.idList}`,
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
      if (this.editingImageId === item.idList) {
        return;
      }

      // Navigate to task detail route with context
      this.$router.push({
        path: `/task/${item.idList}`,
        query: { from: "cards" },
      });
    },

    async duplicateTodo(item, event) {
      event.stopPropagation();

      // Generate a smart duplicate title
      let duplicateTitle = item.titleList;
      const existingTitles = this.items.map((task) => task.titleList);

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

      const duplicatedTodo = {
        titleList: duplicateTitle,
        descriptionList: item.descriptionList,
        dueDateList: item.dueDateList,
        priorityList: item.priorityList,
        stateList: false,
        idUser: AuthService.user.value,
      };

      await createNewList(duplicatedTodo).then(() => location.reload());
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

    handleClickOutside(event) {
      if (this.exportMenu.open && !event.target.closest(".export-dropdown")) {
        this.closeExportMenu();
      }
    },

    async removeLink(item) {
      await destroyShared(item.idList, AuthService.user.value).then(() =>
        location.reload()
      );
    },
  },
};
</script>

<template>
  <!-- Main Cards View -->
  <section class="min-h-lvh bg-(--page-bg) !items-center !my-8 !mx-8">
    <!-- Centered Title -->
    <div class="max-w-6xl !mx-auto text-center !mb-6">
      <h1 class="!text-6xl !font-extrabold">My Lists</h1>
    </div>

    <!-- Controls Row -->
    <div
      class="max-w-6xl !mx-auto flex items-center justify-between max-sm:justify-center !mb-8 gap-6 flex-wrap"
    >
      <!-- View Mode Switch -->
      <div
        class="flex !bg-transparent border !border-(--border) !rounded-xl !p-1 !backdrop-blur-md gap-4"
      >
        <Button
          :basicpadd="true"
          :variant="viewMode == 'cards' ? 'secondary' : 'default'"
          @click="viewMode = 'cards'"
          title="Cards view"
        >
          <template #body
            ><svg viewBox="0 0 24 24" width="18" height="18" class="!mr-2">
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
            Cards</template
          >
        </Button>
        <Button
          :basicpadd="true"
          :variant="viewMode == 'cards' ? 'default' : 'secondary'"
          @click="viewMode = 'calendar'"
          title="Calendar view"
        >
          <template #body
            ><svg viewBox="0 0 24 24" width="18" height="18" class="!mr-2">
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
            Calendar</template
          >
        </Button>
      </div>

      <!-- Task Statistics (Calendar mode only) -->
      <div v-if="viewMode === 'calendar'" class="flex items-center gap-2">
        <div
          class="flex items-center gap-2 !min-w-fit !py-2 !px-3 !bg-(--border)/30 !backdrop-blur-md !border !border-(--border) rounded-lg transition-all shrink-0"
        >
          <div
            class="flex items-center justify-center w-7 h-7 rounded-md !bg-(--border)"
          >
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
          <div class="">
            <h6 class="!font-bold !mb-0.5">{{ items.length }}</h6>
            <p class="text-[10px] mb-0 uppercase text-(--muted)">Total</p>
          </div>
        </div>

        <div
          class="flex items-center gap-2 !min-w-fit !py-2 !px-3 !bg-(--border)/30 !backdrop-blur-md !border !border-(--border) rounded-lg transition-all shrink-0"
        >
          <div
            class="flex items-center justify-center w-7 h-7 rounded-md !bg-(--success)/20 text-(--success)"
          >
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
          <div>
            <h6 class="!font-bold !mb-0.5 !text-(--success)">
              {{ completedTasks }}
            </h6>
            <p class="text-[10px] mb-0 uppercase text-(--muted)">Done</p>
          </div>
        </div>

        <div
          class="flex items-center gap-2 !min-w-fit !py-2 !px-3 !bg-(--border)/30 !backdrop-blur-md !border !border-(--border) rounded-lg transition-all shrink-0"
        >
          <div
            class="flex items-center justify-center w-7 h-7 rounded-md !bg-(--info)/20 text-(--info)"
          >
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
          <div class="">
            <h6 class="!font-bold !mb-0.5 !text-(--info)">
              {{ pendingTasks }}
            </h6>
            <p class="text-[10px] mb-0 uppercase text-(--muted)">Todo</p>
          </div>
        </div>

        <div
          class="flex items-center gap-2 !min-w-fit !py-2 !px-3 !bg-(--border)/30 !backdrop-blur-md !border !border-(--border) rounded-lg transition-all shrink-0"
        >
          <div
            class="flex items-center justify-center w-7 h-7 rounded-md !bg-(--alert)/20 text-(--alert)"
          >
            <svg viewBox="0 0 24 24" width="18" height="18">
              <polygon
                points="13,2 3,14 12,14 11,22 21,10 12,10"
                stroke="currentColor"
                stroke-width="2"
                fill="none"
              />
            </svg>
          </div>
          <div class="">
            <h6 class="!font-bold !mb-0.5 !text-(--alert)">
              {{ highPriorityTasks }}
            </h6>
            <p class="text-[10px] mb-0 uppercase text-(--muted)">High</p>
          </div>
        </div>

        <div
          class="flex items-center gap-2 !min-w-fit !py-2 !px-3 !bg-(--border)/30 !backdrop-blur-md !border !border-(--alert)/30 rounded-lg transition-all shrink-0"
          v-if="overdueTasks > 0"
        >
          <div
            class="flex items-center justify-center w-7 h-7 rounded-md !bg-(--alert)/20 text-(--alert)"
          >
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
          <div class="">
            <h6 class="!font-bold !mb-0.5 !text-(--alert)">
              {{ overdueTasks }}
            </h6>
            <div class="text-[10px] mb-0 uppercase text-(--muted)">Late</div>
          </div>
        </div>
      </div>

      <!-- Action buttons (Calendar mode only) and New Task button -->
      <div class="flex items-center">
        <Button
          variant="secondary"
          :fill="true"
          :basicpadd="true"
          @click="openTaskModal('create')"
          title="Create new task"
        >
          <template #body
            ><svg viewBox="0 0 24 24" width="20" height="20" class="!mr-2">
              <path
                d="M12 5v14m-7-7h14"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
            New List</template
          >
        </Button>
      </div>
    </div>

    <!-- Cards View -->
    <div
      v-if="viewMode === 'cards'"
      class="flex flex-col !max-w-6xl mx-auto justify-start"
    >
      <details class="flex flex-col w-full" open>
        <summary>My List</summary>
        <div class="flex flex-row !gap-6 mt-4 flex-wrap justify-center">
          <article
            v-for="item in items"
            :key="item.idList"
            class="relative overflow-hidden rounded-2xl !shadow-2xl min-w-64 group"
            :aria-pressed="item.stateList ? 'true' : 'false'"
            @click="openTaskDetail(item, $event)"
          >
            <!-- Card controls -->
            <div
              class="absolute !top-3 !left-3 !opacity-0 z-10 flex gap-1 transition-opacity group-hover:!opacity-100"
            >
              <Button
                @click.stop="openTaskModal('edit', item)"
                title="Edit task"
              >
                <template #body
                  ><svg viewBox="0 0 24 24" width="14" height="14">
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
                </template>
              </Button>
              <Button
                @click.stop="duplicateTodo(item, $event)"
                title="Duplicate task"
              >
                <template #body
                  ><svg viewBox="0 0 24 24" width="14" height="14">
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
                </template>
              </Button>
              <Button
                @click.stop="deleteTodo(item, $event)"
                title="Delete task"
              >
                <template #body
                  ><svg viewBox="0 0 24 24" width="14" height="14">
                    <path
                      d="M3 6h18m-2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"
                      stroke="currentColor"
                      stroke-width="2"
                      fill="none"
                    />
                  </svg>
                </template>
              </Button>
            </div>

            <div
              class="relative h-40 cursor-pointer"
              :style="
                item.imageSrcLinkList
                  ? {
                      backgroundImage: `url(${item.imageSrcLinkList})`,
                      backgroundSize: 'cover',
                      backgroundPosition: `${item.imagePosition?.x || 50}% ${
                        item.imagePosition?.y || 50
                      }%`,
                    }
                  : { background: 'linear-gradient(135deg, #1e3c72, #2a5298)' }
              "
              :aria-label="`Task background for ${item.titleList}`"
              tabindex="0"
            >
              <Pill
                class="absolute !top-3 !left-3 group-hover:opacity-0 transition-opacity"
                :text="item.priorityList"
                :priority="item.priorityList"
              ></Pill>

              <span class="absolute bottom-3 left-3 text-xs text-(--pill-fg)"
                >Due: {{ item.dueDateList }}</span
              >

              <!-- Image Control Toolbar -->
              <div
                class="absolute bottom-3 right-3 opacity-0 transition-opacity group-hover:!opacity-100"
                v-if="editingImageId !== item.idList"
              >
                <Button
                  title="Add/Change image"
                  @click.stop="openGallery(item)"
                >
                  <template #body
                    ><svg viewBox="0 0 24 24" width="14" height="14">
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
                  </template>
                </Button>
              </div>
            </div>

            <div
              class="bg-[linear-gradient(180deg,#2b2f4d,#242743)] px-4 py-4 text-center"
            >
              <h5
                class="!font-bold whitespace-nowrap overflow-hidden overflow-ellipsis"
                :class="{ done: item.stateList }"
              >
                {{ item.titleList }}
              </h5>
              <p class="mb-0 text-xs text-(--pill-fg)">
                {{ item.descriptionList }}
              </p>
            </div>
          </article>
        </div>
      </details>
      <details class="flex flex-col w-full">
        <summary>Shared with me</summary>
        <div class="flex flex-row !gap-6 mt-4 flex-wrap justify-center">
          <article
            v-for="item in listSharedWithMe"
            :key="item.idList"
            class="relative overflow-hidden rounded-2xl !shadow-2xl min-w-64 group"
            :aria-pressed="item.stateList ? 'true' : 'false'"
            @click="openTaskDetail(item, $event)"
          >
            <div
              class="absolute !top-3 !left-3 !opacity-0 z-10 flex gap-1 transition-opacity group-hover:!opacity-100"
            >
              <Button @click.stop="removeLink(item)" title="Delete task">
                <template #body
                  ><svg viewBox="0 0 24 24" width="14" height="14">
                    <path
                      d="M3 6h18m-2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"
                      stroke="currentColor"
                      stroke-width="2"
                      fill="none"
                    />
                  </svg>
                </template>
              </Button>
            </div>
            <div
              class="relative h-40 cursor-pointer"
              :style="
                item.imageSrcLinkList
                  ? {
                      backgroundImage: `url(${item.imageSrcLinkList})`,
                      backgroundSize: 'cover',
                      backgroundPosition: `${item.imagePosition?.x || 50}% ${
                        item.imagePosition?.y || 50
                      }%`,
                    }
                  : { background: 'linear-gradient(135deg, #1e3c72, #2a5298)' }
              "
              :aria-label="`Task background for ${item.titleList}`"
              tabindex="0"
            >
              <Pill
                class="absolute !top-3 !left-3 group-hover:opacity-0 transition-opacity"
                :text="item.priorityList"
                :priority="item.priorityList"
              ></Pill>

              <span class="absolute bottom-3 left-3 text-xs text-(--pill-fg)"
                >Due: {{ item.dueDateList }}</span
              >
            </div>

            <div
              class="bg-[linear-gradient(180deg,#2b2f4d,#242743)] px-4 py-4 text-center"
            >
              <h5
                class="!font-bold whitespace-nowrap overflow-hidden overflow-ellipsis"
                :class="{ done: item.stateList }"
              >
                {{ item.titleList }}
              </h5>
              <p class="mb-0 text-xs text-(--pill-fg)">
                {{ item.descriptionList }}
              </p>
            </div>
          </article>
        </div>
      </details>
    </div>

    <!-- Calendar View -->
    <div
      v-else-if="viewMode === 'calendar'"
      class="max-w-6xl !mx-auto calendar-view"
    >
      <Calendar
        :lists="items.concat(listSharedWithMe)"
        @open-task-detail="openTaskDetail"
      />
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
      class="fixed inset-0 bg-black/60 z-50 p-5 flex !items-center !justify-center"
      @click.self="closeTaskModal"
    >
      <Card :header="true" class="min-w-[500px]">
        <template #header
          ><h5 class="!mb-0 !font-semibold">
            {{ taskModal.mode === "create" ? "Create New Task" : "Edit Task" }}
          </h5>
          <button
            class="bg-none border-none !text-xl cursor-pointer p-1"
            @click="closeTaskModal"
            aria-label="Close modal"
          >
            ✕
          </button></template
        >
        <template #main
          ><form @submit.prevent="submitTask">
            <Input
              textlabel="List Title *"
              class="mb-4"
              type="text"
              placeholder="Enter title list"
              required
              v-model="taskModal.form.title"
            ></Input>
            <div class="flex gap-3">
              <Input
                textlabel="Category"
                class="mb-4"
                type="text"
                placeholder="e.g., Work, School, Personal"
                v-model="taskModal.form.tag"
              ></Input>
              <div>
                <Input
                  textlabel="Due Date"
                  class="mb-4"
                  type="text"
                  v-model="taskModal.form.due"
                  placeholder="Today, Tomorrow, Friday, 2024-12-25..."
                  :focus="() => (showDateHelp = true)"
                  :blur="() => (showDateHelp = false)"
                ></Input>
                <div v-if="showDateHelp" class="date-help">
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
                      <li>
                        <code>Monday</code>, <code>Mon</code> - Next Monday
                      </li>
                      <li>
                        <code>Friday</code>, <code>Fri</code> - Next Friday
                      </li>
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
            <Select
              v-model="taskModal.form.priority"
              textlabel="Priority"
              :optionsarray="[
                [
                  'low',
                  '🟢 Low Priority',
                  '!bg-(--border-strong) text-(--success)',
                ],
                ['medium', '🟡 Medium Priority', ''],
                ['high', '🔴 High Priority', ''],
              ]"
            ></Select>

            <div class="flex justify-end w-full gap-3">
              <Button
                variant="alert"
                text="Cancel"
                @click="closeTaskModal"
                :basicpadd="true"
                :paddx="true"
              ></Button>
              <Button
                variant="secondary"
                :fill="true"
                :basicpadd="true"
                :paddx="true"
                :text="
                  taskModal.mode === 'create' ? 'Create Task' : 'Update Task'
                "
              ></Button>
            </div></form
        ></template>
      </Card>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="deleteModal.open"
      class="fixed inset-0 bg-black/60 z-50 p-5 flex !items-center !justify-center"
      @click.self="closeDeleteModal"
    >
      <Card :header="true" class="min-w-[500px]" :danger="true">
        <template #header
          ><h5 class="!mb-0 !font-semibold !text-(--alert)">
            <i class="fa-solid fa-trash-arrow-up"></i> Delete Task
          </h5>
          <button
            class="bg-none border-none !text-xl cursor-pointer p-1"
            @click="closeDeleteModal"
            aria-label="Close modal"
          >
            ✕
          </button></template
        >
        <template #main
          ><section class="flex flex-col text-center gap-2.5">
            <div class="text-5xl mb-3">
              <i class="fa-solid fa-circle-xmark"></i>
            </div>
            <h5 class="m-0 !text-(--alert) !font-semibold">Are you sure?</h5>
            <p class="m-0 text-(--muted)">
              You are about to permanently delete:
            </p>
            <div
              class="!bg-(--alert)/3 border !border-(--alert)/20 p-3 my-2 rounded-lg"
            >
              <h6 class="!font-semibold mb-2">
                {{ deleteModal.taskToDelete?.titleList }}
              </h6>
              <section class="flex gap-2.5 justify-center flex-wrap text-xs">
                <Pill
                  color="secondary"
                  :text="deleteModal.taskToDelete?.descriptionList"
                ></Pill>
                <Pill
                  color="secondary"
                  :text="'Due: ' + deleteModal.taskToDelete?.dueDateList"
                ></Pill>
                <Pill
                  :priority="deleteModal.taskToDelete?.priorityList"
                  :text="deleteModal.taskToDelete?.priorityList"
                ></Pill>
              </section>
            </div>
            <p class="text-(--alert) font-semibold text-sm">
              This action cannot be undone.
            </p>
          </section>

          <div class="delete-actions">
            <Button
              class="flex-1"
              @click="closeDeleteModal"
              text="Cancel"
              :basicpadd="true"
              :paddx="true"
            ></Button>
            <Button
              class="flex-1"
              @click="confirmDelete"
              :basicpadd="true"
              :paddx="true"
              text="Delete Task"
              variant="alert"
              :fill="true"
            ></Button></div
        ></template>
      </Card>
    </div>
  </section>
</template>
