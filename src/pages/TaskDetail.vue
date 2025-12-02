<script>
import { getAllTaskByListID } from "@/middleware/taskService.js";
import { getListByID, updateList } from "@/middleware/listService.js";
import { updateTask } from "@/middleware/taskService.js";
import { createNewTask } from "@/middleware/taskService.js";
import { destroyTask } from "@/middleware/taskService.js";

import Button from "@/components/Button.vue";
import Pill from "@/components/Pill.vue";
import Card from "@/components/Card.vue";
import Checkbox from "@/components/Checkbox.vue";
import Input from "@/components/Input.vue";

import UnsplashImages from "../components/UnsplashImages/UnsplashImages.vue";
import { useToast } from "vue-toastification";

export default {
  name: "TaskDetail",
  components: {
    UnsplashImages,
    Button,
    Pill,
    Card,
    Checkbox,
    Input,
  },
  setup() {
    const toast = useToast();
    return { toast };
  },
  data() {
    return {
      task: null,
      todoItems: [],
      itemModal: {
        open: false,
        mode: "create",
        editingId: null,
        form: {
          title: "",
          description: "",
          tagsText: "",
        },
      },
      gallery: {
        open: false,
        forItemId: null,
      },
    };
  },
  computed: {
    backgroundStyle() {
      if (this.task?.imageSrcLinkList) {
        return {
          backgroundImage: `url(${this.task.imageSrcLinkList})`,
          backgroundSize: "cover",
          backgroundPosition: `${this.task.imagePosition?.x || 50}% ${
            this.task.imagePosition?.y || 50
          }%`,
        };
      }
      return {
        background: "linear-gradient(135deg, #1e3c72, #2a5298)",
      };
    },
    completedCount() {
      return this.todoItems.filter((item) => item.stateTask === 2).length;
    },
    progressPercentage() {
      if (this.todoItems.length === 0) return 0;
      return Math.round((this.completedCount / this.todoItems.length) * 100);
    },
  },
  watch: {
    "$route.params.id"(newId) {
      // Update task and items when route ID changes
    },
  },
  methods: {
    async getTasks() {
      try {
        this.todoItems = await getAllTaskByListID(this.$route.params.id);
      } catch (err) {
        console.log(err);
      }
    },

    async getList() {
      try {
        this.task = await getListByID(this.$route.params.id);
      } catch (err) {
        console.log(err);
        this.$router.push("/not-found");
      }
    },

    goBack() {
      // Check if we have context from where the user came
      const fromContext = this.$route.query.from;

      if (fromContext === "calendar") {
        // Navigate back to todo list with calendar mode
        this.$router.push({
          path: "/to-do-list",
          query: { view: "calendar" },
        });
      } else if (fromContext === "cards") {
        // Navigate back to todo list with cards mode
        this.$router.push({
          path: "/to-do-list",
          query: { view: "cards" },
        });
      } else {
        // Fallback: try to go back in history
        if (window.history.length > 1) {
          this.$router.go(-1);
        } else {
          // Final fallback to todo list home
          this.$router.push("/to-do-list");
        }
      }
    },

    openImageGallery() {
      this.gallery.open = true;
      this.gallery.forItemId = this.task.id;
    },

    closeGallery() {
      this.gallery.open = false;
      this.gallery.forItemId = null;
    },

    selectImage(photo) {
      // Handle both URL strings (from defaults) and photo objects (from API)
      const imageUrl =
        typeof photo === "string"
          ? photo
          : photo?.urls?.regular || photo?.urls?.small || "";
      updateList({ imageSrcLinkList: imageUrl }, this.$route.params.id).then(
        () => {
          this.closeGallery();
          location.reload();
        }
      );
    },

    selectDefault(url) {
      this.selectImage(url);
    },

    async toggleTask(task) {
      console.log(task.stateTask);
      await updateTask(
        { stateTask: task.stateTask < 2 ? task.stateTask + 1 : 0 },
        task.idTask
      ).then(async () => {
        await updateList(
          { stateList: this.progressPercentage == 100 },
          this.$route.params.id
        );
      });
    },

    openAddModal() {
      this.itemModal.mode = "create";
      this.itemModal.open = true;
      this.itemModal.form = {
        title: "",
        description: "",
        tagsText: "",
      };
    },

    editTask(task) {
      this.itemModal.mode = "edit";
      this.itemModal.editingId = task.idTask;
      this.itemModal.open = true;
      this.itemModal.form = {
        title: task.titleTask,
        description: task.descriptionTask || "",
        tagsText: (JSON.parse(task.tagsTask) || []).join(", "),
      };
    },

    closeItemModal() {
      this.itemModal.open = false;
      this.itemModal.editingId = null;
      location.reload();
    },

    async saveItem() {
      const form = this.itemModal.form;
      if (!form.title.trim()) return;

      const itemData = {
        titleTask: form.title.trim(),
        descriptionTask: form.description.trim(),
        tagsTask: JSON.stringify(
          form.tagsText
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        ),
        stateTask: false,
        dueDateTast: "2025-12-31",
        idList: this.$route.params.id,
      };

      if (this.itemModal.mode === "create") {
        await createNewTask(itemData).then(() => this.closeItemModal());
      } else {
        updateTask(itemData, this.itemModal.editingId).then(() =>
          this.closeItemModal()
        );
      }
    },

    async deleteTask(task) {
      await destroyTask(task.idTask).then(() => location.reload());
    },
  },
  mounted() {
    this.getTasks();
    this.getList();
  },
};
</script>

