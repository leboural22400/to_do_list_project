<script setup lang="js">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import AuthService from '@/services/authService.js';

const toast = useToast();
const router = useRouter();

// Reactive data
const currentView = ref('login'); // 'login', 'register', 'profile'
const isLoading = ref(false);
const user = ref(null);

// Auth state
const authState = computed(() => ({
    isAuthenticated: AuthService.isAuthenticated.value,
    user: AuthService.user.value,
    isLoading: AuthService.isLoading.value
}));

// Form data
const loginForm = ref({
    email: '',
    password: '',
    rememberMe: false
});

const registerForm = ref({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
});

const profileForm = ref({
    firstName: '',
    lastName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
});


const isAuthenticated = computed(() => !!user.value);

const canLogin = computed(() => {
    return loginForm.value.email && loginForm.value.password;
});

const canRegister = computed(() => {
    const form = registerForm.value;
    return form.firstName && form.lastName && form.email && 
           form.password && form.confirmPassword && 
           form.password === form.confirmPassword && 
           form.acceptTerms;
});


const switchView = (view) => {
    currentView.value = view;
    clearForms();
};

const clearForms = () => {
    loginForm.value = { email: '', password: '', rememberMe: false };
    registerForm.value = { 
        firstName: '', lastName: '', email: '', 
        password: '', confirmPassword: '', acceptTerms: false 
    };
};

// Authentication methods (ready for the back-end)
const login = async () => {
    if (!canLogin.value) return;
    
    isLoading.value = true;
    try {
        // For the back-end: Replace with actual API call
        await mockApiCall();
        
        // Mock successful login
        user.value = {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: loginForm.value.email,
            avatar: null,
            createdAt: new Date().toISOString()
        };
        
        // Store in localStorage
        localStorage.setItem('user', JSON.stringify(user.value));
        localStorage.setItem('isAuthenticated', 'true');
        
        currentView.value = 'profile';
        toast.success('Login successful! Welcome back!');
        
    } catch (error) {
        toast.error('Login failed. Please check your credentials.');
        console.error('Login error:', error);
    } finally {
        isLoading.value = false;
    }
};

const register = async () => {
    if (!canRegister.value) return;
    
    isLoading.value = true;
    try {
        // For the back-end: Replace with actual API call
        await mockApiCall();
        
        // Mock successful registration
        user.value = {
            id: Date.now(),
            firstName: registerForm.value.firstName,
            lastName: registerForm.value.lastName,
            email: registerForm.value.email,
            avatar: null,
            createdAt: new Date().toISOString()
        };
        
        // Store in localStorage
        localStorage.setItem('user', JSON.stringify(user.value));
        localStorage.setItem('isAuthenticated', 'true');
        
        currentView.value = 'profile';
        toast.success('Registration successful! Welcome to TaskMaster!');
        
    } catch (error) {
        toast.error('Registration failed. Please try again.');
        console.error('Registration error:', error);
    } finally {
        isLoading.value = false;
    }
};

const logout = () => {
    user.value = null;
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    currentView.value = 'login';
    clearForms();
    toast.info('You have been logged out.');
};

const updateProfile = async () => {
    isLoading.value = true;
    try {
        // For the back-end: Replace with actual API call
        await mockApiCall();
        
        // Update user data
        if (user.value) {
            user.value.firstName = profileForm.value.firstName;
            user.value.lastName = profileForm.value.lastName;
            user.value.email = profileForm.value.email;
            localStorage.setItem('user', JSON.stringify(user.value));
        }
        
        toast.success('Profile updated successfully!');
        
    } catch (error) {
        toast.error('Failed to update profile. Please try again.');
        console.error('Profile update error:', error);
    } finally {
        isLoading.value = false;
    }
};

// Mock API call (has to be replaced with the back-end)
const mockApiCall = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (Math.random() > 0.1) {
                resolve({ success: true });
            } else {
                reject(new Error('Network error'));
            }
        }, 1500);
    });
};

