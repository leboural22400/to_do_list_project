<script setup lang="js">
// Components and assets imports
import heroImg from '@/public/MyToDoListHero.png';
import Quote from '@/components/Quote/Quote.vue';

import Button from '@/components/Button.vue';

// For the demonstration
import { ref, computed } from 'vue';
import AuthService from '@/services/authService.js';

const props = defineProps({
    title: { type: String, default: 'MyToDoList' },
    subtitle: {
        type: String,
        default:
            'MyToDoList helps you organize tasks efficiently and stay productive.'
    },
    primaryText: { type: String, default: 'Get Started' },
    primaryPageLink: { type: String, default: '/to-do-list' },
    secondaryText: { type: String, default: 'Learn More' },
    secondaryPageLink: { type: String, default: '/about' },
    imageSrc: { type: String, default: heroImg },
    imageAlt: { type: String, default: 'To-Do List Hero Image' },
    showImage: { type: Boolean, default: true },
    badgeText: { type: String, default: 'New' },
    badgeLabel: { type: String, default: 'Announcing v1.0' }
})

// Authentication state
const isAuthenticated = computed(() => AuthService.isAuthenticated.value);
const user = computed(() => AuthService.user.value);

// Dynamic content based on auth state
const dynamicTitle = computed(() => {
    return isAuthenticated.value && user.value
        ? `Welcome back, ${user.value.firstName}!`
        : props.title;
});

const dynamicSubtitle = computed(() => {
    return isAuthenticated.value
        ? 'Ready to tackle your tasks? Let\'s get organized and stay productive!'
        : props.subtitle;
});

const dynamicPrimaryText = computed(() => {
    return isAuthenticated.value ? 'Go to Tasks' : 'Get Started';
});

