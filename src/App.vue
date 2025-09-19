<script setup>
// Import components
import Navbar from "./components/Navbar/Navbar.vue";
import Footer from "./components/Footer/Footer.vue";
import ScrollBtn from "./components/ScrollBtn/ScrollBtn.vue";
import Toast from "./components/Toast/Toast.vue";

// Styles
import "./components/Toast/Toast.css";
</script>

<template>
  <div class="app-container">
    <!-- To show the routes -->
    <Navbar />
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
