<script setup>
import ToDoList from "@/pages/to-do-list.vue";
import Navbar from "./components/Navbar/Navbar.vue";
</script>

<template>
  <main>

    <!-- To show the routes -->
    <Navbar />
    <router-view></router-view>
  </main>

</template>

<style scoped></style>
