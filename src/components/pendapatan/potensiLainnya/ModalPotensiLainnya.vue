<template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="isEdit ? 'Edit Data Potensi Lainnya' : 'Tambah Data Potensi Lainnya'"
    :style="{ width: '60rem' }"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
  >
    <div class="p-4">
      <div class="grid grid-cols-2 gap-6">
        <div class="space-y-2 border p-2 rounded-lg">
            <label class="block font-semibold">Informasi Utama</label>
            <div>
              <label class="block text-sm font-medium text-gray-700">Tanggal Dokumen</label>
              <DatePicker
                v-model="formData.tgl_dokumen"
                date-format="dd/mm/yy"
                placeholder="Tanggal Dokumen"
                showIcon
                class="w-full"
              />
            </div>
            <div>
              <label class="block mt-2 text-sm font-medium text-gray-700">No Dokumen</label>
              <InputText v-model="formData.no_dokumen" placeholder="No Dokumen" class="w-full" />
            </div>
            <div>
              <label class="block mt-2 text-sm font-medium text-gray-700">Pihak ke-3</label>
              <InputText v-model="formData.pihak3" placeholder="Pihak ke-3" class="w-full" />
            </div>
            <div>
              <label class="block mt-2 text-sm font-medium text-gray-700">Telp Pihak ke-3</label>
              <InputText v-model="formData.pihak3_telp" placeholder="Telp Pihak ke-3" class="w-full" />
            </div>
            <div>
              <label class="block mt-2 text-sm font-medium text-gray-700">Alamat Pihak ke-3</label>
              <Textarea
                v-model="formData.pihak3_alamat"
                rows="3"
                cols="30"
                autoResize
                placeholder="Alamat Pihak ke-3"
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
              <label class="block mt-2 text-sm font-medium text-gray-700">Tanggal Berlaku</label>
              <DatePicker
                v-model="formData.tgl_berlaku"
                date-format="dd/mm/yy"
                placeholder="Tanggal Berlaku"
                showIcon
                class="w-full"
              />
            </div>
            <div>
              <label class="block mt-2 text-sm font-medium text-gray-700">Tanggal Akhir</label>
              <DatePicker
                v-model="formData.tgl_akhir"
                date-format="dd/mm/yy"
                placeholder="Tanggal Akhir"
                showIcon
                class="w-full"
              />
            </div>
          </div>
        <div>
          <div class="space-y-2 border p-2 rounded-lg">
            <label class="block font-semibold">Informasi Keperluan Akrual</label>
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
              <label class="block mt-2 text-sm font-medium text-gray-700">Total</label>
              <InputNumber
                v-model="formData.total"
                placeholder="Total"
                class="w-full"
                mode="currency"
                currency="IDR"
                locale="id-ID"
              />
            </div>
            <div>
              <label class="block mt-2 text-sm font-medium text-gray-700">Total PDD</label>
              <InputNumber
                v-model="formData.total_pdd"
                placeholder="Total PDD"
                class="w-full"
                mode="currency"
                currency="IDR"
                locale="id-ID"
              />
            </div>
            <div>
              <label class="block mt-2 text-sm font-medium text-gray-700">Total Piutang</label>
              <InputNumber
                v-model="formData.total_piutang"
                placeholder="Total Piutang"
                class="w-full"
                mode="currency"
                currency="IDR"
                locale="id-ID"
              />
            </div>
            <div>
              <label class="block mt-2 text-sm font-medium text-gray-700">Reklas PDD</label>
              <InputNumber
                v-model="formData.reklas_pdd"
                placeholder="Reklas PDD"
                class="w-full"
                mode="currency"
                currency="IDR"
                locale="id-ID"
              />
            </div>
            <div>
              <label class="block mt-2 text-sm font-medium text-gray-700">Besaran Per Satuan</label>
              <InputNumber
                v-model="formData.besaran_per_satuan"
                placeholder="Besaran Per Satuan"
                class="w-full"
                mode="currency"
                currency="IDR"
                locale="id-ID"
              />
            </div>
            <div class="flex mt-2 items-center gap-2">
              <Checkbox v-model="formData.is_buktitagihan" binary />
              <label for="buktitagihan">Bukti Tagihan</label>
            </div>
          </div>
          <div class="space-y-2 border p-2 rounded-lg mt-2">
            <label class="block font-semibold">Informasi Pemutusan Kontrak</label>
            <div>
              <label class="block text-sm font-medium text-gray-700">Tanggal Surat Putus</label>
              <DatePicker
                v-model="formData.tgl_putus"
                date-format="dd/mm/yy"
                placeholder="Tanggal Surat Putus"
                showIcon
                class="w-full"
              />
            </div>
            <div>
              <label class="block mt-2 text-sm font-medium text-gray-700">No Surat Putus</label>
              <InputText v-model="formData.no_putus" placeholder="No Surat Putus" class="w-full" />
            </div>
            <div>
              <label class="block mt-2 text-sm font-medium text-gray-700">Tanggal Berlaku Putus</label>
              <DatePicker
                v-model="formData.tgl_berlakuputus"
                date-format="dd/mm/yy"
                placeholder="Tanggal Berlaku Putus"
                showIcon
                class="w-full"
              />
            </div>
            <div>
              <label class="block mt-2 text-sm font-medium text-gray-700">Nilai Kesepakatan</label>
              <InputNumber
                v-model="formData.nilai_reklasputus"
                placeholder="Nilai Kesepakatan"
                class="w-full"
                mode="currency"
                currency="IDR"
                locale="id-ID"
              />
            </div>
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
import Textarea from 'primevue/textarea'
import InputNumber from 'primevue/inputnumber'
import Checkbox from 'primevue/checkbox'
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
const isEdit = ref(false)
const defaultForm = {
  id: '',
  tgl: '',
  ket: '',
  no_dokumen: '',
  tgl_dokumen: '',
  akun_id: 0,
  pihak3: '',
  pihak3_alamat: '',
  pihak3_telp: '',
  uraian: '',
  tgl_berlaku: '',
  tgl_akhir: '',
  jatuh_tempo: 0,
  besaran_per_satuan: 0,
  total: 0,
  total_pdd: 0,
  total_piutang: 0,
  reklas_pdd: 0,
  pembayaran_piutang: 0,
  monev_id: 0,
  no_putus: '',
  tgl_putus: '',
  tgl_berlakuuptus: '',
  nilai_reklasputus: 0,
  is_buktitagihan: false,
  induk_id: ''
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
    // Ensure boolean checkboxes are always present
    if (!('is_buktitagihan' in cleanedPayload)) {
      cleanedPayload.is_buktitagihan = false
    }

    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    }

    if (isEdit.value) {
      await api.put(`/potensi_lainnya/${formData.value.id}`, cleanedPayload, config)
    } else {
      await api.post('/potensi_lainnya', cleanedPayload, config)
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
