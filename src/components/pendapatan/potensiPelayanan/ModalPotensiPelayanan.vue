<template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="isEdit ? 'Edit Data Potensi Pelayanan' : 'Tambah Data Potensi Pelayanan'"
    :style="{ width: '60rem' }"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
  >
    <div class="p-4">
      <div class="grid grid-cols-2 gap-6">
        <div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Cara Bayar</label>
            <Dropdown
              v-model="formData.carabayar_id"
              :options="options.carabayar"
              optionLabel="label"
              optionValue="id"
              placeholder="Pilih Cara Bayar"
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
              placeholder="Pilih Penjamin"
              class="w-full"
              filter
              filterPlaceholder="Search Penjamin"
            />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">Tanggal Dokumen</label>
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
            <label class="block mt-2 text-sm font-medium text-gray-700">Total Pengajuan</label>
            <InputNumber
              v-model="formData.total_pengajuan"
              placeholder="Total Pengajuan"
              class="w-full"
              mode="currency"
              currency="IDR"
              locale="id-ID"
            />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">No Pengajuan</label>
            <InputText v-model="formData.no_pengajuan" placeholder="No Pengajuan" class="w-full" />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">Tanggal Pengajuan</label>
            <DatePicker
              v-model="formData.tgl_pengajuan"
              date-format="dd/mm/yy"
              placeholder="Tanggal Pengajuan"
              showIcon
              class="w-full"
            />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">Akun</label>
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
        <div class="space-y-2 border p-2 rounded-lg">
          <label class="block font-semibold">Isian jika pasien UMUM / GL</label>
          <div>
            <label class="block text-sm font-medium text-gray-700">No Pendaftaran</label>
            <InputText v-model="formData.no_pendaftaran" placeholder="No Pendaftaran" class="w-full" />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">Tanggal Pendaftaran</label>
            <DatePicker
              v-model="formData.tgl_pendaftaran"
              date-format="dd/mm/yy"
              placeholder="Tanggal Pendaftaran"
              showIcon
              class="w-full"
            />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">Tanggal Pelayanan</label>
            <DatePicker
              v-model="formData.tgl_pelayanan"
              date-format="dd/mm/yy"
              placeholder="Tanggal Pelayanan"
              showIcon
              class="w-full"
            />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">Nama Pasien</label>
            <InputText v-model="formData.pasien_nama" placeholder="Nama Pasien" class="w-full" />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">Alamat Pasien</label>
            <Textarea
              v-model="formData.pasien_alamat"
              rows="3"
              cols="30"
              autoResize
              placeholder="Alamat Pasien"
              class="w-full"
            />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">No Rekam Medik</label>
            <InputText v-model="formData.no_rekam_medik" placeholder="No Rekam Medik" class="w-full" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Instalasi</label>
            <Dropdown
              v-model="formData.instalasi_id"
              :options="options.instalasi"
              optionLabel="label"
              optionValue="value"
              placeholder="Pilih Instalasi"
              class="w-full"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Jenis Tagihan</label>
            <Dropdown
              v-model="formData.jenis_tagihan"
              :options="options.jenisTagihan"
              optionLabel="label"
              optionValue="value"
              placeholder="Pilih Jenis Tagihan"
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
import { ref, watch, computed, watchEffect } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import DatePicker from 'primevue/datepicker'
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
  options: Object
})
const emit = defineEmits(['update:modelValue', 'saved'])
const toast = useToast()
const loading = ref(false)
const visible = ref(props.modelValue)
const isEdit = ref(false)
const defaultForm = {
  id: '',
  pendaftaran_id: 0,
  no_pendaftaran: '',
  tgl_pendaftaran: '',
  no_rekam_medik: '',
  pasien_nama: '',
  pasien_alamat: '',
  jenis_tagihan: '',
  tgl_pelayanan: '',
  instalasi_id: 0,
  carabayar_id: 0,
  no_pengajuan: '',
  tgl_pengajuan: '',
  no_dokumen: '',
  tgl_dokumen: '',
  uraian: '',
  total_pengajuan: 0,
  total: 0,
  akun_id: 0,
  penjamin_id: 0,
  pelayanan_id: 0
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
      if (key === 'jenis_tagihan') {
        formData.value[key] = normalizeStr(newItem[key])
      } else if (key.startsWith('tgl_')) {
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

    if (isEdit.value) {
      await api.put(`/potensi_pelayanan/${formData.value.id}`, cleanedPayload, config)
    } else {
      await api.post('/potensi_pelayanan', cleanedPayload, config)
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