<template>
  <main class="min-h-lvh bg-(--page-bg)" v-if="task">
    <header class="h-80 !flex !items-center" :style="backgroundStyle">
      <section
        class="w-full max-w-6xl !flex !items-center justify-center mx-auto"
      >
        <Button @click="goBack" :basicpadd="true" :paddx="true">
          <template #body
            ><svg viewBox="0 0 24 24" width="20" height="20" class="!mr-2">
              <path
                d="M19 12H5m7-7l-7 7 7 7"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            Back</template
          >
        </Button>
        <main class="text-center flex-1">
          <h1 class="!text-(--fg) !font-extrabold mb-3">
            {{ task.titleList }}
          </h1>
          <section class="flex justify-center gap-4 flex-wrap">
            <Pill :text="task.descriptionList" />
            <Pill :text="'Due: ' + task.dueDateList" />
            <Pill :text="task.priorityList" :priority="task.priorityList" />
          </section>
        </main>

        <Button
          @click="openImageGallery"
          title="Change background"
          :basicpadd="true"
          :paddx="true"
        >
          <template #body
            ><svg viewBox="0 0 24 24" width="18" height="18">
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
      </section>
    </header>

    <!-- Content Section -->
    <main class="!py-10 !px-6 !max-w-6xl mx-auto">
      <header class="flex justify-between items-center !mb-6">
        <h2 class="!font-bold !text-(--fg) m-0">{{ task.descriptionList }}</h2>
        <Button
          variant="secondary"
          @click="openAddModal"
          :fill="true"
          :basicpadd="true"
          :paddx="true"
        >
          <template #body
            ><svg viewBox="0 0 24 24" width="16" height="16">
              <path
                d="M12 5v14m-7-7h14"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
            Add Item</template
          >
        </Button>
      </header>

      <!-- Todo Items -->
      <main class="flex flex-col !gap-4 !mb-8">
        <Card
          v-for="item in todoItems"
          :key="item"
          custommainclass="!flex"
          class="group"
        >
          <template #main>
            <section class="flex !flex-1 gap-4">
              <Checkbox
                @click="toggleTask(item)"
                class="!w-6 !h-6"
                v-model="item.stateTask"
                customclass="!w-6 !h-6 after:!w-2 after:!h-3 after:!left-[6px]"
              ></Checkbox>

              <main class="">
                <h5 class="!font-semibold !text-(--fg)">
                  {{ item.titleTask }}
                </h5>
                <p class="text-sm text-(--muted)" v-if="item.descriptionTask">
                  {{ item.descriptionTask }}
                </p>
                <div
                  class="flex gap-2 flex-wrap"
                  v-if="JSON.parse(item.tagsTask).length"
                >
                  <Pill
                    v-for="tag in JSON.parse(item.tagsTask)"
                    :key="tag"
                    :text="tag"
                    color="secondary"
                  ></Pill>
                </div>
              </main>
            </section>

            <aside
              class="flex gap-2 opacity-0 transition-opacity group-hover:!opacity-100"
            >
              <Button
                :nopadd="true"
                variant="secondary"
                @click="editTask(item)"
                title="Edit"
                :basicpadd="true"
                :paddx="true"
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
                :nopadd="true"
                variant="alert"
                @click="deleteTask(item)"
                title="Delete"
                :basicpadd="true"
                :paddx="true"
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
            </aside>
          </template>
        </Card>

        <!-- Empty State -->
        <div v-if="todoItems.length === 0" class="text-center !py-16 !px-5">
          <h1>📝</h1>
          <h4>No items yet</h4>
          <p>Start by adding your first study item!</p>
          <Button
            class="max-w-55 mx-auto"
            variant="secondary"
            :fill="true"
            text="Add Your First Item"
            @click="openAddModal"
            :basicpadd="true"
            :paddx="true"
          ></Button>
        </div>
      </main>

      <!-- Progress Section -->
      <Card v-if="todoItems.length !== 0">
        <template #main
          ><h5>Progress</h5>
          <progress
            class="mt-1 h-5 w-full border-2 border-(--chip-border) rounded-2xl overflow-hidden [&::-webkit-progress-value]:transition-[width,0.3s,ease] [&::-webkit-progress-value]:rounded-lg [&::-webkit-progress-bar]:bg-(--chip) [&::-webkit-progress-value]:bg-[image:_var(--btn)]"
            max="100"
            :value="progressPercentage"
          >
            <span>{{ progressPercentage }}%</span>
          </progress>
          <p class="text-(--muted) text-sm">
            {{ completedCount }} of {{ todoItems.length }} items completed ({{
              progressPercentage
            }}%)
          </p></template
        >
      </Card>
    </main>

    <!-- Add/Edit Item Modal -->
    <div
      v-if="itemModal.open"
      class="fixed inset-0 bg-black/60 z-50 p-5 flex !items-center !justify-center"
      @click.self="closeItemModal"
    >
      <Card :header="true" class="min-w-[500px]">
        <template #header
          ><h5 class="!mb-0">
            {{ itemModal.mode === "create" ? "Add New Item" : "Edit Item" }}
          </h5>
          <button
            class="bg-none border-none !text-xl cursor-pointer p-1"
            @click="closeItemModal"
          >
            ✕
          </button></template
        >
        <template #main
          ><form @submit.prevent="saveItem">
            <Input
              textlabel="Title *"
              class="mb-4"
              type="text"
              placeholder="e.g., Learn Git basics"
              required
              v-model="itemModal.form.title"
            ></Input>
            <Input
              textlabel="Description"
              class="mb-4"
              type="text"
              placeholder="Additional details..."
              v-model="itemModal.form.description"
            ></Input>
            <Input
              textlabel="Tags (comma separated)"
              class="mb-4"
              type="text"
              placeholder="e.g., basics, tutorial, practice"
              v-model="itemModal.form.tagsText"
            ></Input>

            <div class="form-actions">
              <Button
                variant="alert"
                text="Cancel"
                @click="closeItemModal"
                :basicpadd="true"
                :paddx="true"
              ></Button>
              <Button
                variant="secondary"
                :fill="true"
                :text="itemModal.mode === 'create' ? 'Add Item' : 'Update Item'"
                :basicpadd="true"
                :paddx="true"
              ></Button>
            </div></form
        ></template>
      </Card>
    </div>

    <!-- Image Gallery Modal -->
    <UnsplashImages
      :open="gallery.open"
      @selectDefault="selectDefault"
      @selectImage="selectImage"
      @close="closeGallery"
    />
  </main>
</template>
