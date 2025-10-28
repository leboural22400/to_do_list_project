<script setup lang="js">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import AuthService from '@/services/authService.js';

const router = useRouter();
const toast = useToast();

const isAuthenticated = computed(() => AuthService.isAuthenticated.value);
const user = computed(() => AuthService.user.value);

const logout = async () => {
    try {
        await AuthService.logout();
        toast.success('Successfully signed out!');
        router.push('/account');
    } catch (error) {
        toast.error('Error signing out. Please try again.');
        console.error('Logout error:', error);
    }
};
</script>

<template>
    <div class="auth-header">
        <div class="auth-indicator" v-if="isAuthenticated">
            <div class="user-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="user-info">
                <span class="user-name">{{ user.firstName }} {{ user.lastName }}</span>
                <span class="user-email">{{ user.email }}</span>
            </div>
            <div class="auth-actions">
                <router-link to="/profile" class="profile-btn" title="View Profile">
                    <i class="fas fa-cog"></i>
                </router-link>
                <button @click="logout" class="logout-btn" title="Sign Out">
                    <i class="fas fa-sign-out-alt"></i>
                </button>
            </div>
        </div>
        
        <div class="guest-indicator" v-else>
            <router-link to="/account" class="login-btn">
                <i class="fas fa-sign-in-alt"></i>
                Sign In
            </router-link>
        </div>
    </div>
</template>

<style scoped lang="scss">
.auth-header {
    display: flex;
    align-items: center;
    padding: 12px 20px;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(10px);
}

.auth-indicator {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
}

.user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #00b4ff, #0066cc);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 16px;
    flex-shrink: 0;
}

.user-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;

    .user-name {
        font-size: 14px;
        font-weight: 600;
        color: #e1f0ff;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .user-email {
        font-size: 12px;
        color: #a8b3d4;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
}

.auth-actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
}

.profile-btn, .logout-btn {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    background: rgba(255, 255, 255, 0.05);
    color: #a8b3d4;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    font-size: 14px;

    &:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #e1f0ff;
        transform: translateY(-1px);
    }
}

.logout-btn:hover {
    background: rgba(255, 86, 86, 0.15);
    border-color: rgba(255, 86, 86, 0.3);
    color: #ff9999;
}

.guest-indicator {
    width: 100%;
    display: flex;
    justify-content: center;
}

.login-btn {
    padding: 8px 16px;
    border-radius: 8px;
    background: linear-gradient(135deg, rgba(0, 180, 255, 0.2), rgba(0, 140, 255, 0.15));
    border: 1px solid rgba(0, 180, 255, 0.3);
    color: #00b4ff;
    text-decoration: none;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 8px;

    &:hover {
        background: linear-gradient(135deg, rgba(0, 180, 255, 0.3), rgba(0, 140, 255, 0.2));
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 180, 255, 0.2);
    }
}

// Responsive design
@media (max-width: 480px) {
    .auth-header {
        padding: 8px 12px;
    }

    .user-info .user-name {
        font-size: 13px;
    }

    .user-info .user-email {
        font-size: 11px;
    }

    .auth-actions {
        gap: 6px;
    }

    .profile-btn, .logout-btn {
        width: 28px;
        height: 28px;
        font-size: 12px;
    }
}
</style>