<script>
export default {
    name: 'StatusManager',
    data() {
        return {
            statuses: [],
            tasks: [], // For counting tasks by status
            
            // Status creation/editing modal
            statusModal: {
                open: false,
                mode: 'create', // 'create' or 'edit'
                editingId: null,
                form: {
                    nom_statut: ''
                }
            },

            // Delete confirmation modal
            deleteModal: {
                open: false,
                statusToDelete: null
            }
        };
    },
    mounted() {
        this.loadData();
    },
    methods: {
        loadData() {
            // Load statuses
            const savedStatuses = localStorage.getItem('todoStatuses');
            if (savedStatuses) {
                this.statuses = JSON.parse(savedStatuses);
            } else {
                this.initDefaultStatuses();
            }

            // Load tasks (for counting purposes)
            const savedTasks = localStorage.getItem('todoItems');
            if (savedTasks) {
                this.tasks = JSON.parse(savedTasks);
            }
        },

        saveData() {
            localStorage.setItem('todoStatuses', JSON.stringify(this.statuses));
        },

        initDefaultStatuses() {
            const currentUserId = this.getCurrentUserId();
            this.statuses = [
                { id: 1, nom_statut: 'To Do', user_id: currentUserId, created_at: new Date().toISOString() },
                { id: 2, nom_statut: 'In Progress', user_id: currentUserId, created_at: new Date().toISOString() },
                { id: 3, nom_statut: 'Done', user_id: currentUserId, created_at: new Date().toISOString() }
            ];
            this.saveData();
        },

        getCurrentUserId() {
            // To be replaced with actual user ID retrieval logic
            return 1;
        },

        // Status CRUD operations
        openStatusModal(mode = 'create', status = null) {
            this.statusModal.mode = mode;
            if (mode === 'edit' && status) {
                this.statusModal.editingId = status.id;
                this.statusModal.form = { ...status };
            } else {
                this.statusModal.editingId = null;
                this.statusModal.form = {
                    nom_statut: ''
                };
            }
            this.statusModal.open = true;
        },

        closeStatusModal() {
            this.statusModal.open = false;
        },

        saveStatus() {
            if (!this.statusModal.form.nom_statut.trim()) return;

            const currentUserId = this.getCurrentUserId();

            if (this.statusModal.mode === 'create') {
                const newStatus = {
                    id: Date.now(),
                    nom_statut: this.statusModal.form.nom_statut.trim(),
                    user_id: currentUserId,
                    created_at: new Date().toISOString()
                };
                this.statuses.push(newStatus);
            } else {
                const statusIndex = this.statuses.findIndex(status => status.id === this.statusModal.editingId);
                if (statusIndex !== -1) {
                    this.statuses[statusIndex] = {
                        ...this.statuses[statusIndex],
                        nom_statut: this.statusModal.form.nom_statut.trim(),
                        updated_at: new Date().toISOString()
                    };
                }
            }

            this.saveData();
            this.closeStatusModal();
        },

        // Delete operations
        confirmDeleteStatus(status) {
            this.deleteModal.statusToDelete = status;
            this.deleteModal.open = true;
        },

        cancelDeleteStatus() {
            this.deleteModal.open = false;
            this.deleteModal.statusToDelete = null;
        },

        deleteStatus() {
            if (this.deleteModal.statusToDelete) {
                this.statuses = this.statuses.filter(status => status.id !== this.deleteModal.statusToDelete.id);
                this.saveData();
            }
            this.cancelDeleteStatus();
        },

        // Utility methods
        getTaskCount(statusId) {
            return this.tasks.filter(task => task.statut_id === statusId).length;
        },

        formatDate(dateString) {
            if (!dateString) return '';
            return new Date(dateString).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    }
};
</script>

<template>
    <div class="status-manager">
        <div class="header">
            <h1 class="neon-title">My Statuses</h1>
            <button class="create-btn" @click="openStatusModal('create')" title="Create new status">
                <svg viewBox="0 0 24 24" width="20" height="20">
                    <path d="M12 5v14m-7-7h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                New Status
            </button>
        </div>

        <div class="status-list">
            <div v-for="status in statuses" :key="status.id" class="status-card">
                <div class="status-info">
                    <h3>{{ status.nom_statut }}</h3>
                    <p class="status-date">Créé le {{ formatDate(status.created_at) }}</p>
                    <div class="status-tasks">
                        {{ getTaskCount(status.id) }} task(s) with this status
                    </div>
                </div>
                
                <div class="status-actions">
                    <button class="btn-edit" @click="openStatusModal('edit', status)" title="Edit status">
                        <svg viewBox="0 0 24 24" width="16" height="16">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2" fill="none"/>
                            <path d="m18.5 2.5-8 8v4h4l8-8a2 2 0 0 0 0-3z" stroke="currentColor" stroke-width="2" fill="none"/>
                        </svg>
                    </button>
                    <button class="btn-delete" @click="confirmDeleteStatus(status)" title="Delete status" 
                            :disabled="getTaskCount(status.id) > 0">
                        <svg viewBox="0 0 24 24" width="16" height="16">
                            <path d="M3 6h18m-2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" stroke-width="2" fill="none"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>

        <!-- Status Creation/Editing Modal -->
        <div v-if="statusModal.open" class="modal-backdrop" @click.self="closeStatusModal">
            <div class="status-modal">
                <header class="modal-head">
                    <h2>{{ statusModal.mode === 'create' ? 'New Status' : 'Edit Status' }}</h2>
                    <button class="close" @click="closeStatusModal" aria-label="Close modal">
                        ✕
                    </button>
                </header>

                <form @submit.prevent="saveStatus" class="status-form">
                    <div class="form-group">
                        <label for="statusName">Status Name *</label>
                        <input 
                            id="statusName"
                            type="text" 
                            v-model="statusModal.form.nom_statut" 
                            placeholder="Ex: in progress, done..."
                            required
                            autofocus>
                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn-cancel" @click="closeStatusModal">
                            Cancel
                        </button>
                        <button type="submit" class="btn-submit">
                            {{ statusModal.mode === 'create' ? 'Create' : 'Edit' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Delete Confirmation Modal -->
        <div v-if="deleteModal.open" class="modal-backdrop" @click.self="cancelDeleteStatus">
            <div class="delete-modal">
                <header class="modal-head danger">
                    <h2>Delete Status</h2>
                    <button class="close" @click="cancelDeleteStatus" aria-label="Close modal">
                        ✕
                    </button>
                </header>

                <div class="delete-content">
                    <div class="delete-warning">
                        <h3>Are you sure?</h3>
                        <p>You are about to permanently delete:</p>
                        <div class="status-preview">
                            <div class="status-name">{{ deleteModal.statusToDelete?.nom_statut }}</div>
                        </div>
                        <p class="warning-text">This action cannot be undone.</p>
                    </div>

                    <div class="delete-actions">
                        <button type="button" class="btn-cancel" @click="cancelDeleteStatus">
                            Cancel
                        </button>
                        <button type="button" class="btn-delete" @click="deleteStatus">
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.status-manager {
    min-height: 100dvh;
    background: #0f1525 radial-gradient(1200px 400px at 50% -10%, rgba(0, 180, 255, 0.08), transparent 60%);
    color: #e9edf8;
    padding: 32px 24px 56px;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
    flex-wrap: wrap;
    gap: 16px;

    @media (max-width: 768px) {
        flex-direction: column;
        text-align: center;
    }
}

.neon-title {
    font-size: clamp(24px, 5vw, 48px);
    font-weight: 800;
    letter-spacing: .04em;
    color: #6ae8ff;
    text-shadow: 0 0 8px rgba(0, 240, 255, .35), 0 0 26px rgba(0, 180, 255, .25);
    margin: 0;
}

.create-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
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

.status-list {
    display: grid;
    gap: 16px;
    max-width: 800px;
    margin: 0 auto;
}

.status-card {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(255, 255, 255, 0.04);
        border-color: rgba(255, 255, 255, 0.12);
    }
}

.status-info {
    flex: 1;

    h3 {
        margin: 0 0 8px 0;
        font-size: 18px;
        font-weight: 600;
        color: #e9edf8;
    }

    .status-date {
        margin: 0 0 4px 0;
        font-size: 12px;
        color: #94a3b8;
    }

    .status-tasks {
        font-size: 14px;
        color: #6ae8ff;
    }
}

.status-actions {
    display: flex;
    gap: 8px;
}

.btn-edit, .btn-delete {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    border: 1px solid transparent;
    cursor: pointer;
    transition: all 0.2s ease;

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
}

.btn-edit {
    background: rgba(34, 197, 94, 0.1);
    color: #22c55e;
    border-color: rgba(34, 197, 94, 0.2);

    &:hover:not(:disabled) {
        background: rgba(34, 197, 94, 0.2);
        transform: translateY(-1px);
    }
}

.btn-delete {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    border-color: rgba(239, 68, 68, 0.2);

    &:hover:not(:disabled) {
        background: rgba(239, 68, 68, 0.2);
        transform: translateY(-1px);
    }
}

// Modal styles
.modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
}

.status-modal, .delete-modal {
    background: #1e293b;
    border-radius: 16px;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
    max-width: 500px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
}

.modal-head {
    padding: 20px 20px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;

    h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        color: #e9edf8;
    }

    &.danger h2 {
        color: #ef4444;
    }

    .close {
        background: none;
        border: none;
        color: #94a3b8;
        font-size: 20px;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: all 0.2s ease;

        &:hover {
            background: rgba(255, 255, 255, 0.1);
            color: #e9edf8;
        }
    }
}

