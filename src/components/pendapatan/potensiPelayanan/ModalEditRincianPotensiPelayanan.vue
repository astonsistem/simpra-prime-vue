<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="Tambah Data Rincian Potensi Pelayanan"
    :style="{ width: '60rem' }"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
  >
    <div class="p-4">
      <div class="grid grid-cols-2 gap-6">
        <div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Pendaftaran ID</label>
            <InputText 
              v-model="formData.pendaftaran_id" 
              placeholder="Pendaftaran ID" 
              class="w-full" 
              @keypress="($event) => {
                if (!/[0-9]/.test($event.key)) {
                  $event.preventDefault();
                }
              }"
            />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">Total Tagihan</label>
            <InputNumber
                v-model="formData.total_tagihan"
                placeholder="Total Tagihan"
                class="w-full"
                mode="currency"
                currency="IDR"
                locale="id-ID"
            />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">Total Klaim</label>
            <InputNumber
                v-model="formData.total_klaim"
                placeholder="Total Klaim"
                class="w-full"
                mode="currency"
                currency="IDR"
                locale="id-ID"
            />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">Total Verif</label>
            <InputNumber
                v-model="formData.total_verif"
                placeholder="Total Verif"
                class="w-full"
                mode="currency"
                currency="IDR"
                locale="id-ID"
            />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">Total Bayar</label>
            <InputNumber
                v-model="formData.total_bayar"
                placeholder="Total Klaim"
                class="w-full"
                mode="currency"
                currency="IDR"
                locale="id-ID"
            />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">Jenis</label>
            <InputText v-model="formData.jenis" placeholder="Jenis" class="w-full" />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">Bulan</label>
             <Dropdown
                v-model="formData.bulan"
                :options="options.bulan"
                optionLabel="label"
                optionValue="value"
                placeholder="Bulan"
                class="w-full"
            />
          </div>
        </div>
        <div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Tahun</label>
             <Dropdown
                v-model="formData.tahun"
                :options="options.tahun"
                optionLabel="label"
                optionValue="value"
                placeholder="Tahun"
                class="w-full"
            />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">Penjamin</label>
            <Dropdown
                v-model="formData.penjamin_id"
                :options="options.penjamin"
                optionLabel="label"
                optionValue="id"
                placeholder="Penjamin"
                class="w-full"
                filter
                filterPlaceholder="Search Penjamin"
            />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">Sumber</label>
            <InputText 
              v-model="formData.sumber" 
              placeholder="Sumber" 
              class="w-full" 
              maxlength="10"
            />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">No SEP</label>
            <InputText v-model="formData.sep" placeholder="No SEP" class="w-full" />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">No RM</label>
            <InputText v-model="formData.norm" placeholder="No RM" class="w-full" />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">Nama Pasien</label>
            <InputText v-model="formData.nama" placeholder="Nama Pasien" class="w-full" />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">Tanggal MRS</label>
            <DatePicker
                v-model="formData.tgl_mrs"
                date-format="dd/mm/yy"
                placeholder="Tanggal MRS"
                showIcon
                class="w-full"
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
import DatePicker from 'primevue/datepicker'
import Dropdown from 'primevue/dropdown'
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
  options: Object
})
const emit = defineEmits(['update:modelValue', 'saved'])
const toast = useToast()
const loading = ref(false)
const visible = ref(props.modelValue)
const defaultForm = {
  pendaftaran_id: null,
  total_tagihan: 0,
  total_klaim: 0,
  total_verif: 0,
  total_bayar: 0,
  jenis: '',
  bulan: '',
  tahun: '',
  penjamin_id: 0,
  sumber: '',
  sep: '',
  norm: '',
  nama: '',
  tgl_mrs: '',
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
      return
    }

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

    await api.post('/rincian_potensi_pelayanan', cleanedPayload, config)

    toast.add({
      severity: 'success',
      summary: 'Berhasil',
      detail: 'Data berhasil ditambahkan',
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
