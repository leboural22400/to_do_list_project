<script setup lang="ts">
import {ref} from 'vue'
import ToDo from "@/components/to-do-list/to-do.vue";


const toDo = ref({
  title: '',
  status: false,
  date: Date.now() // pour le moment inutile à voir si on garde
})

const toDoList = ref([])
const taskHider = ref(false)

/**
 * Ajoute une nouvelle tâche à la liste si le titre n'est pas vide
 * Réinitialise le champ de saisie après l'ajout
 */

 const addTask=()=>{
   if (toDo.value.title.trim() === '') return;

   toDoList.value.push({
     id: crypto.randomUUID(), // créer un id unique
     title: toDo.value.title,
     status: toDo.value.status,
     date: toDo.value.date, // pour le moment inutile à voir si on garde
    })
   toDo.value.title = ''
 }

/**
 * Retourne la liste des tâches triées et filtrées en fonction du statut
 * Les tâches non accomplies apparaissent en premier
 * Si `taskHider` est activé, les tâches accomplies sont filtrées
 * @returns {Array} Liste des tâches triées et filtrées
 */

const sortedList = () => {

  const sortedList = toDoList.value.toSorted((a, b) =>
      a.status > b.status ? 1 : -1)
   if (taskHider.value) {
    return sortedList.filter(c => c.status === false)
   }
   return sortedList
 }
</script>

<template>
  <div class="to-do-list-container">
    <h1>To-Do List</h1>
    <p v-if="toDoList.length === 0">Aucune tâche à accomplir</p>
  </div>

  <div class="to-do-list">
    <ul>
      <li v-for="task in sortedList()" :key="task.id">

        <to-do :taskProps="task" @update:status="task.status = $event" /> <!-- $event est une variable spéciale de Vue qui
        contient ce que l'enfant a envoyé avec `emit()` -->

      </li>
      <li>
        <form class="add-task"  @submit.prevent="addTask()"> <!-- .prevent empêche de recharger la page sinn tout s'efface -->
        <input v-model="toDo.title" type="text" placeholder="Nouvelle tâche" class="task-input"/>
        <button type="submit" class="add-button">Ajouter</button>
      </form>
      </li>
    </ul>

    <div class="to-do-list-hider">
      <span>
        <input v-model="taskHider" type="checkbox" id="toggle-list" />
        Masquer les tâches accomplies
      </span>
    </div>
  </div>
</template>

<style scoped>
li {
  list-style: none;
}
</style>