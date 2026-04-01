<script setup>
import CardActionButton from "../shared/cardActionButton.vue";

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  confirmText: {
    type: String,
    default: "Confirm",
  },
  cancelText: {
    type: String,
    default: "Cancel",
  },
});
const emit = defineEmits(["close", "confirm"]);

function onDialogModelChange(value) {
  if (!value) {
    emit("close");
  }
}
</script>
<template>
  <v-dialog :model-value="isOpen" max-width="640" @update:model-value="onDialogModelChange">
    <v-card>
      <v-card-title>{{ title }}</v-card-title>
      <v-card-text>
        <slot></slot>
      </v-card-text>
      <v-card-actions class="pa-0 ma-0 action-row">
        <card-action-button
          color="warning"
          icon="mdi-close"
          :text="cancelText"
          curved-lower-corners
          @click="$emit('close')"
        />
        <card-action-button
          color="primary"
          icon="mdi-content-save"
          :text="confirmText"
          curved-lower-corners
          @click="$emit('confirm')"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.action-row {
  width: 100%;
  display: flex;
  gap: 0;
  min-height: 0;
}

.action-row :deep(.v-btn + .v-btn) {
  margin-inline-start: 0;
}
</style>
