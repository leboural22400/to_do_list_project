<script setup lang="ts">
import {ref} from 'vue'

const toDo = ref('')
const toDoList = ref([])
const taskHider = ref(false)

 const addTask=()=>{
    toDoList.value.push({
      title: toDo.value,
      status: false,
      date: Date.now()
    })
   toDo.value = ''
 }

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
      <li v-for="toDo in sortedList()" :key="toDo.date">

        <span>
          <input type="checkbox" v-model="toDo.status" />
          {{toDo.title}}
        </span>

      </li>
      <li>
        <form class="add-task"  @submit.prevent="addTask"> <!-- .prevent empêche de recharger la page sinn tout s'efface -->
        <input v-model="toDo" type="text" placeholder="Nouvelle tâche" class="task-input"/>
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