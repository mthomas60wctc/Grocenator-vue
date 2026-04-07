<script setup>
import CardActionButton from "../../shared/cardActionButton.vue";
import ItemSummary from "../shared/itemSummary.vue";

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
      <item-summary
        :item="item"
        :location-labels="props.locationLabels"
        :units-by-ref="props.unitsByRef"
        entry-prefix="mobile"
        list-density="default"
      />
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

</style>
