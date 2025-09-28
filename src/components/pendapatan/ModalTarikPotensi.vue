<template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="jenis == 'pelayanan' ? 'Tarik Potensi Pelayanan' : 'Tarik Potensi Lainnya'"
    :style="{ width: '60rem' }"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
  >
    <div class="p-4">
      <div>
        <label class="block text-sm font-medium text-gray-700">{{ fieldConfig.label }}</label>
        <DatePicker
          v-model="formData[fieldConfig.key]"
          date-format="dd/mm/yy"
          :placeholder="fieldConfig.placeholder"
          showIcon
          class="w-full"
        />
      </div>
    </div>
    <template #footer>
      <Button label="Batal" icon="pi pi-times" @click="closeModal" class="p-button-text" />
      <Button
        label="Tarik Data"
        icon="pi pi-download"
        @click="saveData"
        :loading="loading"
        class="p-button-success"
      />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import Dialog from 'primevue/dialog'
import DatePicker from 'primevue/datepicker'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import api from '@/api/client.js'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  jenis: {
    type: String,
    required: true,
  }
})
const emit = defineEmits(['update:modelValue', 'saved'])
const toast = useToast()
const loading = ref(false)
const visible = ref(props.modelValue)
const defaultForm = {
  tgl_pelayanan: '',
  tgl_dokumen: ''
}
const formData = ref({ ...defaultForm })
const resetForm = () => {
  formData.value = { ...defaultForm }
}
const formatDateToYYYYMMDD = (date) => {
  if (!date) return null
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
const fieldConfig = computed(() => {
  if (props.jenis == "pelayanan") {
    return {
      key: "tgl_pelayanan",
      label: "Tanggal Pelayanan",
      placeholder: "Tanggal Pelayanan"
    }
  } else {
    return {
      key: "tgl_dokumen",
      label: "Tanggal Dokumen",
      placeholder: "Tanggal Dokumen"
    }
  }
})

watch(
  () => props.modelValue,
  (newValue) => {
    visible.value = newValue
  }
)
watch(visible, (newValue) => {
  emit('update:modelValue', newValue)
})

const saveData = async () => {
  loading.value = true
  try {
    const payload = formData.value

    // Clean payload from null or undefined value
    const cleanedPayload = Object.entries(payload).reduce((acc, [key, value]) => {
      if (value !== null && value !== undefined) {
        if (key.startsWith('tgl_') && value) {
          acc[key] = formatDateToYYYYMMDD(value)
        } else {
          acc[key] = value
        }
      }
      return acc
    }, {})

    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    }

    const res = await api.post(`/potensi_${props.jenis}/tarik`, cleanedPayload, config)

    if (res.data.count == 0) {
      toast.add({
        severity: 'warn',
        summary: 'Peringatan',
        detail: 'Tidak ada data yang ditarik',
        life: 3000,
      })
    }else {
      toast.add({
        severity: 'success',
        summary: 'Berhasil',
        detail: `${res.data.count} Data berhasil ditarik`,
        life: 3000,
      })
      emit('saved')
    }

    closeModal()
  } catch (error) {
    console.error('Gagal tarik data:', error)
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: 'Gagal tarik data. Silakan coba lagi.',
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}
const closeModal = () => {
  visible.value = false
  resetForm()
}
</script>
