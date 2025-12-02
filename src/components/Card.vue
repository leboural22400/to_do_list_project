<template>
  <section
    class="flex flex-col items-center bg-(--page-bg) rounded-2xl !overflow-hidden border-2 border-(--border-strong) backdrop-blur-md"
    :class="{ '!border-(--alert)/10': danger }"
  >
    <header
      class="w-full !py-6 !px-8 bg-(--surface) border-b-2 border-b-(--border) flex !justify-between text-center items-center"
      :class="{ '!bg-(--alert)/15 !border-(--alert)/10': danger }"
      v-if="header"
    >
      <slot name="header"></slot>
    </header>
    <main class="!p-8 w-full bg-(--page-bg)" :class="custommainclass">
      <slot name="main"></slot>
    </main>
    <footer
      class="w-full !py-6 !px-8 border-t-2 bg-(--surface) border-t-(--border)"
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
