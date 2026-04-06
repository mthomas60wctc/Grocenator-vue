import { ref, watch } from "vue";
import { createEditDraft, inputToNumber, numberToInput } from "./itemHelpers";

export function useItemEditDraft(props, options = {}) {
  const getDefaultUnitRef = options.getDefaultUnitRef || (() => "");
  const draft = ref(createEditDraft(props.item, props.inventoryLocations, getDefaultUnitRef()));

  watch(
    () => props.item,
    (nextItem) => {
      draft.value = createEditDraft(nextItem, props.inventoryLocations, getDefaultUnitRef());
    },
    { deep: true, immediate: true }
  );
  return {
    draft,
    inputToNumber,
    numberToInput,
  };
}