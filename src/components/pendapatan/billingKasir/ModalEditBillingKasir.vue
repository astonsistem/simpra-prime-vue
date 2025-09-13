<template>
  <Dialog :visible="visible" @update:visible="visible = $event" modal :header="isEdit ? 'Edit Data' : 'Tambah Data'"
    :style="{ width: '80rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
    <template #header>
      <div class="flex items-center justify-between w-full">
        <div>
          <h2 class="text-lg font-semibold">
            {{ isEdit ? 'Ubah Billing Kasir' : 'Tambah Billing Kasir' }} ID: {{ props.item?.no_buktibayar }}
          </h2>
          <p class="text-sm text-gray-500">
            {{ isEdit ? 'Perbarui informasi billing kasir di bawah ini.' : 'Isi informasi billing kasir di bawah ini.'
            }}
          </p>
        </div>
      </div>
    </template>

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4 sm:gap-6">
      <Fieldset class="mb-4">
        <template #legend>
          <span class="font-semibold text-gray-400">Informasi Pembayaran</span>
        </template>
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">Tgl. Kwitansi <span class="text-red-500">*</span></label>
          <DatePicker v-model="formData.tgl_buktibayar" date-format="dd/mm/yy" placeholder="Tgl. Kwitansi" showIcon
            class="w-full" :invalid="errors?.tgl_buktibayar?.length" />
          <div v-if="errors.tgl_buktibayar" class="text-red-500 text-sm mt-1">{{ errors?.tgl_buktibayar[0] }}</div>
        </div>
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">No. Kwitansi</label>
          <InputText v-model="formData.no_buktibayar" placeholder="No. Kwitansi" class="w-full" :invalid="errors?.no_buktibayar?.length" />
          <div v-if="errors.no_buktibayar" class="text-red-500 text-sm mt-1">{{ errors?.no_buktibayar[0] }}</div>
        </div>
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">Jumlah Bayar <span class="text-red-500">*</span></label>
          <InputNumber v-model="formData.total" placeholder="Jumlah" class="w-full" mode="currency" currency="IDR"
            locale="id-ID" :invalid="errors?.total?.length" />
          <div v-if="errors.total" class="text-red-500 text-sm mt-1">{{ errors?.total[0] }}</div>
        </div>
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">Biaya Admin EDC <span class="text-red-500">*</span></label>
          <InputNumber v-model="formData.admin_kredit" placeholder="Biaya Admin EDC" class="w-full" mode="currency"
            currency="IDR" locale="id-ID" :invalid="errors?.admin_kredit?.length" />
          <div v-if="errors.admin_kredit" class="text-red-500 text-sm mt-1">{{ errors?.admin_kredit[0] }}</div>
        </div>
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">Biaya Admin QRIS <span class="text-red-500">*</span></label>
          <InputNumber v-model="formData.admin_debit" placeholder="Biaya Admin QRIS" class="w-full" mode="currency"
            currency="IDR" locale="id-ID" :invalid="errors?.admin_debit?.length" />
          <div v-if="errors.admin_debit" class="text-red-500 text-sm mt-1">{{ errors?.admin_debit[0] }}</div>
        </div>
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">Selisih <span class="text-red-500">*</span></label>
          <InputNumber v-model="formData.selisih" placeholder="Selisih" class="w-full" show-buttons step="1000" currency="IDR"
            locale="id-ID" :invalid="errors?.selisih?.length" />
          <div v-if="errors.selisih" class="text-red-500 text-sm mt-1">{{ errors?.selisih[0] }}</div>
        </div>
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">Jumlah Netto</label>
          <InputNumber v-model="formData.jumlah_netto" placeholder="Jumlah Netto" class="w-full" mode="currency"
            currency="IDR" locale="id-ID" readonly disabled />
          <div v-if="errors.jumlah_netto" class="text-red-500 text-sm mt-1">{{ errors?.jumlah_netto[0] }}</div>
        </div>
        <Divider />
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">Cara Pembayaran <span class="text-red-500">*</span></label>
          <Dropdown v-model="formData.cara_pembayaran" :options="optionsCaraPembayaran" optionLabel="label" optionValue="value" placeholder="Pilih Cara Pembayaran" class="w-full" :invalid="errors?.cara_pembayaran?.length" />
          <div v-if="errors.cara_pembayaran" class="text-red-500 text-sm mt-1">{{ errors?.cara_pembayaran[0] }}</div>
        </div>
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">Bank Tujuan <span class="text-red-500">*</span></label>
          <Dropdown v-model="formData.bank_tujuan" :options="optionsBankTujuan" optionLabel="label"
            optionValue="value" placeholder="Pilih Bank Tujuan" class="w-full" :invalid="errors?.bank_tujuan?.length" />
          <div v-if="errors.bank_tujuan" class="text-red-500 text-sm mt-1">{{ errors?.bank_tujuan[0] }}</div>
        </div>
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">No. Kartu Bank</label>
          <InputText v-model="formData.no_kartubank_pasien" placeholder="No. Kartu Bank" class="w-full" :invalid="errors?.no_kartubank_pasien?.length" />
          <div v-if="errors.no_kartubank_pasien" class="text-red-500 text-sm mt-1">{{ errors?.no_kartubank_pasien[0]
            }}
          </div>
        </div>
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">Nama Bank</label>
          <InputText v-model="formData.kartubank_pasien" placeholder="Nama Bank" class="w-full" :invalid="errors?.kartubank_pasien?.length" />
          <div v-if="errors.kartubank_pasien" class="text-red-500 text-sm mt-1">{{ errors?.kartubank_pasien[0] }}
          </div>
        </div>
      </Fieldset>

      <!-- Informasi Detail -->
      <Fieldset class="mb-4">
        <template #legend>
          <span class="font-semibold text-gray-400">Informasi Detail</span>
        </template>
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">Loket</label>
          <Dropdown v-model="formData.loket_id" :options="optionsLoket" optionLabel="label" optionValue="value"
            placeholder="Pilih Loket" class="w-full" :invalid="errors?.loket_id?.length" />
          <div v-if="errors.loket_id" class="text-red-500 text-sm mt-1">{{ errors?.loket_id[0] }}</div>
        </div>
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">Kasir</label>
          <Dropdown v-model="formData.kasir_id" :options="optionsKasir" optionLabel="label" optionValue="value"
            placeholder="Pilih Kasir" class="w-full" :invalid="errors?.kasir_id?.length" />
          <div v-if="errors.kasir_id" class="text-red-500 text-sm mt-1">{{ errors?.kasir_id[0] }}</div>
        </div>
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">No. Closing Kasir</label>
          <InputText v-model="formData.no_closingkasir" placeholder="No. Closing Kasir" class="w-full" :invalid="errors?.no_closingkasir?.length" />
          <!-- Error -->
          <div v-if="errors.no_closingkasir" class="text-red-500 text-sm mt-1">{{ errors?.no_closingkasir[0] }}</div>
        </div>
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">Tgl. Closing Kasir</label>
          <DatePicker v-model="formData.tgl_closingkasir" date-format="dd/mm/yy" placeholder="Tgl. Closing Kasir"
            showIcon class="w-full" :invalid="errors?.tgl_closingkasir?.length" />
          <div v-if="errors.tgl_closingkasir" class="text-red-500 text-sm mt-1">{{ errors?.tgl_closingkasir[0] }}
          </div>
        </div>
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">No. Pendaftaran</label>
          <InputText v-model="formData.no_pendaftaran" placeholder="No. Pendaftaran" class="w-full" :invalid="errors?.no_pendaftaran?.length" />
          <div v-if="errors.no_pendaftaran" class="text-red-500 text-sm mt-1">{{ errors?.no_pendaftaran[0] }}</div>
        </div>
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">Tgl. Pendaftaran</label>
          <DatePicker v-model="formData.tgl_pendaftaran" date-format="dd/mm/yy" placeholder="Tgl. Pendaftaran"
            showIcon class="w-full" :invalid="errors?.tgl_pendaftaran?.length" />
          <div v-if="errors.tgl_pendaftaran" class="text-red-500 text-sm mt-1">{{ errors?.tgl_pendaftaran[0] }}</div>
        </div>
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">Tgl. KRS</label>
          <DatePicker v-model="formData.tgl_krs" date-format="dd/mm/yy" placeholder="Tgl. KRS" showIcon
            class="w-full" :invalid="errors?.tgl_krs?.length" />
          <div v-if="errors.tgl_krs" class="text-red-500 text-sm mt-1">{{ errors?.tgl_krs[0] }}</div>
        </div>
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">Nama Pasien</label>
          <InputText v-model="formData.pasien_nama" placeholder="Nama Pasien" class="w-full" :invalid="errors?.pasien_nama?.length" />
          <div v-if="errors.pasien_nama" class="text-red-500 text-sm mt-1">{{ errors?.pasien_nama[0] }}</div>
        </div>
        <div class="mb-4">
          <label class="block mb-2 text-sm font-medium text-gray-700">Tgl. Pelayanan</label>
          <DatePicker v-model="formData.tgl_pelayanan" date-format="dd/mm/yy" placeholder="Tgl. Pelayanan" showIcon
            class="w-full" :invalid="errors?.tgl_pelayanan?.length" />
          <div v-if="errors.tgl_pelayanan" class="text-red-500 text-sm mt-1">{{ errors?.tgl_pelayanan[0] }}</div>
        </div>
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">No. Rekam Medik</label>
          <InputText v-model="formData.no_rekam_medik" placeholder="No. Rekam Medik" class="w-full" :invalid="errors?.no_rekam_medik?.length" />
          <div v-if="errors.no_rekam_medik" class="text-red-500 text-sm mt-1">{{ errors?.no_rekam_medik[0] }}</div>
        </div>
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">Alamat Pasien</label>
          <TextArea v-model="formData.pasien_alamat" placeholder="Alamat Pasien" class="w-full" :invalid="errors?.pasien_alamat?.length" />
          <div v-if="errors.pasien_alamat" class="text-red-500 text-sm mt-1">{{ errors?.pasien_alamat[0] }}</div>
        </div>
      </Fieldset>

      <!-- Informasi Tambahan -->
      <Fieldset class="mb-4">
        <template #legend>
          <span class="font-semibold text-gray-400">Informasi Tambahan</span>
        </template>
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">Instalasi</label>
          <Dropdown v-model="formData.instalasi_id" :options="optionsInstalasi" optionLabel="label"
            optionValue="value" placeholder="Pilih Instalasi" class="w-full" :invalid="errors?.instalasi_id?.length" />
          <div v-if="errors.instalasi_id" class="text-red-500 text-sm mt-1">{{ errors?.instalasi_id[0] }}</div>
        </div>
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">Jenis Tagihan <span class="text-red-500">*</span></label>
          <Dropdown v-model="formData.jenis_tagihan" :options="optionsSumberTransaksi" optionLabel="label"
            optionValue="value" placeholder="Pilih Jenis Tagihan" class="w-full" :invalid="errors?.jenis_tagihan?.length" />
          <div v-if="errors.jenis_tagihan" class="text-red-500 text-sm mt-1">{{ errors?.jenis_tagihan[0] }}</div>
        </div>
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">Cara Bayar</label>
          <Dropdown v-model="formData.carabayar_id" :options="caraBayarOptions" optionLabel="label"
            optionValue="value" placeholder="Cara Bayar" class="w-full" :invalid="errors?.carabayar_id?.length" />
          <div v-if="errors.carabayar_id" class="text-red-500 text-sm mt-1">{{ errors?.carabayar_id[0] }}</div>
        </div>
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">Penjamin</label>
          <Dropdown v-model="formData.penjamin_id" :options="optionsPenjamin" optionLabel="label" optionValue="value"
            placeholder="Pilih Penjamin" class="w-full" :invalid="errors?.penjamin_id?.length" />
          <div v-if="errors.penjamin_id" class="text-red-500 text-sm mt-1">{{ errors?.penjamin_id[0] }}</div>
        </div>
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">Status</label>
          <Dropdown v-model="formData.status_id" :options="optionsStatus" optionLabel="label" optionValue="value"
            placeholder="status" class="w-full" :invalid="errors?.status_id?.length" />
          <div v-if="errors.status_id" class="text-red-500 text-sm mt-1">{{ errors?.status_id[0] }}</div>
        </div>
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">Klasifikasi</label>
          <Dropdown v-model="formData.klasifikasi" :options="[
            { label: 'Pendapatan', value: 'Pendapatan' },
            { label: 'Piutang', value: 'Piutang' },
            { label: 'PDD', value: 'PDD' },
          ]" optionLabel="label" optionValue="value" placeholder="Klasifikasi" class="w-full" :invalid="errors?.klasifikasi?.length" />
          <div v-if="errors.klasifikasi" class="text-red-500 text-sm mt-1">{{ errors?.klasifikasi[0] }}</div>
        </div>
        <!-- rekening dpa -->
          <div class="mb-4">
            <label class="block mb-1 text-sm font-medium text-gray-700">Rekening DPA</label>
            <Dropdown
              v-model="formData.rek_id"
              :options="optionsRekeningDpa"
              optionLabel="label"
              optionValue="value"
              placeholder="Pilih Rekening DPA"
              class="w-[348px]"
              :invalid="errors?.rek_id?.length"
            />
            <Message v-if="errors.rek_id" severity="error" size="small" variant="simple">{{ errors?.rek_id[0] }}</Message>
          </div>
      </Fieldset>
    </div>
    <div class="text-end text-gray-500 px-4 -mt-2">
       (<span class="text-red-500">*</span>) <span class="">wajib diisi</span>
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
  no_buktibayar: '',
  tgl_buktibayar: '',
  total: 0,
  admin_kredit: 0,
  admin_debit: 0,
  selisih: 0,
  jumlah_netto: 0,
  cara_pembayaran: '',
  bank_tujuan: '',
  no_kartubank_pasien: '',
  kartubank_pasien: '',
  loket_id: null,
  kasir_id: null,
  no_closingkasir: '',
  tgl_closingkasir: '',
  tgl_pendaftaran: '',
  no_pendaftaran: '',
  tgl_krs: '',
  tgl_pelayanan: '',
  pasien_nama: '',
  no_rekam_medik: '',
  pasien_alamat: '',
  instalasi_id: null,
  jenis_tagihan: '',
  carabayar_id: null,
  penjamin_id: null,
  status_id: null,
  klasifikasi: '',
  rc_id: null,
  rek_id: null,
  rekening_koran: '',
  tervalidasi: false
})


