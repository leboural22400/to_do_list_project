<template>
  <section
    class="flex flex-col items-center bg-(--surface-2) rounded-2xl border-2 border-(--border) backdrop-blur-md"
    :class="{ '!bg-(--alert)/5 !border-(--alert)/20': danger }"
  >
    <header
      class="w-full !py-6 !px-8 border-b-2 border-b-(--border) flex !justify-between"
      v-if="header"
    >
      <slot name="header"></slot>
    </header>
    <main class="!p-8 w-full" :class="custommainclass">
      <slot name="main"></slot>
    </main>
    <footer
      class="w-full !py-6 !px-8 border-t-2 border-t-(--border)"
      v-if="footer"
    >
      <slot name="footer"></slot>
    </footer>
  </section>
</template>

<script>
export default {
  props: [
    "headerhtml",
    "mainhtml",
    "danger",
    "header",
    "footer",
    "custommainclass",
  ],
};
</script>
