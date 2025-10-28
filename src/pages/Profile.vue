<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import AuthService from '@/services/authService.js';
import { taskData } from '@/services/taskDataService.js';

const router = useRouter();
const toast = useToast();

// Reactive state
const user = computed(() => AuthService.user.value);
const editMode = ref(false);
const isUpdating = ref(false);
const isChangingPassword = ref(false);
const isDeletingAccount = ref(false);
const showDeleteModal = ref(false);
const deleteConfirmation = ref('');

// Forms
const profileForm = reactive({
    firstName: '',
    lastName: '',
    email: ''
});

const passwordForm = reactive({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
});

// Task statistics
const taskStats = computed(() => {
    const tasks = taskData.tasks;
    const total = tasks.length;
    const completed = tasks.filter(task => task.done).length;
    const pending = total - completed;
    
    return { total, completed, pending };
});

const completionPercentage = computed(() => {
    if (taskStats.value.total === 0) return 0;
    return Math.round((taskStats.value.completed / taskStats.value.total) * 100);
});

// Methods
const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const initializeForm = () => {
    if (user.value) {
        profileForm.firstName = user.value.firstName;
        profileForm.lastName = user.value.lastName;
        profileForm.email = user.value.email;
    }
};

const toggleEditMode = () => {
    if (editMode.value) {
        // Cancel - reset form
        initializeForm();
    }
    editMode.value = !editMode.value;
};

const updateProfile = async () => {
    if (!validateProfileForm()) return;
    
    isUpdating.value = true;
    try {
        await AuthService.updateProfile(profileForm);
        editMode.value = false;
        toast.success('Profile updated successfully!');
    } catch (error) {
        toast.error(error.message || 'Failed to update profile');
    } finally {
        isUpdating.value = false;
    }
};

const validateProfileForm = () => {
    if (!profileForm.firstName.trim()) {
        toast.error('First name is required');
        return false;
    }
    if (!profileForm.lastName.trim()) {
        toast.error('Last name is required');
        return false;
    }
    if (!profileForm.email.trim()) {
        toast.error('Email is required');
        return false;
    }
    return true;
};

const changePassword = async () => {
    if (!validatePasswordForm()) return;
    
    isChangingPassword.value = true;
    try {
        await AuthService.changePassword(
            passwordForm.currentPassword,
            passwordForm.newPassword
        );
        
        // Clear form
        passwordForm.currentPassword = '';
        passwordForm.newPassword = '';
        passwordForm.confirmPassword = '';
        
        toast.success('Password changed successfully!');
    } catch (error) {
        toast.error(error.message || 'Failed to change password');
    } finally {
        isChangingPassword.value = false;
    }
};

const validatePasswordForm = () => {
    if (!passwordForm.currentPassword) {
        toast.error('Current password is required');
        return false;
    }
    if (passwordForm.newPassword.length < 6) {
        toast.error('New password must be at least 6 characters');
        return false;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        toast.error('Passwords do not match');
        return false;
    }
    return true;
};

const signOutAllDevices = async () => {
    try {
        await AuthService.signOutAllDevices();
        toast.success('Signed out of all devices successfully!');
        router.push('/account');
    } catch (error) {
        toast.error(error.message || 'Failed to sign out all devices');
    }
};

const confirmDeleteAccount = () => {
    showDeleteModal.value = true;
    deleteConfirmation.value = '';
};

const deleteAccount = async () => {
    if (deleteConfirmation.value !== 'DELETE') return;
    
    isDeletingAccount.value = true;
    try {
        await AuthService.deleteAccount();
        toast.success('Account deleted successfully');
        router.push('/account');
    } catch (error) {
        toast.error(error.message || 'Failed to delete account');
    } finally {
        isDeletingAccount.value = false;
        showDeleteModal.value = false;
    }
};

// Lifecycle
onMounted(() => {
    initializeForm();
});
</script>

