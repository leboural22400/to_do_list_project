<template>
  <section class="flex flex-col gap-2 w-full">
    <label
      for="input"
      class="!text-base font-semibold text-(--pill-fg)"
      v-if="textlabel != ''"
      >{{ textlabel }}</label
    >
    <input
      :type="typeinput"
      :disabled="disableinput"
      class="!py-3 !px-3 border-2 !rounded-lg border-(--border-strong) !bg-(--border-strong) text-(--fg) text-base disabled:!opacity-60 disabled:!cursor-not-allowed"
      :class="{ '!border-(--alert)': danger }"
      :id="textlabel"
      :required="required || false"
      :placeholder="placeholder"
      :minlength="minlength"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      @focus="focus"
      @blur="blur"
    />
  </section>
</template>

<script>
export default {
  props: [
    "textlabel",
    "typeinput",
    "modelValue",
    "minlength",
    "disableinput",
    "placeholder",
    "required",
    "focus",
    "blur",
    "danger",
  ],
  emits: ["update:modelValue"],
};
</script>
