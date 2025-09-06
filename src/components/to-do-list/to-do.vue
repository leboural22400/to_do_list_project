<script setup lang="ts">
import {ref} from "vue";

const toDo = ref({
  title: '',
  status: false,
  date: Date.now()
})
</script>

<template>
<span>
  <input type="checkbox" v-model="toDo.status" />
          {{toDo.title}}
</span>
</template>

<style scoped>

</style>