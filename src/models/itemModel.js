export class ItemModel {
  constructor(data = {}, inventoryLocations = []) {
    this.inventoryLocations = [...inventoryLocations];
    this.name = String(data?.name ?? "");
    this.inventory = this.normalizeInventory(data?.inventory);
    this.shopping = Number(data?.shopping || 0);
    this.unitRef = String(data?.unitRef ?? "");
    this.restock = Number(data?.restock || 0);
  }

  static from(data = {}, inventoryLocations = []) {
    return new ItemModel(data, inventoryLocations);
  }

  static empty(inventoryLocations = [], defaults = {}) {
    return new ItemModel(
      {
        name: "",
        inventory: {},
        shopping: 0,
        unitRef: defaults.unitRef || "",
        restock: 0,
      },
      inventoryLocations
    );
  }

  normalizeInventory(inventory = {}) {
    return this.inventoryLocations.reduce((normalized, location) => {
      normalized[location] = Number(inventory?.[location] || 0);
      return normalized;
    }, {});
  }

  toPlain() {
    return {
      name: this.name,
      inventory: { ...this.inventory },
      shopping: this.shopping,
      unitRef: this.unitRef,
      restock: this.restock,
    };
  }

  clone() {
    return ItemModel.from(this.toPlain(), this.inventoryLocations);
  }

  inventoryEntries() {
    return Object.entries(this.inventory || {}).filter(([, quantity]) => Number(quantity) > 0);
  }

  totalInventory() {
    return Object.values(this.inventory || {}).reduce((total, quantity) => total + Number(quantity || 0), 0);
  }

  shoppingQuantity() {
    return Number(this.shopping || 0);
  }

  restockQuantity() {
    return Number(this.restock || 0);
  }

  inventoryQuantityAt(location) {
    return Number(this.inventory?.[location] || 0);
  }

  hasInventoryAt(location) {
    return this.inventoryQuantityAt(location) > 0;
  }

  isBelowMinimum() {
    return this.totalInventory() + this.shoppingQuantity() < this.restockQuantity();
  }

  moveQuantity(fromLocation, toLocation, quantity) {
    const requestedQuantity = Number(quantity || 0);
    if (!fromLocation || !toLocation || fromLocation === toLocation || requestedQuantity <= 0) {
      return 0;
    }

    const availableQuantity = this.inventoryQuantityAt(fromLocation);
    const transferQuantity = Math.min(requestedQuantity, availableQuantity);
    if (transferQuantity <= 0) {
      return 0;
    }

    this.inventory[fromLocation] = availableQuantity - transferQuantity;
    this.inventory[toLocation] = this.inventoryQuantityAt(toLocation) + transferQuantity;
    return transferQuantity;
  }
}
