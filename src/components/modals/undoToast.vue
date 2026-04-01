<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  itemName: {
    type: String,
    default: "",
  },
  timeout: {
    type: Number,
    default: 6000,
  },
});

const emit = defineEmits(["update:modelValue", "undo"]);

function handleVisibility(nextValue) {
  emit("update:modelValue", nextValue);
}
</script>

<template>
  <v-snackbar
    :model-value="modelValue"
    :timeout="timeout"
    location="bottom"
    class="undo-toast"
    @update:model-value="handleVisibility"
  >
    {{ itemName ? `${itemName} deleted` : "Item deleted" }}

    <template #actions>
      <v-btn variant="text" color="primary" @click="emit('undo')">Undo</v-btn>
    </template>
  </v-snackbar>
</template>

<style scoped>
.undo-toast :deep(.v-snackbar__wrapper) {
  border: 1px solid rgb(var(--v-theme-error));
  background-color: rgb(var(--v-theme-error));
  color: rgb(var(--v-theme-on-error));
}

.undo-toast :deep(.v-btn) {
  color: rgb(var(--v-theme-on-error));
}
</style>
