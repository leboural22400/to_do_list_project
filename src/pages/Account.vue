<script setup lang="js">
import { createNewUser } from '@/middleware/userService';
import { getUserByMail } from '@/middleware/userService';
import { compareUserPasswordByID } from '@/middleware/userService';

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

// Initialize user from localStorage
// Methods
const handleLogin = async () => {
    if (!canLogin.value) return;

    try {
      isLoading.value = true;
      await getUserByMail(loginForm.value.email).then(async (resp) => {
        console.log(resp)
          if (resp != null) {
            console.log(resp.passwordUser)
            await compareUserPasswordByID(loginForm.value.password, resp.idUser).then(async (respCompare) => {
              const response = respCompare
              if (response.same) {
                await AuthService.login({
                  idUser: response.idUser
                });
                router.push('/to-do-list');
              }
            })
          }
        })
    } finally {
      isLoading.value = false;
    }

};

const handleRegister = async () => {
    if (canRegister.value) return;

        isLoading.value = true;
        await createNewUser({
          nameUser: registerForm.value.firstName + " " + registerForm.value.lastName,
          emailUser: registerForm.value.email,
          passwordUser: registerForm.value.password,
          nicknameUser: registerForm.value.firstName.slice(0, 2) + "." + registerForm.value.lastName.slice(0, 2),
          dateJoinUser: Date.now()
        }).then(async (resp) => {
          if (resp.idUser) {
            await AuthService.register({
              idUser: resp.idUser
            }).then(router.push('/to-do-list'));
          }
        }).catch((err) => console.log(err)).finally(() => {isLoading.value = false;})

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
          :basicpadd="true"
          :paddx="true"
        >
          <template #body
            ><i class="fas fa-sign-in-alt !mr-2"></i> Sign In</template
          >
        </Button>
        <Button
          @click="switchView('register')"
          :variant="currentView === 'register' ? 'secondary' : 'default'"
          :fill="false"
          :basicpadd="true"
          :paddx="true"
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
            </div>
            <Button
              type="submit"
              :disabled="!canLogin || isLoading"
              :variant="currentView === 'login' ? 'secondary' : 'default'"
              :fill="currentView === 'login'"
              :basicpadd="true"
              :paddx="true"
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
              :basicpadd="true"
              :paddx="true"
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