// Initialize user from localStorage
// Methods
const handleLogin = async () => {
    if (!canLogin.value) return;
    
    try {
        isLoading.value = true;
        console.log('Account.vue: Calling AuthService.login...');
        
        await AuthService.login({
            email: loginForm.value.email,
            password: loginForm.value.password
        });
        
        toast.success('Successfully signed in!');
        router.push('/to-do-list');
        
    } catch (error) {
        console.error('Login error in Account.vue:', error);
        toast.error(error.message || 'Login failed');
    } finally {
        isLoading.value = false;
    }
};

const handleRegister = async () => {
    if (!canRegister.value) return;
    
    try {
        isLoading.value = true;
        console.log('Account.vue: Calling AuthService.register...');
        
        await AuthService.register({
            firstName: registerForm.value.firstName,
            lastName: registerForm.value.lastName,
            email: registerForm.value.email,
            password: registerForm.value.password
        });
        
        toast.success('Account created successfully!');
        router.push('/to-do-list');
        
    } catch (error) {
        console.error('Register error in Account.vue:', error);
        toast.error(error.message || 'Registration failed');
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    // Check if user is already authenticated
    if (authState.value.isAuthenticated) {
        router.push('/to-do-list');
    }
});
</script>

<template>
    <div class="account-container">
        <!-- Header -->
        <div class="account-header">
            <h1 class="page-title">
                <i class="fas fa-user-circle"></i>
                {{ isAuthenticated ? 'My Account' : 'Welcome' }}
            </h1>
            <p class="page-subtitle">
                {{ isAuthenticated ? 'Manage your profile and preferences' : 'Sign in to access your tasks' }}
            </p>
        </div>

        <!-- Authentication Forms -->
        <div v-if="!isAuthenticated" class="auth-container">
            <!-- Tab Navigation -->
            <div class="auth-tabs">
                <button 
                    :class="['tab-btn', { active: currentView === 'login' }]"
                    @click="switchView('login')"
                >
                    <i class="fas fa-sign-in-alt"></i>
                    Sign In
                </button>
                <button 
                    :class="['tab-btn', { active: currentView === 'register' }]"
                    @click="switchView('register')"
                >
                    <i class="fas fa-user-plus"></i>
                    Sign Up
                </button>
            </div>

            <!-- Login Form -->
            <div v-if="currentView === 'login'" class="auth-form">
                <div class="form-header">
                    <h2>Welcome Back</h2>
                    <p>Sign in to your account to continue</p>
                </div>

                <form @submit.prevent="handleLogin" class="form">
                    <div class="form-group">
                        <label for="loginEmail">Email Address</label>
                        <div class="input-wrapper">
                            <i class="fas fa-envelope input-icon"></i>
                            <input 
                                id="loginEmail"
                                type="email" 
                                v-model="loginForm.email"
                                placeholder="Enter your email"
                                required
                                :disabled="isLoading"
                            >
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="loginPassword">Password</label>
                        <div class="input-wrapper">
                            <i class="fas fa-lock input-icon"></i>
                            <input 
                                id="loginPassword"
                                type="password" 
                                v-model="loginForm.password"
                                placeholder="Enter your password"
                                required
                                :disabled="isLoading"
                            >
                        </div>
                    </div>

                    <div class="form-options">
                        <label class="checkbox-label">
                            <input 
                                type="checkbox" 
                                v-model="loginForm.rememberMe"
                                :disabled="isLoading"
                            >
                            <span class="checkmark"></span>
                            Remember me
                        </label>
                        <a href="#" class="forgot-link">Forgot password?</a>
                    </div>

                    <button 
                        type="submit" 
                        class="btn-primary"
                        :disabled="!canLogin || isLoading"
                    >
                        <span v-if="isLoading" class="loading-spinner"></span>
                        <i v-else class="fas fa-sign-in-alt"></i>
                        {{ isLoading ? 'Signing In...' : 'Sign In' }}
                    </button>
                </form>
            </div>

            <!-- Register Form -->
            <div v-if="currentView === 'register'" class="auth-form">
                <div class="form-header">
                    <h2>Create Account</h2>
                    <p>Join us and start organizing your tasks</p>
                </div>

                <form @submit.prevent="handleRegister" class="form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="firstName">First Name</label>
                            <div class="input-wrapper">
                                <i class="fas fa-user input-icon"></i>
                                <input 
                                    id="firstName"
                                    type="text" 
                                    v-model="registerForm.firstName"
                                    placeholder="First name"
                                    required
                                    :disabled="isLoading"
                                >
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="lastName">Last Name</label>
                            <div class="input-wrapper">
                                <i class="fas fa-user input-icon"></i>
                                <input 
                                    id="lastName"
                                    type="text" 
                                    v-model="registerForm.lastName"
                                    placeholder="Last name"
                                    required
                                    :disabled="isLoading"
                                >
                            </div>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="registerEmail">Email Address</label>
                        <div class="input-wrapper">
                            <i class="fas fa-envelope input-icon"></i>
                            <input 
                                id="registerEmail"
                                type="email" 
                                v-model="registerForm.email"
                                placeholder="Enter your email"
                                required
                                :disabled="isLoading"
                            >
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="registerPassword">Password</label>
                            <div class="input-wrapper">
                                <i class="fas fa-lock input-icon"></i>
                                <input 
                                    id="registerPassword"
                                    type="password" 
                                    v-model="registerForm.password"
                                    placeholder="Create password"
                                    required
                                    :disabled="isLoading"
                                >
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="confirmPassword">Confirm Password</label>
                            <div class="input-wrapper">
                                <i class="fas fa-lock input-icon"></i>
                                <input 
                                    id="confirmPassword"
                                    type="password" 
                                    v-model="registerForm.confirmPassword"
                                    placeholder="Confirm password"
                                    required
                                    :disabled="isLoading"
                                    :class="{ 'error': registerForm.password && registerForm.confirmPassword && registerForm.password !== registerForm.confirmPassword }"
                                >
                            </div>
                            <div v-if="registerForm.password && registerForm.confirmPassword && registerForm.password !== registerForm.confirmPassword" class="error-message">
                                Passwords do not match
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        class="btn-primary"
                        :disabled="!canRegister || isLoading"
                    >
                        <span v-if="isLoading" class="loading-spinner"></span>
                        <i v-else class="fas fa-user-plus"></i>
                        {{ isLoading ? 'Creating Account...' : 'Create Account' }}
                    </button>
                </form>
            </div>
        </div>

        <!-- Profile Section -->
        <div v-if="isAuthenticated" class="profile-container">
            <div class="profile-header">
                <div class="avatar-section">
                    <div class="avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="user-info">
                        <h2>{{ user.firstName }} {{ user.lastName }}</h2>
                        <p>{{ user.email }}</p>
                        <span class="member-since">Member since {{ new Date(user.createdAt).toLocaleDateString() }}</span>
                    </div>
                </div>
                <button class="btn-logout" @click="logout">
                    <i class="fas fa-sign-out-alt"></i>
                    Sign Out
                </button>
            </div>

            <div class="profile-content">
                <div class="profile-section">
                    <h3>
                        <i class="fas fa-user-edit"></i>
                        Profile Information
                    </h3>
                    
                    <form @submit.prevent="updateProfile" class="form">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="profileFirstName">First Name</label>
                                <div class="input-wrapper">
                                    <i class="fas fa-user input-icon"></i>
                                    <input 
                                        id="profileFirstName"
                                        type="text" 
                                        v-model="profileForm.firstName"
                                        placeholder="First name"
                                        required
                                        :disabled="isLoading"
                                    >
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="profileLastName">Last Name</label>
                                <div class="input-wrapper">
                                    <i class="fas fa-user input-icon"></i>
                                    <input 
                                        id="profileLastName"
                                        type="text" 
                                        v-model="profileForm.lastName"
                                        placeholder="Last name"
                                        required
                                        :disabled="isLoading"
                                    >
                                </div>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="profileEmail">Email Address</label>
                            <div class="input-wrapper">
                                <i class="fas fa-envelope input-icon"></i>
                                <input 
                                    id="profileEmail"
                                    type="email" 
                                    v-model="profileForm.email"
                                    placeholder="Email address"
                                    required
                                    :disabled="isLoading"
                                >
                            </div>
                        </div>

                        <div class="form-actions">
                            <button 
                                type="submit" 
                                class="btn-primary"
                                :disabled="isLoading"
                            >
                                <span v-if="isLoading" class="loading-spinner"></span>
                                <i v-else class="fas fa-save"></i>
                                {{ isLoading ? 'Updating...' : 'Update Profile' }}
                            </button>
                        </div>
                    </form>
                </div>

                <div class="profile-section">
                    <h3>
                        <i class="fas fa-key"></i>
                        Change Password
                    </h3>
                    
                    <form class="form">
                        <div class="form-group">
                            <label for="currentPassword">Current Password</label>
                            <div class="input-wrapper">
                                <i class="fas fa-lock input-icon"></i>
                                <input 
                                    id="currentPassword"
                                    type="password" 
                                    v-model="profileForm.currentPassword"
                                    placeholder="Enter current password"
                                    :disabled="isLoading"
                                >
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="newPassword">New Password</label>
                                <div class="input-wrapper">
                                    <i class="fas fa-lock input-icon"></i>
                                    <input 
                                        id="newPassword"
                                        type="password" 
                                        v-model="profileForm.newPassword"
                                        placeholder="Enter new password"
                                        :disabled="isLoading"
                                    >
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="confirmNewPassword">Confirm New Password</label>
                                <div class="input-wrapper">
                                    <i class="fas fa-lock input-icon"></i>
                                    <input 
                                        id="confirmNewPassword"
                                        type="password" 
                                        v-model="profileForm.confirmNewPassword"
                                        placeholder="Confirm new password"
                                        :disabled="isLoading"
                                    >
                                </div>
                            </div>
                        </div>

                        <div class="form-actions">
                            <button 
                                type="button" 
                                class="btn-secondary"
                                :disabled="isLoading"
                            >
                                <i class="fas fa-key"></i>
                                Update Password
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.account-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #0a0f1c 0%, #14192b 50%, #1a2035 100%);
    padding: 40px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.account-header {
    text-align: center;
    margin-bottom: 40px;
    max-width: 600px;

    .page-title {
        font-size: 32px;
        font-weight: 700;
        color: #e1f0ff;
        margin: 0 0 12px 0;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;

        i {
            color: #00b4ff;
        }
    }

    .page-subtitle {
        font-size: 16px;
        color: #a8b3d4;
        margin: 0;
    }
}

