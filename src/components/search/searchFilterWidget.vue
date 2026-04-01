<script setup>
import { ref, watch } from "vue";
import SearchWidget from "./searchWidget.vue";

const props = defineProps({
  chips: {
    type: Array,
    default: () => [],
  },
  selectedChips: {
    type: Array,
    default: () => [],
  },
  chipLabels: {
    type: Object,
    default: () => ({}),
  },
  searchTerm: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "Search",
  },
});

const emit = defineEmits(["update:selectedChips", "update:searchTerm"]);

const isSearchOpen = ref(false);
const localSearchTerm = ref(props.searchTerm);

watch(
  () => props.searchTerm,
  (next) => {
    localSearchTerm.value = next;
  }
);

function onSearchInput(value) {
  const normalizedValue = value ?? "";
  localSearchTerm.value = normalizedValue;
  emit("update:searchTerm", normalizedValue);
}

function handleSearchOpenChange(nextIsOpen) {
  isSearchOpen.value = nextIsOpen;
}

function updateChips(next) {
  emit("update:selectedChips", next);
}

function chipLabel(chip) {
  return props.chipLabels[chip] || chip;
}
</script>

<template>
  <div class="search-filter-widget">
    <div class="chip-row" :class="{ 'chip-row--search-open': isSearchOpen }">
      <search-widget
        class="widget-search-control"
        :model-value="localSearchTerm"
        :placeholder="placeholder"
        @update:model-value="onSearchInput"
        @update:is-open="handleSearchOpenChange"
      />
      <v-chip-group
        v-if="!isSearchOpen"
        filter
        multiple
        color="primary"
        :model-value="selectedChips"
        @update:model-value="updateChips"
      >
        <v-chip v-for="chip in chips" :key="chip" :value="chip" size="small" class="text-capitalize">
          {{ chipLabel(chip) }}
        </v-chip>
      </v-chip-group>
    </div>
  </div>
</template>

<style scoped>
.search-filter-widget {
  width: 100%;
}

.chip-row {
  width: 100%;
  min-height: 40px;
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: hidden;
}

.widget-search-control {
  flex: 0 0 auto;
  width: auto;
  min-width: 40px;
}

.chip-row--search-open .widget-search-control {
  flex: 1 1 auto;
  width: 100%;
}

.chip-row :deep(.v-chip-group) {
  flex: 1;
  overflow-x: auto;
  white-space: nowrap;
}

</style>
