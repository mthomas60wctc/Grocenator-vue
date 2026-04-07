export class ItemCollection {
  static sortByName(items = []) {
    return [...items].sort((a, b) => String(a?.name ?? "").localeCompare(String(b?.name ?? "")));
  }

  static insertSorted(items = [], item) {
    return ItemCollection.sortByName([...items, item]);
  }

  static removeByReference(items = [], item) {
    const index = items.findIndex((listItem) => listItem === item);
    if (index < 0) {
      return { items: [...items], index: -1 };
    }

    const nextItems = [...items];
    nextItems.splice(index, 1);
    return { items: nextItems, index };
  }
}