const dynamicPrimaryLink = computed(() => {
    return isAuthenticated.value ? '/to-do-list' : '/account';
});

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
  <section
    class="relative flex overflow-clip m-10 min-h-dvh items-center align-middle justify-center gap-5 bg-(image:--gradient-for-home-page)"
    aria-label="Hero section"
  >
    <div class="max-w-6xl flex gap-5 !m-10 text-center max-md:flex-col">
      <aside class="flex flex-col gap-4">
        <header
          class="flex items-center gap-2 text-(--muted)"
          v-if="props.badgeText || props.badgeLabel"
        >
          <span
            class="bg-(--pill-bg) text-(--pill-fg) py-1 px-2 rounded-2xl font-semibold tracking-[0.2px]"
            >{{ props.badgeText }}</span
          >
          <span class="opacity-90">{{ props.badgeLabel }}</span>
        </header>

        <main class="lg:flex lg:flex-col lg:items-center gap-4">
          <p class="text-5xl font-extrabold tracking-tight">
            {{ dynamicTitle }}
          </p>
          <p
            class="text-lg text-(--muted) lg:overflow-hidden lg:whitespace-nowrap lg:border-r-[1px] lg:w-0 lg:max-w-[100%] lg:animate-(--typing-animation)"
          >
            {{ dynamicSubtitle }}
          </p>
        </main>

        <!-- Call to action buttons (Navigation to the primary pages) -->
        <footer
          class="flex justify-center flex-wrap gap-3 mt-1"
          role="group"
          aria-label="Hero actions"
        >
          <RouterLink
            :to="dynamicPrimaryLink"
            custom
            v-slot="{ href, navigate }"
          >
            <Button
              variant="secondary"
              :fill="true"
              :text="dynamicPrimaryText"
              @click.prevent="navigate()"
              :basicpadd="true"
              :paddx="true"
            ></Button>
          </RouterLink>
          <RouterLink to="/about" custom v-slot="{ href, navigate }">
            <Button
              variant="default"
              :text="props.secondaryText"
              @click.prevent="navigate()"
              :basicpadd="true"
              :paddx="true"
            ></Button>
          </RouterLink>
        </footer>

        <!-- Trust indicators -->
        <ul
          class="flex gap-2 flex-wrap mt-1 ps-0 text-(--muted) justify-center"
          aria-label="Highlights"
        >
          <li
            class="flex items-center gap-2 bg-(--chip) border-2 border-(--chip-border) py-2 px-3 rounded-full text-base"
          >
            <strong><i class="fa-solid fa-mouse-pointer"></i></strong>Easy to
            use
          </li>
          <li
            class="flex items-center gap-2 bg-(--chip) border-2 border-(--chip-border) py-2 px-3 rounded-full text-base"
          >
            <strong><i class="fas fa-shield-alt"></i></strong>Type-safe
          </li>
          <li
            class="flex items-center gap-2 bg-(--chip) border-2 border-(--chip-border) py-2 px-3 rounded-full text-base"
          >
            <strong><i class="fa-solid fa-universal-access"></i></strong
            >Accessible by default
          </li>
        </ul>
      </aside>

      <figure class="relative grid place-items-center" v-if="props.showImage">
        <img
          class="before:content-none before:absolute before:inset-[10%,-5%,-8%,-5%] before:blur-2xl before:z-0 before:animate-[float,6s,ease-in-out,infinite,alternate] relative z-[1] w-[100%] max-w-[640px] rounded-3xl shadow-[0,10px,30px,#00000033,0,2px,6px,#0000001f] border-2 border-(--border-strong) transform-[translateZ(0)] animate-[rise,500ms,ease,both]"
          :src="props.imageSrc"
          :alt="props.imageAlt"
          loading="eager"
          fetchpriority="high"
        />
        <figcaption class="hidden">{{ props.imageAlt }}</figcaption>
      </figure>
    </div>
  </section>

  <!-- Demonstration -->
  <section class="!pt-[2.5rem] !pb-[2.5rem] !mx-10" aria-label="Demo section">
    <div
      class="max-w-6xl my-0 mx-auto !px-5 pb-3 bg-(--surface-2) border-2 border-(--border) rounded-2xl shadow-[0,6px,24px,#00000014] grid gap-4 items-center"
    >
      <header class="pt-5">
        <h2
          class="!m-0 !text-[clamp(1.25rem,2.2vw,1.6rem)] !font-extrabold !tracking-tight"
        >
          Quick demonstration
        </h2>
        <p class="m-[0.25rem,0,0] text-(--muted) text-lg">
          Add, check, delete. Easy to use.
        </p>
      </header>

      <progress
        class="mt-1 h-5 w-full border-2 border-(--chip-border) rounded-2xl overflow-hidden [&::-webkit-progress-value]:rounded-lg [&::-webkit-progress-bar]:bg-(--chip) [&::-webkit-progress-value]:bg-[image:_var(--btn)]"
        max="100"
        :value="progress"
      >
        <span>{{ progress }}%</span>
      </progress>

      <form
        class="flex w-full gap-3 pt-3"
        @submit.prevent="addDemoTask"
        aria-label="Add a task"
      >
        <input
          class="flex-10 w-full rounded-2xl border-2 border-(--border) bg-(--surface) text-(--fg) py-0 px-4 text-xl"
          v-model="demoInput"
          type="text"
          placeholder="New task..."
          aria-label="New task"
        />
        <Button
          text="Add"
          variant="secondary"
          :fill="true"
          :basicpadd="true"
          :paddx="true"
        ></Button>
      </form>

      <ul class="list-none w-full m-0 pt-1 pb-2 px-0 grid gap-2">
        <li
          v-for="t in demoTasks"
          :key="t.id"
          class="flex justify-between w-full items-center gap-2 p-3 border-2 border-(--border) rounded-2xl bg-(--surface)"
        >
          <label class="!inline-flex gap-2.5 !items-center">
            <input
              class="w-4 h-4 accent-current"
              type="checkbox"
              :checked="t.done"
              @change="toggleDemoTask(t.id)"
            />
            <span
              :class="[
                'font-semibold mt-0.5',
                {
                  'text-(--muted) line-through decoration-2 decoration-(--border-strong)':
                    t.done,
                },
              ]"
              >{{ t.title }}</span
            >
          </label>
          <button
            class="border-2 border-(--border) bg-(--chip) !rounded-lg h-9 w-9 grid place-items-center cursor-pointer transition-[transform,120ms,ease,background-color,120ms,ease] !hover:translate-[translateY(-10px)] !active:translate-y-0"
            @click="removeDemoTask(t.id)"
            aria-label="Delete task"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </li>
      </ul>

      <footer
        class="flex gap-2 justify-end text-(--muted) text-base !p-[0rem,1.25rem,1.5rem,1.25rem]"
        aria-live="polite"
      >
        <span>{{ remaining }} remaining</span>
        <span>•</span>
        <span>{{ total }} in total</span>
      </footer>
    </div>
  </section>

  <!-- Quote component -->
  <section
    class="before:content-none before:absolute before:inset-0 before:bg-[image:radial-gradient(1200p,400px_at_50%,50%,,#6366f114,transparent,70%)] before:pointer-none !pt-[6rem] !pb-[6rem] px-0 !bg-(image:--quote-gradient) relative overflow-hidden"
    aria-label="User testimonial"
  >
    <div class="mx-auto max-w-5xl px-7 relative z-[1]">
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
