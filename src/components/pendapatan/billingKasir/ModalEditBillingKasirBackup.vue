<template>
  <Dialog :visible="visible" @update:visible="visible = $event" modal :header="isEdit ? 'Edit Data' : 'Tambah Data'"
    :style="{ width: '80rem' }" :breakpoints="{ '1199px': '95vw', '575px': '95vw' }">
    <template #header>
      <div class="flex items-center justify-between w-full">
        <div>
          <h2 class="text-lg font-semibold">
            {{ isEdit ? 'Edit Data Billing Kasir' : 'Tambah Data Billing Kasir' }}
          </h2>
          <p class="text-sm text-gray-500">
            {{ isEdit ? 'Perbarui informasi billing kasir di bawah ini.' : 'Isi informasi billing kasir di bawah ini.' }}
          </p>
        </div>
      </div>
    </template>
    <div class="p-4">
      <Fieldset class="mb-6">
        <template #legend>
          <span class="font-semibold text-gray-700">Data Billing Kasir</span>
        </template>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <!-- Loket (dropdown) -->
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">Loket</label>
            <Dropdown v-model="formData.loket_id" :options="optionsLoket" optionLabel="label" optionValue="value"
              placeholder="Pilih Loket" class="w-full" />
            <div v-if="errors.loket_id" class="text-red-500 text-sm mt-1">{{ errors?.loket_id[0] }}</div>
          </div>
          
          <!-- Kasir (dropdown) -->
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">Kasir</label>
            <Dropdown v-model="formData.kasir_id" :options="optionsKasir" optionLabel="label" optionValue="value"
              placeholder="Pilih Kasir" class="w-full" />
            <div v-if="errors.kasir_id" class="text-red-500 text-sm mt-1">{{ errors?.kasir_id[0] }}</div>
          </div>
          
          <!-- Tgl. Kwitansi (Dropdown) -->
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">Tgl. Kwitansi</label>
            <Dropdown v-model="formData.tgl_buktibayar" :options="optionsTanggal" optionLabel="label" optionValue="value"
              placeholder="Pilih Tanggal Kwitansi" class="w-full" />
            <div v-if="errors.tgl_buktibayar" class="text-red-500 text-sm mt-1">{{ errors?.tgl_buktibayar[0] }}</div>
          </div>
          
          <!-- No Kwitansi -->
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">No Kwitansi</label>
            <InputText v-model="formData.no_buktibayar" placeholder="Nomor Kwitansi" class="w-full" />
            <div v-if="errors.no_buktibayar" class="text-red-500 text-sm mt-1">{{ errors?.no_buktibayar[0] }}</div>
          </div>
          
          <!-- Jumlah Bayar -->
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">Jumlah Bayar</label>
            <InputNumber v-model="formData.total" placeholder="Jumlah Bayar" class="w-full" mode="currency"
              currency="IDR" locale="id-ID" />
            <div v-if="errors.total" class="text-red-500 text-sm mt-1">{{ errors?.total[0] }}</div>
          </div>
          
          <!-- Biaya Admin EDC -->
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">Biaya Admin EDC</label>
            <InputNumber v-model="formData.admin_kredit" placeholder="Biaya Admin EDC" class="w-full" mode="currency"
              currency="IDR" locale="id-ID" />
            <div v-if="errors.admin_kredit" class="text-red-500 text-sm mt-1">{{ errors?.admin_kredit[0] }}</div>
          </div>
          
          <!-- Biaya Admin QRIS -->
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">Biaya Admin QRIS</label>
            <InputNumber v-model="formData.admin_debit" placeholder="Biaya Admin QRIS" class="w-full"
              mode="currency" currency="IDR" locale="id-ID" />
            <div v-if="errors.admin_debit" class="text-red-500 text-sm mt-1">{{ errors?.admin_debit[0] }}</div>
          </div>
          
          <!-- Selisih -->
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">Selisih</label>
            <InputNumber v-model="formData.selisih" placeholder="Selisih" class="w-full" mode="currency"
              currency="IDR" locale="id-ID" />
            <div v-if="errors.selisih" class="text-red-500 text-sm mt-1">{{ errors?.selisih[0] }}</div>
          </div>
          
          <!-- Jumlah Netto -->
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">Jumlah Netto</label>
            <InputNumber v-model="formData.jumlah_netto" placeholder="Jumlah Netto" class="w-full" mode="currency"
              currency="IDR" locale="id-ID" readonly disabled />
            <div v-if="errors.jumlah_netto" class="text-red-500 text-sm mt-1">{{ errors?.jumlah_netto[0] }}</div>
          </div>
          
          <!-- Cara Pembayaran (dropdown) -->
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">Cara Pembayaran</label>
            <Dropdown v-model="formData.cara_pembayaran" :options="optionsCaraPembayaran" optionLabel="label" optionValue="value"
              placeholder="Pilih Cara Pembayaran" class="w-full" />
            <div v-if="errors.cara_pembayaran" class="text-red-500 text-sm mt-1">{{ errors?.cara_pembayaran[0] }}</div>
          </div>
          
          <!-- Bank Tujuan (dropdown) -->
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">Bank Tujuan</label>
            <Dropdown v-model="formData.bank_tujuan" :options="optionsBankTujuan" optionLabel="label" optionValue="value"
              placeholder="Pilih Bank Tujuan" class="w-full" />
            <div v-if="errors.bank_tujuan" class="text-red-500 text-sm mt-1">{{ errors?.bank_tujuan[0] }}</div>
          </div>
          
          <!-- No Closing Kasir (dropdown) -->
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">No Closing Kasir</label>
            <Dropdown v-model="formData.no_closingkasir" :options="optionsClosingKasir" optionLabel="label" optionValue="value"
              placeholder="Pilih No Closing Kasir" class="w-full" />
            <div v-if="errors.no_closingkasir" class="text-red-500 text-sm mt-1">{{ errors?.no_closingkasir[0] }}</div>
          </div>
          
          <!-- No Kartu Bank Pasien -->
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">No Kartu Bank Pasien</label>
            <InputText v-model="formData.no_kartu_bank" placeholder="Nomor Kartu Bank Pasien" class="w-full" />
            <div v-if="errors.no_kartu_bank" class="text-red-500 text-sm mt-1">{{ errors?.no_kartu_bank[0] }}</div>
          </div>
          
          <!-- Nama Bank Pasien -->
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">Nama Bank Pasien</label>
            <InputText v-model="formData.nama_bank_pasien" placeholder="Nama Bank Pasien" class="w-full" />
            <div v-if="errors.nama_bank_pasien" class="text-red-500 text-sm mt-1">{{ errors?.nama_bank_pasien[0] }}</div>
          </div>
          
          <!-- Instalasi (dropdown) -->
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">Instalasi</label>
            <Dropdown v-model="formData.instalasi_id" :options="optionsInstalasi" optionLabel="label" optionValue="value"
              placeholder="Pilih Instalasi" class="w-full" />
            <div v-if="errors.instalasi_id" class="text-red-500 text-sm mt-1">{{ errors?.instalasi_id[0] }}</div>
          </div>
          
          <!-- Jenis Tagihan (dropdown) -->
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">Jenis Tagihan</label>
            <Dropdown v-model="formData.jenis_tagihan" :options="optionsSumberTransaksi" optionLabel="label" optionValue="value"
              placeholder="Pilih Jenis Tagihan" class="w-full" />
            <div v-if="errors.jenis_tagihan" class="text-red-500 text-sm mt-1">{{ errors?.jenis_tagihan[0] }}</div>
          </div>
          
          <!-- Tgl. Pendaftaran (dropdown) -->
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">Tgl. Pendaftaran</label>
            <Dropdown v-model="formData.tgl_pendaftaran" :options="optionsTanggal" optionLabel="label" optionValue="value"
              placeholder="Pilih Tanggal Pendaftaran" class="w-full" />
            <div v-if="errors.tgl_pendaftaran" class="text-red-500 text-sm mt-1">{{ errors?.tgl_pendaftaran[0] }}</div>
          </div>
          
          <!-- No Pendaftaran -->
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">No Pendaftaran</label>
            <InputText v-model="formData.no_pendaftaran" placeholder="Nomor Pendaftaran" class="w-full" />
            <div v-if="errors.no_pendaftaran" class="text-red-500 text-sm mt-1">{{ errors?.no_pendaftaran[0] }}</div>
          </div>
          
          <!-- Tgl Krs (dropdown) -->
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">Tgl Krs</label>
            <Dropdown v-model="formData.tgl_krs" :options="optionsTanggal" optionLabel="label" optionValue="value"
              placeholder="Pilih Tanggal KRS" class="w-full" />
            <div v-if="errors.tgl_krs" class="text-red-500 text-sm mt-1">{{ errors?.tgl_krs[0] }}</div>
          </div>
          
          <!-- Tgl Pelayanan (Dropdown) -->
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">Tgl Pelayanan</label>
            <Dropdown v-model="formData.tgl_pelayanan" :options="optionsTanggal" optionLabel="label" optionValue="value"
              placeholder="Pilih Tanggal Pelayanan" class="w-full" />
            <div v-if="errors.tgl_pelayanan" class="text-red-500 text-sm mt-1">{{ errors?.tgl_pelayanan[0] }}</div>
          </div>
          
          <!-- Nama Pasien -->
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">Nama Pasien</label>
            <InputText v-model="formData.pasien_nama" placeholder="Nama Pasien" class="w-full" />
            <div v-if="errors.pasien_nama" class="text-red-500 text-sm mt-1">{{ errors?.pasien_nama[0] }}</div>
          </div>
          
          <!-- No Rekam Medik -->
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">No Rekam Medik</label>
            <InputText v-model="formData.no_rekam_medik" placeholder="Nomor Rekam Medik" class="w-full" />
            <div v-if="errors.no_rekam_medik" class="text-red-500 text-sm mt-1">{{ errors?.no_rekam_medik[0] }}</div>
          </div>
          
          <!-- Alamat Pasien -->
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">Alamat Pasien</label>
            <Textarea v-model="formData.alamat_pasien" placeholder="Alamat Pasien" class="w-full" rows="2" />
            <div v-if="errors.alamat_pasien" class="text-red-50 text-sm mt-1">{{ errors?.alamat_pasien[0] }}</div>
          </div>
          
          <!-- Cara Bayar (dropdown) -->
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">Cara Bayar</label>
            <Dropdown v-model="formData.carabayar_id" :options="caraBayarOptions" optionLabel="label"
              optionValue="value" placeholder="Pilih Cara Bayar" class="w-full" />
            <div v-if="errors.carabayar_id" class="text-red-500 text-sm mt-1">{{ errors?.carabayar_id[0] }}</div>
          </div>
          
          <!-- Penjamin (dropdown) -->
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">Penjamin</label>
            <Dropdown v-model="formData.penjamin_id" :options="optionsPenjamin" optionLabel="label" optionValue="value"
              placeholder="Pilih Penjamin" class="w-full" />
            <div v-if="errors.penjamin_id" class="text-red-500 text-sm mt-1">{{ errors?.penjamin_id[0] }}</div>
          </div>
          
          <!-- Status (dropdown) -->
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">Status</label>
            <Dropdown v-model="formData.status_id" :options="optionsStatus" optionLabel="label" optionValue="value"
              placeholder="Pilih Status" class="w-full" />
            <div v-if="errors.status_id" class="text-red-500 text-sm mt-1">{{ errors?.status_id[0] }}</div>
          </div>
          
          <!-- Klasifikasi (dropdown) -->
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">Klasifikasi</label>
            <Dropdown v-model="formData.klasifikasi" :options="optionsKlasifikasi" optionLabel="label" optionValue="value"
              placeholder="Pilih Klasifikasi" class="w-full" />
            <div v-if="errors.klasifikasi" class="text-red-500 text-sm mt-1">{{ errors?.klasifikasi[0] }}</div>
          </div>
        </div>
      </Fieldset>
    </div>
    <template #footer>
      <Button label="Batal" icon="pi pi-times" @click="closeModal" class="p-button-text" />
      <Button label="Simpan" icon="pi pi-check" @click="saveData" :loading="loading" class="p-button-success" />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import DatePicker from 'primevue/datepicker'
