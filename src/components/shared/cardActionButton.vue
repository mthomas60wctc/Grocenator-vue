<script setup>
import { computed } from "vue";

const props = defineProps({
  color: {
    type: String,
    default: "primary",
  },
  variant: {
    type: String,
    default: "outlined",
  },
  icon: {
    type: String,
    default: "",
  },
  text: {
    type: String,
    default: "",
  },
  curvedLowerCorners: {
    type: Boolean,
    default: false,
  },
  ariaLabel: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["click"]);

const hasIcon = computed(() => props.icon.trim().length > 0);
const hasText = computed(() => props.text.trim().length > 0);

const resolvedAriaLabel = computed(() => props.ariaLabel || props.text || undefined);

const actionStyle = computed(() => ({
  borderColor: `rgb(var(--v-theme-${props.color}))`,
  backgroundColor: `rgba(var(--v-theme-${props.color}), 0.14)`,
}));
</script>

<template>
  <v-btn
    class="flex-1 rounded-0 card-action-btn"
    :class="{ 'card-action-btn--curved': curvedLowerCorners }"
    :color="color"
    :variant="variant"
    :aria-label="resolvedAriaLabel"
    :style="actionStyle"
    @click="emit('click')"
  >
    <v-icon v-if="hasIcon" :icon="icon" :class="{ 'card-action-icon--with-text': hasText }" />
    <template v-if="hasText">{{ text }}</template>
  </v-btn>
</template>

<style scoped>
.card-action-btn {
  flex: 1 1 0;
  min-width: 0;
  --v-btn-height: 30px;
  height: 30px;
  min-height: 30px;
  margin: 0;
  border-width: 1px;
  border-style: solid;
}

.card-action-btn--curved {
  border-bottom-left-radius: var(--v-card-border-radius);
  border-bottom-right-radius: var(--v-card-border-radius);
}

.card-action-icon--with-text {
  margin-inline-end: 6px;
}
</style>
