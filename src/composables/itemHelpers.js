import { ItemModel } from "../models/itemModel";

export function capitalizeLabel(value) {
  const normalized = String(value ?? "");
  if (normalized.length === 0) {
    return "";
  }
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export function resolveLocationLabel(location, labels = {}, capitalizeFallback = true) {
  if (labels?.[location]) {
    return labels[location];
  }
  return capitalizeFallback ? capitalizeLabel(location) : String(location ?? "");
}

export function locationEntries(item) {
  return ItemModel.from(item).inventoryEntries();
}

export function resolveUnit(item, unitsByRef = {}) {
  return unitsByRef?.[item?.unitRef] || null;
}

export function unitDisplay(item, unitsByRef = {}) {
  const resolvedUnit = resolveUnit(item, unitsByRef);
  if (!resolvedUnit) {
    return "";
  }
  return capitalizeLabel(resolvedUnit.alias || resolvedUnit.unit);
}

export function unitOptionLabel(unitDef) {
  const resolvedUnit = unitDef || {};
  const unitRef = String(resolvedUnit.unit || "").trim();
  const normalizedRef = unitRef.toLowerCase();

  if (normalizedRef === "count") {
    return "Count";
  }

  const displayBase = String(
    resolvedUnit.pluralAlias || resolvedUnit.alias || resolvedUnit.pluralUnit || resolvedUnit.unit || ""
  ).trim();
  const displayLabel = capitalizeLabel(displayBase || unitRef);

  return unitRef.length > 0 ? `${displayLabel} (${unitRef})` : displayLabel;
}

export function quantityWithUnit(item, quantity, unitsByRef = {}) {
  const resolvedUnit = resolveUnit(item, unitsByRef);
  if (!resolvedUnit || !Number.isFinite(Number(quantity))) {
    return String(quantity);
  }
  const numericQuantity = Number(quantity);
  const unitLabel = numericQuantity === 1 ? resolvedUnit.unit : resolvedUnit.pluralUnit || resolvedUnit.unit;
  return `${quantity} ${unitLabel}`;
}

export function totalInventoryText(item, unitsByRef = {}) {
  return quantityWithUnit(item, ItemModel.from(item).totalInventory(), unitsByRef);
}

export function createInventoryDraft(inventoryLocations = [], initialValues = {}) {
  return inventoryLocations.reduce((inventory, location) => {
    inventory[location] = Number(initialValues?.[location] || 0);
    return inventory;
  }, {});
}

export function createEditDraft(item, inventoryLocations = [], defaultUnitRef = "") {
  const normalizedItem = ItemModel.from(item, inventoryLocations).toPlain();
  return {
    name: normalizedItem.name || "",
    inventory: createInventoryDraft(inventoryLocations, normalizedItem.inventory || {}),
    shopping: Number(normalizedItem.shopping || 0),
    unitRef: normalizedItem.unitRef || defaultUnitRef || "",
    restock: Number(normalizedItem.restock || 0),
  };
}

export function createMoveDraft(item, inventoryLocations = []) {
  const normalizedItem = ItemModel.from(item, inventoryLocations);
  const availableFromLocations = inventoryLocations.filter((location) => normalizedItem.hasInventoryAt(location));
  const fromLocation = availableFromLocations[0] || inventoryLocations[0] || "";
  const toLocation = inventoryLocations.find((location) => location !== fromLocation) || "";
  return {
    quantity: "",
    fromLocation,
    toLocation,
  };
}

export function numberToInput(value) {
  return Number(value || 0) === 0 ? "" : String(value);
}

export function inputToNumber(value) {
  if (value === null || value === undefined || String(value).trim() === "") {
    return 0;
  }
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
}