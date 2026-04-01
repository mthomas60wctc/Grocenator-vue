<script setup>
const props = defineProps({
  tabs: {
    type: Array,
    required: true,
  },
  activeTab: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <v-window :model-value="activeTab">
    <v-window-item v-for="(label, index) in tabs" :key="index" :value="label">
      <slot :name="label"></slot>
    </v-window-item>
  </v-window>
</template>
