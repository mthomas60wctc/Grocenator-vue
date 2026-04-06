<script setup>
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

function unitText(quantity) {
  const unitDef = props.unitsByRef[props.item.unitRef];
  if (!unitDef) {
    return "";
  }
  return Number(quantity) === 1 ? unitDef.unit : unitDef.pluralUnit;
}

function selectItem() {
  emit("select-item", props.item);
}

function name() {
  return props.item.name;
}

function subText() {
  if (props.type === "catalog") {
    return props.item.restock > 0 ? "Min. Quantity: " + props.item.restock + " " + unitText(props.item.restock) : "";
  }
  if (props.type === "shopping") {
    return Number(props.item.shopping || 0) > 0 ? props.item.shopping + " " + unitText(props.item.shopping) : "";
  }

  const selectedLocationTotal = props.selectedLocations.reduce(
    (total, location) => total + Number(props.item.inventory?.[location] || 0),
    0
  );
  const inventoryQuantity = props.selectedLocations.length > 0
    ? selectedLocationTotal
    : Number(props.item.inventory?.[props.type] || 0);
  return inventoryQuantity > 0 ? inventoryQuantity + " " + unitText(inventoryQuantity) : "";
}

function topRightText() {
  if (props.type !== "catalog") {
    return "";
  }
  const totalInventory = Object.values(props.item.inventory || {}).reduce(
    (total, quantity) => total + Number(quantity || 0),
    0
  );
  return "Inventory: " + totalInventory + " " + unitText(totalInventory);
}

function bottomRightText() {
  if (props.type !== "catalog") {
    return "";
  }
  return "Cart: " + props.item.shopping + " " + unitText(props.item.shopping);
}

function isBelowMinimum() {
  if (props.type !== "catalog") {
    return false;
  }

  const totalInventory = Object.values(props.item.inventory || {}).reduce(
    (total, quantity) => total + Number(quantity || 0),
    0
  );
  const cartQuantity = Number(props.item.shopping || 0);
  const minimumQuantity = Number(props.item.restock || 0);

  return totalInventory + cartQuantity < minimumQuantity;
}
</script>
<template>
  <v-list-item :class="{ 'selected-item': isSelected }" :active="isSelected" color="primary" @click.stop="selectItem">
    <v-list-item-title>{{ name() }}</v-list-item-title>
    <v-list-item-subtitle v-if="subText()" :class="{ 'min-quantity-label': type === 'catalog' }">{{ subText() }}</v-list-item-subtitle>

    <template #append>
      <div class="d-flex align-center ga-2">
        <div class="text-right d-flex flex-column align-end ga-1">
          <v-chip v-if="topRightText()" size="x-small" variant="tonal" :color="isBelowMinimum() ? 'error' : undefined">{{ topRightText() }}</v-chip>
          <v-chip v-if="bottomRightText()" size="x-small" variant="tonal" :color="isBelowMinimum() ? 'error' : undefined">{{ bottomRightText() }}</v-chip>
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