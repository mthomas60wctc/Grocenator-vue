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

const emit = defineEmits(["action"]);

function handleAction(action) {
  emit("action", action);
}
</script>

<template>
  <v-card class="detail-card">
    <v-card-title class="detail-header">
      <span>{{ item.name }}</span>
    </v-card-title>
    <v-card-text>
      <item-summary
        :item="item"
        :location-labels="props.locationLabels"
        :units-by-ref="props.unitsByRef"
        entry-prefix="desktop"
      />
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

</style>