import Dropdown from 'primevue/dropdown'
import Textarea from 'primevue/textarea'
import InputNumber from 'primevue/inputnumber'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import api from '@/services/http.js'
import client from '@/api/client.js'

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

const formData = ref({
  loket_id: null,
  kasir_id: null,
  no_closingkasir: '',
  tgl_closingkasir: null,
  no_buktibayar: '',
  tgl_buktibayar: null,
  no_pendaftaran: '',
  tgl_pelayanan: null,
  status_id: null,
  klasifikasi: null,
  // ==============
  cara_pembayaran: '',
  bank_tujuan: '',
  instalasi_id: null,
  jenis_tagihan: '',
  // ==============
  pasien_nama: '',
  no_rekam_medik: '',
  alamat_pasien: '',
  tgl_pendaftaran: null,
  tgl_krs: null,
  no_kartu_bank: '',
  nama_bank_pasien: '',
  carabayar_id: null,
  penjamin_id: null,
  //
  jumlah_setor: 0,
  total: 0, // bruto
  selisih: 0,
  jumlah_netto: 0,
  admin_kredit: 0,
  admin_debit: 0,
  selisih: 0
})

const toast = useToast()
const loading = ref(false)
const isEdit = ref(false)
const caraBayarOptions = ref([])
const visible = ref(props.modelValue)
const errors = ref({})

