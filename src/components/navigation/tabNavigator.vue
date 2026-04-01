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
});

const openedGroups = ref([]);

const emit = defineEmits(["change-tab", "subcategory-select"]);
const formatLabel = (label) => label.charAt(0).toUpperCase() + label.slice(1);

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
            :title="formatLabel(groupName)"
            :class="{ 'group-selected': props.activeTab === groupName }"
            :active="props.activeTab === groupName"
            @click="onGroupActivatorClick($event, groupName, activatorProps)"
          ></v-list-item>
        </template>

        <v-list-item
          v-for="(subCategory, index) in items"
          nav
          :key="`${groupName}-${index}`"
          :title="formatLabel(subCategory)"
          @click="selectSubcategory(subCategory, groupName)"
        ></v-list-item>
      </v-list-group>

      <v-list-item
        v-else
        :title="formatLabel(groupName)"
        :class="{ 'group-selected': props.activeTab === groupName }"
        :active="props.activeTab === groupName"
        @click="selectItem(groupName)"
      ></v-list-item>
    </template>
  </v-list>
</template>

<style scoped>
.group-selected {
  background-color: rgba(var(--v-theme-primary), 0.12);
  color: rgb(var(--v-theme-primary));
}
</style>
