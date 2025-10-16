<script setup lang="js">
// Components and assets imports
import Masonry from '@/components/Masonry/Masonry.vue';
import heroImg from '@/components/icons/MyToDoListHero.png';
import Quote from '@/components/Quote/Quote.vue';

// Pages imports
import ToDoListHome from './ToDoListHome.vue';
import About from './About.vue';

// For the demonstration
import { ref, computed } from 'vue';

const props = defineProps({
    title: { type: String, default: 'MyToDoList' },
    subtitle: {
        type: String,
        default:
            'MyToDoList helps you organize tasks efficiently and stay productive.'
    },
    primaryText: { type: String, default: 'Get Started' },
    primaryPageLink: { type: String, default: ToDoListHome },
    secondaryText: { type: String, default: 'Learn More' },
    secondaryPageLink: { type: String, default: About },
    imageSrc: { type: String, default: heroImg },
    imageAlt: { type: String, default: 'To-Do List Hero Image' },
    showImage: { type: Boolean, default: true },
    badgeText: { type: String, default: 'New' },
    badgeLabel: { type: String, default: 'Announcing v1.0' }
})

// Items for the Masonry component (images)
const items = [
    // { id, src, alt, text, width, height }
    {
        id: 't1',
        src: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1470&auto=format&fit=crop',
        alt: 'People collaborating at a desk',
        text: 'Collaboration',
        width: 800,
        height: 500
    },
    {
        id: 't2',
        src: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=1470&auto=format&fit=crop',
        alt: 'Planner with pen and coffee',
        text: 'Planning',
        width: 800,
        height: 420
    },
    {
        id: 't3',
        src: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1470&auto=format&fit=crop',
        alt: 'Concentrated',
        text: 'Focus',
        width: 800,
        height: 380
    },
    {
        id: 't4',
        src: 'https://images.unsplash.com/photo-1692158962119-8103c7d78c86?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        alt: 'Journal with sticky notes',
        text: 'Tasks',
        width: 800,
        height: 460
    },
    {
        id: 't5',
        src: 'https://images.unsplash.com/photo-1502945015378-0e284ca1a5be?q=80&w=1470&auto=format&fit=crop',
        alt: 'Steps going upwards',
        text: 'Progress',
        width: 800,
        height: 390
    },
    {
        id: 't6',
        src: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1470&auto=format&fit=crop',
        alt: 'Brainstorming session',
        text: 'Ideas',
        width: 800,
        height: 410
    },
    {
        id: 't7',
        src: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        alt: 'Feeling accomplished',
        text: 'Completion',
        width: 800,
        height: 370
    },
    {
        id: 't8',
        src: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=1470&auto=format&fit=crop',
        alt: 'Happy person celebrating success',
        text: 'Motivation',
        width: 800,
        height: 480
    },
    {
        id: 't9',
        src: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1470&auto=format&fit=crop',
        alt: 'Coworkers in a meeting',
        text: 'Teamwork',
        width: 800,
        height: 400
    },
    {
        id: 't10',
        src: 'https://images.unsplash.com/photo-1555212697-194d092e3b8f?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        alt: 'Get shit done',
        text: 'Productivity',
        width: 800,
        height: 900
    },
    {
        id: 't11',
        src: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?q=80&w=1039&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        alt: 'Person writing in notebook',
        text: 'scheduling',
        width: 800,
        height: 430
    }
];

// Unique id for every task
let uid = 0;

const demoInput = ref('');

const demoTasks = ref([
    { id: ++uid, title: 'Create a task', done: true },
    { id: ++uid, title: 'Check / uncheck', done: false },
    { id: ++uid, title: 'Delete with one click', done: false }
]);

const remaining = computed(() => demoTasks.value.filter(t => !t.done).length);
const total = computed(() => demoTasks.value.length);
// 0 because we can't divide by zero
const progress = computed(() => total.value ? Math.round((total.value - remaining.value) / total.value * 100) : 0);

function addDemoTask() {
    const t = demoInput.value.trim();
    // If empty, do nothing
    if (!t) return;
    demoTasks.value.unshift({ id: ++uid, title: t, done: false });
    // Clear input
    demoInput.value = '';
}

function toggleDemoTask(id) {
    const t = demoTasks.value.find(x => x.id === id);
    if (t) t.done = !t.done;
}

function removeDemoTask(id) {
    demoTasks.value = demoTasks.value.filter(t => t.id !== id);
}

// Quote props
const quoteProps = {
    quote: "With MyToDoList, I organize my daily tasks effortlessly and stay productive every day.",
    author: "John Doe",
    authorImg: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=facearea&w=128&h=128&facepad=2",
    authorAlt: "profile picture",
    authorStatus: "MyToDoList user",
    variant: "elevated",
    accent: "emerald"
};
</script>

