<script setup>
import { ref } from "vue";

const props = defineProps({
  activeTab: {
    type: String,
    required: true,
  },
  categories: {
    type: Object,
    required: true,
  },
  sectionCounts: {
    type: Object,
    default: () => ({}),
  },
});

const openedGroups = ref([]);

const emit = defineEmits(["change-tab", "subcategory-select"]);
const formatLabel = (label) => label.charAt(0).toUpperCase() + label.slice(1);
const countFor = (label) => Number(props.sectionCounts?.[label] || 0);

const selectItem = (label) => {
  openedGroups.value = [];
  emit("change-tab", label);
};

const selectGroup = (groupName) => {
  emit("change-tab", groupName);
};

const onGroupActivatorClick = (event, groupName, activatorProps) => {
  activatorProps?.onClick?.(event);
  selectGroup(groupName);
};

const selectSubcategory = (subcategory, categoryName) => {
  openedGroups.value = [categoryName];
  emit("change-tab", categoryName);
  emit("subcategory-select", subcategory);
};
</script>

<template>
  <v-list v-model:opened="openedGroups" class="tab-navigator" open-strategy="single" density="compact">
    <v-list-subheader>SELECTIONS</v-list-subheader>
    <template v-for="(items, groupName) in categories" :key="groupName">
      <v-list-group v-if="items.length > 0" :value="groupName">
        <template #activator="{ props: activatorProps }">
          <v-list-item
            v-bind="activatorProps"
            class="group-activator-item"
            :class="{ 'group-selected': props.activeTab === groupName }"
            :active="props.activeTab === groupName"
            @click="onGroupActivatorClick($event, groupName, activatorProps)"
          >
            <div class="nav-item-content">
              <v-list-item-title>{{ formatLabel(groupName) }}</v-list-item-title>
            </div>
            <v-chip class="group-count-badge" size="x-small" variant="tonal" color="primary">{{ countFor(groupName) }}</v-chip>
          </v-list-item>
        </template>

        <v-list-item
          v-for="(subCategory, index) in items"
          nav
          :key="`${groupName}-${index}`"
          @click="selectSubcategory(subCategory, groupName)"
        >
          <v-list-item-title>{{ formatLabel(subCategory) }}</v-list-item-title>
          <template #append>
            <v-chip size="x-small" variant="tonal" color="primary">{{ countFor(subCategory) }}</v-chip>
          </template>
        </v-list-item>
      </v-list-group>

      <v-list-item
        v-else
        :class="{ 'group-selected': props.activeTab === groupName }"
        :active="props.activeTab === groupName"
        @click="selectItem(groupName)"
      >
        <v-list-item-title>{{ formatLabel(groupName) }}</v-list-item-title>
        <template #append>
          <v-chip size="x-small" variant="tonal" color="primary">{{ countFor(groupName) }}</v-chip>
        </template>
      </v-list-item>
    </template>
  </v-list>
</template>

<style scoped>
.group-selected {
  background-color: rgba(var(--v-theme-primary), 0.12);
  color: rgb(var(--v-theme-primary));
}

.nav-item-content {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
}

.tab-navigator :deep(.v-list-group__header .v-list-item__content) {
  padding-inline-end: 0;
}

.tab-navigator :deep(.v-list-group__header .v-list-item__append) {
  margin-inline-start: 4px;
}

.group-activator-item {
  position: relative;
}

.group-count-badge {
  position: absolute;
  inset-inline-end: 40px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}
</style>
