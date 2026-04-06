<script setup>
import CardActionButton from "../../shared/cardActionButton.vue";
import {
  locationEntries,
  quantityWithUnit,
  resolveLocationLabel,
  totalInventoryText,
  unitDisplay,
} from "../../../composables/itemHelpers";

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
});

const emit = defineEmits(["edit", "swap", "action"]);
</script>

<template>
  <div class="mode-root">
    <v-card-text class="flex-grow-1">
      <v-list>
        <v-list-item class="detail-row">
          <v-list-item-title class="detail-value">{{ unitDisplay(item, props.unitsByRef) }}</v-list-item-title>
          <v-list-item-subtitle class="muted-label">Unit</v-list-item-subtitle>
        </v-list-item>
        <v-list-item
          v-for="([location, quantity], idx) in locationEntries(item)"
          :key="`mobile-${location}-${idx}`"
          class="detail-row"
        >
          <v-list-item-title class="detail-value">{{ quantityWithUnit(item, quantity, props.unitsByRef) }}</v-list-item-title>
          <v-list-item-subtitle class="muted-label">In {{ resolveLocationLabel(location, props.locationLabels) }}</v-list-item-subtitle>
        </v-list-item>
        <v-list-item class="detail-row">
          <v-list-item-title class="detail-value">{{ totalInventoryText(item, props.unitsByRef) }}</v-list-item-title>
          <v-list-item-subtitle class="muted-label">Total Inventory</v-list-item-subtitle>
        </v-list-item>
        <v-list-item class="detail-row">
          <v-list-item-title class="detail-value">{{ quantityWithUnit(item, item.shopping, props.unitsByRef) }}</v-list-item-title>
          <v-list-item-subtitle class="muted-label">On Shopping List</v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </v-card-text>

    <v-card-actions class="pa-0 ma-0 action-row">
      <card-action-button color="primary" icon="mdi-pencil" text="Edit" curved-lower-corners @click="emit('edit')" />
      <card-action-button color="warning" icon="mdi-swap-horizontal" text="Move" @click="emit('swap')" />
      <card-action-button color="error" icon="mdi-delete" text="Delete" curved-lower-corners @click="emit('action', 'delete')" />
    </v-card-actions>
  </div>
</template>

<style scoped>
.mode-root {
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
}

.detail-row {
  min-height: 66px;
  padding-top: 8px;
  padding-bottom: 8px;
}

.detail-value {
  min-height: 40px;
  display: flex;
  align-items: center;
}

.action-row {
  width: 100%;
  display: flex;
  gap: 0;
  min-height: 0;
  margin: 0;
  padding: 0;
}

.action-row :deep(.v-btn + .v-btn) {
  margin-inline-start: 0;
}

.muted-label {
  font-size: 0.72rem;
  line-height: 1.1;
  opacity: 0.65;
}
</style>
