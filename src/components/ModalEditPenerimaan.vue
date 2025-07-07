<template>
  <Dialog
    v-model="visible"
    modal
    :header="isEdit.value ? 'Edit Data' : 'Tambah Data'"
    :style="{ width: '60rem' }"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
  >
    <div class="p-4">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">No Dokumen</label>
          <InputText v-model="formData.no_dokumen" placeholder="No Dokumen" class="w-full" />
        </div>
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">Tanggal Dokumen</label>
          <DatePicker
            v-model="formData.tgl_dokumen"
            placeholder="Tanggal Dokumen"
            showIcon
            class="w-full"
          />
        </div>
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">Cara Bayar</label>
          <Dropdown
            v-model="formData.cara_pembayaran"
            :options="caraBayarOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Pilih Cara Bayar"
            class="w-full"
          />
        </div>
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">Penjamin</label>
          <Dropdown
            v-model="formData.penjamin"
            :options="penjaminOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Pilih Penjamin"
            class="w-full"
          />
        </div>
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">Tanggal Pendaftaran</label>
          <DatePicker
            v-model="formData.tgl_pendaftaran"
            placeholder="Tanggal Pendaftaran"
            showIcon
            class="w-full"
          />
        </div>
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">No Pendaftaran</label>
          <InputText
            v-model="formData.no_pendaftaran"
            placeholder="No Pendaftaran"
            class="w-full"
          />
        </div>
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">Nama Pasien</label>
          <InputText v-model="formData.nama_pasien" placeholder="Nama Pasien" class="w-full" />
        </div>
        <div class="col-span-2">
          <label class="block mb-2 text-sm font-medium text-gray-700">Uraian</label>
          <Textarea v-model="formData.uraian" placeholder="Uraian" rows="3" class="w-full" />
        </div>
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">Jumlah</label>
          <InputNumber
            v-model="formData.jumlah"
            placeholder="Jumlah"
            class="w-full"
            :minFractionDigits="0"
            :maxFractionDigits="2"
            mode="currency"
            currency="IDR"
            locale="id-ID"
          />
        </div>
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">Terbayar</label>
          <InputNumber
            v-model="formData.terbayar"
            placeholder="Terbayar"
            class="w-full"
            :minFractionDigits="0"
            :maxFractionDigits="2"
            mode="currency"
            currency="IDR"
            locale="id-ID"
          />
        </div>
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">Sisa Potensi</label>
          <InputNumber
            v-model="formData.sisa_potensi"
            placeholder="Sisa Potensi"
            class="w-full"
            :minFractionDigits="0"
            :maxFractionDigits="2"
            mode="currency"
            currency="IDR"
            locale="id-ID"
          />
        </div>
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">Status</label>
          <Dropdown
            v-model="formData.status"
            :options="statusOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Pilih Status"
            class="w-full"
          />
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
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import api from '@/services/http.js'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  id: {
    type: [String, Number],
    default: null,
  },
  item: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const toast = useToast()
const loading = ref(false)

const formData = ref({
  no_dokumen: '',
  tgl_dokumen: null,
  cara_pembayaran: '',
  penjamin: '',
  uraian: '',
  tgl_pendaftaran: null,
  no_pendaftaran: '',
  nama_pasien: '',
  jumlah: 0,
  terbayar: 0,
  sisa_potensi: 0,
  status: '',
})

const caraBayarOptions = ref([
  { label: 'Tunai', value: 'Tunai' },
  { label: 'Kartu Debit', value: 'Kartu Debit' },
  { label: 'Transfer', value: 'Transfer' },
  { label: 'QRIS', value: 'QRIS' },
])

const penjaminOptions = ref([
  { label: 'Penjamin 1', value: 'Penjamin 1' },
  { label: 'Penjamin 2', value: 'Penjamin 2' },
])

const statusOptions = ref([
  { label: 'Aktif', value: 'aktif' },
  { label: 'Nonaktif', value: 'nonaktif' },
])

const resetForm = () => {
  formData.value = {
    no_dokumen: '',
    tgl_dokumen: null,
    cara_pembayaran: '',
    penjamin: '',
    uraian: '',
    tgl_pendaftaran: null,
    no_pendaftaran: '',
    nama_pasien: '',
    jumlah: 0,
    terbayar: 0,
    sisa_potensi: 0,
    status: '',
  }
}

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

const isEdit = ref(!!props.id)

watch(
  () => props.id,
  (newId) => {
    isEdit.value = !!newId
  }
)

watch(
  () => props.item,
  (newItem) => {
    if (newItem) {
      formData.value = {
        no_dokumen: newItem.no_dokumen || '',
        tgl_dokumen: newItem.tgl_dokumen ? new Date(newItem.tgl_dokumen) : null,
        cara_pembayaran: newItem.cara_pembayaran || '',
        penjamin: newItem.penjamin || '',
        uraian: newItem.uraian || '',
        tgl_pendaftaran: newItem.tgl_pendaftaran ? new Date(newItem.tgl_pendaftaran) : null,
        no_pendaftaran: newItem.no_pendaftaran || '',
        nama_pasien: newItem.nama_pasien || '',
        jumlah: newItem.jumlah || 0,
        terbayar: newItem.terbayar || 0,
        sisa_potensi: newItem.sisa_potensi || 0,
        status: newItem.status || '',
      }
    } else {
      resetForm()
    }
  },
  { immediate: true }
)

const saveData = async () => {
  if (!formData.value.no_dokumen || !formData.value.tgl_dokumen || !formData.value.nama_pasien) {
    toast.add({
      severity: 'warn',
      summary: 'Peringatan',
      detail: 'Silakan lengkapi data yang diperlukan (No Dokumen, Tanggal Dokumen, Nama Pasien)',
      life: 3000,
    })
    return
  }

  loading.value = true
  try {
    if (isEdit.value) {
      await api.put(`/pendapatan_pelayanan/${props.id}`, formData.value)
    } else {
      await api.post('/pendapatan_pelayanan', formData.value)
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
