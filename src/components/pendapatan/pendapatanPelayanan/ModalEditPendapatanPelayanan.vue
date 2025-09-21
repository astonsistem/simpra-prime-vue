<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="Edit Data"
    :style="{ width: '60rem' }"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
  >
    <div class="p-4">
      <div class="grid grid-cols-3 gap-6">
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
            />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">Pasien</label>
            <InputText v-model="formData.pasien_nama" placeholder="Pasien" class="w-full" />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">No RM</label>
            <InputText v-model="formData.no_rekam_medik" placeholder="No RM" class="w-full" />
          </div>
          <div class="col-span-2">
            <label class="block mt-2 text-sm font-medium text-gray-700">Alamat Pasien</label>
            <Textarea v-model="formData.pasien_alamat" placeholder="Alamat Pasien" rows="3" class="w-full" />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">No Pendaftaran</label>
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
            <label class="block mt-2 text-sm font-medium text-gray-700">Tanggal KRS</label>
            <DatePicker
              v-model="formData.tgl_krs"
              date-format="dd/mm/yy"
              placeholder="Tanggal KRS"
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
            <label class="block mt-2 text-sm font-medium text-gray-700">Total Tagihan RS</label>
            <InputNumber
              v-model="formData.total"
              placeholder="Total Tagihan RS"
              class="w-full"
              mode="currency"
              currency="IDR"
              locale="id-ID"
            />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">Total Dijamin</label>
            <InputNumber
              v-model="formData.total_dijamin"
              placeholder="Total Dijamin"
              class="w-full"
              mode="currency"
              currency="IDR"
              locale="id-ID"
            />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">Total Sharing</label>
            <InputNumber
              v-model="formData.total_sharing"
              placeholder="Total Sharing"
              class="w-full"
              mode="currency"
              currency="IDR"
              locale="id-ID"
            />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">Piutang Perorangan</label>
            <InputNumber
              v-model="formData.piutang_perorangan"
              placeholder="Piutang Perorangan"
              class="w-full"
              mode="currency"
              currency="IDR"
              locale="id-ID"
            />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">Koreksi Sharing Tagihan</label>
            <InputNumber
              v-model="formData.koreksi_sharing"
              placeholder="Koreksi Sharing Tagihan"
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
              v-model="formData.instalasi_id"
              :options="options.instalasi"
              optionLabel="label"
              optionValue="value"
              placeholder="Instalasi"
              class="w-full"
              filter
              filterPlaceholder="Search Instalasi"
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
            />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">Pendapatan</label>
            <InputNumber
              v-model="formData.pendapatan"
              placeholder="Pendapatan"
              class="w-full"
              mode="currency"
              currency="IDR"
              locale="id-ID"
            />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">Piutang</label>
            <InputNumber
              v-model="formData.piutang"
              placeholder="Piutang"
              class="w-full"
              mode="currency"
              currency="IDR"
              locale="id-ID"
            />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">PDD</label>
            <InputNumber
              v-model="formData.pdd"
              placeholder="PDD"
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
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">Obat Dijamin</label>
            <InputNumber
              v-model="formData.obat_dijamin"
              placeholder="Obat Dijamin"
              class="w-full"
              mode="currency"
              currency="IDR"
              locale="id-ID"
            />
          </div>
        </div>
        <div>
          <div class="space-y-2 border p-2 rounded-lg">
            <label class="block font-semibold">Status</label>
            <div>
              <label class="block text-sm font-medium text-gray-700">Status Fase 1</label>
              <Dropdown
                v-model="formData.status_fase1"
                :options="statusFase1Options"
                optionLabel="label"
                optionValue="value"
                placeholder="Status Fase 1"
                class="w-full"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Status Fase 2</label>
              <Dropdown
                v-model="formData.status_fase2"
                :options="statusFase2Options"
                optionLabel="label"
                optionValue="value"
                placeholder="Status Fase 2"
                class="w-full"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Status Fase 3</label>
              <Dropdown
                v-model="formData.status_fase3"
                :options="statusFase3Options"
                optionLabel="label"
                optionValue="value"
                placeholder="Status Fase 3"
                class="w-full"
              />
            </div>
            <div>
              <div class="flex flex-col gap-2 mt-2">
                <div class="flex items-center gap-2">
                  <Checkbox v-model="formData.is_valid" binary />
                  <label for="valid">Is Valid</label>
                </div>
                <div class="flex items-center gap-2">
                  <Checkbox v-model="formData.is_penjaminlebih1" binary readonly />
                  <label for="penjamin">Is Penjamin &gt; 1</label>
                </div>
                <div class="flex items-center gap-2">
                  <Checkbox v-model="formData.is_naikkelas" binary />
                  <label for="naik">Is Naik Kelas</label>
                </div>
              </div>
            </div>
            <div>
              <label class="block mt-2 text-sm font-medium text-gray-700">Hak Kelas Rawat</label>
              <InputText v-model="formData.hak_kelasrawat" placeholder="Hak Kelas Rawat" class="w-full" />
            </div>
            <div>
              <label class="block mt-2 text-sm font-medium text-gray-700">Naik Kelas Rawat</label>
              <InputText v-model="formData.naik_kelasrawat" placeholder="Naik Kelas Rawat" class="w-full" />
            </div>
          </div>
          <div class="space-y-2 border p-2 rounded-lg mt-2">
            <label class="block font-semibold">Hasil Rumusan Bagian Kas</label>
            <div>
              <label class="block mt-2 text-sm font-medium text-gray-700">Tagihan Riil</label>
              <InputNumber
                v-model="formData.tagihan_riil"
                placeholder="Tagihan Riil"
                class="w-full"
                mode="currency"
                currency="IDR"
                locale="id-ID"
                disabled
              />
            </div>
            <div>
              <label class="block mt-2 text-sm font-medium text-gray-700">Tagihan Terbayar</label>
              <InputNumber
                v-model="formData.tagihan_terbayar"
                placeholder="Tagihan Terbayar"
                class="w-full"
                mode="currency"
                currency="IDR"
                locale="id-ID"
                disabled
              />
            </div>
            <div>
              <label class="block mt-2 text-sm font-medium text-gray-700">Harus Retur</label>
              <InputNumber
                v-model="formData.harus_retur"
                placeholder="Harus Retur"
                class="w-full"
                mode="currency"
                currency="IDR"
                locale="id-ID"
                disabled
              />
            </div>
            <div>
              <label class="block mt-2 text-sm font-medium text-gray-700">Selisih Riil yg Harus Dikoreksi</label>
              <InputNumber
                v-model="formData.selisih_dikoreksi"
                placeholder="Selisih Riil yg Harus Dikoreksi"
                class="w-full"
                mode="currency"
                currency="IDR"
                locale="id-ID"
                disabled
              />
            </div>
          </div>
          <div class="space-y-2 border p-2 rounded-lg mt-2">
            <label class="block font-semibold">Hasil Rumusan Akrual</label>
            <div>
              <label class="block mt-2 text-sm font-medium text-gray-700">Selisih Akrual</label>
              <InputNumber
                v-model="formData.selisih_akrual"
                placeholder="Selisih Akrual"
                class="w-full"
                mode="currency"
                currency="IDR"
                locale="id-ID"
                disabled
              />
            </div>
            <div>
              <label class="block mt-2 text-sm font-medium text-gray-700">Tagihan Netto</label>
              <InputNumber
                v-model="formData.tagihan_netto"
                placeholder="Tagihan Netto"
                class="w-full"
                mode="currency"
                currency="IDR"
                locale="id-ID"
                disabled
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
import { ref, watch, computed, watchEffect } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import DatePicker from 'primevue/datepicker'
import Dropdown from 'primevue/dropdown'
import Textarea from 'primevue/textarea'
import InputNumber from 'primevue/inputnumber'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
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
const visible = ref(props.modelValue)
const statusFase1Options = [
  { label: 'Data Awal', value: 'Data Awal' },
  { label: 'Koreksi Pendapatan', value: 'Koreksi Pendapatan' },
  { label: 'Koreksi Piutang', value: 'Koreksi Piutang' },
  { label: 'Koreksi Tagihan', value: 'Koreksi Tagihan' },
  { label: 'Valid', value: 'Valid' },
]
const statusFase2Options = [
  { label: 'Data Awal', value: 'Data Awal' },
  { label: 'Koreksi Pendapatan', value: 'Koreksi Pendapatan' },
  { label: 'Koreksi Piutang', value: 'Koreksi Piutang' },
  { label: 'Valid', value: 'Valid' },
]
const statusFase3Options = [
  { label: 'Data Awal', value: 'Data Awal' },
  { label: 'Potensi', value: 'Potensi' },
  { label: 'Kwitansi', value: 'Kwitansi' },
  { label: 'Terbayar', value: 'Terbayar' },
  { label: 'Batal', value: 'Batal' },
]
const defaultForm = {
  id: '',
  jenis_tagihan: '',
  pasien_nama: '',
  no_rekam_medik: '',
  pasien_alamat: '',
  no_pendaftaran: '',
  tgl_pendaftaran: '',
  tgl_krs: '',
  tgl_pelayanan: '',
  total: 0,
  total_dijamin: 0,
  total_sharing: 0,
  piutang_perorangan: 0,
  koreksi_sharing: 0,
  carabayar_id: 0,
  penjamin_id: 0,
  instalasi_id: 0,
  loket_id: 0,
  kasir_id: 0,
  pendapatan: 0,
  piutang: 0,
  pdd: 0,
  biaya_admin: 0,
  obat_dijamin: 0,
  status_fase1: '',
  status_fase2: '',
  status_fase3: '',
  is_valid: false,
  is_penjaminlebih1: false,
  is_naikkelas: false,
  hak_kelasrawat: '',
  naik_kelasrawat: '',
  tagihan_riil: 0,
  tagihan_terbayar: 0,
  harus_retur: 0,
  riil_dikoreksi: 0,
  selisih_akrual: 0,
  tagihan_netto: 0,
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
      return
    }

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

