<script setup lang="js">
</script>

<template>
    <router-link to="/">Home</router-link>
    <router-link to="/about">About</router-link>
</template>

<style scoped lang="scss">
/* Add more style in Navbar later */
nav {
    display: flex;
    gap: 20px;
    background-color: #f0f0f0;
    padding: 10px;
}

a {
    text-decoration: none;
    color: #333;
    font-weight: bold;
}

a.router-link-active {
    color: #42b983;
}
</style>