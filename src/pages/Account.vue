<script setup lang="js">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import AuthService from '@/services/authService.js';

import Card from '@/components/Card.vue';
import Button from '@/components/Button.vue';
import Input from '@/components/Input.vue';
import Checkbox from '@/components/Checkbox.vue';
import Link from '@/components/Link.vue';

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
    acceptTerms: true
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
  console.log(!canRegister.value)
    if (canRegister.value) return;

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
  <div
    class="!min-h-[700px] bg-(--page-bg) py-10 px-10 flex flex-col items-center justify-center"
  >
    <Card :header="true" class="w-md">
      <template #header>
        <Button
          @click="switchView('login')"
          :variant="currentView === 'login' ? 'secondary' : 'default'"
          :fill="false"
        >
          <template #body
            ><i class="fas fa-sign-in-alt !mr-2"></i> Sign In</template
          >
        </Button>
        <Button
          @click="switchView('register')"
          :variant="currentView === 'register' ? 'secondary' : 'default'"
          :fill="false"
        >
          <template #body
            ><i class="fas fa-user-plus !mr-2"></i> Sign Up</template
          >
        </Button></template
      >
      <template #main>
        <section v-if="currentView === 'login'">
          <div class="text-center !mb-8">
            <h2 class="!text-2xl !font-bold !text-(--fg) !mb-2">
              Welcome Back
            </h2>
            <p class="text-(--muted)">Sign in to your account to continue</p>
          </div>

          <form @submit.prevent="handleLogin" class="flex flex-col gap-3">
            <Input
              textlabel="Email Address"
              typeinput="email"
              v-model="loginForm.email"
              :disableinput="isLoading"
              placeholder="Enter your email"
            ></Input>
            <Input
              textlabel="Password"
              typeinput="password"
              v-model="loginForm.password"
              :disableinput="isLoading"
              placeholder="Enter your password"
            ></Input>

            <div class="flex justify-between items-center flex-wrap !gap-3">
              <Checkbox
                label="Remember Me"
                v-model="loginForm.rememberMe"
                :disable-input="isLoading"
              />
              <Link href="#" text="Forgot password?" />
            </div>
            <Button
              type="submit"
              :disabled="!canLogin || isLoading"
              :variant="currentView === 'login' ? 'secondary' : 'default'"
              :fill="currentView === 'login'"
            >
              <template #body
                ><span
                  v-if="isLoading"
                  class="w-4 h-4 border-2 border-(--border-strong) !mr-2 rounded-[50%] animate-spin border-t-(--fg)"
                ></span>
                <i v-else class="fas fa-sign-in-alt !mr-2"></i>
                {{ isLoading ? "Signing In..." : "Sign In" }}</template
              >
            </Button>
          </form>
        </section>
        <section v-if="currentView === 'register'">
          <div class="text-center !mb-8">
            <h2 class="!text-2xl !font-bold !text-(--fg) !mb-2">
              Create Account
            </h2>
            <p class="text-(--muted)">
              Join us and start organizing your tasks
            </p>
          </div>

          <form @submit.prevent="handleRegister" class="flex flex-col gap-3">
            <div class="flex gap-3 justify-between">
              <Input
                class="!flex-1 !max-w-46"
                textlabel="Last Name"
                typeinput="text"
                v-model="registerForm.lastName"
                placeholder="Last Name"
                :disableinput="isLoading"
              />
              <Input
                class="!flex-1 !max-w-46"
                textlabel="First Name"
                typeinput="text"
                v-model="registerForm.firstName"
                placeholder="First Name"
                :disableinput="isLoading"
              />
            </div>
            <Input
              textlabel="Email Address"
              typeinput="email"
              v-model="registerForm.email"
              placeholder="Enter your email"
              :disableinput="isLoading"
            />
            <Input
              textlabel="Password"
              typeinput="password"
              v-model="registerForm.password"
              placeholder="Create Password"
              :disableinput="isLoading"
            />
            <Input
              textlabel="Confirm Password"
              typeinput="password"
              v-model="registerForm.confirmPassword"
              placeholder="Confirm Password"
              :disableinput="isLoading"
              :class="{
                error:
                  registerForm.password &&
                  registerForm.confirmPassword &&
                  registerForm.password !== registerForm.confirmPassword,
              }"
            />
            <p
              v-if="
                registerForm.password &&
                registerForm.confirmPassword &&
                registerForm.password !== registerForm.confirmPassword
              "
              class="!text-xs text-(--alert)"
            >
              Passwords do not match
            </p>
            <Button
              type="submit"
              :disabled="!canRegister || isLoading"
              variant="secondary"
              fill="true"
            >
              <template #body
                ><span
                  v-if="isLoading"
                  class="w-4 h-4 border-2 border-(--border-strong) !mr-2 rounded-[50%] animate-spin border-t-(--fg)"
                ></span>
                <i v-else class="fas fa-user-plus !mr-2"></i>
                {{
                  isLoading ? "Creating Account..." : "Create Account"
                }}</template
              >
            </Button>
          </form>
        </section>
      </template>
    </Card>
  </div>
</template>