// New options for dropdowns
const optionsTanggal = ref([
  { label: '01/01/2023', value: '2023-01-01' },
  { label: '02/01/2023', value: '2023-01-02' },
  { label: '03/01/2023', value: '2023-01-03' },
  // Add more dates as needed
])

const optionsClosingKasir = ref([
  { label: 'Closing 001', value: '001' },
  { label: 'Closing 002', value: '002' },
  { label: 'Closing 003', value: '003' },
  // Add more closing kasir options as needed
])

const optionsCaraPembayaran = ref([
  { label: 'Tunai', value: 'TUNAI' },
  { label: 'Transfer', value: 'TRANSFER' },
  { label: 'EDC', value: 'EDC' },
  { label: 'QRIS', value: 'QRIS' },
  { label: 'S-TAPAY', value: 'STPAY' },
  { label: 'UE Reader', value: 'READER' },
])

const optionsKlasifikasi = ref([
  { label: 'Pendapatan', value: 'Pendapatan' },
  { label: 'Piutang', value: 'Piutang' },
  { label: 'PDD', value: 'PDD' },
])

watch(
  () => props.modelValue,
  (newValue) => {
    visible.value = newValue
    if (newValue) {
      fetchCaraBayar()
      fetchLoket()
      fetchKasir()
      fetchInstalasi()
      fetchBankTujuan()
      fetchSumberTransaksi()
      fetchPenjamin()
    }
  }
)

