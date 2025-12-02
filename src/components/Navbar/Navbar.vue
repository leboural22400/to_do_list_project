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
    id="openSidebarButton"
    ref="openBtnRef"
    @click="openSideBar"
    style="background-color: transparent; border: none"
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
    :class="{ show }"
    role="navigation"
    aria-label="Main"
  >
    <ul>
      <li>
        <!-- Close button for mobile navigation -->
        <button
          id="closeSidebarButton"
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
    <ul class="flex justify-between">
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
              class="navlink"
              :class="{ 'current-link': isActive }"
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
              class="navlink"
              :class="{ 'current-link': isActive }"
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
        <li class="home">
          <RouterLink to="/" custom v-slot="{ href, navigate, isActive }">
            <a
              :href="href"
              class="navlink"
              :class="{ 'current-link': isActive }"
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
              class="navlink"
              :class="{ 'current-link': isActive }"
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
    id="overlay"
    ref="overlayRef"
    @click="closeSideBar"
    aria-hidden="true"
  ></div>
</template>

<style scoped lang="scss">
nav {
  top: 0;
  z-index: 10;
  background-color: var(--surface);
}

nav ul {
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0 auto;
  max-width: 72rem;
}

// Pushes the "Home" link to the left in desktop mode for ergonomic reasons
// Otherwise it doesn't look good
nav .home {
  margin-right: auto;
}

// I added this to fix a weird bug where the sidebar would be slightly off-screen
// Using a flex often fix the alignment issues (no other particular reason)
nav li {
  display: flex;
}

.navlink {
  display: flex;
  text-decoration: none;
  color: white;
  font-size: 1.2rem;
  padding: 1rem;
  transition: background-color 0.3s ease;
}

.navlink:hover {
  background-color: #333;
}

// Indicates the current active route in the navbar
.current-link {
  border-bottom: 2px solid white;
}

#openSidebarButton,
#closeSidebarButton {
  display: none;
  background-color: transparent;
  border: none;
  padding: 10px 15px;
  margin-left: auto;
  color: white;
  cursor: pointer;
}

$signout-bg: linear-gradient(135deg, #0ea5e9, #22d3ee);
$signout-hover-bg: linear-gradient(135deg, #0284c7, #06b6d4);
$signout-shadow: rgba(56, 189, 248, 0.4);
$signout-hover-shadow: rgba(34, 211, 238, 0.6);

.sign-out-btn {
  background: $signout-bg;
  border: none;
  border-radius: 10px;
  color: #fff;
  font-family: inherit;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.8em 1.4em;
  text-align: center;
  margin: 0.4em 1em;
  box-shadow: 0 0 10px $signout-shadow;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: left 0.6s ease;
  }

  &:hover {
    background: $signout-hover-bg;
    box-shadow: 0 0 18px $signout-hover-shadow;
    transform: translateY(-1px);

    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 0 8px $signout-shadow;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.4), 0 0 16px $signout-hover-shadow;
  }

  &::after {
    content: "⇢";
    margin-left: 0.6em;
    font-size: 0.9em;
    opacity: 0.8;
  }

  @media (max-width: 768px) {
    width: calc(100% - 2em);
    margin: 0.6em 1em;
    font-size: 1.1rem;
    padding: 0.9em;
    border-radius: 12px;
  }
}

// Position fixed and inset 0 to cover the entire screen
// z-index 9 to be behind the navbar (z-index 10)
#overlay {
  background: rgba(0, 0, 0, 0.5);
  position: fixed;
  inset: 0;
  z-index: 9;
  display: none;
}

@media screen and (max-width: 925px) {
  nav {
    position: fixed;
    top: 0;
    right: -100%;
    height: 100vh;
    width: min(15em, 100%);
    z-index: 10;
    display: flex;
    flex-direction: column;
    transition: right 0.3s ease;
  }

  nav.show {
    right: 0;
  }

  nav ul {
    flex-direction: column;
    width: 100%;
  }

  .navlink {
    width: 100%;
    padding-left: 2em;
  }

  nav .home {
    margin-right: unset;
  }

  #openSidebarButton,
  #closeSidebarButton {
    display: block;
  }

  nav.show ~ #overlay {
    display: block;
  }
}
</style>