// Authentication Styles
.auth-container {
    width: 100%;
    max-width: 480px;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
    overflow: hidden;
}

.auth-tabs {
    display: flex;
    background: rgba(255, 255, 255, 0.03);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);

    .tab-btn {
        flex: 1;
        padding: 16px 20px;
        background: transparent;
        border: none;
        color: #a8b3d4;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        position: relative;

        &:hover {
            background: rgba(0, 180, 255, 0.08);
            color: #00b4ff;
        }

        &.active {
            background: rgba(0, 180, 255, 0.15);
            color: #00b4ff;

            &::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                height: 2px;
                background: #00b4ff;
            }
        }
    }
}

.auth-form {
    padding: 32px;
}

.form-header {
    text-align: center;
    margin-bottom: 32px;

    h2 {
        font-size: 24px;
        font-weight: 700;
        color: #e1f0ff;
        margin: 0 0 8px 0;
    }

    p {
        color: #a8b3d4;
        margin: 0;
    }
}

.form {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;

    @media (max-width: 640px) {
        grid-template-columns: 1fr;
    }
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;

    label {
        font-size: 14px;
        font-weight: 600;
        color: #b8d4ff;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
}

.input-wrapper {
    position: relative;

    .input-icon {
        position: absolute;
        left: 16px;
        top: 50%;
        transform: translateY(-50%);
        color: #6a7488;
        font-size: 14px;
        z-index: 2;
    }

    input {
        width: 100%;
        padding: 14px 16px 14px 46px;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.15);
        background: rgba(255, 255, 255, 0.05);
        color: #e1f0ff;
        font-size: 15px;
        transition: all 0.3s ease;
        box-sizing: border-box;

        &::placeholder {
            color: #6a7488;
        }

        &:focus {
            outline: none;
            border-color: rgba(0, 180, 255, 0.5);
            box-shadow: 0 0 0 3px rgba(0, 180, 255, 0.15);
            background: rgba(255, 255, 255, 0.08);
        }

        &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        &.error {
            border-color: rgba(255, 86, 86, 0.5);
            box-shadow: 0 0 0 3px rgba(255, 86, 86, 0.15);
        }
    }
}

