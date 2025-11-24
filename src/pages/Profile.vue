<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import AuthService from "@/services/authService.js";
import { taskData } from "@/services/taskDataService.js";

import Button from "@/components/Button.vue";
import Card from "@/components/Card.vue";
import Input from "@/components/Input.vue";

const router = useRouter();
const toast = useToast();

// Reactive state
const user = computed(() => AuthService.user.value);
const editMode = ref(false);
const isUpdating = ref(false);
const isChangingPassword = ref(false);
const isDeletingAccount = ref(false);
const showDeleteModal = ref(false);
const deleteConfirmation = ref("");

// Forms
const profileForm = reactive({
  firstName: "",
  lastName: "",
  email: "",
});

const passwordForm = reactive({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

// Task statistics
const taskStats = computed(() => {
  const tasks = taskData.tasks;
  const total = tasks.length;
  const completed = tasks.filter((task) => task.done).length;
  const pending = total - completed;

  return { total, completed, pending };
});

const completionPercentage = computed(() => {
  if (taskStats.value.total === 0) return 0;
  return Math.round((taskStats.value.completed / taskStats.value.total) * 100);
});

// Methods
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
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
  console.log(profileForm);
  if (!validateProfileForm()) return;

  isUpdating.value = true;
  try {
    await AuthService.updateProfile(profileForm);
    editMode.value = false;
    toast.success("Profile updated successfully!");
  } catch (error) {
    toast.error(error.message || "Failed to update profile");
  } finally {
    isUpdating.value = false;
  }
};

const validateProfileForm = () => {
  if (!profileForm.firstName.trim()) {
    toast.error("First name is required");
    return false;
  }
  if (!profileForm.lastName.trim()) {
    toast.error("Last name is required");
    return false;
  }
  if (!profileForm.email.trim()) {
    toast.error("Email is required");
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
    passwordForm.currentPassword = "";
    passwordForm.newPassword = "";
    passwordForm.confirmPassword = "";

    toast.success("Password changed successfully!");
  } catch (error) {
    toast.error(error.message || "Failed to change password");
  } finally {
    isChangingPassword.value = false;
  }
};

const validatePasswordForm = () => {
  if (!passwordForm.currentPassword) {
    toast.error("Current password is required");
    return false;
  }
  if (passwordForm.newPassword.length < 6) {
    toast.error("New password must be at least 6 characters");
    return false;
  }
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    toast.error("Passwords do not match");
    return false;
  }
  return true;
};

const signOutAllDevices = async () => {
  try {
    await AuthService.signOutAllDevices();
    toast.success("Signed out of all devices successfully!");
    router.push("/account");
  } catch (error) {
    toast.error(error.message || "Failed to sign out all devices");
  }
};

const confirmDeleteAccount = () => {
  showDeleteModal.value = true;
  deleteConfirmation.value = "";
};

