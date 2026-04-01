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
const editableLocationEntries = computed(() => Object.entries(draft.value.inventory || {}));

watch(
  () => props.item,
  (nextItem) => {
    draft.value = createDraft(nextItem);
  },
  { immediate: true }
);

function createDraft(item) {
  const inventory = props.inventoryLocations.reduce((acc, location) => {
    acc[location] = Number(item?.inventory?.[location] || 0);
    return acc;
  }, {});

  return {
    inventory,
    shopping: Number(item?.shopping || 0),
    restock: Number(item?.restock || 0),
  };
}

function locationLabel(location) {
  return props.locationLabels[location] || location.charAt(0).toUpperCase() + location.slice(1);
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

function save() {
  emit("save", {
    name: props.item?.name,
    inventory: { ...draft.value.inventory },
    shopping: Number(draft.value.shopping || 0),
    unitRef: props.item?.unitRef,
    restock: Number(draft.value.restock || 0),
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
              :model-value="numberToInput(draft.restock)"
              type="number"
              density="compact"
              hide-details
              label="Min. Quantity"
              class="inline-edit-field inline-edit-field--full"
              @update:model-value="draft.restock = inputToNumber($event)"
            />
          </v-list-item-title>
        </v-list-item>

        <v-list-item class="detail-row">
          <v-list-item-title class="detail-value">
            <v-text-field
              :model-value="numberToInput(draft.shopping)"
              type="number"
              density="compact"
              hide-details
              label="Shopping Quantity"
              class="inline-edit-field inline-edit-field--full"
              @update:model-value="draft.shopping = inputToNumber($event)"
            />
          </v-list-item-title>
        </v-list-item>

        <v-list-item
          v-for="([location], idx) in editableLocationEntries"
          :key="`mobile-edit-${location}-${idx}`"
          class="detail-row"
        >
          <v-list-item-title class="detail-value">
            <v-text-field
              :model-value="numberToInput(draft.inventory[location])"
              type="number"
              density="compact"
              hide-details
              :label="`${locationLabel(location)} Quantity`"
              class="inline-edit-field inline-edit-field--full"
              @update:model-value="draft.inventory[location] = inputToNumber($event)"
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
