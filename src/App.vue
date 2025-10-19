<script setup>
// Import components
import Navbar from "./components/Navbar/Navbar.vue";
import Footer from "./components/Footer/Footer.vue";
import ScrollBtn from "./components/ScrollBtn/ScrollBtn.vue";
import Toast from "./components/Toast/Toast.vue";
import { computed } from 'vue';
import { useRoute } from 'vue-router';

// Styles
import "./components/Toast/Toast.css";

// Get current route
const route = useRoute();

// Compute whether to show navbar (hide on task detail pages)
const showNavbar = computed(() => {
  return !route.path.startsWith('/task/');
});
</script>

<template>
  <div class="app-container">
    <!-- To show the routes -->
    <Navbar v-if="showNavbar" />
    <main class="main-content">
      <router-view></router-view>
    </main>
    <!-- Scroll to top button -->
    <ScrollBtn />
    <Footer />
    <Toast />
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>