.status-form {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;

    label {
        font-size: 13px;
        font-weight: 600;
        color: #cfe9ff;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    input {
        padding: 10px 12px;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        background: rgba(255, 255, 255, 0.05);
        color: #e9edf8;
        font-size: 14px;
        transition: all 0.2s ease;

        &:focus {
            outline: none;
            border-color: #00b4ff;
            background: rgba(255, 255, 255, 0.08);
        }

        &::placeholder {
            color: #64748b;
        }
    }
}

.form-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 8px;
}

.btn-cancel, .btn-submit {
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid transparent;
}

.btn-cancel {
    background: rgba(255, 255, 255, 0.05);
    color: #94a3b8;
    border-color: rgba(255, 255, 255, 0.12);

    &:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #e9edf8;
    }
}

.btn-submit {
    background: linear-gradient(135deg, #00b4ff, #0066cc);
    color: white;

    &:hover {
        background: linear-gradient(135deg, #0099e6, #0055b3);
        transform: translateY(-1px);
    }
}

.delete-content {
    padding: 20px;
}

.delete-warning {
    text-align: center;
    margin-bottom: 24px;

    h3 {
        margin: 0 0 12px 0;
        font-size: 18px;
        color: #ef4444;
    }

    p {
        margin: 0 0 16px 0;
        color: #94a3b8;
    }

    .warning-text {
        font-size: 12px;
        color: #ef4444;
        font-weight: 500;
    }
}

.status-preview {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.2);
    border-radius: 8px;
    padding: 12px;
    margin: 16px 0;

    .status-name {
        font-weight: 600;
        color: #e9edf8;
    }
}

.delete-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
}

.btn-delete {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid transparent;

    &:hover {
        background: linear-gradient(135deg, #dc2626, #b91c1c);
        transform: translateY(-1px);
    }
}
</style>