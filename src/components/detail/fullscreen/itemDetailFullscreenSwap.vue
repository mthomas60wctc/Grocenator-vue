<script setup>
import { computed } from "vue";
import { useItemMoveDraft } from "../../../composables/useItemMoveDraft";
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
const { draft, fromLocationOptions, toLocationOptions, inputToNumber } = useItemMoveDraft(props, locationLabel);

const fromLabel = computed(() => {
  const location = draft.value.fromLocation;
  if (!location) {
    return "From";
  }
  const quantity = Number(props.item?.inventory?.[location] || 0);
  return `From (${quantity} currently)`;
});

const toLabel = computed(() => {
  const location = draft.value.toLocation;
  if (!location) {
    return "To";
  }
  const quantity = Number(props.item?.inventory?.[location] || 0);
  return `To (${quantity} currently)`;
});

function locationLabel(location) {
  return props.locationLabels[location] || location.charAt(0).toUpperCase() + location.slice(1);
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
              label="Move quantity"
              class="inline-edit-field inline-edit-field--full"
            />
          </v-list-item-title>
        </v-list-item>
        <v-list-item class="detail-row">
          <v-list-item-title class="detail-value">
            <v-select
              v-model="draft.fromLocation"
              :label="fromLabel"
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
              :label="toLabel"
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
