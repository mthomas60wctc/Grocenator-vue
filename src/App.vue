<script setup>
import { ref, computed, onMounted, nextTick, watch } from "vue";
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
import { ItemModel } from "./models/itemModel";
import { ItemCollection } from "./models/itemCollection";

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
const listSectionElement = ref(null);
const listCardElement = ref(null);
const theme = useTheme();
const display = useDisplay();
const locationLabels = {
  refrigerator: "Refrigerator",
  freezer: "Freezer",
  cupboard: "Cupboard",
  pantry: "Pantry",
};
const inventoryLocations = categories.value.inventory;
const unitsByRef = units;
const unitOptions = Object.values(unitsByRef);
const defaultUnitRef = Object.keys(unitsByRef)[0] || "";

function createInventory(initialValues = {}) {
  return ItemModel.empty(inventoryLocations).normalizeInventory(initialValues);
}

const itemList = ref([
  ItemModel.from({ name: "Almonds", inventory: createInventory({ cupboard: 2, pantry: 1 }), shopping: 1, unitRef: "lb", restock: 0 }, inventoryLocations),
  ItemModel.from({ name: "Apples", inventory: createInventory({ refrigerator: 6 }), shopping: 5, unitRef: "count", restock: 0 }, inventoryLocations),
  ItemModel.from({ name: "Bananas", inventory: createInventory({ pantry: 2, refrigerator: 3 }), shopping: 2, unitRef: "count", restock: 0 }, inventoryLocations),
  ItemModel.from({ name: "Bell Peppers", inventory: createInventory({ refrigerator: 4 }), shopping: 0, unitRef: "count", restock: 0 }, inventoryLocations),
  ItemModel.from({ name: "Bread", inventory: createInventory({ cupboard: 1, freezer: 1 }), shopping: 0, unitRef: "loaf", restock: 2 }, inventoryLocations),
  ItemModel.from({ name: "Broccoli", inventory: createInventory({ refrigerator: 2 }), shopping: 1, unitRef: "head", restock: 0 }, inventoryLocations),
  ItemModel.from({ name: "Butter", inventory: createInventory({ refrigerator: 1, freezer: 2 }), shopping: 0, unitRef: "lb", restock: 1 }, inventoryLocations),
  ItemModel.from({ name: "Canned Beans", inventory: createInventory({ cupboard: 4, pantry: 2 }), shopping: 0, unitRef: "can", restock: 3 }, inventoryLocations),
  ItemModel.from({ name: "Cheese", inventory: createInventory({ refrigerator: 12 }), shopping: 8, unitRef: "oz", restock: 0 }, inventoryLocations),
  ItemModel.from({ name: "Chicken Breast", inventory: createInventory({ freezer: 3 }), shopping: 2, unitRef: "lb", restock: 0 }, inventoryLocations),
  ItemModel.from({ name: "Coffee", inventory: createInventory({ cupboard: 1, pantry: 1 }), shopping: 1, unitRef: "bag", restock: 1 }, inventoryLocations),
  ItemModel.from({ name: "Eggs", inventory: createInventory({ refrigerator: 12 }), shopping: 0, unitRef: "count", restock: 2 }, inventoryLocations),
  ItemModel.from({ name: "Flour", inventory: createInventory({ pantry: 3, cupboard: 1 }), shopping: 5, unitRef: "lb", restock: 3 }, inventoryLocations),
  ItemModel.from({ name: "Ground Beef", inventory: createInventory({ freezer: 2 }), shopping: 0, unitRef: "lb", restock: 0 }, inventoryLocations),
  ItemModel.from({ name: "Honey", inventory: createInventory({ pantry: 2, cupboard: 1 }), shopping: 0, unitRef: "jar", restock: 1 }, inventoryLocations),
  ItemModel.from({ name: "Milk", inventory: createInventory({ refrigerator: 1 }), shopping: 1, unitRef: "gal", restock: 2 }, inventoryLocations),
  ItemModel.from({ name: "Olive Oil", inventory: createInventory({ pantry: 1, cupboard: 1 }), shopping: 1, unitRef: "L", restock: 1 }, inventoryLocations),
  ItemModel.from({ name: "Pasta", inventory: createInventory({ pantry: 3, cupboard: 2 }), shopping: 0, unitRef: "lb", restock: 3 }, inventoryLocations),
  ItemModel.from({ name: "Rice", inventory: createInventory({ pantry: 2 }), shopping: 2, unitRef: "lb", restock: 3 }, inventoryLocations),
  ItemModel.from({ name: "Shrimp", inventory: createInventory({ freezer: 1 }), shopping: 1, unitRef: "lb", restock: 0 }, inventoryLocations),
  ItemModel.from({ name: "Spinach", inventory: createInventory({ refrigerator: 1 }), shopping: 0, unitRef: "oz", restock: 0 }, inventoryLocations),
  ItemModel.from({ name: "Sugar", inventory: createInventory({ pantry: 4 }), shopping: 0, unitRef: "lb", restock: 2 }, inventoryLocations),
  ItemModel.from({ name: "Tuna", inventory: createInventory({ cupboard: 3 }), shopping: 0, unitRef: "can", restock: 2 }, inventoryLocations),
  ItemModel.from({ name: "Yogurt", inventory: createInventory({ refrigerator: 6 }), shopping: 0, unitRef: "cup", restock: 12 }, inventoryLocations),
]);
const protoItem = ref(ItemModel.empty(inventoryLocations, { unitRef: defaultUnitRef }));

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
    scheduleListScroll();
  }
}

