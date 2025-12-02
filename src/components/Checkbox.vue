<template>
  <label class="checkbox-label">
    <input
      id="checkbox"
      type="checkbox"
      :disabled="disableInput"
      :checked="modelValue === 2 || modelValue === true"
      :indeterminate="modelValue === 1"
      @input="
        $emit(
          'update:modelValue',
          typeof modelValue == 'boolean'
            ? $event.target.checked
            : modelValue < 2
            ? modelValue + 1
            : 0
        )
      "
    />
    <span class="checkmark" :class="customclass" />
    {{ label }}
  </label>
</template>

<script>
export default {
  props: ["modelValue", "disableInput", "label", "customclass"],
  emits: ["update:modelValue"],
};
</script>

<style scoped lang="scss">
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #a8b3d4;
  font-size: 14px;
  cursor: pointer;

  input[type="checkbox"] {
    display: none;
  }

  .checkmark {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    position: relative;
    transition: all 0.3s ease;

    &::before {
      content: "";
      position: absolute;
      left: 5px;
      top: 2px;
      width: 10px;
      height: 9px;
      border: solid var(--secondary);
      border-width: 0 0px 2px 0;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    &::after {
      content: "";
      position: absolute;
      left: 5px;
      top: 2px;
      width: 4px;
      height: 8px;
      border: solid var(--secondary);
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
      opacity: 0;
      transition: opacity 0.3s ease;
    }
  }

  input:checked + .checkmark {
    background: rgba(var(--secondary), 0.2);
    border-color: var(--secondary);

    &::after {
      opacity: 1;
    }
  }

  input:indeterminate + .checkmark {
    display: block;
    background: rgba(var(--secondary), 0.2);
    border-color: var(--secondary);

    &::before {
      opacity: 1;
    }
  }
}
</style>
