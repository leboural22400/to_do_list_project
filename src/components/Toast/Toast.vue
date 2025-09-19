<script setup lang="js">
// Toast notification
import { useToast } from "vue-toastification";
import { useRoute } from 'vue-router';
import { watch, onMounted, nextTick } from 'vue';

const toast = useToast();
const route = useRoute();

/**
 * Format the current path to a more readable page name.
 * @param path - The current path (e.g., "/about-us")
 * @returns Formatted page name (e.g., "ABOUT US")
 */
function formatPageName(path) {
    return path
        .replace(/^\//, "")
        .replace(/-/g, " ")
        .toUpperCase() || "HOME";
}

const showNotification = () => {
    const pageName = formatPageName(route.path);

    const messages = [
        `Exciting news: ${pageName} is getting a makeover!`,
        `${pageName} is leveling up. Don't miss out!`,
        `Hot off the press: ${pageName} updates are coming soon!`,
        `Alert! The ${pageName} section will expand soon.`,
        `Breaking news: ${pageName} is evolving. Stay connected!`,
        `Heads up! ${pageName} is about to get a fresh look.`,
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    // Show the toast notification
    toast.success(randomMessage, {
        position: "top-right",
        timeout: 2500,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        draggablePercent: 0.6,
        showCloseButtonOnHover: false,
        hideProgressBar: false,
        closeButton: "button",
        icon: true,
        rtl: false
    });
};

// To avoid showing the toast on the initial load twice
let firstLoad = true; 

// Show toast on initial load
onMounted(async () => {
    // Make sure Vue Router is initialized and DOM is updated
    await nextTick();
    setTimeout(() => {
        showNotification();
        firstLoad = false;
    }, 100);
});

// Show toast on every route change
watch(() => route.path, () => {
    if(!firstLoad)
    showNotification();
});
</script>