<template>
    <div class="profile-page">
        <div class="profile-container">
            <div class="profile-header">
                <div class="profile-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="profile-info">
                    <h1 class="profile-name">{{ user.firstName }} {{ user.lastName }}</h1>
                    <p class="profile-email">{{ user.email }}</p>
                    <span class="profile-joined">Member since {{ formatDate(user.createdAt) }}</span>
                </div>
            </div>

            <div class="profile-stats">
                <div class="stat-card">
                    <div class="stat-value">{{ taskStats.total }}</div>
                    <div class="stat-label">Total Tasks</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">{{ taskStats.completed }}</div>
                    <div class="stat-label">Completed</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">{{ taskStats.pending }}</div>
                    <div class="stat-label">Pending</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">{{ completionPercentage }}%</div>
                    <div class="stat-label">Completion Rate</div>
                </div>
            </div>

            <div class="profile-sections">
                <!-- Account Settings Section -->
                <div class="section-card">
                    <div class="section-header">
                        <h2>
                            <i class="fas fa-cog"></i>
                            Account Settings
                        </h2>
                    </div>
                    <div class="section-content">
                        <form @submit.prevent="updateProfile" class="profile-form">
                            <div class="form-group">
                                <label for="firstName">First Name</label>
                                <input 
                                    type="text" 
                                    id="firstName" 
                                    v-model="profileForm.firstName"
                                    :disabled="!editMode"
                                    required
                                />
                            </div>
                            <div class="form-group">
                                <label for="lastName">Last Name</label>
                                <input 
                                    type="text" 
                                    id="lastName" 
                                    v-model="profileForm.lastName"
                                    :disabled="!editMode"
                                    required
                                />
                            </div>
                            <div class="form-group">
                                <label for="email">Email</label>
                                <input 
                                    type="email" 
                                    id="email" 
                                    v-model="profileForm.email"
                                    :disabled="!editMode"
                                    required
                                />
                            </div>
                            
                            <div class="form-actions">
                                <button 
                                    type="button" 
                                    @click="toggleEditMode" 
                                    class="btn btn-secondary"
                                    :class="{ 'btn-cancel': editMode }"
                                >
                                    {{ editMode ? 'Cancel' : 'Edit Profile' }}
                                </button>
                                <button 
                                    type="submit" 
                                    v-if="editMode" 
                                    class="btn btn-primary"
                                    :disabled="isUpdating"
                                >
                                    {{ isUpdating ? 'Updating...' : 'Save Changes' }}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Security Section -->
                <div class="section-card">
                    <div class="section-header">
                        <h2>
                            <i class="fas fa-shield-alt"></i>
                            Security
                        </h2>
                    </div>
                    <div class="section-content">
                        <form @submit.prevent="changePassword" class="password-form">
                            <div class="form-group">
                                <label for="currentPassword">Current Password</label>
                                <input 
                                    type="password" 
                                    id="currentPassword" 
                                    v-model="passwordForm.currentPassword"
                                    required
                                />
                            </div>
                            <div class="form-group">
                                <label for="newPassword">New Password</label>
                                <input 
                                    type="password" 
                                    id="newPassword" 
                                    v-model="passwordForm.newPassword"
                                    required
                                    minlength="6"
                                />
                            </div>
                            <div class="form-group">
                                <label for="confirmPassword">Confirm New Password</label>
                                <input 
                                    type="password" 
                                    id="confirmPassword" 
                                    v-model="passwordForm.confirmPassword"
                                    required
                                    minlength="6"
                                />
                            </div>
                            
                            <div class="form-actions">
                                <button 
                                    type="submit" 
                                    class="btn btn-primary"
                                    :disabled="isChangingPassword"
                                >
                                    {{ isChangingPassword ? 'Changing...' : 'Change Password' }}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Danger Zone -->
                <div class="section-card danger-zone">
                    <div class="section-header">
                        <h2>
                            <i class="fas fa-exclamation-triangle"></i>
                            Danger Zone
                        </h2>
                    </div>
                    <div class="section-content">
                        <div class="danger-actions">
                            <div class="danger-item">
                                <div class="danger-info">
                                    <h3>Sign Out All Devices</h3>
                                    <p>Sign out of all devices and invalidate all active sessions.</p>
                                </div>
                                <button @click="signOutAllDevices" class="btn btn-danger-outline">
                                    Sign Out All
                                </button>
                            </div>
                            <div class="danger-item">
                                <div class="danger-info">
                                    <h3>Delete Account</h3>
                                    <p>Permanently delete your account and all associated data. This action cannot be undone.</p>
                                </div>
                                <button @click="confirmDeleteAccount" class="btn btn-danger">
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Delete Account Confirmation Modal -->
        <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
            <div class="modal-content danger-modal" @click.stop>
                <div class="modal-header">
                    <h3>
                        <i class="fas fa-exclamation-triangle"></i>
                        Delete Account
                    </h3>
                </div>
                <div class="modal-body">
                    <p>Are you absolutely sure you want to delete your account?</p>
                    <p>This will permanently delete:</p>
                    <ul>
                        <li>Your profile information</li>
                        <li>All your tasks and data</li>
                        <li>Your account settings</li>
                    </ul>
                    <p><strong>This action cannot be undone.</strong></p>
                    
                    <div class="confirmation-input">
                        <label for="deleteConfirmation">
                            Type "DELETE" to confirm:
                        </label>
                        <input 
                            type="text" 
                            id="deleteConfirmation"
                            v-model="deleteConfirmation"
                            placeholder="DELETE"
                        />
                    </div>
                </div>
                <div class="modal-actions">
                    <button @click="showDeleteModal = false" class="btn btn-secondary">
                        Cancel
                    </button>
                    <button 
                        @click="deleteAccount" 
                        class="btn btn-danger"
                        :disabled="deleteConfirmation !== 'DELETE' || isDeletingAccount"
                    >
                        {{ isDeletingAccount ? 'Deleting...' : 'Delete Account' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.profile-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #0f0f23 0%, #1a1a3a 100%);
    padding: 2rem 1rem;
}

.profile-container {
    max-width: 1000px;
    margin: 0 auto;
}

.profile-header {
    display: flex;
    align-items: center;
    gap: 2rem;
    margin-bottom: 3rem;
    padding: 2rem;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(10px);
}

.profile-avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: linear-gradient(135deg, #00b4ff, #0066cc);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 2rem;
    flex-shrink: 0;
}

.profile-info {
    flex: 1;
    
    .profile-name {
        font-size: 2rem;
        font-weight: 700;
        color: #e1f0ff;
        margin: 0 0 0.5rem 0;
    }
    
    .profile-email {
        font-size: 1.1rem;
        color: #a8b3d4;
        margin: 0 0 0.5rem 0;
    }
    
    .profile-joined {
        font-size: 0.9rem;
        color: #6b7280;
    }
}

.profile-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin-bottom: 3rem;
}

