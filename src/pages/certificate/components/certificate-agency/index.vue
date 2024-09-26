<template>
  <div class="certificate-agency">
    <img v-if="props.agency === 'letsencrypt'" class="cert-agency" src="@/assets/brand/letsencrypt.png" />
    <img v-if="props.agency === 'zerossl'" class="cert-agency" src="@/assets/brand/zerossl.png" />
    <img v-if="props.agency === 'google'" class="cert-agency" src="@/assets/brand/google.png" />
  </div>
</template>
<script setup lang="ts">
const props = defineProps({
  agency: String,
});
</script>
<style lang="less" scoped>
.cert-agency {
  height: 30px;
}
</style>
