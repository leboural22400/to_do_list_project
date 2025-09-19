<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const showScrollTop = ref(false);

/**
 * Update the visibility of the scroll-to-top button based on scroll position.
 * The button appears when the user scrolls down more than 200px.
 */
function onScroll() {
    showScrollTop.value = window.scrollY > 200;
}

/**
 * Smoothly scroll the window back to the top.
 */
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Set up and clean up the scroll event listener.
 */
onMounted(() => window.addEventListener('scroll', onScroll));
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll));
</script>

<template>
    <button v-if="showScrollTop" @click="scrollToTop" class="scroll-top-btn" aria-label="Scroll to top">
        <i class="fa fa-chevron-up"></i>
    </button>
</template>

<style scoped>
/* Used the same color as the background to blend in */
.scroll-top-btn {
    position: fixed;
    bottom: 1.5rem;
    right: 1.5rem;
    padding: 0.8rem 1rem;
    border: none;
    border-radius: 50%;
    background: var(--nav-bg, #222);
    color: white;
    font-size: 1.2rem;
    cursor: pointer;
    z-index: 99;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    transition: opacity 0.3s ease;
}

.scroll-top-btn:hover {
    opacity: 0.8;
}
</style>