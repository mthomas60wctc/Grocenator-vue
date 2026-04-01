<script setup>
import { ref, computed, onMounted } from "vue";
import { useTheme, useDisplay } from "vuetify";
import TabNavigator from "./components/navigation/tabNavigator.vue";
import TabBody from "./components/navigation/tabBody.vue";
import ListBody from "./components/list/listBody.vue";
import SearchFilterWidget from "./components/search/searchFilterWidget.vue";
import SearchWidget from "./components/search/searchWidget.vue";
import ItemDetailCard from "./components/detail/card/itemDetailView.vue";
import EditItemCard from "./components/detail/card/editItemCard.vue";
import MoveItemCard from "./components/detail/card/moveItemCard.vue";
import UndoToast from "./components/modals/undoToast.vue";
import AddItemModal from "./components/modals/addItemModal.vue";
import { units } from "./data/units";

// State (Replacing data)
const categories = ref({
  inventory: ["refrigerator", "freezer", "cupboard", "pantry"],
  catalog: [],
  shopping: [],
});
const activeTab = ref("inventory");
const selectedSubcategory = ref("pantry");
const inventoryFilters = ref([selectedSubcategory.value]);
const inventorySearch = ref("");
const catalogSearch = ref("");
const shoppingSearch = ref("");
const selectedItem = ref(null);
const isEditingItem = ref(false);
const isMovingItem = ref(false);
const showUndoToast = ref(false);
const deletedItemName = ref("");
const lastDeletedItem = ref(null);
const lastDeletedIndex = ref(-1);
const undoToastKey = ref(0);
const detailPanelKey = ref(0);
const navbarHeight = ref(56);
const navbarElement = ref(null);
const containerElement = ref(null);
const theme = useTheme();
const display = useDisplay();
const locationLabels = {
  refrigerator: "Refrigerator",
  freezer: "Freezer",
  cupboard: "Cupboard",
  pantry: "Pantry",
};
const inventoryLocations = categories.value.inventory;
const unitsByRef = units.reduce((acc, unitDef) => {
  acc[unitDef.unit] = unitDef;
  return acc;
}, {});

function createInventory(initialValues = {}) {
  return inventoryLocations.reduce((inventory, location) => {
    inventory[location] = Number(initialValues[location] || 0);
    return inventory;
  }, {});
}

