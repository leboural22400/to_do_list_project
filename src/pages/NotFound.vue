<script setup>
import Button from "@/components/Button.vue";
</script>

<template>
  <div
    class="min-h-[65.6vh] flex flex-col justify-center items-center bg-(--surface-2) text-(--fg) text-center relative overflow-hidden"
  >
    <h1
      class="!text-9xl !font-extrabold !text-transparent bg-(image:--btn) bg-clip-text m-0 z-[1]"
    >
      404
    </h1>
    <p class="text-3xl font-semibold my-2 mx-0 text-(--fg)">Page not found</p>
    <p class="text-lg/1.6 mb-8 text-(--muted)">
      Oops... the page you are looking for doesn’t exist.
    </p>
    <router-link to="/" class="!no-underline">
      <Button text="Back to Home" />
    </router-link>
  </div>
</template>