.error-message {
    font-size: 12px;
    color: #ff5656;
    margin-top: 4px;
}

.form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #a8b3d4;
    font-size: 14px;
    cursor: pointer;

    input[type="checkbox"] {
        display: none;
    }

    .checkmark {
        width: 18px;
        height: 18px;
        border: 2px solid rgba(255, 255, 255, 0.2);
        border-radius: 4px;
        position: relative;
        transition: all 0.3s ease;

        &::after {
            content: '';
            position: absolute;
            left: 5px;
            top: 2px;
            width: 4px;
            height: 8px;
            border: solid #00b4ff;
            border-width: 0 2px 2px 0;
            transform: rotate(45deg);
            opacity: 0;
            transition: opacity 0.3s ease;
        }
    }

    input:checked + .checkmark {
        background: rgba(0, 180, 255, 0.2);
        border-color: #00b4ff;

        &::after {
            opacity: 1;
        }
    }
}

.forgot-link, .terms-link {
    color: #00b4ff;
    text-decoration: none;
    font-size: 14px;
    transition: color 0.3s ease;

    &:hover {
        color: #66d9ff;
        text-decoration: underline;
    }
}

.btn-primary, .btn-secondary {
    padding: 14px 24px;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
        transition: left 0.6s ease;
    }

    &:hover::before {
        left: 100%;
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none !important;
    }
}

