<script setup>
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
  entryPrefix: {
    type: String,
    default: "detail",
  },
  listDensity: {
    type: String,
    default: "compact",
  },
});
</script>

<template>
  <v-list :density="listDensity">
    <v-list-item>
      <v-list-item-title>{{ unitDisplay(item, unitsByRef) }}</v-list-item-title>
      <v-list-item-subtitle class="muted-label">Unit</v-list-item-subtitle>
    </v-list-item>

    <v-list-item
      v-for="([location, quantity], idx) in locationEntries(item)"
      :key="`${entryPrefix}-${location}-${idx}`"
    >
      <v-list-item-title>{{ quantityWithUnit(item, quantity, unitsByRef) }}</v-list-item-title>
      <v-list-item-subtitle class="muted-label">
        In {{ resolveLocationLabel(location, locationLabels) }}
      </v-list-item-subtitle>
    </v-list-item>

    <v-list-item>
      <v-list-item-title>{{ totalInventoryText(item, unitsByRef) }}</v-list-item-title>
      <v-list-item-subtitle class="muted-label">Total Inventory</v-list-item-subtitle>
    </v-list-item>

    <v-list-item>
      <v-list-item-title>{{ quantityWithUnit(item, item?.shopping, unitsByRef) }}</v-list-item-title>
      <v-list-item-subtitle class="muted-label">On Shopping List</v-list-item-subtitle>
    </v-list-item>
  </v-list>
</template>

<style scoped>
.muted-label {
  font-size: 0.72rem;
  line-height: 1.1;
  opacity: 0.65;
}
</style>
