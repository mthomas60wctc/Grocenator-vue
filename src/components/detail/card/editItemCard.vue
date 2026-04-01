<script setup>
import { ref, watch } from "vue";
import CardActionButton from "../../shared/cardActionButton.vue";

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  units: {
    type: Array,
    default: () => [],
  },
  inventoryLocations: {
    type: Array,
    default: () => [],
  },
  locationLabels: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["cancel", "save"]);

const draft = ref(createDraft(props.item));

watch(
  () => props.item,
  (nextItem) => {
    draft.value = createDraft(nextItem);
  },
  { deep: true }
);

function createInventory(initialValues = {}) {
  return props.inventoryLocations.reduce((inventory, location) => {
    inventory[location] = Number(initialValues[location] || 0);
    return inventory;
  }, {});
}

function createDraft(item) {
  return {
    name: item?.name || "",
    inventory: createInventory(item?.inventory || {}),
    shopping: Number(item?.shopping || 0),
    unitRef: item?.unitRef || props.units[0]?.unit || "",
    restock: Number(item?.restock || 0),
  };
}

function save() {
  emit("save", {
    ...draft.value,
    inventory: { ...draft.value.inventory },
  });
}

function locationLabel(location) {
  return props.locationLabels[location] || location;
}

function numberToInput(value) {
  return Number(value || 0) === 0 ? "" : String(value);
}

function inputToNumber(value) {
  if (value === null || value === undefined || String(value).trim() === "") {
    return 0;
  }
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
}
</script>

<template>
  <v-card>
    <v-card-title>Edit Item</v-card-title>
    <v-card-text>
      <v-text-field label="Item Name" v-model="draft.name" density="compact" hide-details class="mb-2" />
      <v-select
        label="Unit"
        :items="units"
        item-title="alias"
        item-value="unit"
        v-model="draft.unitRef"
        density="compact"
        hide-details
        class="mb-2"
      />
      <v-text-field
        type="number"
        label="Min. Quantity"
        :model-value="numberToInput(draft.restock)"
        density="compact"
        hide-details
        class="mb-2"
        @update:model-value="draft.restock = inputToNumber($event)"
      />
      <v-text-field
        type="number"
        label="Shopping Quantity"
        :model-value="numberToInput(draft.shopping)"
        density="compact"
        hide-details
        class="mb-2"
        @update:model-value="draft.shopping = inputToNumber($event)"
      />
      <v-text-field
        v-for="location in inventoryLocations"
        :key="`edit-${location}`"
        type="number"
        :label="`${locationLabel(location)} Quantity`"
        :model-value="numberToInput(draft.inventory[location])"
        density="compact"
        hide-details
        class="mb-2"
        @update:model-value="draft.inventory[location] = inputToNumber($event)"
      />
    </v-card-text>
    <v-card-actions class="pa-0 ma-0 edit-actions-row">
      <card-action-button color="warning" icon="mdi-close" aria-label="Cancel" curved-lower-corners @click="emit('cancel')" />
      <card-action-button color="primary" icon="mdi-content-save" aria-label="Save" curved-lower-corners @click="save" />
    </v-card-actions>
  </v-card>
</template>

<style scoped>
.edit-actions-row {
  width: 100%;
  display: flex;
  gap: 0;
  min-height: 0;
}

.edit-actions-row :deep(.v-btn + .v-btn) {
  margin-inline-start: 0;
}
</style>
