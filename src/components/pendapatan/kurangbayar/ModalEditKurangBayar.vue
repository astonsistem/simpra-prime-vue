<template>
  <Dialog
    :visible="visible"
    @update:visible="visible = $event"
    modal
    :header="isEdit ? 'Edit Data' : 'Tambah Data'"
    :style="{ width: '60rem' }"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
  >
    <div class="p-4">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">ID</label>
          <InputText v-model="formData.id" placeholder="ID" class="w-full" disabled />
        </div>
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">Tanggal Setor</label>
          <DatePicker
            v-model="formData.tgl_setor"
            placeholder="Tanggal Setor"
            showIcon
            class="w-full"
          />
        </div>
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">Jenis</label>
          <Dropdown
            v-model="formData.jenis"
            :options="jenisOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Pilih Jenis"
            class="w-full"
          />
        </div>
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">Cara Pembayaran</label>
          <Dropdown
            v-model="formData.cara_pembayaran"
            :options="caraBayarOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Pilih Cara Pembayaran"
            class="w-full"
          />
        </div>
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">Rekening Bank</label>
          <Dropdown
            v-model="formData.rekening_bank"
            :options="rekeningBankOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Pilih Rekening Bank"
            class="w-full"
          />
        </div>
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">Jumlah Setor</label>
          <InputNumber
            v-model="formData.jumlah_setor"
            placeholder="Jumlah Setor"
            class="w-full"
            mode="currency"
            currency="IDR"
            locale="id-ID"
          />
        </div>
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">Admin EDC</label>
          <InputNumber
            v-model="formData.admin_edc"
            placeholder="Admin EDC"
            class="w-full"
            mode="currency"
            currency="IDR"
            locale="id-ID"
          />
        </div>
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">Admin QRIS</label>
          <InputNumber
            v-model="formData.admin_qris"
            placeholder="Admin QRIS"
            class="w-full"
            mode="currency"
            currency="IDR"
            locale="id-ID"
          />
        </div>
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">Jumlah Netto</label>
          <InputNumber
            v-model="jumlahNetto"
            placeholder="Jumlah Netto"
            class="w-full"
            mode="currency"
            currency="IDR"
            locale="id-ID"
            disabled
          />
        </div>
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">Penyetor</label>
          <InputText v-model="formData.penyetor" placeholder="Penyetor" class="w-full" />
        </div>
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">Rekening DPA</label>
          <Dropdown
            v-model="formData.rekening_dpa"
            :options="rekeningDpaOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Pilih Rekening DPA"
            class="w-full"
          />
        </div>
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">Sumber Transaksi</label>
          <Dropdown
            v-model="formData.sumber_transaksi"
            :options="sumberTransaksiOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Pilih Sumber Transaksi"
            class="w-full"
          />
        </div>
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">Klasifikasi</label>
          <Dropdown
            v-model="formData.klasifikasi"
            :options="klasifikasiOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Pilih Klasifikasi"
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
import { ref, watch, computed } from 'vue'
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
  item: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const toast = useToast()
const loading = ref(false)
const isEdit = ref(false)

const formData = ref({
  id: null,
  tgl_setor: null,
  jenis: null,
  cara_pembayaran: null,
  rekening_bank: null,
  jumlah_setor: 0,
  admin_edc: 0,
  admin_qris: 0,
  penyetor: '',
  rekening_dpa: null,
  sumber_transaksi: null,
  klasifikasi: null,
})

const jenisOptions = ref([
    {label: 'Jenis 1', value: 'jenis1'},
    {label: 'Jenis 2', value: 'jenis2'}
]);
const caraBayarOptions = ref([])
const rekeningBankOptions = ref([
    {label: 'Bank A', value: 'bank_a'},
    {label: 'Bank B', value: 'bank_b'}
]);
const rekeningDpaOptions = ref([
    {label: 'DPA 1', value: 'dpa1'},
    {label: 'DPA 2', value: 'dpa2'}
]);
const sumberTransaksiOptions = ref([
    {label: 'Sumber 1', value: 'sumber1'},
    {label: 'Sumber 2', value: 'sumber2'}
]);
const klasifikasiOptions = ref([
    {label: 'Klasifikasi 1', value: 'klasifikasi1'},
    {label: 'Klasifikasi 2', value: 'klasifikasi2'}
]);


const visible = ref(props.modelValue)

watch(
  () => props.modelValue,
  (newValue) => {
    visible.value = newValue
    if (newValue) {
      fetchCaraBayar()
      // Fetch other dropdown options if needed
    }
  }
)

watch(visible, (newValue) => {
  emit('update:modelValue', newValue)
})

const resetForm = () => {
  formData.value = {
    id: null,
    tgl_setor: null,
    jenis: null,
    cara_pembayaran: null,
    rekening_bank: null,
    jumlah_setor: 0,
    admin_edc: 0,
    admin_qris: 0,
    penyetor: '',
    rekening_dpa: null,
    sumber_transaksi: null,
    klasifikasi: null,
  }
}

watch(
  () => props.item,
  (newItem) => {
    isEdit.value = !!(newItem && newItem.id)
    if (isEdit.value) {
      formData.value = {
        id: newItem.id,
        tgl_setor: newItem.tglSetor ? new Date(newItem.tglSetor) : null,
        jenis: newItem.jenis,
        cara_pembayaran: newItem.caraPembayaran,
        rekening_bank: newItem.rekeningBank,
        jumlah_setor: newItem.jumlahSetor,
        admin_edc: newItem.adminEdc,
        admin_qris: newItem.adminQris,
        penyetor: newItem.penyetor,
        rekening_dpa: newItem.rekeningDpa,
        sumber_transaksi: newItem.sumberTransaksi,
        klasifikasi: newItem.klasifikasi,
      }
    } else {
      resetForm()
    }
  },
  { immediate: true }
)

const jumlahNetto = computed(() => {
  return (
    (formData.value.jumlah_setor || 0) -
    (formData.value.admin_edc || 0) -
    (formData.value.admin_qris || 0)
  )
})

const fetchCaraBayar = async () => {
  try {
    const response = await api.get('/carabayar')
    if (response.data.items) {
      caraBayarOptions.value = response.data.items.map((item) => ({
        label: item.caraBayar,
        value: item.id,
      }))
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Gagal memuat data cara bayar',
      life: 3000,
    })
  }
}

const saveData = async () => {
  loading.value = true
  try {
    const payload = { ...formData.value, jumlah_netto: jumlahNetto.value }
    if (isEdit.value) {
      await api.put(`/kurang_bayar/${formData.value.id}`, payload)
    } else {
      await api.post('/kurang_bayar', payload)
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
