<template>
  <div>
    <button
      class="flex w-full items-center !py-3 !px-6 !rounded-lg !no-underline font-bold border !bg-(--alert)/10 !text-(--alert) !border-(--alert)/30 hover:!bg-(--alert)/25 hover:!text-(--fg) transition-all"
      :class="{
        '!bg-(--alert)/100 !text-(--fg)': fill,
        '!px-0 !py-0': nopadd,
      }"
      type="submit"
      v-if="variant == 'alert'"
    >
      {{ text }}
      <slot name="body"></slot>
    </button>
    <button
      class="flex w-full justify-center items-center !py-3 !px-6 !rounded-lg !no-underline font-bold border !bg-(--secondary)/10 text-(--secondary) !border-(--secondary)/30 hover:!bg-(--secondary)/25 hover:!text-(--fg) transition-all"
      :class="{
        '!bg-(--secondary)/100 !text-(--fg)': fill,
        '!px-0 !py-0': nopadd,
      }"
      type="submit"
      v-else-if="variant == 'secondary'"
    >
      {{ text }}
      <slot name="body"></slot>
    </button>
    <button
      class="flex w-full items-center !py-3 !px-6 !rounded-lg !no-underline font-bold border !bg-(--default)/10 !text-(--default) !border-(--default)/30 hover:!bg-(--default)/25 hover:!text-(--fg) transition-all"
      :class="{
        '!bg-(--default)/100 !text-(--fg)': fill,
        '!px-0 !py-0': nopadd,
      }"
      type="submit"
      v-else
    >
      {{ text }}
      <slot name="body"></slot>
    </button>
  </div>
</template>

<script>
export default {
  props: ["text", "variant", "fill", "disabled", "customclass", "nopadd"],
};
</script>
