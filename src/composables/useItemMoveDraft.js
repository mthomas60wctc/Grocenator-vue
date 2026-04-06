import { computed, ref, watch } from "vue";
import { createMoveDraft, inputToNumber } from "./itemHelpers";

export function useItemMoveDraft(props, getLocationLabel) {
  const draft = ref(createMoveDraft(props.item, props.inventoryLocations));

  const fromLocationOptions = computed(() =>
    props.inventoryLocations
      .filter((location) => Number(props.item?.inventory?.[location] || 0) > 0)
      .map((location) => ({
        title: getLocationLabel(location),
        value: location,
      }))
  );

  const toLocationOptions = computed(() =>
    props.inventoryLocations
      .filter((location) => location !== draft.value.fromLocation)
      .map((location) => ({
        title: getLocationLabel(location),
        value: location,
      }))
  );

  watch(
    () => props.item,
    (nextItem) => {
      draft.value = createMoveDraft(nextItem, props.inventoryLocations);
    },
    { deep: true, immediate: true }
  );

  watch(
    [fromLocationOptions, toLocationOptions],
    ([fromOptions, toOptions]) => {
      if (!fromOptions.some((option) => option.value === draft.value.fromLocation)) {
        draft.value.fromLocation = fromOptions[0]?.value || "";
      }
      if (!toOptions.some((option) => option.value === draft.value.toLocation)) {
        draft.value.toLocation = toOptions[0]?.value || "";
      }
    },
    { immediate: true }
  );
  return {
    draft,
    fromLocationOptions,
    toLocationOptions,
    inputToNumber,
  };
}