<template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="isEdit ? 'Edit Data Rincian BKU' : 'Tambah Data Rincian BKU'"
    :style="{ width: '40rem' }"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
  >
    <div class="p-4">
      <div class="grid grid-cols-2 gap-6">
        <div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Akun</label>
            <Dropdown
              v-model="formData.akun_id"
              :options="options.akun"
              optionLabel="label"
              optionValue="value"
              placeholder="Pilih Akun"
              class="w-full"
              filter
              filterPlaceholder="Search Akun"
            />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">Rekening</label>
            <Dropdown
              v-model="formData.rek_id"
              :options="options.rekening"
              optionLabel="label"
              optionValue="value"
              placeholder="Pilih Rekening"
              class="w-full"
            />
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
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">Keterangan</label>
            <InputText v-model="formData.ket" placeholder="Keterangan" class="w-full" />
          </div>
        </div>
        <div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Jumlah</label>
            <InputNumber
              v-model="formData.jumlah"
              placeholder="Jumlah"
              class="w-full"
              mode="currency"
              currency="IDR"
              locale="id-ID"
            />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">Pendapatan</label>
            <InputNumber
              v-model="formData.pendapatan"
              placeholder="Pendapatan"
              class="w-full"
              mode="currency"
              currency="IDR"
              locale="id-ID"
            />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">PDD</label>
            <InputNumber
              v-model="formData.pdd"
              placeholder="PDD"
              class="w-full"
              mode="currency"
              currency="IDR"
              locale="id-ID"
            />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">Piutang</label>
            <InputNumber
              v-model="formData.piutang"
              placeholder="Piutang"
              class="w-full"
              mode="currency"
              currency="IDR"
              locale="id-ID"
            />
          </div>
        </div>
      </div>
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
</template>

<script setup>
import { ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Textarea from 'primevue/textarea'
import InputNumber from 'primevue/inputnumber'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import api from '@/api/client.js'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  item: {
    type: Object,
    default: null,
  },
  bkuId: { 
      type: Number, 
      default: null 
  },   
  options: Object
})
const emit = defineEmits(['update:modelValue', 'saved'])
const toast = useToast()
const loading = ref(false)
const visible = ref(props.modelValue)
const isEdit = ref(false)
const defaultForm = {
  rincian_id: 0,
  bku_id: 0,
  ket: '',
  uraian: '',
  akun_id: 0,
  rek_id: 0,
  jumlah: 0,
  pendapatan: 0,
  pdd: 0,
  piutang: 0
}
const formData = ref({ ...defaultForm })
const resetForm = () => {
  formData.value = { ...defaultForm }
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
  async (newItem) => {
    if (!newItem) {
      resetForm()
      isEdit.value = false
      formData.value.bku_id = props.bkuId
      return
    }
    isEdit.value = true

    Object.keys(formData.value).forEach((key) => {
      if (key == "rek_id") {
        formData.value[key] = String(newItem[key])
      } else {
        formData.value[key] = newItem[key]
      }
    })
  },
  { immediate: true }
)
watch(
  () => props.bkuId,
  (newBkuId) => {
    if (!isEdit.value) {
      formData.value.bku_id = newBkuId
    }
  },
  { immediate: true }
)

const saveData = async () => {
  loading.value = true
  try {
    const payload = formData.value

    // Clean payload from null or undefined value
    const cleanedPayload = Object.entries(payload).reduce((acc, [key, value]) => {
      if (value !== null && value !== undefined) {
        acc[key] = value
      }
      return acc
    }, {})

    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    }

    if (isEdit.value) {
      await api.put(`/rincian_bku/${formData.value.rincian_id}`, cleanedPayload, config)
    } else {
      await api.post('/rincian_bku', cleanedPayload, config)
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
const closeModal = () => {
  visible.value = false
  resetForm()
}
</script>
