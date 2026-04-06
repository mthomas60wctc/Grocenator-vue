<script setup>
import { useItemMoveDraft } from "../../../composables/useItemMoveDraft";
import CardActionButton from "../../shared/cardActionButton.vue";

const props = defineProps({
  item: {
    type: Object,
    required: true,
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

const emit = defineEmits(["cancel", "move"]);
const { draft, fromLocationOptions, toLocationOptions, inputToNumber } = useItemMoveDraft(props, locationLabel);

function locationLabel(location) {
  return props.locationLabels[location] || location;
}

function move() {
  emit("move", {
    quantity: inputToNumber(draft.value.quantity),
    fromLocation: draft.value.fromLocation,
    toLocation: draft.value.toLocation,
  });
}
</script>

<template>
  <v-card>
    <v-card-title>Move Item</v-card-title>
    <v-card-text>
      <div class="text-body-2 mb-2">Move X from Y to Z</div>
      <v-text-field
        type="number"
        label="Move"
        v-model="draft.quantity"
        density="compact"
        hide-details
        class="mb-2"
      />
      <v-select
        label="From"
        :items="fromLocationOptions"
        item-title="title"
        item-value="value"
        v-model="draft.fromLocation"
        density="compact"
        hide-details
        class="mb-2"
      />
      <v-select
        label="To"
        :items="toLocationOptions"
        item-title="title"
        item-value="value"
        v-model="draft.toLocation"
        density="compact"
        hide-details
        class="mb-2"
      />
    </v-card-text>
    <v-card-actions class="pa-0 ma-0 edit-actions-row">
      <card-action-button color="warning" icon="mdi-close" aria-label="Cancel" curved-lower-corners @click="emit('cancel')" />
      <card-action-button color="primary" icon="mdi-content-save" aria-label="Move" curved-lower-corners @click="move" />
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
