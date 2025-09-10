<template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="isEdit ? 'Edit Data Penjamin' : 'Tambah Data Penjamin'"
    :style="{ width: '60rem' }"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
  >
    <div class="p-4">
      <div class="grid grid-cols-2 gap-6">
        <div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Jenis Tagihan</label>
            <Dropdown
                v-model="formData.jenis_tagihan"
                :options="options.jenisPelayanan"
                optionLabel="label"
                optionValue="value"
                placeholder="Pilih Jenis Tagihan"
                class="w-full"
                disabled
            />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">Pasien</label>
            <InputText v-model="formData.pasien_nama" placeholder="Pasien" class="w-full" disabled />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">No RM</label>
            <InputText v-model="formData.no_rekam_medik" placeholder="No RM" class="w-full" disabled />
          </div>
          <div class="col-span-2">
            <label class="block mt-2 text-sm font-medium text-gray-700">Alamat Pasien</label>
            <Textarea v-model="formData.pasien_alamat" placeholder="Alamat Pasien" rows="3" class="w-full" disabled />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">No Pendaftaran</label>
            <InputText v-model="formData.no_pendaftaran" placeholder="No Pendaftaran" class="w-full" disabled />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">Tanggal Pendaftaran</label>
            <DatePicker
                v-model="formData.tgl_pendaftaran"
                placeholder="Tanggal Pendaftaran"
                showIcon
                class="w-full"
                disabled
            />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">Tanggal KRS</label>
            <DatePicker
                v-model="formData.tgl_krs"
                placeholder="Tanggal KRS"
                showIcon
                class="w-full"
                disabled
            />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">Tanggal Pelayanan</label>
            <DatePicker
                v-model="formData.tgl_pelayanan"
                placeholder="Tanggal Pelayanan"
                showIcon
                class="w-full"
                disabled
            />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">Nilai Penjaminan</label>
            <InputNumber
                v-model="formData.total_dijamin"
                placeholder="Nilai Penjaminan"
                class="w-full"
                mode="currency"
                currency="IDR"
                locale="id-ID"
            />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">Biaya Admin</label>
            <InputNumber
                v-model="formData.biaya_admin"
                placeholder="Biaya Admin"
                class="w-full"
                mode="currency"
                currency="IDR"
                locale="id-ID"
            />
          </div>
        </div>
        <div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Cara Bayar</label>
            <Dropdown
                v-model="formData.carabayar_id"
                :options="options.carabayar"
                optionLabel="label"
                optionValue="id"
                placeholder="Cara Bayar"
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
            <label class="block mt-2 text-sm font-medium text-gray-700">Instalasi</label>
            <Dropdown
                v-model="formData.instalasi_id_id"
                :options="options.instalasi"
                optionLabel="label"
                optionValue="id"
                placeholder="Instalasi"
                class="w-full"
                filter
                filterPlaceholder="Search Instalasi"
                disabled
            />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">Loket Kasir</label>
            <Dropdown
                v-model="formData.loket_id"
                :options="options.loket"
                optionLabel="label"
                optionValue="value"
                placeholder="Loket Kasir"
                class="w-full"
                filter
                filterPlaceholder="Search Loket Kasir"
                disabled
            />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">Nama Kasir</label>
            <Dropdown
                v-model="formData.kasir_id"
                :options="options.kasir"
                optionLabel="label"
                optionValue="value"
                placeholder="Nama Kasir"
                class="w-full"
                filter
                filterPlaceholder="Search Nama Kasir"
                disabled
            />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">Status</label>
            <Dropdown
                v-model="formData.status"
                :options="statusOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Status Fase 2"
                class="w-full"
                :disabled="!isEdit"
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
import { ref, watch, computed, watchEffect } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import DatePicker from 'primevue/datepicker'
import Dropdown from 'primevue/dropdown'
import InputNumber from 'primevue/inputnumber'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import api from '@/services/http.js'

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
const isEdit = ref(false)
const visible = ref(props.modelValue)
const statusOptions = [
  { label: 'Data Awal', value: 'Data Awal' },
  { label: 'Piutang', value: 'Piutang' },
  { label: 'Klaim', value: 'Klaim' },
  { label: 'Bayar', value: 'Bayar' },
]
const defaultForm = {
  id: '',
  pelayanan_id: '',
  pendaftaran_id: null,
  no_pendaftaran: '',
  tgl_pendaftaran: '',
  pasien_id: null,
  jenis_tagihan: '',
  tgl_krs: '',
  tgl_pelayanan: '',
  no_rekam_medik: '',
  pasien_nama: '',
  carabayar_id: null,
  penjamin_id: null,
  no_penjamin: '',
  tgl_jaminan: '',
  instalasi_id: null,
  kasir_id: null,
  loket_id: null,
  total_dijamin: 0,
  bulan_mrs: '',
  bulan_krs: '',
  bulan_pelayanan: '',
  biaya_admin: 0,
  status: '',
  pasien_alamat: '',
}
const formData = ref({ ...defaultForm })
const normalizeStr = (val) => {
  return val
    ? val.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
    : null
}
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
  (newItem) => {
    if (!newItem) {
      resetForm()
      return
    }
    isEdit.value = !!(newItem.id != newItem.pelayanan_id)

    Object.keys(formData.value).forEach((key) => {
        if (key === 'jenis_tagihan') {
            formData.value[key] = normalizeStr(newItem[key])
        } else if (key.startsWith('tgl_')) {
            formData.value[key] = newItem[key] ? new Date(newItem[key]) : null
        } else {
            formData.value[key] = newItem[key]
        }
    })

    if (!isEdit.value) {
      formData.value.status = statusOptions[0].value
    }
  },
  { immediate: true }
)


const saveData = async () => {
  console.log(formData.value)
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
      await api.put(`/pendapatan_penjamin1/${formData.value.id}`, cleanedPayload, config)
    } else {
      await api.post('/pendapatan_penjamin1', cleanedPayload, config)
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