const toast = useToast()
const loading = ref(false)
const isEdit = ref(false)
const visible = ref(props.modelValue)
const errors = ref({})

const optionsCaraPembayaran = ref([
  { label: 'Tunai', value: 'TUNAI' },
  { label: 'Transfer', value: 'TRANSFER' },
  { label: 'EDC', value: 'EDC' },
  { label: 'QRIS', value: 'QRIS' },
  { label: 'S-TAPAY', value: 'STPAY' },
  { label: 'UE Reader', value: 'READER' },
])
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

watch(
  () => props.modelValue,
  (newValue) => {
    visible.value = newValue
    if (newValue) {
    }
  }
)

watch(visible, (newValue) => {
  emit('update:modelValue', newValue)
  if (newValue) {
    formData.value.jumlah_netto = hitungJumlahNetto()
    fetchCaraBayar()
    fetchLoket()
    fetchKasir()
    fetchInstalasi()
    fetchBankTujuan()
    fetchSumberTransaksi()
    fetchPenjamin()
    fetchRekeningDpa()
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
      formData.value = { ...newItem }
    } else {
      resetForm()
    }
  },
  { immediate: true }
)

const hitungJumlahNetto = () => {
  const total = formData.value.total || 0
  const adminKredit = formData.value.admin_kredit || 0
  const adminDebit = formData.value.admin_debit || 0
  const selisih = formData.value.selisih || 0
  return ( parseInt(total) - parseInt(adminKredit) - parseInt(adminDebit) )  + parseInt(selisih)
}

