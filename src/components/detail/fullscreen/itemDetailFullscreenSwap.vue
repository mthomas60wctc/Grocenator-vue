<script setup>
import { computed, ref, watch } from "vue";
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
  inventoryLocations: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["cancel", "save"]);

const draft = ref(createDraft(props.item));

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
  () => props.item,
  (nextItem) => {
    draft.value = createDraft(nextItem);
  },
  { immediate: true }
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
  return props.locationLabels[location] || location.charAt(0).toUpperCase() + location.slice(1);
}

function inputToNumber(value) {
  if (value === null || value === undefined || String(value).trim() === "") {
    return 0;
  }
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function save() {
  emit("save", {
    quantity: inputToNumber(draft.value.quantity),
    fromLocation: draft.value.fromLocation,
    toLocation: draft.value.toLocation,
  });
}
</script>

<template>
  <div class="mode-root">
    <v-card-text class="flex-grow-1">
      <v-list>
        <v-list-item class="detail-row">
          <v-list-item-title class="detail-value">
            <v-text-field
              v-model="draft.quantity"
              type="number"
              density="compact"
              hide-details
              label="Move"
              class="inline-edit-field inline-edit-field--full"
            />
          </v-list-item-title>
        </v-list-item>
        <v-list-item class="detail-row">
          <v-list-item-title class="detail-value">
            <v-select
              v-model="draft.fromLocation"
              label="From"
              :items="fromLocationOptions"
              item-title="title"
              item-value="value"
              density="compact"
              hide-details
              class="inline-edit-field inline-edit-field--full"
            />
          </v-list-item-title>
        </v-list-item>
        <v-list-item class="detail-row">
          <v-list-item-title class="detail-value">
            <v-select
              v-model="draft.toLocation"
              label="To"
              :items="toLocationOptions"
              item-title="title"
              item-value="value"
              density="compact"
              hide-details
              class="inline-edit-field inline-edit-field--full"
            />
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card-text>

    <v-card-actions class="pa-0 ma-0 action-row">
      <card-action-button color="warning" icon="mdi-close" text="Cancel" curved-lower-corners @click="emit('cancel')" />
      <card-action-button color="primary" icon="mdi-content-save" text="Save" curved-lower-corners @click="save" />
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

.inline-edit-field {
  width: 180px;
  max-width: 180px;
}

.inline-edit-field--full {
  width: 100%;
  max-width: none;
}
</style>
