<template>
    <div class="notfound">
        <div class="notfound__glow"></div>
        <h1 class="notfound__title">404</h1>
        <p class="notfound__subtitle">Page not found</p>
        <p class="notfound__text">
            Oops... the page you are looking for doesn’t exist (or decided to take a vacation :3 ).
        </p>
        <router-link to="/" class="notfound__button">Back to Home</router-link>
    </div>
</template>

<script setup>
</script>

<style>
.notfound {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: radial-gradient(circle at top left, rgba(124, 58, 237, 0.15), transparent 40%),
        radial-gradient(circle at bottom right, rgba(6, 182, 212, 0.15), transparent 40%),
        #0f172a;
    /* dark slate */
    color: #e5e7eb;
    text-align: center;
    position: relative;
    overflow: hidden;
}

.notfound__glow {
    position: absolute;
    width: 350px;
    height: 350px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(124, 58, 237, 0.25), transparent 70%);
    top: 20%;
    left: 10%;
    filter: blur(80px);
    z-index: 0;
}

.notfound__title {
    font-size: 8rem;
    font-weight: 800;
    color: transparent;
    background: linear-gradient(90deg, #7c3aed, #06b6d4);
    -webkit-background-clip: text;
    background-clip: text;
    margin: 0;
    z-index: 1;
}

.notfound__subtitle {
    font-size: 2rem;
    font-weight: 600;
    margin: 0.5rem 0;
    color: #cbd5e1;
    z-index: 1;
}

.notfound__text {
    max-width: 500px;
    font-size: 1.1rem;
    line-height: 1.6;
    margin-bottom: 2rem;
    color: #94a3b8;
    z-index: 1;
}

.notfound__button {
    display: inline-block;
    padding: 0.8rem 1.6rem;
    font-weight: 600;
    color: #fff;
    border-radius: 12px;
    text-decoration: none;
    background: linear-gradient(90deg, #7c3aed, #06b6d4);
    box-shadow: 0 0 18px rgba(124, 58, 237, 0.4), 0 0 18px rgba(6, 182, 212, 0.4);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    z-index: 1;
}

.notfound__button:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 0 28px rgba(124, 58, 237, 0.6), 0 0 28px rgba(6, 182, 212, 0.6);
}
</style>