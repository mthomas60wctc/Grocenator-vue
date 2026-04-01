<script setup>
import ItemDetailFullscreen from "../fullscreen/itemDetailFullscreen.vue";
import ItemDetailCard from "./itemDetailCard.vue";

const props = defineProps({
  item: {
    type: Object,
    default: null,
  },
  isMobile: {
    type: Boolean,
    required: true,
  },
  locationLabels: {
    type: Object,
    default: () => ({}),
  },
  unitsByRef: {
    type: Object,
    default: () => ({}),
  },
  inventoryLocations: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["close", "action", "save", "move"]);

function handleClose() {
  emit("close");
}

function handleAction(action) {
  emit("action", action);
}

function handleSave(payload) {
  emit("save", payload);
}

function handleMove(payload) {
  emit("move", payload);
}
</script>

<template>
  <div v-if="item">
    <ItemDetailFullscreen
      v-if="isMobile"
      :item="item"
      :location-labels="locationLabels"
      :units-by-ref="unitsByRef"
      :inventory-locations="inventoryLocations"
      @close="handleClose"
      @action="handleAction"
      @save="handleSave"
      @move="handleMove"
    />
    <ItemDetailCard
      v-else
      :item="item"
      :location-labels="locationLabels"
      :units-by-ref="unitsByRef"
      @action="handleAction"
    />
  </div>
</template>
