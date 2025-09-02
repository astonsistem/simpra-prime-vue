<template>
  <Dialog
    :visible="visible"
    @update:visible="visible = $event"
    modal
    :header="isEdit ? 'Edit Data' : 'Tambah Data'"
    :style="{ width: '80rem' }"
    :breakpoints="{ '1199px': '95vw', '575px': '95vw' }"
  >
    <div class="p-4">
      <Fieldset class="mb-6">
        <template #legend>
          <span class="font-semibold text-gray-700">Data Billing SWA</span>
        </template>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <!-- Jenis Penerimaan (dropdown) -->
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">Jenis Penerimaan</label>
            <Dropdown
              v-model="formData.jenis_penerimaan"
              :options="jenisPenerimaanOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Pilih Jenis Penerimaan"
              class="w-full"
            />
          </div>
          
          <!-- Sumber Transaksi (dropdown) -->
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
          
          <!-- Tgl. Bayar (dropdown) -->
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">Tgl. Bayar</label>
            <Dropdown
              v-model="formData.tgl_bayar"
              :options="tanggalOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Pilih Tanggal Bayar"
              class="w-full"
            />
          </div>
          
          <!-- No. Bayar -->
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">No. Bayar</label>
            <InputText v-model="formData.no_bayar" placeholder="Nomor Bayar" class="w-full" />
          </div>
          
          <!-- Pasien -->
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">Pasien</label>
            <InputText v-model="formData.pasien" placeholder="Nama Pasien" class="w-full" />
          </div>
          
          <!-- Uraian -->
          <div class="lg:col-span-3">
            <label class="block mb-2 text-sm font-medium text-gray-700">Uraian</label>
            <Textarea v-model="formData.uraian" placeholder="Uraian" rows="3" class="w-full" />
          </div>
          
          <!-- No Dokumen -->
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">No Dokumen</label>
            <InputText v-model="formData.no_dokumen" placeholder="Nomor Dokumen" class="w-full" />
          </div>
          
          <!-- Tgl Dokumen (dropdown) -->
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">Tgl Dokumen</label>
            <Dropdown
              v-model="formData.tgl_dokumen"
              :options="tanggalOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Pilih Tanggal Dokumen"
              class="w-full"
            />
          </div>
          
          <!-- Jumlah Bayar -->
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">Jumlah Bayar</label>
            <InputNumber
              v-model="formData.jumlah_bayar"
              placeholder="Jumlah Bayar"
              class="w-full"
              mode="currency"
              currency="IDR"
              locale="id-ID"
            />
          </div>
          
          <!-- Biaya Admin EDC -->
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">Biaya Admin EDC</label>
            <InputNumber
              v-model="formData.biaya_admin_edc"
              placeholder="Biaya Admin EDC"
              class="w-full"
              mode="currency"
              currency="IDR"
              locale="id-ID"
            />
          </div>
          
          <!-- Biaya Admin QRIS -->
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">Biaya Admin QRIS</label>
            <InputNumber
              v-model="formData.biaya_admin_qris"
              placeholder="Biaya Admin QRIS"
              class="w-full"
              mode="currency"
              currency="IDR"
              locale="id-ID"
            />
          </div>
          
          <!-- Selisih -->
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">Selisih</label>
            <InputNumber
              v-model="formData.selisih"
              placeholder="Selisih"
              class="w-full"
              mode="currency"
              currency="IDR"
              locale="id-ID"
            />
          </div>
          
          <!-- Jumlah Netto -->
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">Jumlah Netto</label>
            <InputNumber
              v-model="formData.jumlah_netto"
              placeholder="Jumlah Netto"
              class="w-full"
              mode="currency"
              currency="IDR"
              locale="id-ID"
              readonly
              disabled
            />
          </div>
          
          <!-- Cara Pembayaran (dropdown) -->
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">Cara Pembayaran</label>
            <Dropdown
              v-model="formData.cara_pembayaran"
              :options="caraPembayaranOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Pilih Cara Pembayaran"
              class="w-full"
            />
          </div>
          
          <!-- Bank Tujuan (dropdown) -->
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">Bank Tujuan</label>
            <Dropdown
              v-model="formData.bank_tujuan"
              :options="bankTujuanOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Pilih Bank Tujuan"
              class="w-full"
            />
          </div>
          
          <!-- Pendapatan -->
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">Pendapatan</label>
            <InputNumber
              v-model="formData.pendapatan"
              placeholder="Pendapatan"
              class="w-full"
              mode="currency"
              currency="IDR"
              locale="id-ID"
            />
          </div>
          
          <!-- PDD -->
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">PDD</label>
            <InputNumber
              v-model="formData.pdd"
              placeholder="PDD"
              class="w-full"
              mode="currency"
              currency="IDR"
              locale="id-ID"
            />
          </div>
          
          <!-- Piutang -->
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">Piutang</label>
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
      </Fieldset>
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
  jenis_penerimaan: null,
  sumber_transaksi: null,
  tgl_bayar: null,
  no_bayar: '',
  pasien: '',
  uraian: '',
  no_dokumen: '',
  tgl_dokumen: null,
  jumlah_bayar: 0,
  biaya_admin_edc: 0,
  biaya_admin_qris: 0,
  selisih: 0,
  jumlah_netto: 0,
  cara_pembayaran: null,
  bank_tujuan: null,
  pendapatan: 0,
  pdd: 0,
  piutang: 0,
})

// New options for dropdowns
const jenisPenerimaanOptions = ref([
  { label: 'Penerimaan 1', value: '1' },
  { label: 'Penerimaan 2', value: '2' },
  { label: 'Penerimaan 3', value: '3' },
])

