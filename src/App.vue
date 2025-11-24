<script setup>
// Import components
import Navbar from "./components/Navbar/Navbar.vue";
import Footer from "./components/Footer/Footer.vue";
import ScrollBtn from "./components/ScrollBtn/ScrollBtn.vue";
import { computed } from "vue";
import { useRoute } from "vue-router";

// Styles
import "./components/Toast/Toast.css";

// Get current route
const route = useRoute();

// Compute whether to show navbar (hide on task detail pages)
const showNavbar = computed(() => {
  return !route.path.startsWith("/task/");
});
</script>

<template>
  <div class="flex min-h-dvh flex-col">
    <!-- To show the routes -->
    <Navbar v-if="showNavbar" />
    <router-view></router-view>
    <!-- Scroll to top button -->
    <ScrollBtn />
    <Footer />
    <!-- <Toast /> -->
  </div>
</template>