const jumlahNetto = computed(() => {
  return hitungJumlahNetto()
})

watch(jumlahNetto, (newVal) => {
  formData.value.jumlah_netto = newVal
})
const caraBayarOptions = ref([])
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
const fetchLoket = async () => {
  if (optionsLoket.value.length) return; // Cek jika sudah ada data, tidak perlu fetch ulang
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

const optionsKasir = ref([])
const fetchKasir = async () => {
  if (optionsKasir.value.length) return; // Cek jika sudah ada data, tidak perlu fetch ulang
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
  if (optionsInstalasi.value.length) return; // Cek jika sudah ada data, tidak perlu fetch ulang
  try {
    const response = await api.get('/instalasi')
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
  if (optionsBankTujuan.value.length) return; // Cek jika sudah ada data, tidak perlu fetch ulang
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
  if (optionsSumberTransaksi.value.length) return; // Cek jika sudah ada data, tidak perlu fetch ulang
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


const optionsRekeningDpa = ref([])
const fetchRekeningDpa = async () => {
  console.log('fetchRekeningDpa')
  if (optionsRekeningDpa.value.length) return; // Cek jika sudah ada data, tidak perlu fetch ulang
  try {
    const response = await api.get('/akun/list/pendapatan?rekening-dpa')

    if (response.data.data) {
      optionsRekeningDpa.value = response.data.data.map((item) => ({
        value: item.rek_id,
        label: item.rek_nama,
      }))
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Gagal memuat data rekening dpa',
      life: 3000,
    })
  }
}

const optionsPenjamin = ref([])
const fetchPenjamin = async () => {
  if (optionsPenjamin.value.length) return; // Cek jika sudah ada data, tidak perlu fetch ulang
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
