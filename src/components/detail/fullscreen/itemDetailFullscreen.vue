<script setup>
import { ref, watch } from "vue";
import ItemDetailFullscreenView from "./itemDetailFullscreenView.vue";
import ItemDetailFullscreenEdit from "./itemDetailFullscreenEdit.vue";
import ItemDetailFullscreenSwap from "./itemDetailFullscreenSwap.vue";

const props = defineProps({
  item: {
    type: Object,
    default: null,
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

const mode = ref("view");

watch(
  () => props.item,
  () => {
    mode.value = "view";
  },
  { immediate: true }
);

function setViewMode() {
  mode.value = "view";
}

function setEditMode() {
  mode.value = "edit";
}

function setSwapMode() {
  mode.value = "swap";
}

function handleClose() {
  setViewMode();
  emit("close");
}

function handleAction(action) {
  emit("action", action);
}

function handleSave(payload) {
  emit("save", payload);
  setViewMode();
}

function handleMove(payload) {
  emit("move", payload);
  setViewMode();
}
</script>

<template>
  <v-dialog
    :model-value="true"
    fullscreen
    class="mobile-detail-dialog"
    content-class="mobile-detail-dialog__content"
  >
    <v-card class="d-flex flex-column h-100 mobile-detail-card detail-card">
      <v-card-title class="d-flex justify-space-between align-center detail-header">
        <span>{{ item.name }}</span>
        <v-btn icon density="comfortable" size="small" @click="handleClose">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <transition name="mode-swap" mode="out-in">
        <item-detail-fullscreen-view
          v-if="mode === 'view'"
          :key="`fullscreen-view-${item?.name || ''}`"
          :item="item"
          :location-labels="locationLabels"
          :units-by-ref="unitsByRef"
          @edit="setEditMode"
          @swap="setSwapMode"
          @action="handleAction"
        />
        <item-detail-fullscreen-edit
          v-else-if="mode === 'edit'"
          key="fullscreen-edit"
          :item="item"
          :location-labels="locationLabels"
          :inventory-locations="inventoryLocations"
          @cancel="setViewMode"
          @save="handleSave"
        />
        <item-detail-fullscreen-swap
          v-else
          key="fullscreen-swap"
          :item="item"
          :location-labels="locationLabels"
          :inventory-locations="inventoryLocations"
          @cancel="setViewMode"
          @save="handleMove"
        />
      </transition>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.mobile-detail-dialog :deep(.v-overlay__content),
.mobile-detail-dialog__content {
  width: 100vw;
  max-width: 100vw;
  height: 100dvh;
  max-height: 100dvh;
  margin: 0;
}

.mobile-detail-card {
  border-radius: 0;
}

.detail-card {
  margin-bottom: 0;
  overflow: hidden;
}

.detail-header {
  min-height: 44px;
  padding: 8px 16px;
}

.mode-swap-enter-active,
.mode-swap-leave-active {
  transition:
    transform 180ms ease,
    opacity 180ms ease;
}

.mode-swap-enter-from {
  transform: translateX(12px);
  opacity: 0;
}

.mode-swap-leave-to {
  transform: translateX(-12px);
  opacity: 0;
}
</style>