.stat-card {
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    text-align: center;
    backdrop-filter: blur(10px);
    
    .stat-value {
        font-size: 2.5rem;
        font-weight: 700;
        color: #00b4ff;
        margin-bottom: 0.5rem;
    }
    
    .stat-label {
        font-size: 0.9rem;
        color: #a8b3d4;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
}

.profile-sections {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.section-card {
    background: rgba(255, 255, 255, 0.02);
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(10px);
    overflow: hidden;
    
    &.danger-zone {
        border-color: rgba(239, 68, 68, 0.3);
        background: rgba(239, 68, 68, 0.05);
    }
}

.section-header {
    padding: 1.5rem 2rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    
    h2 {
        font-size: 1.3rem;
        font-weight: 600;
        color: #e1f0ff;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        
        i {
            color: #00b4ff;
        }
    }
    
    .danger-zone & h2 i {
        color: #ef4444;
    }
}

.section-content {
    padding: 2rem;
}

.profile-form, .password-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    
    label {
        font-size: 0.9rem;
        font-weight: 600;
        color: #a8b3d4;
    }
    
    input {
        padding: 0.75rem 1rem;
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.05);
        color: #e1f0ff;
        font-size: 1rem;
        transition: all 0.3s ease;
        
        &:focus {
            outline: none;
            border-color: #00b4ff;
            background: rgba(255, 255, 255, 0.08);
        }
        
        &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
    }
}

