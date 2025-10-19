<script>
// Toast notification
import { useToast } from 'vue-toastification';
import UnsplashImages from '../UnsplashImages/UnsplashImages.vue';
import { TaskDataService } from '../../services/taskDataService.js';

export default {
    name: "TodoCards",
    components: {
        UnsplashImages
    },
    setup() {
        const toast = useToast();
        return { toast };
    },
    data() {
        return {
            // Use a centralized data service
            items: TaskDataService.getAllTasks(),
            gallery: {
                open: false,
                forItemId: null
            },
            editingImageId: null,

            // Task creation/editing modal
            taskModal: {
                open: false,
                mode: 'create', // 'create' or 'edit'
                editingId: null,
                form: {
                    title: '',
                    tag: '',
                    due: '',
                    priority: 'medium'
                }
            },

            // Delete confirmation modal
            deleteModal: {
                open: false,
                taskToDelete: null
            }
        };
    },
    mounted() {
        // Add the listener for the ESC key
        document.addEventListener('keydown', this.handleKeydown);
    },
    beforeUnmount() {
        // Clean up the listener when the component is destroyed
        document.removeEventListener('keydown', this.handleKeydown);
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
            this.toast.success('Default background image applied!');
            this.closeGallery();
        },

        selectImage(photo) {
            // Use the service to update the task image
            TaskDataService.updateTaskImage(
                this.gallery.forItemId, 
                photo?.urls?.regular || photo?.urls?.small || photo
            );
            this.toast.success('Background image applied!');
            this.closeGallery();
        },
        removeImage(item) {
            TaskDataService.updateTaskImage(item.id, "");
            this.toast.info('Background image removed.');
        },

        handleKeydown(event) {
            if (event.key === 'Escape' && this.taskModal.open) {
                this.closeTaskModal();
            }

            if (event.key === 'Escape' && this.deleteModal.open) {
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
            this.toast.success('Image position updated.');
        },

        updateImagePosition(item, event) {
            if (this.editingImageId !== item.id) return;

            const rect = event.currentTarget.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width) * 100;
            const y = ((event.clientY - rect.top) / rect.height) * 100;

            // Clamp values between 0 and 100
            const newPosition = {
                x: Math.max(0, Math.min(100, x)),
                y: Math.max(0, Math.min(100, y))
            };
            
            // Update position in the data service
            TaskDataService.updateTaskImagePosition(item.id, newPosition);
        },

        // ---------- Task Modal Management ----------
        openTaskModal(mode = 'create', item = null) {
            this.taskModal.mode = mode;
            this.taskModal.open = true;

            if (mode === 'edit' && item) {
                this.taskModal.editingId = item.id;
                this.taskModal.form = {
                    title: item.title,
                    tag: item.tag,
                    due: item.due,
                    priority: item.priority
                };
            } else {
                this.taskModal.editingId = null;
                this.taskModal.form = {
                    title: '',
                    tag: '',
                    due: '',
                    priority: 'medium'
                };
            }
        },

        closeTaskModal() {
            this.taskModal.open = false;
            this.taskModal.editingId = null;
            this.taskModal.form = {
                title: '',
                tag: '',
                due: '',
                priority: 'medium'
            };
        },

        submitTask() {
            const form = this.taskModal.form;

            // Validation
            if (!form.title.trim()) {
                this.toast.error('Task title is required.');
                return;
            }

            if (this.taskModal.mode === 'create') {
                this.createTask(form);
            } else if (this.taskModal.mode === 'edit') {
                this.updateTask(form);
            }

            this.closeTaskModal();
        },

        createTask(form) {
            // Generate new ID
            const maxId = Math.max(...this.items.map(item => item.id));
            const newId = maxId + 1;

            const newTodo = {
                id: newId,
                title: form.title.trim(),
                tag: form.tag.trim() || 'General',
                due: form.due.trim() || 'TBD',
                priority: form.priority,
                done: false,
                imageUrl: "",
                imagePosition: { x: 50, y: 50 }
            };

            this.items.push(newTodo);
            this.toast.success(`Task "${form.title}" created successfully!`);
        },

        updateTask(form) {
            const item = this.items.find(i => i.id === this.taskModal.editingId);
            if (item) {
                item.title = form.title.trim();
                item.tag = form.tag.trim() || 'General';
                item.due = form.due.trim() || 'TBD';
                item.priority = form.priority;
                this.toast.success('Task updated successfully!');
            }
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

            const index = this.items.findIndex(i => i.id === item.id);
            if (index !== -1) {
                this.items.splice(index, 1);
                this.toast.success(`Task "${item.title}" deleted successfully!`);
            }

            this.closeDeleteModal();
        },

        closeDeleteModal() {
            this.deleteModal.open = false;
            this.deleteModal.taskToDelete = null;
        },

        // Detail view methods
        openTaskDetail(item, event) {
            // Prevent navigation if clicking on controls
            if (event.target.closest('.card-control') ||
                event.target.closest('.check') ||
                event.target.closest('.image-controls') ||
                event.target.closest('.img-btn')) {
                return;
            }

            // Prevent navigation if we're in image editing mode
            if (this.editingImageId === item.id) {
                return;
            }

            // Navigate to task detail route
            this.$router.push(`/task/${item.id}`);
        },

        duplicateTodo(item, event) {
            event.stopPropagation();

            const maxId = Math.max(...this.items.map(i => i.id));
            const duplicatedTodo = {
                ...item,
                id: maxId + 1,
                title: `${item.title} (Copy)`,
                done: false
            };

            const originalIndex = this.items.findIndex(i => i.id === item.id);
            this.items.splice(originalIndex + 1, 0, duplicatedTodo);

            this.toast.success(`Task duplicated successfully!`);
        }
    }
};
</script>

