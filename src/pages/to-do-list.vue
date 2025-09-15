<script setup lang="ts">
import {ref, computed, onMounted} from 'vue'
import ToDo from "@/components/to-do-list/to-do.vue";
import TaskService from "../services/taskService"

// Dans votre composant
const taskService = new TaskService();

const tasks = ref([])
const allTasks = ref([])
const toDoList = ref([])
const taskHider = ref(false)

const toDo = ref({
  title: '',
  status: 'todo',
  date: Date.now() // pour le moment inutile à voir si on garde
})

// Charger les données au montage du composant
onMounted( async() => {
  try {
    // Pour récupérer les tâches d'une liste spécifique
    tasks.value = await taskService.fetchTasksByListId('1');
    tasks.value = tasks.value.map(task => ({
      ID_task: task.ID_task,
      Title_task: task.Title_task,
      Title_statuts: task.Title_statuts,
      ID_statuts: task.ID_statuts,
      ID_list: task.ID_list
    }))
    console.log('Tasks fetched:', tasks.value);
    // Utiliser les données récupérées pour initialiser votre liste
    toDoList.value = tasks.value;

  } catch (error) {
    console.error('Erreur lors du chargement des tâches:', error);
  }
});




/**
 * Ajoute une nouvelle tâche à la liste si le titre n'est pas vide
 * Réinitialise le champ de saisie après l'ajout
 */

 const addTask=()=>{
   if (toDo.value.title.trim() === '') return;

   toDoList.value.push({
     ID_task: crypto.randomUUID(), // créer un id unique
     Title_task: toDo.value.title,
     ID_statuts: toDo.value.status,
     ID_list: '',
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

const sortedList = computed(() => { // à adapter au nouveau systeme de status

  const sortedList = toDoList.value
   if (taskHider.value) {
    return sortedList.filter(c => c.ID_statuts !== "done")
   }
   return sortedList
 })
</script>

<template>
  <div class="to-do-list-container">
    <h1>To-Do List</h1>
    <p v-if="toDoList.length === 0">Aucune tâche à accomplir</p>
  </div>

  <div class="to-do-list">
    <ul>
      <li v-for="task in sortedList" :key="task.ID_task"> <!-- `sortedList` au lieu de `sortedList()` car c'est maintenant une computed property -->

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