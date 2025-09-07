<script setup lang="ts">
import {ref} from "vue";

const props = defineProps({
  task: {
    type: Object,
    required: true,
  }

});
const emit = defineEmits(['update:status']) // on definit un emit pour le status
const updateStatus = (newStatus) => {
  emit('update:status', newStatus)
}
</script>

<template>
<span>
  <input
      type="checkbox"
      :checked="task.status"
      @change="updateStatus($event.target.checked)"
  />
  {{task.title}}
</span>
</template>

<style scoped>

</style>