<script setup>
import CardActionButton from "../../shared/cardActionButton.vue";
import { useItemEditDraft } from "../../../composables/useItemEditDraft";
import { unitOptionLabel } from "../../../composables/itemHelpers";

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
const { draft, inputToNumber, numberToInput } = useItemEditDraft(props, {
  getDefaultUnitRef: () => props.units[0]?.unit || "",
});

function save() {
  emit("save", {
    ...draft.value,
    inventory: { ...draft.value.inventory },
  });
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
        :item-title="unitOptionLabel"
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
        :label="`${locationLabels[location] || location} Quantity`"
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