const deleteAccount = async () => {
  if (deleteConfirmation.value !== "DELETE") return;

  isDeletingAccount.value = true;
  try {
    await AuthService.deleteAccount();
    toast.success("Account deleted successfully");
    router.push("/account");
  } catch (error) {
    toast.error(error.message || "Failed to delete account");
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
  <article class="min-h-[100vh] bg-(--page-bg) !py-8 !px-4">
    <main class="max-w-6xl mx-auto">
      <section
        class="flex items-center gap-8 !mb-12 p-4 bg-(--surface-2) rounded-2xl border-2 border-(--border) backdrop-blur-md"
      >
        <aside
          class="flex items-center justify-center bg-(--pill-bg) text-(--pill-fg) w-20 h-20 rounded-4xl text-4xl shrink-0"
        >
          <i class="fas fa-user"></i>
        </aside>
        <main>
          <h1 class="!text-3xl !font-bold !text-(--fg) !mb-2">
            {{ user.firstName }} {{ user.lastName }}
          </h1>
          <p class="!text-base text-(--muted) mb-2">{{ user.email }}</p>
          <span class="text-base text-(--ghost)"
            >Member since {{ formatDate(user.createdAt) }}</span
          >
        </main>
      </section>

      <section
        class="!w-full items-stretch justify-center flex-wrap flex gap-6"
      >
        <section
          class="flex-1 flex flex-col text-center !items-center gap-4 !mb-12 !p-6 bg-(--surface-2) rounded-2xl border-2 border-(--border) backdrop-blur-md"
        >
          <h1 class="!text-4xl !font-bold !text-(--pill-fg)">
            {{ taskStats.total }}
          </h1>
          <h3 class="!text-xl !text-(--fg) !uppercase !h-full">Total</h3>
        </section>
        <section
          class="flex-1 flex flex-col text-center !items-center gap-4 !mb-12 !p-6 bg-(--surface-2) rounded-2xl border-2 border-(--border) backdrop-blur-md"
        >
          <h1 class="!text-4xl !font-bold !text-(--pill-fg)">
            {{ taskStats.completed }}
          </h1>
          <h3 class="!text-xl !text-(--fg) !uppercase !h-full">Completed</h3>
        </section>
        <section
          class="flex-1 flex flex-col text-center !items-center gap-4 !mb-12 !p-6 bg-(--surface-2) rounded-2xl border-2 border-(--border) backdrop-blur-md"
        >
          <h1 class="!text-4xl !font-bold !text-(--pill-fg)">
            {{ taskStats.pending }}
          </h1>
          <h3 class="!text-xl !text-(--fg) !uppercase !h-full">Pending</h3>
        </section>
        <section
          class="flex-1 flex flex-col text-center !items-center gap-4 !mb-12 !p-6 bg-(--surface-2) rounded-2xl border-2 border-(--border) backdrop-blur-md"
        >
          <h1 class="!text-4xl !font-bold !text-(--pill-fg)">
            {{ completionPercentage }} %
          </h1>
          <h3 class="!text-xl !text-(--fg) !uppercase !h-full">
            Completion Rate
          </h3>
        </section>
      </section>

      <section class="flex flex-col gap-8">
        <!-- Account Settings Section -->
        <Card :header="true">
          <template #header
            ><h2
              class="!text-2xl !font-semibold !text-(--fg) m-0 !flex items-center !gap-2"
            >
              <i class="fas fa-cog text-(--pill-fg)"></i>
              Account Settings
            </h2></template
          >
          <template #main
            ><form @submit.prevent="updateProfile" class="flex flex-col gap-6">
              <Input
                type="text"
                textlabel="First Name"
                :disableinput="!editMode"
                v-model="profileForm.firstName"
              ></Input>
              <Input
                type="text"
                textlabel="Last Name"
                :disableinput="!editMode"
                v-model="profileForm.lastName"
              ></Input>
              <Input
                type="email"
                textlabel="Email"
                :disableinput="!editMode"
                v-model="profileForm.email"
              ></Input>

              <footer class="flex gap-4 mt-4">
                <Button
                  type="submit"
                  variant="alert"
                  :text="editMode ? 'Cancel' : 'Edit Profile'"
                  @click="toggleEditMode"
                  v-if="editMode"
                  :disabled="isUpdating"
                >
                </Button>
                <Button
                  type="submit"
                  :text="editMode ? 'Cancel' : 'Edit Profile'"
                  @click="toggleEditMode"
                  v-else="editMode"
                  :disabled="isUpdating"
                >
                </Button>
                <Button
                  type="submit"
                  text="Save Changes"
                  variant="secondary"
                  v-if="editMode"
                  :disabled="isUpdating"
                >
                  {{ isUpdating ? "Updating..." : "Save Changes" }}
                </Button>
              </footer>
            </form></template
          >
        </Card>
        <Card :header="true">
          <template #header
            ><h2
              class="!text-2xl !font-semibold !text-(--fg) m-0 !flex items-center !gap-2"
            >
              <i class="fas fa-shield-alt text-(--pill-fg)"></i>
              Security
            </h2></template
          >
          <template #main
            ><form @submit.prevent="changePassword" class="flex flex-col gap-6">
              <Input
                type="password"
                textlabel="Current Password"
                :vmodel="passwordForm.currentPassword"
              ></Input>
              <Input
                type="password"
                textlabel="New Password"
                :vmodel="passwordForm.newPassword"
                minlength="6"
              ></Input>
              <Input
                type="password"
                textlabel="Confirm New Password"
                :vmodel="passwordForm.newPassword"
                minlength="6"
              ></Input>

              <footer class="flex gap-4 mt-4">
                <Button
                  type="submit"
                  variant="secondary"
                  :text="isChangingPassword ? 'Changing...' : 'Change Password'"
                ></Button>
              </footer></form
          ></template>
        </Card>
        <Card :header="true" :danger="true">
          <template #header
            ><h2
              class="!text-2xl !font-semibold !text-(--fg) m-0 !flex items-center !gap-2"
            >
              <i class="fas fa-exclamation-triangle text-(--alert)"></i>
              Danger Zone
            </h2></template
          >
          <template #main
            ><div class="flex flex-col gap-8">
              <section
                class="flex !justify-between !items-center !p-6 border !border-(--alert)/20 rounded-lg bg-(--alert)/5"
              >
                <div class="flex-1">
                  <h5 class="!font-semibold !text-(--alert) mb-2">
                    Sign Out All Devices
                  </h5>
                  <p class="text-(--muted) m-0">
                    Sign out of all devices and invalidate all active sessions.
                  </p>
                </div>
                <Button
                  variant="alert"
                  @click="signOutAllDevices"
                  text="Sign Out All"
                ></Button>
              </section>
              <section
                class="flex !justify-between !items-center !p-6 border !border-(--alert)/20 rounded-lg bg-(--alert)/5"
              >
                <div class="flex-1">
                  <h5 class="!font-semibold !text-(--alert) mb-2">
                    Delete Account
                  </h5>
                  <p class="text-(--muted) m-0">
                    Permanently delete your account and all associated data.
                    This action cannot be undone.
                  </p>
                </div>
                <Button
                  variant="alert"
                  :fill="true"
                  @click="confirmDeleteAccount"
                  text="Delete Account"
                ></Button>
              </section>
            </div>
          </template>
        </Card>
      </section>
    </main>

    <!-- Delete Account Confirmation Modal -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      @click="showDeleteModal = false"
    >
      <Card class="max-w-lg" :header="true" :footer="true" @click.stop>
        <template #header
          ><h3 class="m-0 !text-(--alert) flex items-center gap-2">
            <i class="fas fa-exclamation-triangle"></i>
            Delete Account
          </h3></template
        >
        <template #main
          ><p class="text-(--muted)">
            Are you absolutely sure you want to delete your account?
          </p>
          <p class="text-(--muted)">This will permanently delete:</p>
          <ul class="text-(--muted)">
            <li>Your profile information</li>
            <li>All your tasks and data</li>
            <li>Your account settings</li>
          </ul>
          <p class="text-(--alert)">
            <strong>This action cannot be undone.</strong>
          </p>
          <br />
          <div class="mt-8 flex flex-col w-full">
            <label
              for="deleteConfirmation"
              class="block text-(--muted) mb-2 font-semibold"
            >
              Type "DELETE" to confirm:
            </label>
            <input
              type="text"
              id="deleteConfirmation"
              v-model="deleteConfirmation"
              placeholder="DELETE"
              class="w-full p-3 border !border-(--alert)/50 rounded-lg bg-(--alert)/10 !text-base text-(--fg) focus:!outline-none focus:!border-(--alert)/100"
            /></div
        ></template>
        <template #footer>
          <div class="flex gap-4 justify-end">
            <Button
              variant="default"
              text="Cancel"
              @click="showDeleteModal = false"
            ></Button>
            <Button
              variant="alert"
              :fill="true"
              :disabled="deleteConfirmation !== 'DELETE' || isDeletingAccount"
              text="Delete Account"
              @click="deleteAccount"
            ></Button></div
        ></template>
      </Card>
    </div>
  </article>
</template>
