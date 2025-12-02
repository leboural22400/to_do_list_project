<template>
  <span
    class="py-1 px-3 rounded-2xl text-sm bg-black/10 border border-black/10 text-(--fg) backdrop-blur-md"
    :class="{
      '!bg-(--alert)/30 !border-(--alert)/30 !font-semibold uppercase':
        priority == 'high',
      '!bg-(--warning)/30 !border-(--warning)/30 !font-semibold uppercase':
        priority == 'medium',
      '!bg-(--success)/30 !border-(--success)/30 !font-semibold uppercase':
        priority == 'low',
      '!bg-(--secondary)/30 !border-(--secondary)/50': color == 'secondary',
    }"
  >
    {{ text }}
    <slot name="body"></slot>
  </span>
</template>

<script>
export default {
  props: ["priority", "text", "color"],
};
</script>
