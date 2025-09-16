<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';

const show = ref(false);
const isMobile = ref(false);

const navbarRef = ref(null);
const openBtnRef = ref(null);
const overlayRef = ref(null);

let mediaQuery;

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
</script>

<template>
    <button id="openSidebarButton" ref="openBtnRef" @click="openSideBar"
        style="background-color: transparent; border: none;" aria-label="Open sidebar" aria-expanded="false"
        aria-controls="navbar">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            class="feather feather-menu">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
    </button>

    <nav id="navbar" ref="navbarRef" :class="{ show }" role="navigation" aria-label="Main">
        <ul>
            <li>
                <button id="closeSidebarButton" @click="closeSideBar" aria-label="Close navigation">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        class="feather feather-x">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </li>

            <li class="home">
                <RouterLink to="/" custom v-slot="{ href, navigate, isActive }">
                    <a :href="href" class="navlink" :class="{ 'current-link': isActive }"
                        @click.prevent="navigate(); closeSideBar()">
                        Home
                    </a>
                </RouterLink>
            </li>

            <li>
                <RouterLink to="/to-do-list" custom v-slot="{ href, navigate, isActive }">
                    <a :href="href" class="navlink" :class="{ 'current-link': isActive }"
                        @click.prevent="navigate(); closeSideBar()">
                        To-Do List
                    </a>
                </RouterLink>
            </li>

            <li>
                <RouterLink to="/about" custom v-slot="{ href, navigate, isActive }">
                    <a :href="href" class="navlink" :class="{ 'current-link': isActive }"
                        @click.prevent="navigate(); closeSideBar()">
                        About
                    </a>
                </RouterLink>
            </li>
        </ul>
    </nav>

    <div id="overlay" ref="overlayRef" @click="closeSideBar" aria-hidden="true"></div>
</template>

<style scoped lang="scss">
nav {
    background-color: var(--nav-bg);
}

nav ul {
    display: flex;
    list-style: none;
    padding: 0;
    margin: 0;
}

nav .home {
    margin-right: auto;
}

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

    nav.show~#overlay {
        display: block;
    }
}
</style>