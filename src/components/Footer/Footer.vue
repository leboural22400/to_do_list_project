<script setup lang="js">
// Get the current year for the copyright
const year = new Date().getFullYear();
</script>

<template>
  <!-- The links will be added later -->
  <footer
    class="items-center relative !pt-10 px-0 pb-2 bg-(--surface) border-t border-t-(--border-strong) text-xs/[1.6]"
    aria-label="Footer"
  >
    <nav class="max-w-6xl mx-auto px-6 flex justify-around">
      <section>
        <h3
          class="!text-[0.85rem] !font-normal tracking-[0.1px] !text-(--fg) mb-2.5"
        >
          Product
        </h3>
        <ul class="!flex flex-col gap-2 mt-2 mx-0 mb-0 p-0 list-none">
          <li>
            <RouterLink
              to="/to-do-list"
              class="!no-underline !text-(--muted) border-b border-dashed border-transparent transition-colors hover:!text-(--fg) hover:border-(--link-hover) hover:transform-[translateY(-1px)]"
              >All tasks</RouterLink
            >
          </li>
          <li>
            <RouterLink
              to="/to-do-list?view=today"
              class="!no-underline !text-(--muted) border-b border-dashed border-transparent transition-colors hover:!text-(--fg) hover:border-(--link-hover) hover:transform-[translateY(-1px)]"
              >Today</RouterLink
            >
          </li>
          <li>
            <RouterLink
              to="/to-do-list?view=completed"
              class="!no-underline !text-(--muted) border-b border-dashed border-transparent transition-colors hover:!text-(--fg) hover:border-(--link-hover) hover:transform-[translateY(-1px)]"
              >Completed</RouterLink
            >
          </li>
          <li>
            <RouterLink
              to="/to-do-list?view=calendar"
              class="!no-underline !text-(--muted) border-b border-dashed border-transparent transition-colors hover:!text-(--fg) hover:border-(--link-hover) hover:transform-[translateY(-1px)]"
              >Calendar view</RouterLink
            >
          </li>
        </ul>
      </section>

      <section>
        <h3
          class="!text-[0.85rem] !font-normal tracking-[0.1px] !text-(--fg) mb-2.5"
        >
          App
        </h3>
        <ul class="!flex flex-col gap-2 mt-2 mx-0 mb-0 p-0 list-none">
          <li>
            <RouterLink
              to="/about"
              class="!no-underline !text-(--muted) border-b border-dashed border-transparent transition-colors hover:!text-(--fg) hover:border-(--link-hover) hover:transform-[translateY(-1px)]"
              >About</RouterLink
            >
          </li>
          <li>
            <a
              href="#"
              aria-disabled="true"
              class="!no-underline !text-(--muted) border-b border-dashed border-transparent cursor-not-allowed opacity-70"
              >Pricing</a
            >
          </li>
          <li>
            <a
              href="#"
              aria-disabled="true"
              class="!no-underline !text-(--muted) border-b border-dashed border-transparent cursor-not-allowed opacity-70"
              >Roadmap</a
            >
          </li>
          <li>
            <a
              href="#"
              aria-disabled="true"
              class="!no-underline !text-(--muted) border-b border-dashed border-transparent cursor-not-allowed opacity-70"
              >Changelog</a
            >
          </li>
        </ul>
      </section>

      <section>
        <h3
          class="!text-[0.85rem] !font-normal tracking-[0.1px] !text-(--fg) mb-2.5"
        >
          Social
        </h3>
        <ul class="!flex flex-col gap-2 mt-2 mx-0 mb-0 p-0 list-none">
          <li>
            <a
              href="#"
              aria-disabled="true"
              class="!no-underline !text-(--muted) border-b border-dashed border-transparent cursor-not-allowed opacity-70"
              >Blog</a
            >
          </li>
          <li>
            <a
              href="#"
              aria-disabled="true"
              class="!no-underline !text-(--muted) border-b border-dashed border-transparent cursor-not-allowed opacity-70"
              >Twitter</a
            >
          </li>
          <li>
            <a
              href="#"
              aria-disabled="true"
              class="!no-underline !text-(--muted) border-b border-dashed border-transparent cursor-not-allowed opacity-70"
              >GitHub</a
            >
          </li>
        </ul>
      </section>
    </nav>
    <div class="flex justify-center w-full">
      <div
        class="!mt-10 !pt-6 w-6xl border-t flex border-dashed border-(--border) gap-1.5 text-center"
      ></div>
    </div>
  </footer>
</template>
