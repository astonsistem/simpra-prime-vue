<template>
  <Dialog :visible="visible" @update:visible="visible = $event" modal :header="isEdit ? 'Edit Data' : 'Tambah Data'"
    :style="{ width: '60rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
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
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">Loket</label>
          <Dropdown v-model="formData.loket_id" :options="optionsLoket" optionLabel="label" optionValue="value"
            placeholder="Pilih Loket" class="w-full" />
          <!-- Error -->
          <div v-if="errors.loket_id" class="text-red-500 text-sm mt-1">{{ errors?.loket_id[0] }}</div>
        </div>
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">Kasir</label>
          <Dropdown v-model="formData.kasir_id" :options="optionsKasir" optionLabel="label" optionValue="value"
            placeholder="Pilih Kasir" class="w-full" />
          <!-- Error -->
          <div v-if="errors.kasir_id" class="text-red-500 text-sm mt-1">{{ errors?.kasir_id[0] }}</div>
        </div>
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">No Closing Kasir</label>
          <InputText v-model="formData.no_closingkasir" placeholder="No Closing Kasir" class="w-full" />
        <!-- Error -->
          <div v-if="errors.no_closingkasir" class="text-red-500 text-sm mt-1">{{ errors?.no_closingkasir[0] }}</div>
        </div>
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">Tanggal Closing Kasir</label>
          <DatePicker v-model="formData.tgl_closingkasir" date-format="dd/mm/yy" placeholder="Tanggal Closing Kasir" showIcon class="w-full" />
          <div v-if="errors.tgl_closingkasir" class="text-red-500 text-sm mt-1">{{ errors?.tgl_closingkasir[0] }}</div>
        </div>
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">No Bayar</label>
          <InputText v-model="formData.no_buktibayar" placeholder="No Bayar" class="w-full" />
          <div v-if="errors.no_buktibayar" class="text-red-500 text-sm mt-1">{{ errors?.no_buktibayar[0] }}</div>
        </div>
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">Tanggal Bayar</label>
          <DatePicker v-model="formData.tgl_buktibayar" date-format="dd/mm/yy" placeholder="Tanggal Bayar" showIcon class="w-full" />
          <div v-if="errors.tgl_buktibayar" class="text-red-500 text-sm mt-1">{{ errors?.tgl_buktibayar[0] }}</div>
        </div>
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">No Kwitansi</label>
          <InputText v-model="formData.no_pendaftaran" placeholder="No Kwitansi" class="w-full" />
          <div v-if="errors.no_pendaftaran" class="text-red-500 text-sm mt-1">{{ errors?.no_pendaftaran[0] }}</div>
        </div>
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">Tanggal Kwitansi</label>
          <DatePicker v-model="formData.tgl_pelayanan" date-format="dd/mm/yy" placeholder="Tanggal Kwintansi" showIcon class="w-full" />
          <div v-if="errors.tgl_pelayanan" class="text-red-500 text-sm mt-1">{{ errors?.tgl_pelayanan[0] }}</div>
        </div>
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">Status</label>
          <Dropdown v-model="formData.status_id" :options="optionsStatus" optionLabel="label" optionValue="value" placeholder="status"
            class="w-full" />
          <div v-if="errors.status_id" class="text-red-500 text-sm mt-1">{{ errors?.status_id[0] }}</div>
        </div>
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">Klasifikasi</label>
          <Dropdown v-model="formData.klasifikasi" :options="[
            { label: 'Pendapatan', value: 'Pendapatan' },
            { label: 'Piutang', value: 'Piutang' },
            { label: 'PDD', value: 'PDD' },
          ]" optionLabel="label" optionValue="value"
            placeholder="Klasifikasi" class="w-full" />
          <div v-if="errors.klasifikasi" class="text-red-500 text-sm mt-1">{{ errors?.klasifikasi[0] }}</div>
        </div>
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">Uraian</label>
          <Textarea v-model="formData.uraian" placeholder="Uraian" rows="2" class="w-full" />
          <div v-if="errors.uraian" class="text-red-500 text-sm mt-1">{{ errors?.uraian[0] }}</div>
        </div>
      </div>

      <Divider />

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4">
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">Cara Pembayaran</label>
          <Dropdown v-model="formData.cara_pembayaran" :options="[
            { label: 'Tunai', value: 'TUNAI' },
            { label: 'Transfer', value: 'TRANSFER' },
            { label: 'EDC', value: 'EDC' },
            { label: 'QRIS', value: 'QRIS' },
            { label: 'S-TAPAY', value: 'STPAY' },
            { label: 'UE Reader', value: 'READER' },
          ]" optionLabel="label" optionValue="value"
            placeholder="Pilih Cara Pembayaran" class="w-full" />
          <div v-if="errors.cara_pembayaran" class="text-red-500 text-sm mt-1">{{ errors?.cara_pembayaran[0] }}</div>
        </div>
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">Instalasi</label>
          <Dropdown v-model="formData.instalasi_id" :options="optionsInstalasi" optionLabel="label" optionValue="value"
            placeholder="Pilih Instalasi" class="w-full" />
          <div v-if="errors.instalasi_id" class="text-red-500 text-sm mt-1">{{ errors?.instalasi_id[0] }}</div>
        </div>
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">Bank Tujuan</label>
          <Dropdown v-model="formData.bank_tujuan" :options="optionsBankTujuan" optionLabel="label" optionValue="value"
            placeholder="Pilih Bank Tujuan" class="w-full" />
          <div v-if="errors.bank_tujuan" class="text-red-500 text-sm mt-1">{{ errors?.bank_tujuan[0] }}</div>
        </div>
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">Sumber Transaksi</label>
          <Dropdown v-model="formData.jenis_tagihan" :options="optionsSumberTransaksi" optionLabel="label" optionValue="value"
            placeholder="Pilih Sumber Transaksi" class="w-full" />
          <div v-if="errors.jenis_tagihan" class="text-red-500 text-sm mt-1">{{ errors?.jenis_tagihan[0] }}</div>
        </div>
      </div>

      <Fieldset class="mb-4">
        <template #legend>
          <span class="font-semibold text-gray-400">Data Pasien</span>
        </template>
        <div class="grid grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">Nama Pasien</label>
            <InputText v-model="formData.pasien_nama" placeholder="Nama Pasien" class="w-full" />
            <div v-if="errors.pasien_nama" class="text-red-500 text-sm mt-1">{{ errors?.pasien_nama[0] }}</div>
          </div>
          <div>&nbsp;</div>
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">No Rekam Medik</label>
            <InputText v-model="formData.no_rekam_medik" placeholder="No Rekam Medik" class="w-full" />
            <div v-if="errors.no_rekam_medik" class="text-red-500 text-sm mt-1">{{ errors?.no_rekam_medik[0] }}</div>
          </div>
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">No Rekening DPA</label>
            <InputText v-model="formData.no_rekening_dpa" placeholder="No Rekening DPA" class="w-full" />
            <div v-if="errors.no_rekening_dpa" class="text-red-500 text-sm mt-1">{{ errors?.no_rekening_dpa[0] }}</div>
          </div>
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">Nomor Pendaftaran</label>
            <InputText v-model="formData.no_pendaftaran" placeholder="Nomor Pendaftaran" class="w-full" />
            <div v-if="errors.no_pendaftaran" class="text-red-500 text-sm mt-1">{{ errors?.no_pendaftaran[0] }}</div>
          </div>
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">Tanggal Pendaftaran</label>
            <DatePicker v-model="formData.tgl_pendaftaran" date-format="dd/mm/yy" placeholder="Tanggal Pendaftaran" showIcon class="w-full" />
            <div v-if="errors.tgl_pendaftaran" class="text-red-500 text-sm mt-1">{{ errors?.tgl_pendaftaran[0] }}</div>
          </div>
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">Cara Bayar</label>
            <Dropdown v-model="formData.carabayar_id" :options="caraBayarOptions" optionLabel="label"
              optionValue="value" placeholder="Cara Bayar" class="w-full" />
            <div v-if="errors.carabayar_id" class="text-red-500 text-sm mt-1">{{ errors?.carabayar_id[0] }}</div>
          </div>
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">Penjamin</label>
            <Dropdown v-model="formData.penjamin_id" :options="optionsPenjamin" optionLabel="label" optionValue="value"
              placeholder="Pilih Penjamin" class="w-full" />
            <div v-if="errors.penjamin_id" class="text-red-500 text-sm mt-1">{{ errors?.penjamin_id[0] }}</div>
          </div>
        </div>

      </Fieldset>

      <div class="my-4"></div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>&nbsp;</div>
          <div>
            <Fieldset class="mb-4">
              <template #legend>
                <span class="font-semibold text-gray-400">Data Billing</span>
              </template>
              <div class="flex flex-col gap-4 sm:gap-6">
                <div>
                  <label class="block mb-2 text-sm font-medium text-gray-700">Jumlah</label>
                  <InputNumber v-model="formData.total" placeholder="Jumlah" class="w-full" mode="currency"
                    currency="IDR" locale="id-ID" />
                  <div v-if="errors.total" class="text-red-500 text-sm mt-1">{{ errors?.total[0] }}</div>
                </div>
                <div>
                  <label class="block mb-2 text-sm font-medium text-gray-700">Biaya Admin EDC</label>
                  <InputNumber v-model="formData.admin_kredit" placeholder="Biaya Admin EDC" class="w-full" mode="currency"
                    currency="IDR" locale="id-ID" />
                  <div v-if="errors.admin_kredit" class="text-red-500 text-sm mt-1">{{ errors?.admin_kredit[0] }}</div>
                </div>
                <div>
                  <label class="block mb-2 text-sm font-medium text-gray-700">Biaya Admin QRIS</label>
                  <InputNumber v-model="formData.admin_debit" placeholder="Biaya Admin QRIS" class="w-full"
                    mode="currency" currency="IDR" locale="id-ID" />
                  <div v-if="errors.admin_debit" class="text-red-500 text-sm mt-1">{{ errors?.admin_debit[0] }}</div>
                </div>
                <div>
                  <label class="block mb-2 text-sm font-medium text-gray-700">Selisih</label>
                  <InputNumber v-model="formData.selisih" placeholder="Selisih" class="w-full" mode="currency"
                    currency="IDR" locale="id-ID" />
                  <div v-if="errors.selisih" class="text-red-500 text-sm mt-1">{{ errors?.selisih[0] }}</div>
                </div>
                <div>
                  <label class="block mb-2 text-sm font-medium text-gray-700">Jumlah Netto</label>
                  <InputNumber v-model="formData.jumlah_netto" placeholder="Jumlah Netto" class="w-full" mode="currency"
                    currency="IDR" locale="id-ID" readonly disabled />
                  <div v-if="errors.jumlah_nettot" class="text-red-500 text-sm mt-1">{{ errors?.jumlah_nettot[0] }}</div>
                </div>
              </div>
            </Fieldset>
          </div>
        </div>
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
  uraian: '',
  // ==============
  cara_pembayaran: '',
  bank_tujuan: '',
  instalasi_id: null,
  jenis_tagihan: '',
  // ==============
  pasien_nama: '',
  no_rekam_medik: '',
  tgl_pendaftaran: null,
  no_rekening_dpa: '',
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
})

watch(() => formData.value.jumlah_setor, (newVal) => {
  if(formData.value.jumlah_setor != null || formData.value.jumlah_setor != undefined){
    formData.value.jumlah_netto = newVal - formData.value.admin_kredit
  }
})

watch(() => formData.value.admin_kredit, (newVal) => {
  if(formData.value.jumlah_setor != null || formData.value.jumlah_setor != undefined){
    formData.value.jumlah_netto = formData.value.jumlah_setor - newVal
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

const jumlahNetto = computed(() => {
  return (
    (formData.value.total || 0) -
    (formData.value.admin_kredit || 0) -
    (formData.value.admin_debit || 0)
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