.btn-primary {
    background: linear-gradient(135deg, #00b4ff, #0066cc);
    color: white;
    box-shadow: 0 4px 15px rgba(0, 180, 255, 0.3);

    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 180, 255, 0.4);
    }
}

.btn-secondary {
    background: rgba(255, 255, 255, 0.08);
    color: #e1f0ff;
    border: 1px solid rgba(255, 255, 255, 0.2);

    &:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.12);
        transform: translateY(-2px);
    }
}

.loading-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

// Profile Styles
.profile-container {
    width: 100%;
    max-width: 800px;
}

.profile-header {
    background: rgba(255, 255, 255, 0.02);
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    padding: 32px;
    margin-bottom: 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 24px;
}

.avatar-section {
    display: flex;
    align-items: center;
    gap: 20px;
}

.avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: linear-gradient(135deg, #00b4ff, #0066cc);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    color: white;
    box-shadow: 0 8px 25px rgba(0, 180, 255, 0.3);
}

.user-info {
    h2 {
        font-size: 24px;
        font-weight: 700;
        color: #e1f0ff;
        margin: 0 0 4px 0;
    }

    p {
        font-size: 16px;
        color: #00b4ff;
        margin: 0 0 4px 0;
    }

    .member-since {
        font-size: 14px;
        color: #a8b3d4;
    }
}

.btn-logout {
    padding: 12px 20px;
    border-radius: 10px;
    background: rgba(255, 86, 86, 0.1);
    border: 1px solid rgba(255, 86, 86, 0.3);
    color: #ff9999;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 8px;

    &:hover {
        background: rgba(255, 86, 86, 0.2);
        transform: translateY(-2px);
    }
}

.profile-content {
    display: flex;
    flex-direction: column;
    gap: 32px;
}

.profile-section {
    background: rgba(255, 255, 255, 0.02);
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    padding: 32px;

    h3 {
        font-size: 20px;
        font-weight: 700;
        color: #e1f0ff;
        margin: 0 0 24px 0;
        display: flex;
        align-items: center;
        gap: 12px;

        i {
            color: #00b4ff;
        }
    }
}

.form-actions {
    display: flex;
    gap: 16px;
    padding-top: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

// Responsive Design
@media (max-width: 768px) {
    .account-container {
        padding: 20px 16px;
    }

    .account-header .page-title {
        font-size: 28px;
    }

    .auth-form {
        padding: 24px;
    }

    .profile-header {
        padding: 24px;
        flex-direction: column;
        text-align: center;
    }

    .profile-section {
        padding: 24px;
    }

    .form-actions {
        flex-direction: column;
    }
}

@media (max-width: 480px) {
    .auth-tabs .tab-btn {
        padding: 14px 16px;
        font-size: 14px;
    }

    .form-header h2 {
        font-size: 20px;
    }

    input {
        padding: 12px 14px 12px 42px !important;
    }
}
</style>