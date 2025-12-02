<template>
  <a
    :href="href"
    class="!text-(--info) !no-underline !text-sm transition-colors hover:!underline"
    >{{ text }}</a
  >
</template>

<script>
export default {
  props: ["href", "text"],
};
</script>
