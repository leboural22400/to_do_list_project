<script>
import { destroyUser, getUserByID, updateUser } from "@/middleware/userService";
import { getAllListByUserID } from "@/middleware/listService";
import { getAllTaskByListID } from "@/middleware/taskService";

import { useRouter } from "vue-router";
import AuthService from "@/services/authService.js";

import Button from "@/components/Button.vue";
import Card from "@/components/Card.vue";
import Input from "@/components/Input.vue";

export default {
  components: {
    Button,
    Card,
    Input,
  },
  setup() {
    const router = useRouter();
    return { router };
  },
  data() {
    return {
      user: null,
      tasks: [],
      editMode: false,
      isUpdating: false,
      isChangingPassword: false,
      isDeletingAccount: false,
      showDeleteModal: false,
      deleteConfirmation: "",
      profileForm: {
        firstName: "",
        lastName: "",
        email: "",
      },
      passwordForm: {
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      },
    };
  },
  computed: {
    taskStats() {
      const total = this.tasks.length;
      const completed = this.tasks.filter(
        (task) => task.stateTask === 2
      ).length;
      const pending = this.tasks.filter((task) => task.stateTask === 0).length;

      return { total, completed, pending };
    },
    completionPercentage() {
      console.log(this.taskStats);
      if (this.taskStats.total === 0) return 0;
      return Math.round(
        (this.taskStats.completed / this.taskStats.total) * 100
      );
    },
  },
  mounted() {
    this.getUser();
    this.getTasks();
  },
  methods: {
    async getUser() {
      try {
        await getUserByID(AuthService.user.value).then((resp) => {
          this.user = resp;
          this.profileForm.firstName = this.user.nameUser.split(" ")[0];
          this.profileForm.lastName = this.user.nameUser.split(" ")[1];
          this.profileForm.email = this.user.emailUser;
        });
      } catch (err) {
        console.log(err);
        this.$router.push("/not-found");
      }
    },
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },
    async getTasks() {
      getAllListByUserID(AuthService.user.value).then((res) => {
        res.forEach((list) => {
          getAllTaskByListID(list.idList).then((resTasks) => {
            resTasks.forEach((task) => {
              this.tasks.push(task);
            });
          });
        });
      });
    },
    toggleEditMode() {
      if (this.editMode) {
        initializeForm();
      }
      this.editMode = !this.editMode;
    },
    async updateProfile() {
      console.log(this.profileForm);
      if (!this.validateProfileForm()) return;

      this.isUpdating = true;
      try {
        await AuthService.updateProfile(this.profileForm);
        this.editMode = false;
      } catch (error) {
      } finally {
        this.isUpdating = false;
      }
    },
    async validateProfileForm() {
      if (!this.profileForm.firstName.trim()) {
        return false;
      }
      if (!this.profileForm.lastName.trim()) {
        return false;
      }
      if (!this.profileForm.email.trim()) {
        return false;
      }
      await updateUser(
        {
          nameUser:
            this.profileForm.firstName.trim() +
            " " +
            this.profileForm.lastName.trim(),
          emailUser: this.profileForm.email.trim(),
        },
        AuthService.user.value
      ).then(() => location.reload());
    },
    async changePassword() {
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
      } catch (error) {
      } finally {
        isChangingPassword.value = false;
      }
    },
    validatePasswordForm() {
      if (!passwordForm.currentPassword) {
        return false;
      }
      if (passwordForm.newPassword.length < 6) {
        return false;
      }
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        return false;
      }
      return true;
    },
    async signOut() {
      try {
        await AuthService.logout();
        this.router.push("/account");
      } catch (error) {
        console.log(error);
      }
    },
    confirmDeleteAccount() {
      this.showDeleteModal = true;
      this.deleteConfirmation = "";
    },
    async deleteAccount() {
      if (this.deleteConfirmation !== "DELETE") return;

      this.isDeletingAccount = true;
      try {
        await destroyUser(AuthService.user.value).then(
          async () => await AuthService.deleteAccount()
        );
        this.router.push("/account");
      } catch (error) {
        console.log(error);
      } finally {
        this.isDeletingAccount = false;
        this.showDeleteModal = false;
      }
    },
  },
};
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
            {{ user == null ? "" : user.nameUser }}
          </h1>
          <p class="!text-base text-(--muted) mb-2">
            {{ user == null ? "" : user.emailUser }}
          </p>
          <span class="text-base text-(--ghost)"
            >Member since
            {{ formatDate(user == null ? "" : user.dateJoinUser) }}</span
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
                  :basicpadd="true"
                  :paddx="true"
                >
                </Button>
                <Button
                  type="submit"
                  :text="editMode ? 'Cancel' : 'Edit Profile'"
                  @click="toggleEditMode"
                  v-else="editMode"
                  :disabled="isUpdating"
                  :basicpadd="true"
                  :paddx="true"
                >
                </Button>
                <Button
                  type="submit"
                  text="Save Changes"
                  variant="secondary"
                  v-if="editMode"
                  :disabled="isUpdating"
                  :basicpadd="true"
                  :paddx="true"
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
                  :basicpadd="true"
                  :paddx="true"
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
                  <h5 class="!font-semibold !text-(--alert) mb-2">Sign Out</h5>
                  <p class="text-(--muted) m-0">
                    Sign out of the active session.
                  </p>
                </div>
                <Button
                  variant="alert"
                  @click="signOut"
                  text="Sign Out"
                  :basicpadd="true"
                  :paddx="true"
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
                  :basicpadd="true"
                  :paddx="true"
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
              :basicpadd="true"
              :paddx="true"
            ></Button>
            <Button
              variant="alert"
              :fill="true"
              :disabled="deleteConfirmation !== 'DELETE' || isDeletingAccount"
              text="Delete Account"
              @click="deleteAccount"
              :basicpadd="true"
              :paddx="true"
            ></Button></div
        ></template>
      </Card>
    </div>
  </article>
</template>