const itemList = ref([
  { name: "Almonds", inventory: createInventory({ cupboard: 2, pantry: 1 }), shopping: 1, unitRef: "lb", restock: 0 },
  { name: "Apples", inventory: createInventory({ refrigerator: 6 }), shopping: 5, unitRef: "count", restock: 0 },
  { name: "Bananas", inventory: createInventory({ pantry: 2, refrigerator: 3 }), shopping: 2, unitRef: "count", restock: 0 },
  { name: "Bell Peppers", inventory: createInventory({ refrigerator: 4 }), shopping: 0, unitRef: "count", restock: 0 },
  { name: "Bread", inventory: createInventory({ cupboard: 1, freezer: 1 }), shopping: 0, unitRef: "loaf", restock: 2 },
  { name: "Broccoli", inventory: createInventory({ refrigerator: 2 }), shopping: 1, unitRef: "head", restock: 0 },
  { name: "Butter", inventory: createInventory({ refrigerator: 1, freezer: 2 }), shopping: 0, unitRef: "lb", restock: 1 },
  { name: "Canned Beans", inventory: createInventory({ cupboard: 4, pantry: 2 }), shopping: 0, unitRef: "can", restock: 3 },
  { name: "Cheese", inventory: createInventory({ refrigerator: 12 }), shopping: 8, unitRef: "oz", restock: 0 },
  { name: "Chicken Breast", inventory: createInventory({ freezer: 3 }), shopping: 2, unitRef: "lb", restock: 0 },
  { name: "Coffee", inventory: createInventory({ cupboard: 1, pantry: 1 }), shopping: 1, unitRef: "bag", restock: 1 },
  { name: "Eggs", inventory: createInventory({ refrigerator: 12 }), shopping: 0, unitRef: "count", restock: 2 },
  { name: "Flour", inventory: createInventory({ pantry: 3, cupboard: 1 }), shopping: 5, unitRef: "lb", restock: 3 },
  { name: "Ground Beef", inventory: createInventory({ freezer: 2 }), shopping: 0, unitRef: "lb", restock: 0 },
  { name: "Honey", inventory: createInventory({ pantry: 2, cupboard: 1 }), shopping: 0, unitRef: "jar", restock: 1 },
  { name: "Milk", inventory: createInventory({ refrigerator: 1 }), shopping: 1, unitRef: "gal", restock: 2 },
  { name: "Olive Oil", inventory: createInventory({ pantry: 1, cupboard: 1 }), shopping: 1, unitRef: "L", restock: 1 },
  { name: "Pasta", inventory: createInventory({ pantry: 3, cupboard: 2 }), shopping: 0, unitRef: "lb", restock: 3 },
  { name: "Rice", inventory: createInventory({ pantry: 2 }), shopping: 2, unitRef: "lb", restock: 3 },
  { name: "Shrimp", inventory: createInventory({ freezer: 1 }), shopping: 1, unitRef: "lb", restock: 0 },
  { name: "Spinach", inventory: createInventory({ refrigerator: 1 }), shopping: 0, unitRef: "oz", restock: 0 },
  { name: "Sugar", inventory: createInventory({ pantry: 4 }), shopping: 0, unitRef: "lb", restock: 2 },
  { name: "Tuna", inventory: createInventory({ cupboard: 3 }), shopping: 0, unitRef: "can", restock: 2 },
  { name: "Yogurt", inventory: createInventory({ refrigerator: 6 }), shopping: 0, unitRef: "cup", restock: 12 },
]);
const protoItem = ref({
  name: "",
  inventory: createInventory(),
  shopping: 0,
  unitRef: units[0].unit,
  restock: 0,
});

// Methods
function toggleTheme() {
  theme.change(theme.global.current.value.dark ? "light" : "dark");
}
function setActiveTab(tab) {
  const allCategories = Object.keys(categories.value);
  const allSubcategories = Object.values(categories.value).flat();

  if (allCategories.includes(tab) || allSubcategories.includes(tab)) {
    activeTab.value = tab;
    if (tab === "inventory") {
      inventoryFilters.value = [...categories.value.inventory];
    }
  }
}

function handleSubcategorySelect(subcategory) {
  selectedSubcategory.value = subcategory;
  inventoryFilters.value = [subcategory];
}

function handleInventoryFiltersUpdate(nextFilters) {
  inventoryFilters.value = nextFilters;
  if (nextFilters.length > 0) {
    selectedSubcategory.value = nextFilters[0];
  }
}

function handleItemSelect(item) {
  if (selectedItem.value === item) {
    if (isDesktop.value) {
      selectedItem.value = null;
      isEditingItem.value = false;
      isMovingItem.value = false;
    }
    return;
  }
  selectedItem.value = item;
  isEditingItem.value = false;
  isMovingItem.value = false;
  detailPanelKey.value += 1;
}

function handleCloseDetail() {
  selectedItem.value = null;
  isEditingItem.value = false;
  isMovingItem.value = false;
}

function handleItemAction(action) {
  if (action === "edit" && selectedItem.value && isDesktop.value) {
    isEditingItem.value = true;
    isMovingItem.value = false;
    return;
  }
  if (action === "move" && selectedItem.value && isDesktop.value) {
    isMovingItem.value = true;
    isEditingItem.value = false;
    return;
  }
  if (action === "delete" && selectedItem.value) {
    removeItem(selectedItem.value);
    return;
  }
  console.log("Item action:", action, selectedItem.value);
}

function cancelEdit() {
  isEditingItem.value = false;
}

function cancelMove() {
  isMovingItem.value = false;
}

