<script setup>
import ListItem from "./listItem.vue";

const props = defineProps({
  list: {
    type: Array,
    required: true,
  },
  type: {
    type: String,
    default: "catalog",
  },
  selectedItem: {
    type: Object,
    default: null,
  },
  selectedLocations: {
    type: Array,
    default: () => [],
  },
  unitsByRef: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["remove-item", "select-item"]);

function itemKey(item, index) {
  if (item?.name) {
    return item.name;
  }
  return String(index);
}
</script>

<template>
  <v-list class="my-3" lines="two">
    <v-fade-transition group tag="div" class="list-transition-group">
      <div
        v-for="(item, index) in list"
        :key="itemKey(item, index)"
        class="list-transition-item"
      >
        <list-item
          :item="item"
          :type="type"
          :selected-locations="selectedLocations"
          :units-by-ref="unitsByRef"
          :is-selected="selectedItem === item"
          @remove-item="emit('remove-item', $event)"
          @select-item="emit('select-item', $event)"
        ></list-item>
      </div>
    </v-fade-transition>
  </v-list>
</template>

<style scoped>
.list-transition-group {
  display: block;
}

.list-transition-item {
  display: block;
}

.fade-transition-move {
  transition: transform 220ms cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
