<script setup>
import { ref } from "vue";
import BasicModal from "./basicModal.vue";
const props = defineProps({
  protoItem: {
    type: Object,
    required: true,
  },
  locations: {
    type: Array,
    default: () => [],
  },
  locationLabels: {
    type: Object,
    default: () => ({}),
  },
  units: {
    type: Array,
    default: () => [],
  },
});
const isOpen = ref(false);
function openModal() {
  emit("open");
  isOpen.value = true;
}
function closeModal() {
  isOpen.value = false;
  emit("close");
}
function submitModal() {
  emit("submit");
  closeModal();
}
const emit = defineEmits(["open", "submit", "close"]);

function locationLabel(location) {
  return props.locationLabels[location] || location;
}

function unitOptionLabel(unitDef) {
  return `${unitDef.alias} (${unitDef.unit})`;
}
</script>
<template>
  <div>
    <basic-modal :is-open="isOpen" title="New Item" confirm-text="Add Item" cancel-text="Cancel" @close="closeModal" @confirm="submitModal">
      <v-row class="mb-1">
        <v-col cols="12" md="6">
          <v-text-field id="itemName" label="Item Name" v-model="protoItem.name" density="compact" hide-details class="mb-2" />
        </v-col>
        <v-col cols="12" md="6">
          <v-select
            id="itemUnit"
            label="Unit"
            :items="units"
            :item-title="unitOptionLabel"
            item-value="unit"
            v-model="protoItem.unitRef"
            density="compact"
            hide-details
            class="mb-2"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col v-for="location in locations" :key="location" cols="12" md="6">
          <v-text-field
            type="number"
            :id="`${location}Quantity`"
            :label="`${locationLabel(location)} Quantity`"
            v-model.number="protoItem.inventory[location]"
            density="compact"
            hide-details
            class="mb-2"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field type="number" id="restockQuantity" label="Min. Quantity" v-model.number="protoItem.restock" density="compact" hide-details class="mb-2" />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field type="number" id="cartQuantity" label="Shopping Quantity" v-model.number="protoItem.shopping" density="compact" hide-details class="mb-2" />
        </v-col>
      </v-row>
    </basic-modal>

    <v-btn
      icon="mdi-plus"
      size="x-large"
      color="primary"
      class="position-fixed add-item-fab"
      @click="openModal"
    />
  </div>
</template>

<style scoped>
.add-item-fab {
  right: 24px;
  bottom: 24px;
  z-index: 1000;
}
</style>
