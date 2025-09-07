<script setup lang="ts">
import {ref} from "vue";


/*- **Props** : Parent → Enfant (données descendantes)
- **Emits** : Enfant → Parent (événements remontants)
*/


/**
 * Props pour recevoir une tâche depuis le composant parent
 * @property {Object} task - La tâche à afficher et gérer
 */
const props = defineProps({
  taskProps: {
    type: Object,
    required: true,
  }

});

/**
 * Emet un événement pour mettre à jour le statut de la tâche
 * @param {boolean} newStatus - Le nouveau statut de la tâche (true/false)
 */

const emit = defineEmits(['update:status']) // on definit un emit pour le status
const updateStatus = (newStatus) => {
  emit('update:status', newStatus)
}

</script>

<template>
<span>
  <input
      type="checkbox"
      :checked="taskProps.status"
      @change="updateStatus($event.target.checked)"
  />
  {{taskProps.title}}
</span>
</template>

<style scoped>

</style>