const sumberTransaksiOptions = ref([
  { label: 'Sumber 1', value: '1' },
  { label: 'Sumber 2', value: '2' },
  { label: 'Sumber 3', value: '3' },
])

const tanggalOptions = ref([
  { label: '01/01/2023', value: '2023-01-01' },
  { label: '02/01/2023', value: '2023-01-02' },
  { label: '03/01/2023', value: '2023-01-03' },
])

const caraPembayaranOptions = ref([
  { label: 'Tunai', value: 'tunai' },
  { label: 'Transfer', value: 'transfer' },
  { label: 'EDC', value: 'edc' },
  { label: 'QRIS', value: 'qris' },
])

const bankTujuanOptions = ref([
  { label: 'Bank BCA', value: 'bca' },
  { label: 'Bank BNI', value: 'bni' },
  { label: 'Bank BRI', value: 'bri' },
  { label: 'Bank Mandiri', value: 'mandiri' },
])

const caraBayarOptions = ref([])

const visible = ref(props.modelValue)

watch(
  () => props.modelValue,
  (newValue) => {
    visible.value = newValue
    if (newValue) {
      fetchCaraBayar()
      fetchDataForDropdowns()
    }
  }
)

watch(visible, (newValue) => {
  emit('update:modelValue', newValue)
})

const resetForm = () => {
  formData.value = {
    jenis_penerimaan: null,
    sumber_transaksi: null,
    tgl_bayar: null,
    no_bayar: '',
    pasien: '',
    uraian: '',
    no_dokumen: '',
    tgl_dokumen: null,
    jumlah_bayar: 0,
    biaya_admin_edc: 0,
    biaya_admin_qris: 0,
    selisih: 0,
    jumlah_netto: 0,
    cara_pembayaran: null,
    bank_tujuan: null,
    pendapatan: 0,
    pdd: 0,
    piutang: 0,
  }
}

watch(
  () => props.item,
  (newItem) => {
    isEdit.value = !!(newItem && newItem.id)
    if (isEdit.value) {
      formData.value = {
        id: newItem.id,
        jenis_penerimaan: newItem.jenisPenerimaan || null,
        sumber_transaksi: newItem.sumberTransaksi || null,
        tgl_bayar: newItem.tglBayar || null,
        no_bayar: newItem.noBayar || '',
        pasien: newItem.pasien || '',
        uraian: newItem.uraian || '',
        no_dokumen: newItem.noDokumen || '',
        tgl_dokumen: newItem.tglDokumen || null,
        jumlah_bayar: newItem.jumlahBayar || 0,
        biaya_admin_edc: newItem.biayaAdminEdc || 0,
        biaya_admin_qris: newItem.biayaAdminQris || 0,
        selisih: newItem.selisih || 0,
        jumlah_netto: newItem.jumlahNetto || 0,
        cara_pembayaran: newItem.caraPembayaran || null,
        bank_tujuan: newItem.bankTujuan || null,
        pendapatan: newItem.pendapatan || 0,
        pdd: newItem.pdd || 0,
        piutang: newItem.piutang || 0,
      }
    } else {
      resetForm()
    }
  },
  { immediate: true }
)

const jumlahNetto = computed(() => {
  return (
    (formData.value.jumlah_bayar || 0) -
    (formData.value.biaya_admin_edc || 0) -
    (formData.value.biaya_admin_qris || 0) -
    (formData.value.selisih || 0)
  )
})

watch(jumlahNetto, (newVal) => {
  formData.value.jumlah_netto = newVal
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

// Fetch data for new dropdown fields
const fetchDataForDropdowns = async () => {
  // In a real application, these would be API calls
  // For now, we're using static data defined earlier
  // You can replace these with actual API calls as needed
  
  // Example of how you might fetch data for jenis penerimaan:
  // try {
  //   const response = await api.get('/jenis-penerimaan')
  //   if (response.data) {
  //     jenisPenerimaanOptions.value = response.data.map((item) => ({
  //       label: item.nama,
  //       value: item.id,
  //     }))
  //   }
  // } catch (error) {
  //   toast.add({
  //     severity: 'error',
  //     summary: 'Error',
  //     detail: 'Gagal memuat data jenis penerimaan',
  //     life: 3000,
  //   })
  // }
  
  // Similar API calls would be made for:
  // - sumberTransaksiOptions
  // - caraPembayaranOptions
  // - bankTujuanOptions
}

const saveData = async () => {
  loading.value = true
  try {
    // Map form field names to API field names
    const payload = {
      id: formData.value.id,
      jenisPenerimaan: formData.value.jenis_penerimaan,
      sumberTransaksi: formData.value.sumber_transaksi,
      tglBayar: formData.value.tgl_bayar,
      noBayar: formData.value.no_bayar,
      pasien: formData.value.pasien,
      uraian: formData.value.uraian,
      noDokumen: formData.value.no_dokumen,
      tglDokumen: formData.value.tgl_dokumen,
      jumlahBayar: formData.value.jumlah_bayar,
      biayaAdminEdc: formData.value.biaya_admin_edc,
      biayaAdminQris: formData.value.biaya_admin_qris,
      selisih: formData.value.selisih,
      jumlahNetto: formData.value.jumlah_netto,
      caraPembayaran: formData.value.cara_pembayaran,
      bankTujuan: formData.value.bank_tujuan,
      pendapatan: formData.value.pendapatan,
      pdd: formData.value.pdd,
      piutang: formData.value.piutang,
    }
    
    if (isEdit.value) {
      await api.put(`/billing_swa/${formData.value.id}`, payload)
    } else {
      await api.post('/billing_swa', payload)
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
