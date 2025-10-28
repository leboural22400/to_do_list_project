<script>
import { TaskDataService } from '../services/taskDataService.js';
import UnsplashImages from '../components/UnsplashImages/UnsplashImages.vue';
import { useToast } from 'vue-toastification';

export default {
    name: 'TaskDetail',
    components: {
        UnsplashImages
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
                mode: 'create',
                editingId: null,
                form: {
                    title: '',
                    description: '',
                    tagsText: ''
                }
            },
            gallery: {
                open: false,
                forItemId: null
            }
        };
    },
    computed: {
        backgroundStyle() {
            if (this.task?.imageUrl) {
                return {
                    backgroundImage: `url(${this.task.imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: `${this.task.imagePosition?.x || 50}% ${this.task.imagePosition?.y || 50}%`
                };
            }
            return {
                background: 'linear-gradient(135deg, #1e3c72, #2a5298)'
            };
        },
        completedCount() {
            return this.todoItems.filter(item => item.completed).length;
        },
        progressPercentage() {
            if (this.todoItems.length === 0) return 0;
            return Math.round((this.completedCount / this.todoItems.length) * 100);
        }
    },
    created() {
        // Take the ID from route parameters
        const taskId = parseInt(this.$route.params.id);
        this.task = TaskDataService.getTaskById(taskId);
        this.todoItems = this.getTaskSpecificItems(taskId);
        
        // Redirect if task not found
        if (!this.task) {
            this.$router.push('/not-found');
        }
    },
    watch: {
        '$route.params.id'(newId) {
            // Update task and items when route ID changes
            const taskId = parseInt(newId);
            this.task = TaskDataService.getTaskById(taskId);
            this.todoItems = this.getTaskSpecificItems(taskId);
            
            if (!this.task) {
                this.$router.push('/not-found');
            }
        }
    },
    methods: {
        getTaskSpecificItems(taskId) {
            const taskItems = {
                1: [ // "Use Git and GitHub"
                    {
                        id: 1,
                        title: 'Set up Git repository',
                        description: 'Initialize a new Git repository and connect to GitHub',
                        tags: ['setup', 'git'],
                        completed: true
                    },
                    {
                        id: 2,
                        title: 'Learn basic Git commands',
                        description: 'Master add, commit, push, pull commands',
                        tags: ['commands', 'basics'],
                        completed: false
                    },
                    {
                        id: 3,
                        title: 'Understand branching',
                        description: 'Learn how to create and merge branches',
                        tags: ['branching', 'workflow'],
                        completed: false
                    },
                    {
                        id: 4,
                        title: 'Practice with pull requests',
                        description: 'Create and review pull requests on GitHub',
                        tags: ['github', 'collaboration'],
                        completed: false
                    }
                ],
                2: [ // "Submit C Lab"
                    {
                        id: 1,
                        title: 'Review lab requirements',
                        description: 'Read through all the lab specifications and requirements',
                        tags: ['preparation', 'requirements'],
                        completed: false
                    },
                    {
                        id: 2,
                        title: 'Code the main functions',
                        description: 'Implement the core functionality required for the lab',
                        tags: ['coding', 'implementation'],
                        completed: false
                    },
                    {
                        id: 3,
                        title: 'Test and debug',
                        description: 'Test all functions and fix any bugs found',
                        tags: ['testing', 'debugging'],
                        completed: false
                    },
                    {
                        id: 4,
                        title: 'Write documentation',
                        description: 'Document the code and create submission report',
                        tags: ['documentation', 'report'],
                        completed: false
                    }
                ],
                3: [ // "Review binary systems"
                    {
                        id: 1,
                        title: 'Binary number representation',
                        description: 'Understand how binary numbers work and conversions',
                        tags: ['theory', 'conversion'],
                        completed: false
                    },
                    {
                        id: 2,
                        title: 'Boolean algebra basics',
                        description: 'Learn AND, OR, NOT operations and truth tables',
                        tags: ['boolean', 'operations'],
                        completed: false
                    },
                    {
                        id: 3,
                        title: 'Practice exercises',
                        description: 'Solve binary arithmetic and logic problems',
                        tags: ['practice', 'exercises'],
                        completed: false
                    }
                ],
                4: [ // "Fix linked list"
                    {
                        id: 1,
                        title: 'Identify the bug',
                        description: 'Debug and find the issue in the linked list implementation',
                        tags: ['debugging', 'analysis'],
                        completed: true
                    },
                    {
                        id: 2,
                        title: 'Implement fix',
                        description: 'Apply the necessary code changes to fix the issue',
                        tags: ['implementation', 'fix'],
                        completed: true
                    },
                    {
                        id: 3,
                        title: 'Test the solution',
                        description: 'Verify that the linked list works correctly after the fix',
                        tags: ['testing', 'verification'],
                        completed: true
                    }
                ],
                5: [ // "Prepare democracy slides"
                    {
                        id: 1,
                        title: 'Research democratic principles',
                        description: 'Gather information about key democratic concepts',
                        tags: ['research', 'theory'],
                        completed: false
                    },
                    {
                        id: 2,
                        title: 'Create slide outline',
                        description: 'Structure the presentation with main topics',
                        tags: ['planning', 'structure'],
                        completed: false
                    },
                    {
                        id: 3,
                        title: 'Design slides',
                        description: 'Create visually appealing slides with content',
                        tags: ['design', 'creation'],
                        completed: false
                    }
                ],
            };

            // Return items for the given task ID
            return taskItems[taskId] || [];
        },

        getSectionTitle() {
            const titles = {
                1: 'Git & GitHub Learning Plan',
                2: 'C Lab Submission Steps',
                3: 'Binary Systems Study Plan',
                4: 'Linked List Fix Tasks',
                5: 'Democracy Presentation Plan',
                6: 'Probability Math Exercises',
                7: 'Docker App Containerization',
                8: 'REST API Learning Path',
                9: 'Algorithm Review Sessions',
                10: 'Programming Practice'
            };
            return titles[this.task?.id] || 'Task Plan';
        },

        goBack() {
            // Check if we have context from where the user came
            const fromContext = this.$route.query.from;
            
            if (fromContext === 'calendar') {
                // Navigate back to todo list with calendar mode
                this.$router.push({
                    path: '/to-do-list',
                    query: { view: 'calendar' }
                });
            } else if (fromContext === 'cards') {
                // Navigate back to todo list with cards mode
                this.$router.push({
                    path: '/to-do-list',
                    query: { view: 'cards' }
                });
            } else {
                // Fallback: try to go back in history
                if (window.history.length > 1) {
                    this.$router.go(-1);
                } else {
                    // Final fallback to todo list home
                    this.$router.push('/to-do-list');
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
            const imageUrl = typeof photo === 'string' ? photo : (photo?.urls?.regular || photo?.urls?.small || "");
            TaskDataService.updateTaskImage(this.gallery.forItemId, imageUrl);
            this.toast.success('Image mise à jour!');
            this.closeGallery();
        },

        selectDefault(url) {
            this.selectImage(url);
        },

        toggleItem(id) {
            const item = this.todoItems.find(item => item.id === id);
            if (item) {
                item.completed = !item.completed;
            }
        },

        openAddModal() {
            this.itemModal.mode = 'create';
            this.itemModal.open = true;
            this.itemModal.form = {
                title: '',
                description: '',
                tagsText: ''
            };
        },

        editItem(item) {
            this.itemModal.mode = 'edit';
            this.itemModal.editingId = item.id;
            this.itemModal.open = true;
            this.itemModal.form = {
                title: item.title,
                description: item.description || '',
                tagsText: (item.tags || []).join(', ')
            };
        },

        closeItemModal() {
            this.itemModal.open = false;
            this.itemModal.editingId = null;
        },

        saveItem() {
            const form = this.itemModal.form;
            if (!form.title.trim()) return;

            const itemData = {
                title: form.title.trim(),
                description: form.description.trim(),
                tags: form.tagsText.split(',').map(tag => tag.trim()).filter(Boolean),
                completed: false
            };

            if (this.itemModal.mode === 'create') {
                const maxId = Math.max(...this.todoItems.map(item => item.id), 0);
                this.todoItems.push({
                    id: maxId + 1,
                    ...itemData
                });
            } else {
                const item = this.todoItems.find(item => item.id === this.itemModal.editingId);
                if (item) {
                    Object.assign(item, itemData);
                }
            }

            this.closeItemModal();
        },

        deleteItem(id) {
            const index = this.todoItems.findIndex(item => item.id === id);
            if (index > -1) {
                this.todoItems.splice(index, 1);
            }
        }
    }
};
</script>

<template>
    <div class="todo-detail-page" v-if="task">
        <div class="header-section" :style="backgroundStyle">
            <div class="header-overlay">
                <button class="back-btn" @click="goBack" title="Go back">
                    <svg viewBox="0 0 24 24" width="20" height="20">
                        <path d="M19 12H5m7-7l-7 7 7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                            stroke-linejoin="round" />
                    </svg>
                    Back
                </button>

                <div class="task-header">
                    <h1 class="task-title">{{ task.title }}</h1>
                    <div class="task-meta">
                        <span class="task-category">{{ task.tag }}</span>
                        <span class="task-due">Due: {{ task.due }}</span>
                        <span class="task-priority" :data-priority="task.priority">{{ task.priority }}</span>
                    </div>
                </div>

                <button class="edit-bg-btn" @click="openImageGallery" title="Change background">
                    <svg viewBox="0 0 24 24" width="18" height="18">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"
                            fill="none" />
                        <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" stroke-width="2" fill="none" />
                        <path d="M21 15l-5-5L5 21" stroke="currentColor" stroke-width="2" fill="none" />
                    </svg>
                </button>
            </div>
        </div>

        <!-- Content Section -->
        <div class="content-section">
            <div class="todo-container">
                <div class="section-header">
                    <h2>{{ getSectionTitle() }}</h2>
                    <button class="add-item-btn" @click="openAddModal">
                        <svg viewBox="0 0 24 24" width="16" height="16">
                            <path d="M12 5v14m-7-7h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                        </svg>
                        Add Item
                    </button>
                </div>

                <!-- Todo Items -->
                <div class="todo-items">
                    <div v-for="item in todoItems" :key="item.id" class="todo-item"
                        :class="{ completed: item.completed }">
                        <div class="item-content">
                            <button class="check-btn" @click="toggleItem(item.id)" :class="{ checked: item.completed }">
                                <svg viewBox="0 0 24 24" width="16" height="16">
                                    <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" fill="none"
                                        stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                            </button>

                            <div class="item-details">
                                <h3 class="item-title">{{ item.title }}</h3>
                                <p class="item-description" v-if="item.description">{{ item.description }}</p>
                                <div class="item-tags" v-if="item.tags?.length">
                                    <span v-for="tag in item.tags" :key="tag" class="tag">{{ tag }}</span>
                                </div>
                            </div>
                        </div>

                        <div class="item-actions">
                            <button class="action-btn edit" @click="editItem(item)" title="Edit">
                                <svg viewBox="0 0 24 24" width="14" height="14">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                                        stroke="currentColor" stroke-width="2" fill="none" />
                                    <path d="m18.5 2.5-8 8v4h4l8-8a2 2 0 0 0 0-3z" stroke="currentColor"
                                        stroke-width="2" fill="none" />
                                </svg>
                            </button>
                            <button class="action-btn delete" @click="deleteItem(item.id)" title="Delete">
                                <svg viewBox="0 0 24 24" width="14" height="14">
                                    <path
                                        d="M3 6h18m-2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"
                                        stroke="currentColor" stroke-width="2" fill="none" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <!-- Empty State -->
                    <div v-if="todoItems.length === 0" class="empty-state">
                        <div class="empty-icon">📝</div>
                        <h3>No items yet</h3>
                        <p>Start by adding your first study item!</p>
                        <button class="add-first-btn" @click="openAddModal">Add Your First Item</button>
                    </div>
                </div>

                <!-- Progress Section -->
                <div class="progress-section">
                    <h3>Progress</h3>
                    <div class="progress-bar">
                        <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
                    </div>
                    <p class="progress-text">
                        {{ completedCount }} of {{ todoItems.length }} items completed ({{ progressPercentage }}%)
                    </p>
                </div>
            </div>
        </div>

        <!-- Add/Edit Item Modal -->
        <div v-if="itemModal.open" class="modal-backdrop" @click.self="closeItemModal">
            <div class="item-modal">
                <header class="modal-head">
                    <h2>{{ itemModal.mode === 'create' ? 'Add New Item' : 'Edit Item' }}</h2>
                    <button class="close" @click="closeItemModal">✕</button>
                </header>

                <form @submit.prevent="saveItem" class="item-form">
                    <div class="form-group">
                        <label for="itemTitle">Title *</label>
                        <input id="itemTitle" type="text" v-model="itemModal.form.title"
                            placeholder="e.g., Learn Git basics" required autofocus>
                    </div>

                    <div class="form-group">
                        <label for="itemDesc">Description</label>
                        <textarea id="itemDesc" v-model="itemModal.form.description" placeholder="Additional details..."
                            rows="3"></textarea>
                    </div>

                    <div class="form-group">
                        <label for="itemTags">Tags (comma separated)</label>
                        <input id="itemTags" type="text" v-model="itemModal.form.tagsText"
                            placeholder="e.g., basics, tutorial, practice">
                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn-cancel" @click="closeItemModal">Cancel</button>
                        <button type="submit" class="btn-submit">
                            {{ itemModal.mode === 'create' ? 'Add Item' : 'Update Item' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Image Gallery Modal -->
        <UnsplashImages :open="gallery.open" @selectDefault="selectDefault" @selectImage="selectImage" @close="closeGallery" />
    </div>
</template>

<style scoped lang="scss">
.todo-detail-page {
    min-height: 100vh;
    background: #0f1525;
    position: relative;
    z-index: 1;
}

.header-section {
    position: relative;
    height: 300px;
    display: flex;
    align-items: center;
    background: linear-gradient(135deg, #1e3c72, #2a5298);

    &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
    }
}

.header-overlay {
    position: relative;
    z-index: 2;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    align-items: center;
    gap: 24px;
}

.back-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 10px;
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    backdrop-filter: blur(10px);

    &:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: translateX(-2px);
    }
}

.task-header {
    flex: 1;
    text-align: center;
}

.task-title {
    font-size: clamp(24px, 4vw, 36px);
    font-weight: 800;
    color: white;
    margin: 0 0 12px 0;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.task-meta {
    display: flex;
    justify-content: center;
    gap: 16px;
    flex-wrap: wrap;
}

.task-category,
.task-due,
.task-priority {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 600;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    backdrop-filter: blur(10px);
}

.task-priority {
    text-transform: uppercase;

    &[data-priority="high"] {
        background: rgba(255, 86, 86, 0.3);
        border-color: rgba(255, 86, 86, 0.5);
    }

    &[data-priority="medium"] {
        background: rgba(255, 195, 0, 0.3);
        border-color: rgba(255, 195, 0, 0.5);
    }

    &[data-priority="low"] {
        background: rgba(0, 255, 170, 0.3);
        border-color: rgba(0, 255, 170, 0.5);
    }
}

.edit-bg-btn {
    padding: 10px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 10px;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
    backdrop-filter: blur(10px);

    &:hover {
        background: rgba(255, 255, 255, 0.2);
    }
}

.content-section {
    padding: 40px 24px;
}

.todo-container {
    max-width: 800px;
    margin: 0 auto;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    h2 {
        font-size: 28px;
        font-weight: 700;
        color: #e9edf8;
        margin: 0;
    }
}

.add-item-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: linear-gradient(135deg, rgba(0, 180, 255, 0.2), rgba(0, 140, 255, 0.15));
    border: 1px solid rgba(0, 180, 255, 0.3);
    border-radius: 10px;
    color: #00b4ff;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: linear-gradient(135deg, rgba(0, 180, 255, 0.3), rgba(0, 140, 255, 0.2));
        transform: translateY(-1px);
    }
}

.todo-items {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 32px;
}

.todo-item {
    background: #1a2035;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 20px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    transition: all 0.2s ease;

    &:hover {
        border-color: rgba(255, 255, 255, 0.12);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    &.completed {
        opacity: 0.7;

        .item-title {
            text-decoration: line-through;
            color: #a9ffcf;
        }
    }
}

.item-content {
    display: flex;
    gap: 16px;
    flex: 1;
}

.check-btn {
    width: 24px;
    height: 24px;
    border-radius: 8px;
    border: 2px solid rgba(0, 180, 255, 0.3);
    background: transparent;
    color: transparent;
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;
    margin-top: 2px;

    &:hover {
        border-color: rgba(0, 180, 255, 0.5);
    }

    &.checked {
        background: linear-gradient(135deg, #00b4ff, #0080cc);
        border-color: #00b4ff;
        color: white;
    }
}

.item-details {
    flex: 1;
}

.item-title {
    font-size: 18px;
    font-weight: 600;
    color: #e9edf8;
    margin: 0 0 8px 0;
}

.item-description {
    font-size: 14px;
    color: #a8b3d4;
    margin: 0 0 12px 0;
    line-height: 1.5;
}

.item-tags {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.tag {
    padding: 2px 8px;
    background: rgba(0, 180, 255, 0.1);
    border: 1px solid rgba(0, 180, 255, 0.2);
    border-radius: 12px;
    font-size: 12px;
    color: #00b4ff;
}

.item-actions {
    display: flex;
    gap: 8px;
    opacity: 0;
    transition: opacity 0.2s ease;
}

.todo-item:hover .item-actions {
    opacity: 1;
}

.action-btn {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.3);
    color: #e9edf8;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;

    &.edit:hover {
        background: rgba(0, 180, 255, 0.2);
        border-color: rgba(0, 180, 255, 0.3);
        color: #00b4ff;
    }

    &.delete:hover {
        background: rgba(255, 86, 86, 0.2);
        border-color: rgba(255, 86, 86, 0.3);
        color: #ff5656;
    }
}

.empty-state {
    text-align: center;
    padding: 60px 20px;
    color: #a8b3d4;
}

.empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
}

.empty-state h3 {
    font-size: 24px;
    margin: 0 0 8px 0;
    color: #e9edf8;
}

.empty-state p {
    margin: 0 0 24px 0;
}

.add-first-btn {
    padding: 12px 24px;
    background: linear-gradient(135deg, rgba(0, 180, 255, 0.2), rgba(0, 140, 255, 0.15));
    border: 1px solid rgba(0, 180, 255, 0.3);
    border-radius: 10px;
    color: #00b4ff;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: linear-gradient(135deg, rgba(0, 180, 255, 0.3), rgba(0, 140, 255, 0.2));
    }
}

.progress-section {
    background: #1a2035;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 24px;

    h3 {
        font-size: 20px;
        color: #e9edf8;
        margin: 0 0 16px 0;
    }
}

.progress-bar {
    height: 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 12px;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #00b4ff, #0080cc);
    border-radius: 4px;
    transition: width 0.3s ease;
}

.progress-text {
    font-size: 14px;
    color: #a8b3d4;
    margin: 0;
}

/* Modal Styles */
.modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
}

.item-modal {
    width: min(500px, 100%);
    background: #14192b;
    border-radius: 14px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
    overflow: hidden;
    position: relative;
    z-index: 1101;
}

.modal-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    background: #1b2240;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);

    h2 {
        margin: 0;
        font-size: 18px;
        color: #cfe9ff;
    }
}

.close {
    background: none;
    border: none;
    color: #cfe9ff;
    font-size: 20px;
    cursor: pointer;
    padding: 4px;
}

.item-form {
    padding: 24px;
}

.form-group {
    margin-bottom: 20px;

    label {
        display: block;
        margin-bottom: 6px;
        font-size: 14px;
        font-weight: 600;
        color: #cfe9ff;
    }

    input,
    textarea {
        width: 100%;
        padding: 10px 12px;
        background: #0f1525;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 8px;
        color: #e9edf8;
        font-size: 14px;
        transition: border-color 0.2s ease;

        &:focus {
            outline: none;
            border-color: rgba(0, 180, 255, 0.4);
        }

        &::placeholder {
            color: #7a8ba0;
        }
    }

    textarea {
        resize: vertical;
        font-family: inherit;
    }
}

.form-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
}

.btn-cancel,
.btn-submit {
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-cancel {
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: #e9edf8;

    &:hover {
        background: rgba(255, 255, 255, 0.05);
    }
}

.btn-submit {
    background: linear-gradient(135deg, rgba(0, 180, 255, 0.2), rgba(0, 140, 255, 0.15));
    border: 1px solid rgba(0, 180, 255, 0.3);
    color: #00b4ff;

    &:hover {
        background: linear-gradient(135deg, rgba(0, 180, 255, 0.3), rgba(0, 140, 255, 0.2));
    }
}

@media (max-width: 768px) {
    .header-overlay {
        flex-direction: column;
        gap: 16px;
        text-align: center;
    }

    .task-meta {
        gap: 12px;
    }

    .section-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
    }

    .todo-item {
        flex-direction: column;
        gap: 16px;
    }

    .item-actions {
        opacity: 1;
        justify-content: flex-end;
    }
}
</style>