<template>
    <!-- Hero section (for the main call to action) -->
    <section class="hero" aria-label="Hero section">
        <div class="hero__bg" aria-hidden="true">
            <div class="blob blob--1"></div>
            <div class="blob blob--2"></div>
            <div class="grid"></div>
        </div>

        <div class="container">
            <div class="content">
                <div class="eyebrow" v-if="props.badgeText || props.badgeLabel">
                    <span class="pill">{{ props.badgeText }}</span>
                    <span class="eyebrow__label">{{ props.badgeLabel }}</span>
                </div>

                <div class="typewriter">
                    <h1 class="title">{{ props.title }}</h1>
                    <p class="subtitle">{{ props.subtitle }}</p>
                </div>

                <!-- Call to action buttons (Navigation to the primary pages) -->
                <div class="actions" role="group" aria-label="Hero actions">
                    <RouterLink to="/to-do-list-home" custom v-slot="{ href, navigate }">
                        <a class="btn btn--primary" :href="href" @click.prevent="navigate()">{{ props.primaryText }}</a>
                    </RouterLink>
                    <RouterLink to="/about" custom v-slot="{ href, navigate }">
                        <a class="btn btn--ghost" :href="href" @click.prevent="navigate()">{{ props.secondaryText }}</a>
                    </RouterLink>
                </div>

                <!-- Trust indicators (we won't eat you) -->
                <ul class="trust" aria-label="Highlights">
                    <li><strong><i class="fa-solid fa-mouse-pointer"></i></strong>Easy to use</li>
                    <li><strong><i class="fas fa-shield-alt"></i></strong>Type-safe</li>
                    <li><strong><i class="fa-solid fa-universal-access"></i></strong>Accessible by default</li>
                </ul>
            </div>

            <figure class="visual" v-if="props.showImage">
                <img class="visual__img" :src="props.imageSrc" :alt="props.imageAlt" loading="eager"
                    fetchpriority="high" />
                <figcaption class="sr-only">{{ props.imageAlt }}</figcaption>
            </figure>
        </div>
    </section>

    <!-- Masonry section (for the images grid) -->
    <section>
        <Masonry :items="items" ease="power3.out" :duration="0.6" :stagger="0.05" animateFrom="bottom"
            :scaleOnHover="true" :hoverScale="0.95" :blurToFocus="true" :colorShiftOnHover="false" />
    </section>

    <!-- Demonstration -->
    <section class="demo" aria-label="Demo section">
        <div class="demo__wrap">
            <header class="demo__head">
                <h2>Quick demonstration</h2>
                <p class="demo__sub">Add, check, delete. Easy to use.</p>
            </header>

            <div class="demo__bar" :aria-valuenow="progress" aria-valuemin="0" aria-valuemax="100" role="progressbar">
                <div class="demo__bar-fill" :style="{ width: progress + '%' }"></div>
                <span class="demo__bar-label">{{ progress }}%</span>
            </div>

            <form class="demo__form" @submit.prevent="addDemoTask" aria-label="Add a task">
                <input class="demo__input" v-model="demoInput" type="text" placeholder="New task..."
                    aria-label="New task" />
                <button class="btn btn--primary demo__add" type="submit">Add</button>
            </form>

            <ul class="demo__list">
                <li v-for="t in demoTasks" :key="t.id" class="demo__item">
                    <label class="demo__check">
                        <input type="checkbox" :checked="t.done" @change="toggleDemoTask(t.id)" />
                        <span :class="['demo__title', { 'is-done': t.done }]">{{ t.title }}</span>
                    </label>
                    <button class="demo__remove" @click="removeDemoTask(t.id)" aria-label="Delete task">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </li>
            </ul>

            <div class="demo__foot" aria-live="polite">
                <span>{{ remaining }} remaining</span>
                <span>•</span>
                <span>{{ total }} in total</span>
            </div>
        </div>
    </section>

    <!-- Quote component -->
    <section class="quote-section" aria-label="User testimonial">
        <div class="quote-container">
            <Quote 
                :quote="quoteProps.quote"
                :author="quoteProps.author"
                :author-img="quoteProps.authorImg"
                :author-alt="quoteProps.authorAlt"
                :author-status="quoteProps.authorStatus"
                size="lg"
                :glow="true"
            />
        </div>
    </section>
</template>

<style scoped lang="scss">
/* Layout tokens */
$max-w: 1200px;
$pad-x: clamp(1rem, 4vw, 2rem);

// Has to be scoped to avoid conflicts with other pages
.hero {
    position: relative;
    overflow: clip;
    isolation: isolate;
    padding: clamp(3rem, 6vw, 6rem) 0;
    min-height: calc(100dvh - var(--nav-h, 0px));
    display: grid;
    align-items: center;

    &__bg {
        position: absolute;
        inset: 0;
        z-index: -1;
        background:
            radial-gradient(1200px 600px at 10% -10%, rgba(99, 102, 241, 0.25), transparent 60%),
            radial-gradient(1000px 500px at 110% 10%, rgba(16, 185, 129, 0.25), transparent 55%),
            linear-gradient(to bottom, var(--surface), var(--surface-2));
    }
}

.container {
    margin-inline: auto;
    max-width: $max-w;
    padding-inline: $pad-x;
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
    align-items: center;

    @media (min-width: 900px) {
        grid-template-columns: 1.05fr 0.95fr;
        gap: 3rem;
    }
}

.content {
    display: grid;
    gap: 1.25rem;
}

.eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.95rem;
    color: var(--muted);

    .pill {
        background: var(--pill-bg);
        color: var(--pill-fg);
        padding: 0.25rem 0.6rem;
        border-radius: 999px;
        font-weight: 600;
        letter-spacing: 0.2px;
    }

    &__label {
        opacity: 0.9;
    }
}