const tagihanRiil = computed(() => {
  return (
    (formData.value.total_dijamin || 0) + (formData.value.total_sharing || 0) + (formData.value.piutang_perorangan || 0) + (formData.value.koreksi_sharing || 0)
  )
})
const tagihanTerbayar = computed(() => {
  return (
    (formData.value.pendapatan || 0) + (formData.value.pdd || 0)
  )
})
const harusRetur = computed(() => {
  return (
    Math.max(0, (formData.value.tagihan_terbayar || 0) - (formData.value.tagihan_riil || 0))
  )
})
const selisihDikoreksi = computed(() => {
  return (
    (formData.value.tagihan_terbayar || 0) < (formData.value.tagihan_riil || 0) ? 
    (formData.value.tagihan_riil || 0) - (formData.value.tagihan_terbayar || 0) - (formData.value.piutang_perorangan || 0) :
    0
  )
})
const selisihAkrual = computed(() => {
  return (
    (formData.value.pendapatan || 0) + (formData.value.piutang || 0) + (formData.value.pdd || 0) - (formData.value.tagihan_riil || 0)
  )
})
const tagihanNetto = computed(() => {
  return (
    (formData.value.pendapatan || 0) + (formData.value.piutang || 0) + (formData.value.pdd || 0) - (formData.value.biaya_admin || 0)
  )
})
watchEffect(() => {
  formData.value.tagihan_riil = tagihanRiil.value
  formData.value.tagihan_terbayar = tagihanTerbayar.value
  formData.value.harus_retur = harusRetur.value
  formData.value.selisih_dikoreksi = selisihDikoreksi.value
  formData.value.selisih_akrual = selisihAkrual.value
  formData.value.tagihan_netto = tagihanNetto.value
})

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
    ;['is_valid', 'is_penjaminlebih1', 'is_naikkelas'].forEach((key) => {
      if (!(key in cleanedPayload)) {
        cleanedPayload[key] = false
      }
    })

    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    }

    await api.put(`/pendapatan_pelayanan/${formData.value.id}`, cleanedPayload, config)

    toast.add({
      severity: 'success',
      summary: 'Berhasil',
      detail: 'Data berhasil diperbarui',
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
