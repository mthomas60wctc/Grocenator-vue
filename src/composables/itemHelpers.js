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
  return Object.entries(item?.inventory || {}).filter(([, quantity]) => Number(quantity) > 0);
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
  const totalQuantity = Object.values(item?.inventory || {}).reduce(
    (total, quantity) => total + Number(quantity || 0),
    0
  );
  return quantityWithUnit(item, totalQuantity, unitsByRef);
}

export function createInventoryDraft(inventoryLocations = [], initialValues = {}) {
  return inventoryLocations.reduce((inventory, location) => {
    inventory[location] = Number(initialValues?.[location] || 0);
    return inventory;
  }, {});
}

export function createEditDraft(item, inventoryLocations = [], defaultUnitRef = "") {
  return {
    name: item?.name || "",
    inventory: createInventoryDraft(inventoryLocations, item?.inventory || {}),
    shopping: Number(item?.shopping || 0),
    unitRef: item?.unitRef || defaultUnitRef || "",
    restock: Number(item?.restock || 0),
  };
}

export function createMoveDraft(item, inventoryLocations = []) {
  const availableFromLocations = inventoryLocations.filter((location) => Number(item?.inventory?.[location] || 0) > 0);
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