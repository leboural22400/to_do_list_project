<script setup lang="js">
import { ref, onMounted, onBeforeUnmount, nextTick, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import AuthService from '@/services/authService.js';

const router = useRouter();
const toast = useToast();

const show = ref(false);
const isMobile = ref(false);

const navbarRef = ref(null);
const openBtnRef = ref(null);
const overlayRef = ref(null);

let mediaQuery;

// Authentication state
const isAuthenticated = computed(() => AuthService.isAuthenticated.value);

/**
 * Apply or remove the `inert` attribute on the navbar.
 * When `inert` is present, the element is inaccessible to mouse and keyboard interactions.
 * @param {boolean} val - If true, apply `inert`. If false, remove it.
 */
function applyInert(val) {
    const el = navbarRef.value;
    if (!el) return;
    if (val) el.setAttribute('inert', '');
    else el.removeAttribute('inert');
}

/**
 * Update the overlay (background behind the sidebar) display.
 * @param {boolean} display - true to show the overlay, false to hide it.
 */
function syncOverlayDisplay(display) {
    if (overlayRef.value) overlayRef.value.style.display = display ? 'block' : 'none';
}

/**
 * Update the hamburger button (open sidebar button) display.
 * @param {boolean} display - true to show the button, false to hide it.
 */
function syncOpenBtnDisplay(display) {
    if (openBtnRef.value) openBtnRef.value.style.display = display ? 'block' : 'none';
}

/**
 * Update navigation state depending on screen size (mobile or desktop).
 * - Activates/deactivates mobile mode
 * - Handles `inert`, overlay display, and hamburger button visibility
 * @param {MediaQueryListEvent|MediaQueryList} [e] - Event from `matchMedia` or the initial MediaQuery object.
 */
function updateNav(e) {
    const mobile = e ? e.matches : (mediaQuery && mediaQuery.matches);
    isMobile.value = !!mobile;

    if (isMobile.value) {
        if (!show.value) applyInert(true);
        syncOpenBtnDisplay(true);
        syncOverlayDisplay(show.value);
    } else {
        applyInert(false);
        show.value = false;
        syncOpenBtnDisplay(false);
        syncOverlayDisplay(false);
    }
}

/**
 * Open the sidebar (only in mobile mode).
 * - Updates `show` state
 * - Updates the aria-expanded attribute
 * - Displays the overlay
 */
function openSideBar() {
    if (!isMobile.value) return;
    show.value = true;
    if (openBtnRef.value) openBtnRef.value.setAttribute('aria-expanded', 'true');
    applyInert(false);
    syncOverlayDisplay(true);
}

/**
 * Close the sidebar (only in mobile mode).
 * - Updates `show` state
 * - Updates the aria-expanded attribute
 * - Hides the overlay
 */
function closeSideBar() {
    if (!isMobile.value) return;
    show.value = false;
    if (openBtnRef.value) openBtnRef.value.setAttribute('aria-expanded', 'false');
    applyInert(true);
    syncOverlayDisplay(false);
}

/**
 * Lifecycle hook: runs when the component is mounted.
 * - Initializes the `(max-width: 925px)` mediaQuery
 * - Immediately applies `updateNav`
 * - Adds a listener for screen size changes
 */
onMounted(async () => {
    await nextTick();
    mediaQuery = window.matchMedia('(max-width: 925px)');
    updateNav(mediaQuery);
    mediaQuery.addEventListener('change', updateNav);
});

/**
 * Lifecycle hook: runs before the component is unmounted.
 * - Removes the `change` listener from the mediaQuery
 */
onBeforeUnmount(() => {
    if (mediaQuery) mediaQuery.removeEventListener('change', updateNav);
});

/**
 * Handle user logout
 */
async function handleSignOut() {
    try {
        AuthService.logout();
        closeSideBar();
        router.push('/');
        toast.success('Successfully signed out!');
    } catch (error) {
        console.error('Sign out error:', error);
        toast.error('Error signing out. Please try again.');
    }
}
</script>

<template>
  <!-- Open button for mobile navigation -->
  <button
    ref="openBtnRef"
    @click="openSideBar"
    class="!bg-transparent !border-none py-3 px-4 !ml-auto cursor-pointer"
    aria-label="Open sidebar"
    aria-expanded="false"
    aria-controls="navbar"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="feather feather-menu"
    >
      <line x1="3" y1="12" x2="21" y2="12"></line>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
  </button>

  <!-- Navigation Menu -->
  <nav
    id="navbar"
    ref="navbarRef"
    class="top-0 z-50 bg-(--surface) max-md:fixed max-md:right-[-100%] max-md:h-[100vh] max-md:w-oty max-md:z-10 max-md:flex max-md:flex-col max-md:transition-transform"
    :class="{ '!right-0': show }"
    role="navigation"
    aria-label="Main"
  >
    <ul
      class="!flex !list-none !p-0 my-0 mx-auto !max-w-3xl max-md:flex-col max-md:!w-fit max-md:!m-2"
    >
      <li class="flex">
        <!-- Close button for mobile navigation -->
        <button
          class="hidden !bg-transparent !border-none py-3 px-4 ml-auto cursor-pointer max-md:inline"
          @click="closeSideBar"
          aria-label="Close navigation"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="feather feather-x"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </li>
    </ul>
    <ul
      class="!flex !list-none justify-between !p-0 my-0 mx-auto !max-w-6xl max-md:!w-fit max-md:!flex-col max-md:!m-2"
    >
      <!-- Authenticated User Links -->
      <template v-if="isAuthenticated">
        <li>
          <RouterLink
            to="/to-do-list"
            custom
            v-slot="{ href, navigate, isActive }"
          >
            <a
              :href="href"
              class="flex !no-underline !text-xl !text-(--fg) text-center p-3 transition-colors hover:bg-[#333]"
              :class="{ 'border-b-2 border-b-(--fg)': isActive }"
              @click.prevent="
                navigate();
                closeSideBar();
              "
            >
              My Lists
            </a>
          </RouterLink>
        </li>

        <li>
          <RouterLink
            to="/profile"
            custom
            v-slot="{ href, navigate, isActive }"
          >
            <a
              :href="href"
              class="flex !no-underline !text-xl !text-(--fg) text-center p-3 transition-colors hover:bg-[#333]"
              :class="{ 'border-b-2 border-b-(--fg)': isActive }"
              @click.prevent="
                navigate();
                closeSideBar();
              "
            >
              Profile
            </a>
          </RouterLink>
        </li>
      </template>

      <!-- Guest User Links except  -->
      <template v-else>
        <li>
          <RouterLink to="/" custom v-slot="{ href, navigate, isActive }">
            <a
              :href="href"
              class="flex !no-underline !text-xl !text-(--fg) text-center p-3 transition-colors hover:bg-[#333]"
              :class="{ 'border-b-2 border-b-(--fg)': isActive }"
              @click.prevent="
                navigate();
                closeSideBar();
              "
            >
              Home
            </a>
          </RouterLink>
        </li>
        <li>
          <RouterLink
            to="/account"
            custom
            v-slot="{ href, navigate, isActive }"
          >
            <a
              :href="href"
              class="flex !no-underline !text-xl !text-(--fg) text-center p-3 transition-colors hover:bg-[#333]"
              :class="{ 'border-b-2 border-b-(--fg)': isActive }"
              @click.prevent="
                navigate();
                closeSideBar();
              "
            >
              Sign In
            </a>
          </RouterLink>
        </li>
      </template>
    </ul>
  </nav>

  <!-- Overlay behind the sidebar when open (mobile) -->
  <div
    class="bg-black/50 fixed inset-0 z-[9] hidden"
    ref="overlayRef"
    @click="closeSideBar"
    aria-hidden="true"
  ></div>
</template>
