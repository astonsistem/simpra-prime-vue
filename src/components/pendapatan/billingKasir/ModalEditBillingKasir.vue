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
          <label class="block mb-2 text-sm font-medium text-gray-700">No Bayar</label>
          <InputText v-model="formData.no_bayar" placeholder="No Bayar" class="w-full" />
        </div>
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">Tanggal Bayar</label>
          <DatePicker
            v-model="formData.tgl_bayar"
            placeholder="Tanggal Bayar"
            showIcon
            class="w-full"
          />
        </div>
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">Pasien</label>
          <InputText v-model="formData.pasien" placeholder="Pasien" class="w-full" />
        </div>
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
            v-model="formData.cara_bayar_id"
            :options="caraBayarOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Pilih Cara Bayar"
            class="w-full"
          />
        </div>
        <div class="col-span-2">
          <label class="block mb-2 text-sm font-medium text-gray-700">Uraian</label>
          <Textarea v-model="formData.uraian" placeholder="Uraian" rows="3" class="w-full" />
        </div>
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">Jumlah Bruto</label>
          <InputNumber
            v-model="formData.jumlah_bruto"
            placeholder="Jumlah Bruto"
            class="w-full"
            mode="currency"
            currency="IDR"
            locale="id-ID"
          />
        </div>
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
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">Jumlah Netto</label>
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
  no_bayar: '',
  tgl_bayar: null,
  pasien: '',
  no_dokumen: '',
  tgl_dokumen: null,
  uraian: '',
  cara_bayar_id: null,
  jumlah_bruto: 0,
  biaya_admin_edc: 0,
  biaya_admin_qris: 0,
})

const caraBayarOptions = ref([])

const visible = ref(props.modelValue)

watch(
  () => props.modelValue,
  (newValue) => {
    visible.value = newValue
    if (newValue) {
      fetchCaraBayar()
    }
  }
)

watch(visible, (newValue) => {
  emit('update:modelValue', newValue)
})

const resetForm = () => {
  formData.value = {
    no_bayar: '',
    tgl_bayar: null,
    pasien: '',
    no_dokumen: '',
    tgl_dokumen: null,
    uraian: '',
    cara_bayar_id: null,
    jumlah_bruto: 0,
    biaya_admin_edc: 0,
    biaya_admin_qris: 0,
  }
}

watch(
  () => props.item,
  (newItem) => {
    isEdit.value = !!(newItem && newItem.id)
    if (isEdit.value) {
      formData.value = {
        ...newItem,
        id: newItem.id,
        no_bayar: newItem.noBayar,
        tgl_bayar: new Date(newItem.tglBayar),
        pasien: newItem.pasien,
        no_dokumen: newItem.noDokumen,
        tgl_dokumen: new Date(newItem.tglDokumen),
        uraian: newItem.uraian,
        cara_bayar_id: newItem.caraBayarId,
        jumlah_bruto: newItem.jumlahBruto,
        biaya_admin_edc: newItem.biayaAdminEdc,
        biaya_admin_qris: newItem.biayaAdminQris,
      }
    } else {
      resetForm()
    }
  },
  { immediate: true }
)

const jumlahNetto = computed(() => {
  return (
    (formData.value.jumlah_bruto || 0) -
    (formData.value.biaya_admin_edc || 0) -
    (formData.value.biaya_admin_qris || 0)
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

const saveData = async () => {
  loading.value = true
  try {
    const payload = {
      id: formData.value.id,
      pendaftaran_id: formData.value.pendaftaran_id,
      no_pendaftaran: formData.value.no_pendaftaran,
      tgl_pendaftaran: formData.value.tgl_pendaftaran,
      pasien_id: formData.value.pasien_id,
      no_rekam_medik: formData.value.no_rekam_medik,
      pasien_nama: formData.value.pasien,
      pasien_alamat: formData.value.pasien_alamat,
      jenis_tagihan: formData.value.jenis_tagihan,
      tgl_krs: formData.value.tgl_krs,
      tgl_pelayanan: formData.value.tgl_pelayanan,
      carabayar_id: formData.value.cara_bayar_id,
      carabayar_nama: formData.value.carabayar_nama,
      penjamin_id: formData.value.penjamin_id,
      penjamin_nama: formData.value.penjamin_nama,
      instalasi_id: formData.value.instalasi_id,
      instalasi_nama: formData.value.instalasi_nama,
      metode_bayar: formData.value.metode_bayar,
      tandabuktibayar_id: formData.value.tandabuktibayar_id,
      no_buktibayar: formData.value.no_bayar,
      tgl_buktibayar: formData.value.tgl_bayar,
      sep_id: formData.value.sep_id,
      no_sep: formData.value.no_sep,
      tgl_sep: formData.value.tgl_sep,
      cara_pembayaran: formData.value.cara_pembayaran,
      bank_tujuan: formData.value.bank_tujuan,
      admin_kredit: formData.value.admin_kredit,
      admin_debit: formData.value.admin_debit,
      kartubank_pasien: formData.value.kartubank_pasien,
      no_kartubank_pasien: formData.value.no_kartubank_pasien,
      closingkasir_id: formData.value.closingkasir_id,
      tgl_closingkasir: formData.value.tgl_closingkasir,
      no_closingkasir: formData.value.no_closingkasir,
      kasir_id: formData.value.kasir_id,
      kasir_nama: formData.value.kasir_nama,
      loket_id: formData.value.loket_id,
      loket_nama: formData.value.loket_nama,
      guna_bayar: formData.value.uraian,
      total: formData.value.jumlah_bruto,
      klasifikasi: formData.value.klasifikasi,
      status_id: formData.value.status_id,
      bulan_mrs: formData.value.bulan_mrs,
      bulan_krs: formData.value.bulan_krs,
      bulan_pelayanan: formData.value.bulan_pelayanan,
      akun_id: formData.value.akun_id,
      selisih: formData.value.selisih,
      jumlah_netto: formData.value.jumlah_netto,
      rc_id: formData.value.rc_id,
      is_web_change: true,
    }

    // Membersihkan payload dari nilai null atau undefined
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
      await api.put(`/billing_kasir/${formData.value.id}`, cleanedPayload, config)
    } else {
      await api.post('/billing_kasir', cleanedPayload, config)
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