watch(visible, (newValue) => {
  emit('update:modelValue', newValue)
  if (newValue) {
    formData.value.jumlah_netto = hitungJumlahNetto()
  }
})

const resetForm = () => {
  Object.keys(formData.value).forEach((key) => {
    if (typeof formData.value[key] === 'string') {
      formData.value[key] = ''
    } else if (typeof formData.value[key] === 'number') {
      formData.value[key] = 0
    } else {
      formData.value[key] = null
    }
  })
}

watch(
  () => props.item,
  (newItem) => {
    isEdit.value = !!(newItem && newItem.id)
    if (isEdit.value) {
      formData.value = {...newItem}
    } else {
      resetForm()
    }
  },
  { immediate: true }
)

const hitungJumlahNetto = () => {
  const total = formData.value.total || 0
  const adminKredit = formData.value.admin_kredit || 0
  const selisih = formData.value.selisih || 0
  return total - (adminKredit + selisih)
}

const jumlahNetto = computed(() => {
  return hitungJumlahNetto()
})

watch(jumlahNetto, (newVal) => {
  formData.value.jumlah_netto = newVal
})

const fetchCaraBayar = async () => {
  try {
    const response = await api.get('/carabayar')
    if (response.data.items) {
      caraBayarOptions.value = response.data.items.map((item) => ({
        label: item.carabayar_nama,
        value: item.carabayar_id,
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

const optionsLoket = ref([])
const optionsKasir = ref([])
const optionsStatus = ref([
  { label: 'Tagihan', value: '1' },
  { label: 'Klaim', value: '2' },
  { label: 'Verif', value: '3' },
  { label: 'Terima', value: '4' },
  { label: 'Setor', value: '5' },
  { label: 'BKU', value: '6' },
  { label: 'Pending', value: '7' },
  { label: 'Gagal', value: '8' },
  { label: 'Batal', value: '1-' },
])

const fetchLoket = async () => {
  if(optionsLoket.value.length) return; // Cek jika sudah ada data, tidak perlu fetch ulang
  try {
    const response = await api.get('/loket/list')
    // console.log('Loket Response data:', response.data)
    if (response.data) {
      optionsLoket.value = response.data.data.map((item) => ({
        label: item.loket_nama,
        value: item.loket_id,
      }))
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Gagal memuat data loket',
      life: 3000,
    })
  }
}

const fetchKasir = async () => {
  if(optionsKasir.value.length) return; // Cek jika sudah ada data, tidak perlu fetch ulang
  try {
    const response = await api.get('/kasir/list')
    if (response.data) {
      optionsKasir.value = response.data.data.map((item) => ({
        label: item.kasir_nama,
        value: item.kasir_id,
      }))
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Gagal memuat data kasir',
      life: 3000,
    })
  }
}

const optionsInstalasi = ref([])
const fetchInstalasi = async () => {
  if(optionsInstalasi.value.length) return; // Cek jika sudah ada data, tidak perlu fetch ulang
  try {
    const response = await api.get('/instalasi')
    console.log('Instalasi Response data:', response.data.items)
    if (response.data.items) {
      optionsInstalasi.value = response.data.items.map((item) => ({
        label: item.instalasi_nama,
        value: item.instalasi_id,
      }))
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Gagal memuat data instalasi',
      life: 3000,
    })
  }
}

// bank tujuan
const optionsBankTujuan = ref([])
const fetchBankTujuan = async () => {
  if(optionsBankTujuan.value.length) return; // Cek jika sudah ada data, tidak perlu fetch ulang
  try {
    const response = await api.get('/bank/list')
    if (response.data.data) {
      optionsBankTujuan.value = response.data.data.map((item) => ({
        label: item.bank_nama,
        value: item.bank_id,
      }))
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Gagal memuat data bank tujuan',
      life: 3000,
    })
  }
}

// sumber transaksi
const optionsSumberTransaksi = ref([])
const fetchSumberTransaksi = async () => {
  if(optionsSumberTransaksi.value.length) return; // Cek jika sudah ada data, tidak perlu fetch ulang
  try {
    const response = await api.get('/sumbertransaksi/list')
    if (response.data.data) {
      optionsSumberTransaksi.value = response.data.data.map((item) => ({
        label: item.sumber_nama,
        value: item.sumber_id,
      }))
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Gagal memuat data sumber transaksi',
      life: 3000,
    })
  }
}

const optionsPenjamin = ref([])
const fetchPenjamin = async () => {
  if(optionsPenjamin.value.length) return; // Cek jika sudah ada data, tidak perlu fetch ulang
  try {
    const response = await api.get('/penjamin/list')
    if (response.data.data) {
      optionsPenjamin.value = response.data.data.map((item) => ({
        label: item.penjamin_nama,
        value: item.penjamin_id,
      }))
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Gagal memuat data penjamin',
      life: 3000,
    })    
  }
}

const saveData = async () => {
  loading.value = true
  errors.value = {} // Reset errors sebelum menyimpan
  try {
    const payload = formData.value

    if (isEdit.value) {
      await client.put(`/billing_kasir/${formData.value.id}`, payload)
    } else {
      await client.post('/billing_kasir', payload)
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
      detail: error.message || 'Gagal menyimpan data. Silakan coba lagi.',
      life: 3000,
    })

    if (error.errors) {
      errors.value = error.errors; // Simpan pesan error validasi
    }
  } finally {
    loading.value = false
  }
}

const closeModal = () => {
  visible.value = false
  resetForm()
}
</script>