function saveEdit(draft) {
  if (!selectedItem.value || !draft) {
    return;
  }

  Object.assign(selectedItem.value, {
    name: draft.name,
    inventory: { ...createInventory(draft.inventory), ...draft.inventory },
    shopping: Number(draft.shopping || 0),
    unitRef: draft.unitRef || units[0].unit,
    restock: Number(draft.restock || 0),
  });

  itemList.value.sort((a, b) => a.name.localeCompare(b.name));
  detailPanelKey.value += 1;
  cancelEdit();
}

function moveItem(movePayload) {
  if (!selectedItem.value || !movePayload) {
    return;
  }

  const fromLocation = movePayload.fromLocation;
  const toLocation = movePayload.toLocation;
  const requestedQuantity = Number(movePayload.quantity || 0);

  if (!fromLocation || !toLocation || fromLocation === toLocation || requestedQuantity <= 0) {
    return;
  }

  const availableQuantity = Number(selectedItem.value.inventory?.[fromLocation] || 0);
  const transferQuantity = Math.min(requestedQuantity, availableQuantity);

  if (transferQuantity <= 0) {
    return;
  }

  selectedItem.value.inventory[fromLocation] = availableQuantity - transferQuantity;
  selectedItem.value.inventory[toLocation] = Number(selectedItem.value.inventory?.[toLocation] || 0) + transferQuantity;

  detailPanelKey.value += 1;
  cancelMove();
}

function removeItem(item) {
  if (!item) {
    return;
  }

  const itemIndex = itemList.value.findIndex((listItem) => listItem === item);
  if (itemIndex < 0) {
    return;
  }

  lastDeletedItem.value = item;
  lastDeletedIndex.value = itemIndex;
  deletedItemName.value = item.name || "Item";

  itemList.value.splice(itemIndex, 1);

  if (selectedItem.value === item) {
    handleCloseDetail();
  }

  undoToastKey.value += 1;
  showUndoToast.value = true;
}

function undoRemoveItem() {
  if (!lastDeletedItem.value) {
    showUndoToast.value = false;
    return;
  }

  const insertionIndex = Math.min(
    Math.max(lastDeletedIndex.value, 0),
    itemList.value.length
  );
  itemList.value.splice(insertionIndex, 0, lastDeletedItem.value);

  showUndoToast.value = false;
  deletedItemName.value = "";
  lastDeletedItem.value = null;
  lastDeletedIndex.value = -1;
}

function handleUndoToastVisibility(nextValue) {
  showUndoToast.value = nextValue;
  if (!nextValue) {
    deletedItemName.value = "";
    lastDeletedItem.value = null;
    lastDeletedIndex.value = -1;
  }
}
function addItem() {
  itemList.value.push({
    ...protoItem.value,
    inventory: { ...protoItem.value.inventory },
  });
  itemList.value.sort((a, b) => a.name.localeCompare(b.name));
  resetProto();
}
function resetProto() {
  protoItem.value = {
    name: "",
    inventory: createInventory(),
    shopping: 0,
    unitRef: units[0].unit,
    restock: 0,
  };
}

function resolveRefElement(target) {
  if (!target) {
    return null;
  }
  if (target instanceof HTMLElement) {
    return target;
  }
  if (target.$el instanceof HTMLElement) {
    return target.$el;
  }
  return null;
}

// Lifecycle
onMounted(() => {
  const navbarDom = resolveRefElement(navbarElement.value);
  if (navbarDom) {
    navbarHeight.value = navbarDom.offsetHeight;
  }

  const containerDom = resolveRefElement(containerElement.value);
  if (containerDom) {
    const containerPadding = window.getComputedStyle(containerDom).paddingTop;
    const paddingValue = parseInt(containerPadding) || 0;
    navbarHeight.value += paddingValue;
  }
});