.title {
    font-size: clamp(2rem, 4vw, 3.25rem);
    line-height: 1.1;
    font-weight: 800;
    letter-spacing: -0.02em;
}

.subtitle {
    font-size: clamp(1rem, 1.4vw, 1.125rem);
    color: var(--muted);
    max-width: 60ch;
}

// Only show the typewriter effect on larger screens
@media screen and (min-width: 900px) {
    .typewriter {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.25rem;
    }

    .typewriter .title {
        margin: 0;
    }

    .typewriter .subtitle {
        margin: 0;
        overflow: hidden;
        white-space: nowrap;
        border-right: 1px solid;
        width: 0;
        max-width: 100%;
        animation: typing 3.5s steps(40, end) 0.5s forwards, blink-caret 0.75s step-end infinite 0.5s;
    }

    @keyframes typing {
        from {
            width: 0;
        }

        to {
            width: 100%;
        }
    }

    @keyframes blink-caret {

        from,
        to {
            border-color: transparent;
        }

        50% {
            border-color: var(--fg);
        }
    }
}

.actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-top: 0.25rem;
}

.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 2.75rem;
    padding: 0 1.1rem;
    border-radius: 0.9rem;
    font-weight: 700;
    letter-spacing: 0.2px;
    text-decoration: none;
    border: 1px solid transparent;
    transition: transform 120ms ease, box-shadow 120ms ease, background-color 120ms ease, border-color 120ms ease;

    &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 3px var(--focus);
    }

    &--primary {
        background: var(--btn);
        color: var(--btn-fg);
        border-color: var(--btn-border);

        &:hover {
            transform: translateY(-1px);
        }

        &:active {
            transform: translateY(0);
        }
    }

    &--ghost {
        background: transparent;
        color: var(--fg);
        border-color: var(--border);

        &:hover {
            background: var(--ghost-hover);
        }
    }
}

.trust {
    display: flex;
    gap: 1rem 1.25rem;
    flex-wrap: wrap;
    margin-top: 0.25rem;
    color: var(--muted);

    li {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        background: var(--chip);
        border: 1px solid var(--chip-border);
        padding: 0.4rem 0.65rem;
        border-radius: 999px;
        font-size: 0.95rem;

        strong {
            font-weight: 700;
        }
    }
}

.visual {
    position: relative;
    display: grid;
    place-items: center;

    &::before {
        content: "";
        position: absolute;
        inset: 10% -5% -8% -5%;
        filter: blur(40px);
        background: radial-gradient(60% 60% at 50% 40%, rgba(99, 102, 241, 0.45), transparent 60%);
        z-index: 0;
        animation: float 6s ease-in-out infinite alternate;
    }

    &__img {
        position: relative;
        z-index: 1;
        width: 100%;
        max-width: 640px;
        border-radius: 1.25rem;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.20), 0 2px 6px rgba(0, 0, 0, 0.12);
        border: 1px solid var(--border-strong);
        transform: translateZ(0);
        animation: rise 500ms ease both;
    }
}

/* Decorative background bits */
.blob {
    position: absolute;
    width: 38vmax;
    height: 38vmax;
    filter: blur(60px);
    opacity: 0.4;
    border-radius: 50%;
    mix-blend-mode: multiply;
    pointer-events: none;

    &--1 {
        left: -12vmax;
        top: -10vmax;
        background: #6366f1;
    }

    &--2 {
        right: -10vmax;
        bottom: -14vmax;
        background: #10b981;
    }
}

