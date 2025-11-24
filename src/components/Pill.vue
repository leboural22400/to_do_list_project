<template>
  <span
    class="pill"
    :class="{
      high: priority == 'high',
      medium: priority == 'medium',
      low: priority == 'low',
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

<style lang="scss">
.pill {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  backdrop-filter: blur(10px);
}
.high {
  background: rgba(255, 86, 86, 0.3);
  border-color: rgba(255, 86, 86, 0.5);
  text-transform: uppercase;
  font-weight: 600;
}

.medium {
  background: rgba(255, 195, 0, 0.3);
  border-color: rgba(255, 195, 0, 0.5);
  text-transform: uppercase;
  font-weight: 600;
}

.low {
  background: rgba(0, 255, 170, 0.3);
  border-color: rgba(0, 255, 170, 0.5);
  text-transform: uppercase;
  font-weight: 600;
}
</style>
