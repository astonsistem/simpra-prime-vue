<template>
  <router-view />
  <Toast />
  <ConfirmDialog />
</template>

<script>
import { defineComponent } from 'vue'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'

export default defineComponent({
  name: 'App',
  components: {
    Toast,
    ConfirmDialog,
  },
})
</script>