.grid {
    position: absolute;
    inset: 0;
    background-image: linear-gradient(var(--grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--grid-color) 1px, transparent 1px);
    background-size: 40px 40px;
    mask-image: radial-gradient(1200px 600px at 50% 0%, #000 40%, transparent 70%);
    opacity: 0.35;
}

/* a11y */
.sr-only {
    position: absolute !important;
    height: 1px;
    width: 1px;
    overflow: hidden;
    clip: rect(1px, 1px, 1px, 1px);
    white-space: nowrap;
    border: 0;
    padding: 0;
    margin: -1px;
}

/* Animations */
@keyframes rise {
    from {
        transform: translateY(8px);
        opacity: 0
    }

    to {
        transform: translateY(0);
        opacity: 1
    }
}

@keyframes float {
    from {
        transform: translateY(0)
    }

    to {
        transform: translateY(-8px)
    }
}

/* Demo animations */
.demo {
    padding: clamp(2rem, 4vw, 3rem) 0;

    .demo__wrap {
        max-width: $max-w;
        margin: 0 auto;
        padding-inline: $pad-x;
        background: var(--surface-2);
        border: 1px solid var(--border);
        border-radius: 1.25rem;
        box-shadow: 0 6px 24px rgba(0, 0, 0, .08);
        display: grid;
        gap: 1rem;
    }

    .demo__head {
        padding: 1.25rem 1.25rem 0 1.25rem;

        h2 {
            margin: 0;
            font-size: clamp(1.25rem, 2.2vw, 1.6rem);
            font-weight: 800;
            letter-spacing: -.02em;
        }

        .demo__sub {
            margin: .25rem 0 0;
            color: var(--muted);
            font-size: .98rem;
        }
    }

    .demo__bar {
        position: relative;
        margin: .25rem 1.25rem 0;
        height: 10px;
        background: var(--chip);
        border: 1px solid var(--chip-border);
        border-radius: 999px;
        overflow: clip;
    }

    .demo__bar-fill {
        height: 100%;
        background: var(--btn);
        transition: width 200ms ease;
    }

    .demo__bar-label {
        position: absolute;
        right: .5rem;
        top: -1.6rem;
        font-size: .85rem;
        color: var(--muted);
    }

    .demo__form {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: .75rem;
        padding: .75rem 1.25rem 0 1.25rem;
    }

    .demo__input {
        height: 2.75rem;
        border-radius: .9rem;
        border: 1px solid var(--border);
        background: var(--surface);
        color: var(--fg);
        padding: 0 .9rem;
        font-size: 1rem;

        &:focus {
            outline: none;
            box-shadow: 0 0 0 3px var(--focus);
        }
    }

    .demo__add {
        height: 2.75rem;
    }

    .demo__list {
        list-style: none;
        margin: 0;
        padding: .25rem 1.25rem 0 1.25rem;
        display: grid;
        gap: .5rem;
    }

    .demo__item {
        display: grid;
        grid-template-columns: 1fr auto;
        align-items: center;
        gap: .5rem;
        padding: .6rem .6rem;
        border: 1px solid var(--border);
        border-radius: .9rem;
        background: var(--surface);
    }

    .demo__check {
        display: inline-flex;
        align-items: center;
        gap: .6rem;

        input[type="checkbox"] {
            width: 1.1rem;
            height: 1.1rem;
            accent-color: currentColor;
        }
    }

    .demo__title {
        font-weight: 600;

        &.is-done {
            color: var(--muted);
            text-decoration: line-through;
            text-decoration-thickness: 2px;
            text-decoration-color: var(--border-strong);
        }
    }

    .demo__remove {
        border: 1px solid var(--border);
        background: var(--chip);
        border-radius: .65rem;
        height: 2.2rem;
        width: 2.2rem;
        display: grid;
        place-items: center;
        cursor: pointer;
        transition: transform 120ms ease, background-color 120ms ease;

        &:hover {
            transform: translateY(-1px);
        }

        &:active {
            transform: translateY(0);
        }
    }

    .demo__foot {
        display: flex;
        gap: .5rem;
        justify-content: flex-end;
        color: var(--muted);
        font-size: .95rem;
        padding: .25rem 1.25rem 1.1rem 1.25rem;
    }
}

/* Quote section */
.quote-section {
    padding: clamp(4rem, 8vw, 8rem) 0;
    background: linear-gradient(
        135deg,
        var(--surface) 0%,
        var(--surface-2) 50%,
        var(--surface) 100%
    );
    position: relative;
    overflow: hidden;

    &::before {
        content: "";
        position: absolute;
        inset: 0;
        background: radial-gradient(
            1200px 400px at 50% 50%,
            rgba(99, 102, 241, 0.08),
            transparent 70%
        );
        pointer-events: none;
    }
}

.quote-container {
    margin-inline: auto;
    max-width: $max-w;
    padding-inline: $pad-x;
    position: relative;
    z-index: 1;
}
</style>