<template>
    <!-- Main Cards View -->
    <section class="page">
        <div class="header-controls">
            <h1 class="neon-title">MY TO-DOs</h1>
            <button class="create-btn" @click="openTaskModal('create')" title="Create new task">
                <svg viewBox="0 0 24 24" width="20" height="20">
                    <path d="M12 5v14m-7-7h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                </svg>
                New Task
            </button>
        </div>

        <div class="grid">
            <article v-for="item in items" :key="item.id" class="card" :aria-pressed="item.done ? 'true' : 'false'"
                @click="openTaskDetail(item, $event)">
                <!-- Card controls -->
                <div class="card-controls">
                    <button class="card-control edit" @click="openTaskModal('edit', item)" title="Edit task">
                        <svg viewBox="0 0 24 24" width="14" height="14">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor"
                                stroke-width="2" fill="none" />
                            <path d="m18.5 2.5-8 8v4h4l8-8a2 2 0 0 0 0-3z" stroke="currentColor" stroke-width="2"
                                fill="none" />
                        </svg>
                    </button>
                    <button class="card-control duplicate" @click="duplicateTodo(item, $event)" title="Duplicate task">
                        <svg viewBox="0 0 24 24" width="14" height="14">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor"
                                stroke-width="2" fill="none" />
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor"
                                stroke-width="2" fill="none" />
                        </svg>
                    </button>
                    <button class="card-control delete" @click="deleteTodo(item, $event)" title="Delete task">
                        <svg viewBox="0 0 24 24" width="14" height="14">
                            <path d="M3 6h18m-2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"
                                stroke="currentColor" stroke-width="2" fill="none" />
                        </svg>
                    </button>
                </div>

                <div class="thumb" :style="item.imageUrl ? {
                    backgroundImage: `url(${item.imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: `${item.imagePosition?.x || 50}% ${item.imagePosition?.y || 50}%`
                } : {}" @click="editingImageId === item.id ? finishImageEdit($event) : null"
                    @mousemove="updateImagePosition(item, $event)"
                    :class="{ 'editing-image': editingImageId === item.id }"
                    :aria-label="`Task background for ${item.title}`" tabindex="0">
                    <span class="chip" :data-priority="item.priority">{{ item.priority }}</span>
                    <span class="due">Due: {{ item.due }}</span>

                    <button class="check" :class="{ on: item.done }" aria-label="Mark done"
                        @click.stop="toggle(item.id)">
                        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                            <path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" stroke-width="3"
                                stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </button>

                    <!-- Image Control Toolbar -->
                    <div class="image-controls" v-if="editingImageId !== item.id">
                        <button class="img-btn add-img" title="Add/Change image" @click.stop="openGallery(item)">
                            <svg viewBox="0 0 24 24" width="14" height="14">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor"
                                    stroke-width="2" fill="none" />
                                <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" stroke-width="2" fill="none" />
                                <path d="M21 15l-5-5L5 21" stroke="currentColor" stroke-width="2" fill="none" />
                            </svg>
                        </button>

                        <button v-if="item.imageUrl" class="img-btn remove-img" title="Remove image"
                            @click.stop="removeImage(item)">
                            <svg viewBox="0 0 24 24" width="14" height="14">
                                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2"
                                    stroke-linecap="round" />
                            </svg>
                        </button>

                        <button v-if="item.imageUrl" class="img-btn reposition-img" title="Adjust position"
                            @click.stop="startImageEdit(item, $event)">
                            <svg viewBox="0 0 24 24" width="14" height="14">
                                <path d="M12 2l3 3-3 3M2 12l3-3 3 3M12 22l-3-3 3-3M22 12l-3 3-3-3" stroke="currentColor"
                                    stroke-width="2" fill="none" />
                            </svg>
                        </button>
                    </div>

                    <!-- Editing overlay -->
                    <div v-if="editingImageId === item.id" class="edit-overlay">
                        <span class="edit-hint">Move cursor to reposition • Click to finish</span>
                        <div class="crosshair"></div>
                    </div>
                </div>

                <div class="label">
                    <div class="title" :class="{ done: item.done }">{{ item.title }}</div>
                    <div class="tag">{{ item.tag }}</div>
                </div>
            </article>
        </div>

        <!-- Image Gallery Modal -->
        <UnsplashImages :open="gallery.open" @selectDefault="selectDefault" @selectImage="selectImage" @close="closeGallery" />

        <!-- Task Creation/Editing Modal -->
        <div v-if="taskModal.open" class="modal-backdrop" @click.self="closeTaskModal">
            <div class="task-modal">
                <header class="modal-head">
                    <h2>{{ taskModal.mode === 'create' ? 'Create New Task' : 'Edit Task' }}</h2>
                    <button class="close" @click="closeTaskModal" aria-label="Close modal">
                        ✕
                    </button>
                </header>

                <form @submit.prevent="submitTask" class="task-form">
                    <div class="form-group">
                        <label for="taskTitle">Task Title *</label>
                        <input id="taskTitle" type="text" v-model="taskModal.form.title"
                            placeholder="Enter task title..." required autofocus>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="taskTag">Category</label>
                            <input id="taskTag" type="text" v-model="taskModal.form.tag"
                                placeholder="e.g., Work, School, Personal">
                        </div>

                        <div class="form-group">
                            <label for="taskDue">Due Date</label>
                            <input id="taskDue" type="text" v-model="taskModal.form.due"
                                placeholder="e.g., Tomorrow, Friday, Dec 25">
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
                            {{ taskModal.mode === 'create' ? 'Create Task' : 'Update Task' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Delete Confirmation Modal -->
        <div v-if="deleteModal.open" class="modal-backdrop" @click.self="closeDeleteModal">
            <div class="delete-modal">
                <header class="modal-head danger">
                    <h2><i class="fa-solid fa-trash-arrow-up"></i> Delete Task</h2>
                    <button class="close" @click="closeDeleteModal" aria-label="Close modal">
                        ✕
                    </button>
                </header>

                <div class="delete-content">
                    <div class="delete-warning">
                        <div class="warning-icon"><i class="fa-solid fa-circle-xmark"></i></div>
                        <h3>Are you sure?</h3>
                        <p>You are about to permanently delete:</p>
                        <div class="task-preview">
                            <div class="task-title">{{ deleteModal.taskToDelete?.title }}</div>
                            <div class="task-info">
                                <span class="task-tag">{{ deleteModal.taskToDelete?.tag }}</span>
                                <span class="task-due">Due: {{ deleteModal.taskToDelete?.due }}</span>
                                <span class="task-priority" :data-priority="deleteModal.taskToDelete?.priority">
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
    background: #0f1525 radial-gradient(1200px 400px at 50% -10%, rgba(0, 180, 255, 0.08), transparent 60%);
    color: #e9edf8;
    padding: 32px 24px 56px;
}

.neon-title {
    text-align: center;
    font-size: clamp(28px, 6vw, 64px);
    font-weight: 800;
    letter-spacing: .04em;
    color: #6ae8ff;
    text-shadow: 0 0 8px rgba(0, 240, 255, .35), 0 0 26px rgba(0, 180, 255, .25);
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
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .06), 0 14px 40px rgba(0, 0, 0, .45);
    transition: transform .18s ease, box-shadow .18s ease;
    isolation: isolate;
}

.card::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(120deg, transparent 60%, rgba(255, 255, 255, .06) 70%, transparent 78%);
    transform: translateX(-8%);
    pointer-events: none;
}

.card:hover {
    transform: translateY(-4px);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .08),
        0 18px 50px rgba(0, 0, 0, .55),
        0 0 22px rgba(0, 220, 255, .06);
}

.thumb {
    position: relative;
    height: 160px;
    background: radial-gradient(200px 80px at 30% 20%, rgba(0, 255, 255, .18), transparent 60%),
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
    letter-spacing: .06em;
    border-radius: 999px;
    background: rgba(0, 0, 0, .35);
    border: 1px solid rgba(255, 255, 255, .14);
    backdrop-filter: blur(6px);
}

.chip[data-priority="high"] {
    color: #ffd5d5;
    box-shadow: 0 0 12px rgba(255, 86, 86, .25) inset;
}

.chip[data-priority="medium"] {
    color: #ffeec2;
    box-shadow: 0 0 12px rgba(255, 195, 0, .18) inset;
}

.chip[data-priority="low"] {
    color: #d2ffe9;
    box-shadow: 0 0 12px rgba(0, 255, 170, .18) inset;
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
    opacity: .85;
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
    border: 1px solid rgba(255, 255, 255, .18);
    box-shadow: 0 6px 14px rgba(0, 0, 0, .35);
    transition: transform .15s ease, box-shadow .15s ease, background-color .2s ease;
}

.check:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 18px rgba(0, 0, 0, .4);
}

.check.on {
    color: #b7ffd9;
    background: linear-gradient(180deg, #203b2b, #13281c);
}

.label {
    background: linear-gradient(180deg, #2b2f4d, #242743);
    padding: 16px 16px 18px;
    text-align: center;
    border-top: 1px solid rgba(255, 255, 255, .06);
    box-shadow: 0 -1px 0 rgba(255, 255, 255, .04) inset, 0 8px 24px rgba(0, 0, 0, .35);
}

.title {
    font-weight: 700;
    font-size: 16px;
    color: #eef3ff;
    text-shadow: 0 0 14px rgba(0, 220, 255, .15);
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
    opacity: .9;
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
    background: rgba(0, 0, 0, .6);
    border: 1px solid rgba(255, 255, 255, .18);
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
    background: rgba(0, 0, 0, .65);
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

/* Header Controls */
.header-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    gap: 16px;
    position: relative;

    .neon-title {
        margin: 0;
    }

    .create-btn {
        position: absolute;
        right: 0;

        @media (max-width: 768px) {
            position: static;
            margin-top: 12px;
        }
    }

    @media (max-width: 768px) {
        flex-direction: column;
        text-align: center;
    }
}

.create-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    border-radius: 10px;
    background: linear-gradient(135deg, rgba(0, 180, 255, 0.15), rgba(0, 140, 255, 0.1));
    border: 1px solid rgba(0, 180, 255, 0.3);
    color: #00b4ff;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 12px rgba(0, 180, 255, 0.1);

    &:hover {
        background: linear-gradient(135deg, rgba(0, 180, 255, 0.25), rgba(0, 140, 255, 0.15));
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
    border: 1px solid rgba(255, 255, 255, .12);
    box-shadow: 
        0 25px 80px rgba(0, 0, 0, .7),
        0 0 0 1px rgba(0, 180, 255, .08),
        inset 0 1px 0 rgba(255, 255, 255, .1);
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
        background: linear-gradient(90deg, transparent, rgba(0, 180, 255, 0.3), transparent);
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
    border: 1px solid rgba(255, 255, 255, .15);
    background: linear-gradient(145deg, #0d1420, #111929);
    color: #f0f5ff;
    font-size: 15px;
    font-weight: 500;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);

    &:focus {
        outline: none;
        border-color: rgba(0, 180, 255, 0.6);
        box-shadow: 
            0 0 0 3px rgba(0, 180, 255, 0.15),
            inset 0 1px 3px rgba(0, 0, 0, 0.2),
            0 4px 12px rgba(0, 180, 255, 0.1);
        background: linear-gradient(145deg, #0f1525, #141d2e);
        transform: translateY(-1px);
    }

    &::placeholder {
        color: #8494b8;
        opacity: 0.9;
        font-weight: 400;
    }

    &:hover:not(:focus) {
        border-color: rgba(255, 255, 255, .2);
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
        background: linear-gradient(90deg, transparent, rgba(0, 180, 255, 0.4), transparent);
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
    border: 1px solid rgba(255, 255, 255, .15);
    position: relative;
    overflow: hidden;

    &::before {
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
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
    background: linear-gradient(135deg, rgba(0, 180, 255, 0.25), rgba(0, 140, 255, 0.2));
    border-color: rgba(0, 180, 255, 0.4);
    color: #4dd0ff;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    position: relative;

    &:hover {
        background: linear-gradient(135deg, rgba(0, 180, 255, 0.4), rgba(0, 140, 255, 0.3));
        transform: translateY(-2px);
        box-shadow: 
            0 8px 25px rgba(0, 180, 255, 0.25),
            0 0 20px rgba(0, 180, 255, 0.15);
        border-color: rgba(0, 180, 255, 0.6);
        color: #66d9ff;
    }

    &:active {
        transform: translateY(-1px);
    }

    &:focus {
        outline: none;
        box-shadow: 
            0 0 0 3px rgba(0, 180, 255, 0.3),
            0 8px 25px rgba(0, 180, 255, 0.25);
    }
}

/* Delete Modal Styles */
.delete-modal {
    width: min(450px, 90vw);
    background: #14192b;
    border-radius: 14px;
    border: 1px solid rgba(255, 86, 86, 0.2);
    box-shadow: 0 20px 60px rgba(0, 0, 0, .6);
    overflow: hidden;
}

.modal-head.danger {
    background: linear-gradient(135deg, rgba(255, 86, 86, 0.15), rgba(200, 60, 60, 0.1));
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
    background: linear-gradient(135deg, rgba(255, 86, 86, 0.2), rgba(200, 60, 60, 0.15));
    color: #ff9999;

    &:hover {
        background: linear-gradient(135deg, rgba(255, 86, 86, 0.3), rgba(200, 60, 60, 0.2));
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(255, 86, 86, 0.3);
    }

    &:active {
        transform: translateY(0);
    }
}
</style>