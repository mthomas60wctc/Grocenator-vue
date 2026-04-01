<script setup>
import { computed, ref, watch } from "vue";
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

const draft = ref(createDraft(props.item));

watch(
  () => props.item,
  (nextItem) => {
    draft.value = createDraft(nextItem);
  },
  { deep: true }
);

const fromLocationOptions = computed(() =>
  props.inventoryLocations
    .filter((location) => Number(props.item?.inventory?.[location] || 0) > 0)
    .map((location) => ({
      title: locationLabel(location),
      value: location,
    }))
);

const toLocationOptions = computed(() =>
  props.inventoryLocations
    .filter((location) => location !== draft.value.fromLocation)
    .map((location) => ({
      title: locationLabel(location),
      value: location,
    }))
);

watch(
  [fromLocationOptions, toLocationOptions],
  ([fromOptions, toOptions]) => {
    if (!fromOptions.some((option) => option.value === draft.value.fromLocation)) {
      draft.value.fromLocation = fromOptions[0]?.value || "";
    }
    if (!toOptions.some((option) => option.value === draft.value.toLocation)) {
      draft.value.toLocation = toOptions[0]?.value || "";
    }
  },
  { immediate: true }
);

function createDraft(item) {
  const availableFromLocations = props.inventoryLocations.filter(
    (location) => Number(item?.inventory?.[location] || 0) > 0
  );
  const fromLocation = availableFromLocations[0] || props.inventoryLocations[0] || "";
  const toLocation = props.inventoryLocations.find((location) => location !== fromLocation) || "";

  return {
    quantity: "",
    fromLocation,
    toLocation,
  };
}

function locationLabel(location) {
  return props.locationLabels[location] || location;
}

function inputToNumber(value) {
  if (value === null || value === undefined || String(value).trim() === "") {
    return 0;
  }
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
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
