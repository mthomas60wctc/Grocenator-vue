<script setup>
import { ref } from "vue";
import BasicModal from "../modals/basicModal.vue";
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

const hovered = ref(false);
const modifying = ref(false);
const removing = ref(false);
const editDraft = ref({ name: "", inventory: {}, shopping: 0, unitRef: "", restock: 0 });

function unitText(quantity) {
  const unitDef = props.unitsByRef[props.item.unitRef];
  if (!unitDef) {
    return "";
  }
  return Number(quantity) === 1 ? unitDef.unit : unitDef.pluralUnit;
}

function openModifying() {
  editDraft.value = { ...props.item };
  modifying.value = true;
}
function openRemoving() {
  removing.value = true;
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
  <v-hover v-model="hovered">
    <template #default>
      <v-list-item :class="{ 'selected-item': isSelected }" :active="isSelected" color="primary" @click.stop="selectItem">
        <v-list-item-title>{{ name() }}</v-list-item-title>
        <v-list-item-subtitle v-if="subText()" :class="{ 'min-quantity-label': type === 'catalog' }">{{ subText() }}</v-list-item-subtitle>

        <template #append>
          <div class="d-flex align-center ga-2">
            <div class="text-right d-flex flex-column align-end ga-1">
              <v-chip v-if="topRightText()" size="x-small" variant="tonal" :color="isBelowMinimum() ? 'error' : undefined">{{ topRightText() }}</v-chip>
              <v-chip v-if="bottomRightText()" size="x-small" variant="tonal" :color="isBelowMinimum() ? 'error' : undefined">{{ bottomRightText() }}</v-chip>
            </div>
            <div v-show="hovered" class="d-flex flex-column ga-1">
              <v-btn icon="mdi-pencil" size="small" color="warning" variant="text" @click.stop="openModifying"></v-btn>
              <v-btn icon="mdi-trash-can" size="small" color="error" variant="text" @click.stop="openRemoving"></v-btn>
            </div>
          </div>
        </template>
      </v-list-item>
    </template>
  </v-hover>
</template>

<style scoped>
.min-quantity-label {
  font-size: 0.72rem;
  line-height: 1.1;
}
</style>