<script setup lang="ts">
import {ref} from "vue";

const defineProps = ({
  title: {
    type: String,
    required: true
  },
  status: {
    type: Boolean,
    required: true
  },
  date: {
    type: Date,
  }
});

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