// Computed
const shoppingList = computed(() => itemList.value.filter((item) => item.shopping > 0));
const inventoryList = computed(() =>
  itemList.value.filter((item) =>
    Object.values(item.inventory || {}).some((quantity) => Number(quantity) > 0)
  )
);
const filteredInventoryList = computed(() => {
  const selectedLocations = inventoryFilters.value;
  const searchValue = inventorySearch.value.trim().toLowerCase();

  return inventoryList.value.filter((item) => {
    const matchesLocation =
      selectedLocations.length > 0 &&
      selectedLocations.some((location) => Number(item.inventory?.[location] || 0) > 0);
    const matchesSearch =
      searchValue.length === 0 || item.name.toLowerCase().includes(searchValue);

    return matchesLocation && matchesSearch;
  });
});
const filteredCatalogList = computed(() => {
  const searchValue = catalogSearch.value.trim().toLowerCase();
  if (searchValue.length === 0) {
    return itemList.value;
  }
  return itemList.value.filter((item) => item.name.toLowerCase().includes(searchValue));
});
const filteredShoppingList = computed(() => {
  const searchValue = shoppingSearch.value.trim().toLowerCase();
  if (searchValue.length === 0) {
    return shoppingList.value;
  }
  return shoppingList.value.filter((item) => item.name.toLowerCase().includes(searchValue));
});
const currentBreakpoint = computed(() => display.name.value || "xs");
const isEdgeToEdge = computed(() => ["xs", "md", "lg"].includes(currentBreakpoint.value));
const isSmall = computed(() => currentBreakpoint.value === "xs");
const isMobile = computed(() => ["xs", "sm"].includes(currentBreakpoint.value));
const isDesktop = computed(() => ["md", "lg", "xl", "xxl"].includes(currentBreakpoint.value));
const hasBufferColumns = computed(() => ["lg", "xl", "xxl"].includes(currentBreakpoint.value));
const themeIcon = computed(() => (theme.global.current.value.dark ? "mdi-weather-night" : "mdi-weather-sunny"));
</script>

