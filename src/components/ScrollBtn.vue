<script setup lang="js">
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
  <button
    v-if="showScrollTop"
    @click="scrollToTop"
    class="fixed bottom-6 right-6 py-3 px-4 border-none !rounded-[100%] bg-(--nav-bg) text-(--fg) cursor-pointer !z-[100] !shadow !transition-opacity hover:!opacity-80 max-md:hidden"
    aria-label="Scroll to top"
  >
    <i class="fa fa-chevron-up"></i>
  </button>
</template>
