<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'
import { useToast } from 'primevue/usetoast'
import api from '@/services/http.js'

const props = defineProps({
  sync: Object,
  isEdit: Boolean,
})

const emit = defineEmits(['close', 'saved'])
const toast = useToast()

const syncData = ref({})

const groupUsers = ref([
  { text: 'monev kasir', value: 'monev kasir' },
  { text: 'monev piutang', value: 'monev piutang' },
  { text: 'akrual', value: 'akrual' },
  { text: 'monev swa', value: 'monev swa' },
  { text: 'bendahara', value: 'bendahara' },
  { text: 'semua user', value: 'semua user' },
  { text: 'Monev Pendapatan Lain-lain', value: 'Monev Pendapatan Lain-lain' },
])

watch(
  () => props.sync,
  (newSync) => {
    syncData.value = newSync ? { ...newSync } : {}
  },
  { immediate: true }
)

async function saveSync() {
  try {
    if (props.isEdit) {
      await api.put(`/sinkronisasi/${syncData.value.id}`, syncData.value)
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Sync data updated',
        life: 3000,
      })
    } else {
      await api.post('/sinkronisasi', syncData.value)
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Sync data created',
        life: 3000,
      })
    }
    emit('saved')
    emit('close')
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Could not save sync data',
      life: 3000,
    })
  }
}
</script>

<template>
  <Dialog
    :visible="true"
    :style="{ width: '700px' }"
    :header="isEdit ? 'Edit Sync' : 'Add Sync'"
    :modal="true"
    class="p-fluid"
    @update:visible="$emit('close')"
  >
    <div class="field grid">
      <label for="nama" class="col-12 mb-2 md:col-2 md:mb-0">Nama</label>
      <div class="col-12 md:col-10">
        <InputText id="nama" v-model.trim="syncData.sinkronisasi_nama" required="true" autofocus />
      </div>
    </div>
    <div class="field grid">
      <label for="menu" class="col-12 mb-2 md:col-2 md:mb-0">Menu</label>
      <div class="col-12 md:col-10">
        <InputText id="menu" v-model.trim="syncData.sinkronisasi_menu" required="true" />
      </div>
    </div>
    <div class="field grid">
      <label for="api_url" class="col-12 mb-2 md:col-2 md:mb-0">API Url</label>
      <div class="col-12 md:col-10">
        <InputText id="api_url" v-model.trim="syncData.sinkronisasi_api" required="true" />
      </div>
    </div>
    <div class="field grid">
      <label for="group_user" class="col-12 mb-2 md:col-2 md:mb-0">Group User</label>
      <div class="col-12 md:col-10">
        <Dropdown
          id="group_user"
          v-model="syncData.sinkronisasi_groupuser"
          :options="groupUsers"
          optionLabel="text"
          optionValue="value"
          placeholder="Select a Group"
        />
      </div>
    </div>
    <template #footer>
      <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="$emit('close')" />
      <Button
        :label="isEdit ? 'Update' : 'Save'"
        icon="pi pi-check"
        class="p-button-text"
        @click="saveSync"
      />
    </template>
  </Dialog>
</template>
