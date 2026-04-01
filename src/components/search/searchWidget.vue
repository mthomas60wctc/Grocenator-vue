<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "Search",
  },
});

const emit = defineEmits(["update:modelValue", "update:isOpen"]);

const isOpen = ref(false);
const localValue = ref(props.modelValue);

watch(
  () => props.modelValue,
  (nextValue) => {
    const normalized = nextValue ?? "";
    localValue.value = normalized;
    if (normalized.length > 0) {
      isOpen.value = true;
    }
  },
  { immediate: true }
);

watch(isOpen, (nextIsOpen) => {
  emit("update:isOpen", nextIsOpen);
});

function openSearch() {
  isOpen.value = true;
}

function closeSearch() {
  localValue.value = "";
  emit("update:modelValue", "");
  isOpen.value = false;
}

function onInput(value) {
  const normalized = value ?? "";
  localValue.value = normalized;
  emit("update:modelValue", normalized);
}
</script>

<template>
  <div class="search-widget" :class="{ 'search-widget--open': isOpen }">
    <transition name="search-swap" mode="out-in">
      <v-text-field
        v-if="isOpen"
        key="search-open"
        class="search-input"
        density="comfortable"
        variant="outlined"
        hide-details
        autofocus
        clearable
        clear-icon="mdi-backspace-outline"
        prepend-inner-icon="mdi-magnify"
        append-inner-icon="mdi-close"
        :model-value="localValue"
        :placeholder="placeholder"
        @update:model-value="onInput"
        @click:append-inner="closeSearch"
      />
      <v-btn
        v-else
        key="search-closed"
        icon="mdi-magnify"
        variant="text"
        size="small"
        @click="openSearch"
      />
    </transition>
  </div>
</template>

<style scoped>
.search-widget {
  width: auto;
  min-width: 40px;
}

.search-widget--open {
  width: 100%;
  min-width: 0;
}

.search-input {
  width: 100%;
}

.search-input :deep(.v-field__outline) {
  color: rgb(var(--v-theme-primary));
  opacity: 1;
}

.search-input :deep(.v-field--focused .v-field__outline) {
  color: rgb(var(--v-theme-primary));
  opacity: 1;
}

.search-swap-enter-active,
.search-swap-leave-active {
  transition: opacity 140ms ease;
}

.search-swap-enter-from,
.search-swap-leave-to {
  opacity: 0;
}
</style>
