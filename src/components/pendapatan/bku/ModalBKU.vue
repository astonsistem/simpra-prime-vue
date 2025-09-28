<template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="isEdit ? 'Edit Data BKU' : 'Tambah Data BKU'"
    :style="isEdit ? { width: '60rem' } : { width: '32rem' }"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
  >
    <div class="p-4">
      <div>
        <div>
          <label class="block mt-2 text-sm font-medium text-gray-700">Tanggal BKU</label>
          <DatePicker
            v-model="formData.tgl_bku"
            date-format="dd/mm/yy"
            placeholder="Tanggal BKU"
            showIcon
            class="w-full"
          />
        </div>
        <div>
          <label class="block mt-2 text-sm font-medium text-gray-700">Jenis</label>
          <Dropdown
            v-model="formData.jenis"
            :options="options.jenis"
            optionLabel="label"
            optionValue="value"
            placeholder="Pilih Jenis"
            class="w-full"
          />
        </div>
        <div>
          <label class="block mt-2 text-sm font-medium text-gray-700">Keterangan</label>
          <InputText v-model="formData.ket" placeholder="Keterangan" class="w-full" />
        </div>
        <div>
          <label class="block mt-2 text-sm font-medium text-gray-700">Uraian</label>
          <Textarea
            v-model="formData.uraian"
            rows="3"
            cols="30"
            autoResize
            placeholder="Uraian"
            class="w-full"
          />
        </div>
      </div>
      <div v-if="isEdit" class="flex gap-2">
        <Button
          label="Tambah Rincian"
          icon="pi pi-plus"
          @click="createRincian"
          :loading="loading"
          class="p-button-success mt-4"
        />
      </div>
      <TabView v-if="isEdit" v-model:activeIndex="activeIndex" class="mt-4">
        <TabPanel header="Rincian BKU">
          <TableRincianBKU
            ref="tableRincianBKU"
            :bkuId="formData.bku_id"
            :options="options"
          />
        </TabPanel>
      </TabView>
    </div>
    <template #footer>
      <Button label="Batal" icon="pi pi-times" @click="closeModal" class="p-button-text" />
      <Button
        label="Simpan"
        icon="pi pi-check"
        @click="saveData"
        :loading="loading"
        class="p-button-success"
      />
    </template>
  </Dialog>
  <ModalRincianBKU
    v-model="showModal" 
    :item="selectedItem" 
    :bkuId="formData.bku_id"
    :options="options"
    @saved="handleSaved" 
  />
</template>

<script setup>
import { ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import DatePicker from 'primevue/datepicker'
import Dropdown from 'primevue/dropdown'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import api from '@/api/client.js'
import TableRincianBKU from '@/components/pendapatan/bku/TableRincianBKU.vue'
import ModalRincianBKU from '@/components/pendapatan/bku/ModalRincianBKU.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  item: {
    type: Object,
    default: null,
  },
  options: Object
})
const emit = defineEmits(['update:modelValue', 'saved'])
const toast = useToast()
const loading = ref(false)
const showModal = ref(false)
const visible = ref(props.modelValue)
const selectedItem = ref(null)
const isEdit = ref(false)
const activeIndex = ref(0) 
const tableRincianBKU = ref(null)
const defaultForm = {
  bku_id: 0,
  ket: '',
  tgl_bku: '',
  jenis: 0,
  uraian: ''
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

watch(
  () => props.modelValue,
  (newValue) => {
    visible.value = newValue
  }
)
watch(visible, (newValue) => {
  emit('update:modelValue', newValue)
})
watch(
  () => props.item,
  (newItem) => {
    if (!newItem) {
      resetForm()
      isEdit.value = false
      return
    }
    isEdit.value = true

    Object.keys(formData.value).forEach((key) => {
      if (key.startsWith('tgl_')) {
        formData.value[key] = newItem[key] ? new Date(newItem[key]) : null
      } else {
        formData.value[key] = newItem[key]
      }
    })
  },
  { immediate: true }
)

const createRincian = async () => {
  selectedItem.value = null
  showModal.value = true
}

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

    if (isEdit.value) {
      await api.put(`/bku/${formData.value.bku_id}`, cleanedPayload, config)
    } else {
      await api.post('/bku', cleanedPayload, config)
    }

    toast.add({
      severity: 'success',
      summary: 'Berhasil',
      detail: `Data berhasil ${isEdit.value ? 'diperbarui' : 'ditambahkan'}`,
      life: 3000,
    })

    emit('saved')
    closeModal()
  } catch (error) {
    console.error('Gagal menyimpan data:', error)
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: 'Gagal menyimpan data. Silakan coba lagi.',
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}

const handleSaved = () => {
  showModal.value = false
  tableRincianBKU.value.loadData()
}

const closeModal = () => {
  visible.value = false
  resetForm()
}
</script>
