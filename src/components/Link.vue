<template>
  <a :href="href" class="forgot-link">{{ text }}</a>
</template>

<script>
export default {
  props: ["href", "text"],
};
</script>

<style scoped lang="scss">
.forgot-link,
.terms-link {
  color: #00b4ff;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s ease;

  &:hover {
    color: #66d9ff;
    text-decoration: underline;
  }
}
</style>
