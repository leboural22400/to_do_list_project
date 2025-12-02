<template>
  <section class="flex flex-col gap-2 w-full mb-4">
    <label for="select" class="!text-base font-semibold text-(--pill-fg)">{{
      textlabel
    }}</label>
    <select
      id="select"
      class="!py-3 !px-3 border-2 !rounded-lg border-(--border-strong) !bg-(--border-strong) text-(--fg) text-base disabled:!opacity-60 disabled:!cursor-not-allowed"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
    >
      <option
        v-for="option in optionsarray"
        :value="option[0]"
        class="bg-[#474755] !first-of-type:rounded-xl"
      >
        {{ option[1] }}
      </option>
    </select>
  </section>
</template>

<script>
export default {
  props: ["modelValue", "textlabel", "optionsarray"],
};
</script>