<template>
  <v-app>
    <v-app-bar ref="navbarElement" color="primary" density="comfortable">
      <v-app-bar-title>Grocenator</v-app-bar-title>
      <v-btn :icon="themeIcon" variant="text" @click="toggleTheme()" />
    </v-app-bar>

    <v-main>
      <v-container ref="containerElement" :fluid="isEdgeToEdge " :class="isSmall ? 'py-4 px-0' : 'py-4 px-4'">
        <v-row class="content-row">
          <!-- Left buffer spacer (lg+) -->
          <v-col v-if="hasBufferColumns" cols="0" lg="1" xl="1" xxl="2"></v-col>

          <!-- Left sidebar (nav) -->
          <v-col cols="12" sm="12" md="3" lg="2" xl="2" xxl="2" :class="{ 'sticky-side': isDesktop }" :style="{ '--sticky-top': `${navbarHeight}px` }">
            <v-card>
              <v-card-text class="pa-0">
                <tab-navigator
                  :categories="categories"
                  :active-tab="activeTab"
                  @change-tab="setActiveTab"
                  @subcategory-select="handleSubcategorySelect"
                ></tab-navigator>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Center (list) -->
          <v-col cols="12" sm="12" md="6" lg="6" xl="6" xxl="4">
            <v-card>
              <v-card-text>
                <tab-body :tabs="Object.keys(categories)" :active-tab="activeTab">
                  <template #inventory>
                    <search-filter-widget
                      class="mb-3"
                      :chips="categories.inventory"
                      :chip-labels="locationLabels"
                      :selected-chips="inventoryFilters"
                      :search-term="inventorySearch"
                      placeholder="Search inventory"
                      @update:selected-chips="handleInventoryFiltersUpdate"
                      @update:search-term="inventorySearch = $event"
                    ></search-filter-widget>
                    <list-body
                      :list="filteredInventoryList"
                      :type="selectedSubcategory"
                      :selected-locations="inventoryFilters"
                      :units-by-ref="unitsByRef"
                      :selected-item="selectedItem"
                      @remove-item="removeItem"
                      @select-item="handleItemSelect"
                    ></list-body>
                  </template>
                  <template #catalog>
                    <search-widget
                      class="mb-3"
                      :model-value="catalogSearch"
                      placeholder="Search catalog"
                      @update:model-value="catalogSearch = $event"
                    />
                    <list-body
                      :list="filteredCatalogList"
                      :type="'catalog'"
                      :units-by-ref="unitsByRef"
                      :selected-item="selectedItem"
                      @remove-item="removeItem"
                      @select-item="handleItemSelect"
                    ></list-body>
                  </template>
                  <template #shopping>
                    <search-widget
                      class="mb-3"
                      :model-value="shoppingSearch"
                      placeholder="Search shopping"
                      @update:model-value="shoppingSearch = $event"
                    />
                    <list-body
                      :list="filteredShoppingList"
                      :type="'shopping'"
                      :units-by-ref="unitsByRef"
                      :selected-item="selectedItem"
                      @remove-item="removeItem"
                      @select-item="handleItemSelect"
                    ></list-body>
                  </template>
                </tab-body>
              </v-card-text>
            </v-card>
          </v-col>
          <!-- Right sidebar (detail panel) -->
          <v-col v-if="isDesktop" cols="12" sm="12" md="3" lg="2" xl="2" xxl="2" :class="{ 'sticky-side': isDesktop }" :style="{ '--sticky-top': `${navbarHeight}px` }">
            <transition name="panel-swap" mode="out-in">
              <item-detail-card
                v-if="selectedItem && !isEditingItem && !isMovingItem"
                :key="`desktop-${detailPanelKey}`"
                :item="selectedItem"
                :is-mobile="false"
                :location-labels="locationLabels"
                :units-by-ref="unitsByRef"
                :inventory-locations="categories.inventory"
                @close="handleCloseDetail"
                @action="handleItemAction"
                @move="moveItem"
              ></item-detail-card>
              <edit-item-card
                v-else-if="selectedItem && isEditingItem"
                key="desktop-edit-card"
                :item="selectedItem"
                :units="units"
                :inventory-locations="categories.inventory"
                :location-labels="locationLabels"
                @cancel="cancelEdit"
                @save="saveEdit"
              />
              <move-item-card
                v-else-if="selectedItem && isMovingItem"
                key="desktop-move-card"
                :item="selectedItem"
                :inventory-locations="categories.inventory"
                :location-labels="locationLabels"
                @cancel="cancelMove"
                @move="moveItem"
              />
            </transition>
          </v-col>

          <!-- Right buffer spacer (lg+) -->
          <v-col v-if="hasBufferColumns" cols="0" lg="1" xl="1" xxl="2"></v-col>
        </v-row>
      </v-container>
    </v-main>

    <add-item-modal
      :proto-item="protoItem"
      :locations="categories.inventory"
      :location-labels="locationLabels"
      :units="units"
      @open="resetProto"
      @submit="addItem"
    ></add-item-modal>

    <item-detail-card
      v-if="selectedItem && isMobile"
      :item="selectedItem"
      :is-mobile="true"
      :location-labels="locationLabels"
      :units-by-ref="unitsByRef"
      :inventory-locations="categories.inventory"
      @close="handleCloseDetail"
      @action="handleItemAction"
      @save="saveEdit"
      @move="moveItem"
    ></item-detail-card>

    <undo-toast
      :key="undoToastKey"
      :model-value="showUndoToast"
      :item-name="deletedItemName"
      @update:model-value="handleUndoToastVisibility"
      @undo="undoRemoveItem"
    />

    <v-footer class="app-footer justify-center py-2">
      <span class="text-center">© 2024 Grocenator. Just kidding who has time for that paperwork.</span>
    </v-footer>
  </v-app>
</template>

<style scoped>
.sticky-side {
  position: sticky;
  top: var(--sticky-top, 56px);
  height: fit-content;
}

@media (min-width: 960px) and (max-width: 1279.98px) {
  .content-row {
    --v-gutter-x: 12px;
  }
}

.app-footer {
  flex: 0 0 auto;
}

.panel-swap-enter-active,
.panel-swap-leave-active {
  transition:
    transform 200ms ease,
    opacity 200ms ease;
}

.panel-swap-enter-from {
  transform: translateY(20px);
  opacity: 0;
}

.panel-swap-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}
</style>
