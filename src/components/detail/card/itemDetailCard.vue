<script setup>
import CardActionButton from "../../shared/cardActionButton.vue";

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

const emit = defineEmits(["action"]);

function handleAction(action) {
  emit("action", action);
}

function locationLabel(location) {
  return props.locationLabels[location] || location.charAt(0).toUpperCase() + location.slice(1);
}

function locationEntries(item) {
  return Object.entries(item?.inventory || {}).filter(([, quantity]) => Number(quantity) > 0);
}

function unitDef(item) {
  return props.unitsByRef[item?.unitRef] || null;
}

function unitDisplay(item) {
  const resolvedUnit = unitDef(item);
  if (!resolvedUnit) {
    return "";
  }
  const unitLabel = resolvedUnit.alias || resolvedUnit.unit;
  return unitLabel.charAt(0).toUpperCase() + unitLabel.slice(1);
}

function quantityWithUnit(item, quantity) {
  const resolvedUnit = unitDef(item);
  if (!resolvedUnit || !Number.isFinite(Number(quantity))) {
    return String(quantity);
  }
  const isSingular = Number(quantity) === 1;
  return `${quantity} ${isSingular ? resolvedUnit.unit : resolvedUnit.pluralUnit}`;
}

function totalInventoryText(item) {
  const totalQuantity = Object.values(item?.inventory || {}).reduce(
    (total, quantity) => total + Number(quantity || 0),
    0
  );
  return quantityWithUnit(item, totalQuantity);
}
</script>

<template>
  <v-card class="detail-card">
    <v-card-title class="detail-header">
      <span>{{ item.name }}</span>
    </v-card-title>
    <v-card-text>
      <v-list density="compact">
        <v-list-item>
          <v-list-item-title>{{ unitDisplay(item) }}</v-list-item-title>
          <v-list-item-subtitle class="muted-label">Unit</v-list-item-subtitle>
        </v-list-item>
        <v-list-item v-for="([location, quantity], idx) in locationEntries(item)" :key="`desktop-${location}-${idx}`">
          <v-list-item-title>{{ quantityWithUnit(item, quantity) }}</v-list-item-title>
          <v-list-item-subtitle class="muted-label">In {{ locationLabel(location) }}</v-list-item-subtitle>
        </v-list-item>
        <v-list-item>
          <v-list-item-title>{{ totalInventoryText(item) }}</v-list-item-title>
          <v-list-item-subtitle class="muted-label">Total Inventory</v-list-item-subtitle>
        </v-list-item>
        <v-list-item>
          <v-list-item-title>{{ quantityWithUnit(item, item.shopping) }}</v-list-item-title>
          <v-list-item-subtitle class="muted-label">On Shopping List</v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </v-card-text>
    <v-card-actions class="pa-0 ma-0 action-row">
      <card-action-button color="primary" icon="mdi-pencil" aria-label="Edit" curved-lower-corners @click="handleAction('edit')" />
      <card-action-button color="warning" icon="mdi-swap-horizontal" aria-label="Move" @click="handleAction('move')" />
      <card-action-button color="error" icon="mdi-delete" aria-label="Delete" curved-lower-corners @click="handleAction('delete')" />
    </v-card-actions>
  </v-card>
</template>

<style scoped>
.detail-card {
  margin-bottom: 0;
  overflow: hidden;
}

.detail-header {
  min-height: 44px;
  padding: 8px 16px;
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
