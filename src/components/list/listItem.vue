<script setup>
import { computed } from "vue";
import { ItemModel } from "../../models/itemModel";

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  type: {
    type: String,
    default: "catalog",
  },
  isSelected: {
    type: Boolean,
    default: false,
  },
  selectedLocations: {
    type: Array,
    default: () => [],
  },
  unitsByRef: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["remove-item", "select-item"]);

const itemModel = computed(() => ItemModel.from(props.item));
const unitDef = computed(() => props.unitsByRef[props.item.unitRef]);

const subText = computed(() => {
  if (props.type === "catalog") {
    return itemModel.value.restockQuantity() > 0
      ? `Min. Quantity: ${itemModel.value.restockQuantity()} ${unitText(itemModel.value.restockQuantity())}`
      : "";
  }

  if (props.type === "shopping") {
    return itemModel.value.shoppingQuantity() > 0
      ? `${itemModel.value.shoppingQuantity()} ${unitText(itemModel.value.shoppingQuantity())}`
      : "";
  }

  const selectedLocationTotal = props.selectedLocations.reduce(
    (total, location) => total + itemModel.value.inventoryQuantityAt(location),
    0
  );
  const inventoryQuantity = props.selectedLocations.length > 0
    ? selectedLocationTotal
    : itemModel.value.inventoryQuantityAt(props.type);
  return inventoryQuantity > 0 ? `${inventoryQuantity} ${unitText(inventoryQuantity)}` : "";
});

const topRightText = computed(() => {
  if (props.type !== "catalog") {
    return "";
  }
  const totalInventory = itemModel.value.totalInventory();
  return `Inventory: ${totalInventory} ${unitText(totalInventory)}`;
});

const bottomRightText = computed(() => {
  if (props.type !== "catalog") {
    return "";
  }
  const shoppingQuantity = itemModel.value.shoppingQuantity();
  return `Cart: ${shoppingQuantity} ${unitText(shoppingQuantity)}`;
});

const isBelowMinimum = computed(() => props.type === "catalog" && itemModel.value.isBelowMinimum());

function unitText(quantity) {
  if (!unitDef.value) {
    return "";
  }
  return Number(quantity) === 1 ? unitDef.value.unit : unitDef.value.pluralUnit;
}

function selectItem() {
  emit("select-item", props.item);
}
</script>

<template>
  <v-list-item :class="{ 'selected-item': isSelected }" :active="isSelected" color="primary" @click.stop="selectItem">
    <v-list-item-title>{{ item.name }}</v-list-item-title>
    <v-list-item-subtitle v-if="subText" :class="{ 'min-quantity-label': type === 'catalog' }">{{ subText }}</v-list-item-subtitle>

    <template #append>
      <div class="d-flex align-center ga-2">
        <div class="text-right d-flex flex-column align-end ga-1">
          <v-chip v-if="topRightText" size="x-small" variant="tonal" :color="isBelowMinimum ? 'error' : undefined">{{ topRightText }}</v-chip>
          <v-chip v-if="bottomRightText" size="x-small" variant="tonal" :color="isBelowMinimum ? 'error' : undefined">{{ bottomRightText }}</v-chip>
        </div>
      </div>
    </template>
  </v-list-item>
</template>

<style scoped>
.min-quantity-label {
  font-size: 0.72rem;
  line-height: 1.1;
}
</style>

<style scoped>
.min-quantity-label {
  font-size: 0.72rem;
  line-height: 1.1;
}
</style>