.form-actions {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
}

.btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    
    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
    
    &.btn-primary {
        background: linear-gradient(135deg, #00b4ff, #0066cc);
        color: white;
        
        &:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 180, 255, 0.3);
        }
    }
    
    &.btn-secondary {
        background: rgba(255, 255, 255, 0.1);
        color: #a8b3d4;
        border: 1px solid rgba(255, 255, 255, 0.15);
        
        &:hover:not(:disabled) {
            background: rgba(255, 255, 255, 0.15);
            color: #e1f0ff;
        }
        
        &.btn-cancel {
            background: rgba(239, 68, 68, 0.1);
            color: #ef4444;
            border-color: rgba(239, 68, 68, 0.3);
            
            &:hover:not(:disabled) {
                background: rgba(239, 68, 68, 0.2);
            }
        }
    }
    
    &.btn-danger {
        background: linear-gradient(135deg, #ef4444, #dc2626);
        color: white;
        
        &:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }
    }
    
    &.btn-danger-outline {
        background: transparent;
        color: #ef4444;
        border: 1px solid rgba(239, 68, 68, 0.5);
        
        &:hover:not(:disabled) {
            background: rgba(239, 68, 68, 0.1);
        }
    }
}

.danger-actions {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.danger-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border: 1px solid rgba(239, 68, 68, 0.2);
    border-radius: 8px;
    background: rgba(239, 68, 68, 0.05);
    
    .danger-info {
        flex: 1;
        
        h3 {
            font-size: 1.1rem;
            font-weight: 600;
            color: #ef4444;
            margin: 0 0 0.5rem 0;
        }
        
        p {
            color: #a8b3d4;
            margin: 0;
            font-size: 0.9rem;
        }
    }
}

.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
}

.modal-content {
    background: #1a1a3a;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    max-width: 500px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    
    &.danger-modal {
        border-color: rgba(239, 68, 68, 0.3);
    }
}

.modal-header {
    padding: 1.5rem 2rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    
    h3 {
        margin: 0;
        color: #ef4444;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
}

.modal-body {
    padding: 2rem;
    
    p {
        color: #a8b3d4;
        margin: 0 0 1rem 0;
    }
    
    ul {
        color: #a8b3d4;
        margin: 1rem 0;
        padding-left: 1.5rem;
    }
    
    strong {
        color: #ef4444;
    }
}

.confirmation-input {
    margin-top: 2rem;
    
    label {
        display: block;
        color: #a8b3d4;
        margin-bottom: 0.5rem;
        font-weight: 600;
    }
    
    input {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid rgba(239, 68, 68, 0.5);
        border-radius: 8px;
        background: rgba(239, 68, 68, 0.1);
        color: #e1f0ff;
        font-size: 1rem;
        
        &:focus {
            outline: none;
            border-color: #ef4444;
        }
    }
}

.modal-actions {
    padding: 1.5rem 2rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
}

// Responsive design
@media (max-width: 768px) {
    .profile-page {
        padding: 1rem;
    }
    
    .profile-header {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
    }
    
    .profile-stats {
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
    }
    
    .section-content {
        padding: 1.5rem;
    }
    
    .danger-item {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
    }
    
    .form-actions {
        flex-direction: column;
    }
    
    .modal-actions {
        flex-direction: column;
    }
}

@media (max-width: 480px) {
    .profile-stats {
        grid-template-columns: 1fr;
    }
    
    .stat-card .stat-value {
        font-size: 2rem;
    }
}
</style>