function handleSubcategorySelect(subcategory) {
  selectedSubcategory.value = subcategory;
  inventoryFilters.value = [subcategory];
  scheduleListScroll();
}

let scrollTimeoutId = null;

function scheduleListScroll() {
  if (scrollTimeoutId) {
    window.clearTimeout(scrollTimeoutId);
  }

  scrollTimeoutId = window.setTimeout(() => {
    scrollTimeoutId = null;
    void scrollListToTop();
  }, 180);
}

async function scrollListToTop() {
  await nextTick();
  await nextTick();

  const targetDom = resolveRefElement(listCardElement.value) || resolveRefElement(listSectionElement.value);
  if (!targetDom) {
    window.scrollTo({ top: 0, behavior: "auto" });
    return;
  }

  targetDom.scrollIntoView({ block: "start", inline: "nearest", behavior: "auto" });
}

watch([activeTab, selectedSubcategory], () => {
  scheduleListScroll();
}, { flush: "post" });

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
    inventory: ItemModel.from({ inventory: draft.inventory }, inventoryLocations).inventory,
    shopping: Number(draft.shopping || 0),
    unitRef: draft.unitRef || defaultUnitRef,
    restock: Number(draft.restock || 0),
  });

  itemList.value = ItemCollection.sortByName(itemList.value);
  detailPanelKey.value += 1;
  cancelEdit();
}

function moveItem(movePayload) {
  if (!selectedItem.value || !movePayload) {
    return;
  }
  const transferQuantity = ItemModel.from(selectedItem.value, inventoryLocations).moveQuantity(
    movePayload.fromLocation,
    movePayload.toLocation,
    movePayload.quantity
  );

  if (transferQuantity <= 0) {
    return;
  }

  detailPanelKey.value += 1;
  cancelMove();
}

function removeItem(item) {
  if (!item) {
    return;
  }
  const result = ItemCollection.removeByReference(itemList.value, item);
  if (result.index < 0) {
    return;
  }
  lastDeletedItem.value = item;
  lastDeletedIndex.value = result.index;
  deletedItemName.value = item.name || "Item";
  itemList.value = result.items;
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
  itemList.value = ItemCollection.insertSorted(itemList.value, protoItem.value.clone());
  resetProto();
}
function resetProto() {
  protoItem.value = ItemModel.empty(inventoryLocations, { unitRef: defaultUnitRef });
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
const sectionCounts = computed(() => {
  const byLocation = inventoryLocations.reduce((counts, location) => {
    counts[location] = itemList.value.filter((item) => Number(item.inventory?.[location] || 0) > 0).length;
    return counts;
  }, {});

  return {
    inventory: inventoryList.value.length,
    catalog: itemList.value.length,
    shopping: shoppingList.value.length,
    ...byLocation,
  };
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
                  :section-counts="sectionCounts"
                  @change-tab="setActiveTab"
                  @subcategory-select="handleSubcategorySelect"
                ></tab-navigator>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Center (list) -->
          <v-col ref="listSectionElement" cols="12" sm="12" md="6" lg="6" xl="6" xxl="4">
            <v-card ref="listCardElement" class="list-scroll-target" :style="{ scrollMarginTop: `${navbarHeight + 8}px` }">
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
                :units="unitOptions"
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
      :units="unitOptions"
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
