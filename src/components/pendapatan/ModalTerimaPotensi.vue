<template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="jenisPotensi == 'pelayanan' ? 'Terima Potensi Pelayanan' : 'Terima Potensi Lainnya'"
    :style="{ width: '60rem' }"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
  >
    <div class="p-4">
      <div class="grid grid-cols-2 gap-6">
        <div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Jenis Penerimaan</label>
            <Dropdown
              v-model="formData.akun_id"
              :options="options.akun"
              optionLabel="label"
              optionValue="value"
              placeholder="Pilih Jenis Penerimaan"
              class="w-full"
              filter
              filterPlaceholder="Search Jenis Penerimaan"
            />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">Tanggal Bayar</label>
            <DatePicker
              v-model="formData.tgl_bayar"
              date-format="dd/mm/yy"
              placeholder="Tanggal Bayar"
              showIcon
              class="w-full"
            />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">No Bayar</label>
            <InputText v-model="formData.no_bayar" placeholder="No Bayar" class="w-full" />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">Pihak ke-3</label>
            <InputText v-model="formData.pihak3" placeholder="Pihak ke-3" class="w-full" />
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
            <label class="block mt-2 text-sm font-medium text-gray-700">No Dokumen</label>
            <InputText v-model="formData.no_dokumen" placeholder="No Dokumen" class="w-full" />
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
            <label class="block mt-2 text-sm font-medium text-gray-700">Jumlah Bayar</label>
            <InputNumber
              v-model="formData.total"
              placeholder="Jumlah Bayar"
              class="w-full"
              mode="currency"
              currency="IDR"
              locale="id-ID"
            />
          </div>
        </div>
        <div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Cara Pembayaran</label>
            <Dropdown
              v-model="formData.cara_pembayaran"
              :options="options.caraPembayaran"
              optionLabel="label"
              optionValue="value"
              placeholder="Pilih Cara Pembayaran"
              class="w-full"
            />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">Bank Tujuan</label>
            <Dropdown
              v-model="formData.bank_tujuan"
              :options="options.bank"
              optionLabel="label"
              optionValue="value"
              placeholder="Pilih Bank Tujuan"
              class="w-full"
            />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">Biaya Admin EDC</label>
            <InputNumber
              v-model="formData.admin_kredit"
              placeholder="Biaya Admin EDC"
              class="w-full"
              mode="currency"
              currency="IDR"
              locale="id-ID"
            />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">Biaya Admin QRIS</label>
            <InputNumber
              v-model="formData.admin_debit"
              placeholder="Biaya Admin QRIS"
              class="w-full"
              mode="currency"
              currency="IDR"
              locale="id-ID"
            />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">Selisih</label>
            <InputNumber
              v-model="formData.selisih"
              placeholder="Selisih"
              class="w-full"
              mode="currency"
              currency="IDR"
              locale="id-ID"
            />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">Jumlah Netto</label>
            <InputNumber
              v-model="formData.jumlah_netto"
              placeholder="Jumlah Netto"
              class="w-full"
              mode="currency"
              currency="IDR"
              locale="id-ID"
              disabled
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
            <label class="block mt-2 text-sm font-medium text-gray-700">Piutang</label>
            <InputNumber
              v-model="formData.piutang"
              placeholder="Piutang"
              class="w-full"
              mode="currency"
              currency="IDR"
              locale="id-ID"
              disabled
            />
          </div>
        </div>
      </div>
      <div>
        <label class="block mt-2 text-sm font-medium text-gray-700">
          {{ jenisPotensi == 'pelayanan' ? 'Informasi Potensi Pelayanan' : 'Informasi Potensi Lain' }}
        </label>
        <Textarea
           v-model="formData[jenisPotensi === 'pelayanan' ? 'desc_piutang_pelayanan' : 'desc_piutang_lain']"
          rows="3"
          cols="30"
          autoResize
          :placeholder="jenisPotensi == 'pelayanan' ? 'Informasi potensi pelayanan' : 'Informasi potensi lainnya'"
          class="w-full"
        />
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
  jenisPotensi: {
    type: String,
    default: null,
  },
  options: Object
})
const emit = defineEmits(['update:modelValue', 'saved'])
const toast = useToast()
const loading = ref(false)
const visible = ref(props.modelValue)
const defaultForm = {
  id: '',
  akun_id: 0,
  tgl_bayar: '',
  no_bayar: '',
  pihak3: '',
  uraian: '',
  no_dokumen: '',
  tgl_dokumen: '',
  total: 0,
  cara_pembayaran: '',
  bank_tujuan: '',
  admin_kredit: 0,
  admin_debit: 0,
  selisih: 0,
  jumlah_netto: 0,
  pendapatan: 0,
  pdd: 0,
  piutang: 0,
  desc_piutang_pelayanan: '',
  desc_piutang_lain: '',
  piutang_id: '',
  piutanglain_id: '',
  sumber_transaksi: ''
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
    if (newItem) {
      Object.keys(formData.value).forEach((key) => {
        if (key.startsWith('tgl_')) {
          formData.value[key] = newItem[key] ? new Date(newItem[key]) : null
        } else {
          formData.value[key] = newItem[key]
        }
      })

      if (props.jenisPotensi == 'pelayanan') {
        formData.value.id = ''
        formData.value.piutang_id = newItem.id
        formData.value.pihak3 = newItem.penjamin_nama
        formData.value.uraian = ''
        formData.value.total = 0
        formData.value.pendapatan = 0
        formData.value.pdd = 0
        formData.value.desc_piutang_pelayanan = newItem.uraian
        formData.value.desc_piutang_lain = ''
        formData.value.sumber_transaksi = 'POTENSI1'
      } else {
        formData.value.id = ''
        formData.value.piutanglain_id = newItem.id
        formData.value.uraian = ''
        formData.value.total = 0
        formData.value.pendapatan = 0
        formData.value.pdd = 0
        formData.value.piutang = 0
        formData.value.desc_piutang_pelayanan = ''
        formData.value.desc_piutang_lain = newItem.uraian
        formData.value.sumber_transaksi = 'POTENSI2'
      }
    }
  },
  { immediate: true }
)

const jumlahNetto = computed(() => {
  return (
    (formData.value.total || 0) - (formData.value.admin_kredit || 0) + (formData.value.selisih || 0)
  )
})
watchEffect(() => {
  formData.value.jumlah_netto = jumlahNetto.value
  formData.value.piutang = jumlahNetto.value
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

    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    }

    const endpoint = props.jenisPotensi == 'pelayanan' ? '/potensi_pelayanan/terima' : '/potensi_lainnya/terima'

    await api.post(endpoint, cleanedPayload, config)

    toast.add({
      severity: 'success',
      summary: 'Berhasil',
      detail: 'Data berhasil ditambahkan',
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
