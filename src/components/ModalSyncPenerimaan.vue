<template>
  <Dialog
    v-model="visible"
    modal
    header="Sinkronisasi Data"
    :style="{ width: '50rem' }"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
  >
    <div class="p-4">
      <div class="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">Tahun</label>
          <Dropdown
            v-model="syncData.tahun"
            :options="tahunOptions"
            placeholder="Pilih Tahun"
            class="w-full"
          />
        </div>
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">Bulan</label>
          <Dropdown
            v-model="syncData.bulan"
            :options="bulanOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Pilih Bulan"
            class="w-full"
          />
        </div>
      </div>
      <div class="flex gap-2">
        <Button
          label="Request Data"
          icon="pi pi-refresh"
          class="p-button-info"
          @click="requestData"
          :loading="loading"
        />
        <Button
          label="Sinkronisasi"
          icon="pi pi-sync"
          class="p-button-success"
          @click="performSync"
          :loading="loading"
          :disabled="!hasData"
        />
        <Button label="Reset" icon="pi pi-times" class="p-button-secondary" @click="resetData" />
      </div>
    </div>
    <template #footer>
      <Button label="Tutup" icon="pi pi-times" @click="closeModal" class="p-button-text" />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'sync'])

const toast = useToast()
const loading = ref(false)
const hasData = ref(false)

const syncData = ref({
  tahun: '',
  bulan: '',
})

const tahunOptions = Array.from({ length: 10 }, (_, i) => `${new Date().getFullYear() - 5 + i}`)

const bulanOptions = [
  { label: 'Januari', value: '01' },
  { label: 'Februari', value: '02' },
  { label: 'Maret', value: '03' },
  { label: 'April', value: '04' },
  { label: 'Mei', value: '05' },
  { label: 'Juni', value: '06' },
  { label: 'Juli', value: '07' },
  { label: 'Agustus', value: '08' },
  { label: 'September', value: '09' },
  { label: 'Oktober', value: '10' },
  { label: 'November', value: '11' },
  { label: 'Desember', value: '12' },
]

const visible = ref(props.modelValue)

watch(
  () => props.modelValue,
  (newValue) => {
    visible.value = newValue
  }
)

watch(visible, (newValue) => {
  emit('update:modelValue', newValue)
})

const requestData = async () => {
  if (!syncData.value.tahun || !syncData.value.bulan) {
    toast.add({
      severity: 'warn',
      summary: 'Peringatan',
      detail: 'Silakan pilih tahun dan bulan terlebih dahulu',
      life: 3000,
    })
    return
  }

  loading.value = true
  try {
    // TODO: Implement request data API call
    await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulate API call
    hasData.value = true
    toast.add({
      severity: 'success',
      summary: 'Berhasil',
      detail: 'Data berhasil di-request',
      life: 3000,
    })
  } catch (error) {
    console.error('Gagal request data:', error)
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: 'Gagal request data. Silakan coba lagi.',
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}

const performSync = async () => {
  loading.value = true
  try {
    // TODO: Implement sync data API call
    await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulate API call
    toast.add({
      severity: 'success',
      summary: 'Berhasil',
      detail: 'Data berhasil disinkronisasi',
      life: 3000,
    })
    emit('sync')
    closeModal()
  } catch (error) {
    console.error('Gagal sinkronisasi data:', error)
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: 'Gagal sinkronisasi data. Silakan coba lagi.',
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}

const resetData = () => {
  syncData.value = {
    tahun: '',
    bulan: '',
  }
  hasData.value = false
}

const closeModal = () => {
  visible.value = false
  resetData()
}
</script>
