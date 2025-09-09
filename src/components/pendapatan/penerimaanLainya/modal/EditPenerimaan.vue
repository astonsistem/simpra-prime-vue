<script setup>
import { ref, reactive, watch, onMounted, computed } from 'vue'
import api from '@/services/http.js'
import Dropdown from 'primevue/dropdown'
import DatePicker from 'primevue/datepicker'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import InputNumber from 'primevue/inputnumber'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'

// Props
const props = defineProps({
  item: { type: Object, required: false, default: null }, // pakai item bukan id
  visible: { type: Boolean, required: true },
})

// Emits
const emit = defineEmits(['update:visible', 'saved'])

// State
const form = reactive({
  id: null,
  akun_id: null,
  tgl_bayar: null,
  no_bayar: '',
  pihak3: '',
  uraian: '',
  no_dokumen: '',
  tgl_dokumen: null,
  total: 0,
  jumlah_netto: 0,
  piutang: 0,
  desc_piutang_pelayanan: '',
  desc_piutang_lain: '',
  cara_bayar: null,
  bank_tujuan: null,
  biaya_admin_edc: 0,
  biaya_admin_qris: 0,
  selisih: 0,
  pendapatan: 0,
  pdd: 0,
})

const isEdit = computed(() => !!form.id)

const akunOptions = ref([])
const caraBayarOptions = ref([])
const bankTujuanOptions = ref([])
const loadingSubmit = ref(false)

// Fetch akun options
async function fetchAkunOptions() {
  try {
    const res = await api.get('/akun/list')
    if (res.data.status === 200) {
      akunOptions.value = res.data.data.map((item) => ({
        akun_id: item.akun_id,
        akun_nama: item.akun_nama,
      }))
    }
  } catch (error) {
    console.error('Gagal memuat data akun:', error)
  }
}

// Fetch cara bayar options
async function fetchCaraBayarOptions() {
  try {
    const res = await api.get('/carabayar')
    if (res.data.items) {
      caraBayarOptions.value = res.data.items.map((item) => ({
        value: item.carabayar_id,
        label: item.carabayar_nama,
      }))
    }
  } catch (error) {
    console.error('Gagal memuat data cara bayar:', error)
  }
}

// Fetch bank tujuan options
async function fetchBankTujuanOptions() {
  try {
    const res = await api.get('/bank/list')
    if (res.data.data) {
      bankTujuanOptions.value = res.data.data.map((item) => ({
        value: item.bank_id,
        label: item.bank_nama,
      }))
    }
  } catch (error) {
    console.error('Gagal memuat data bank tujuan:', error)
  }
}

// Fetch detail data
async function fetchDetail(id) {
  const res = await api.get(`/penerimaan_lain/${id}`)
  Object.assign(form, {
    id: res.data.id,
    akun_id: res.data.akun_id,
    tgl_bayar: res.data.tgl_bayar ? new Date(res.data.tgl_bayar) : null,
    no_bayar: res.data.no_bayar,
    pihak3: res.data.pihak3,
    uraian: res.data.uraian,
    no_dokumen: res.data.no_dokumen,
    tgl_dokumen: res.data.tgl_dokumen ? new Date(res.data.tgl_dokumen) : null,
    total: res.data.total,
    jumlah_netto: res.data.jumlah_netto,
    piutang: res.data.piutang,
    desc_piutang_pelayanan: res.data.desc_piutang_pelayanan,
    desc_piutang_lain: res.data.desc_piutang_lain,
    cara_bayar: res.data.cara_bayar,
    bank_tujuan: res.data.bank_tujuan,
    biaya_admin_edc: res.data.biaya_admin_edc || 0,
    biaya_admin_qris: res.data.biaya_admin_qris || 0,
    selisih: res.data.selisih || 0,
    pendapatan: res.data.pendapatan || 0,
    pdd: res.data.pdd || 0,
  })
}

function resetForm() {
  Object.assign(form, {
    id: null,
    akun_id: null,
    tgl_bayar: null,
    no_bayar: '',
    pihak3: '',
    uraian: '',
    no_dokumen: '',
    tgl_dokumen: null,
    total: 0,
    jumlah_netto: 0,
    piutang: 0,
    desc_piutang_pelayanan: '',
    desc_piutang_lain: '',
    cara_bayar: null,
    bank_tujuan: null,
    biaya_admin_edc: 0,
    biaya_admin_qris: 0,
    selisih: 0,
    pendapatan: 0,
    pdd: 0,
  })
}

watch(
  () => props.visible,
  async (val) => {
    if (val) {
      await fetchAkunOptions()
      await fetchCaraBayarOptions()
      await fetchBankTujuanOptions()
      if (props.item?.id) {
        await fetchDetail(props.item.id)
      } else {
        resetForm()
      }
    }
  }
)

function closeModal() {
  emit('update:visible', false)
}

async function submitForm() {
  loadingSubmit.value = true
  const payload = {
    akun_id: form.akun_id,
    tgl_bayar: form.tgl_bayar?.toISOString(),
    no_bayar: form.no_bayar,
    pihak3: form.pihak3,
    uraian: form.uraian,
    no_dokumen: form.no_dokumen,
    tgl_dokumen: form.tgl_dokumen?.toISOString(),
    total: form.total,
    jumlah_netto: form.jumlah_netto,
    piutang: form.piutang,
    desc_piutang_pelayanan: form.desc_piutang_pelayanan,
    desc_piutang_lain: form.desc_piutang_lain,
    cara_bayar: form.cara_bayar,
    bank_tujuan: form.bank_tujuan,
    biaya_admin_edc: form.biaya_admin_edc,
    biaya_admin_qris: form.biaya_admin_qris,
    selisih: form.selisih,
    pendapatan: form.pendapatan,
    pdd: form.pdd,
  }

  try {
    if (isEdit.value) {
      await api.put(`/penerimaan_lain/${form.id}`, payload)
    } else {
      await api.post('/penerimaan_lain', payload)
    }
    emit('saved')
    closeModal()
  } catch (err) {
    console.error('Gagal menyimpan data:', err)
  } finally {
    loadingSubmit.value = false
  }
}

onMounted(() => {
  fetchAkunOptions()
  fetchCaraBayarOptions()
  fetchBankTujuanOptions()
})
</script>

<template>
  <Dialog
    :visible="visible"
    @update:visible="(val) => emit('update:visible', val)"
    modal
    :closable="false"
    :header="isEdit ? 'Ubah Data Penerimaan #' + form.id : 'Tambah Data Penerimaan'"
    style="width: 720px"
  >
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block mb-1 font-medium text-sm">No Bayar</label>
        <InputText v-model="form.no_bayar" class="w-full" />
      </div>

      <div>
        <label class="block mb-1 font-medium text-sm">Pihak 3</label>
        <InputText v-model="form.pihak3" class="w-full" />
      </div>

      <div class="md:col-span-2">
        <label class="block mb-1 font-medium text-sm">Uraian</label>
        <InputText v-model="form.uraian" class="w-full" />
      </div>

      <div>
        <label class="block mb-1 font-medium text-sm">No Dokumen</label>
        <InputText v-model="form.no_dokumen" class="w-full" />
      </div>

      <div>
        <label class="block mb-1 font-medium text-sm">Tgl Dokumen</label>
        <DatePicker v-model="form.tgl_dokumen" dateFormat="dd-mm-yy" showIcon class="w-full" />
      </div>

      <div>
        <label class="block mb-1 font-medium text-sm">Jumlah Bayar</label>
        <InputNumber
          v-model="form.total"
          mode="currency"
          currency="IDR"
          locale="id-ID"
          class="w-full"
        />
      </div>

      <div>
        <label class="block mb-1 font-medium text-sm">Biaya Admin EDC</label>
        <InputNumber
          v-model="form.biaya_admin_edc"
          mode="currency"
          currency="IDR"
          locale="id-ID"
          class="w-full"
        />
      </div>

      <div>
        <label class="block mb-1 font-medium text-sm">Biaya Admin QRIS</label>
        <InputNumber
          v-model="form.biaya_admin_qris"
          mode="currency"
          currency="IDR"
          locale="id-ID"
          class="w-full"
        />
      </div>

      <div>
        <label class="block mb-1 font-medium text-sm">Selisih</label>
        <InputNumber
          v-model="form.selisih"
          mode="currency"
          currency="IDR"
          locale="id-ID"
          class="w-full"
        />
      </div>

      <div>
        <label class="block mb-1 font-medium text-sm">Jumlah Netto</label>
        <InputNumber
          v-model="form.jumlah_netto"
          mode="currency"
          currency="IDR"
          locale="id-ID"
          class="w-full"
        />
      </div>

      <div>
        <label class="block mb-1 font-medium text-sm">Cara Pembayaran</label>
        <Dropdown
          v-model="form.cara_bayar"
          :options="caraBayarOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Pilih Cara Pembayaran"
          class="w-full"
        />
      </div>

      <div>
        <label class="block mb-1 font-medium text-sm">Bank Tujuan</label>
        <Dropdown
          v-model="form.bank_tujuan"
          :options="bankTujuanOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Pilih Bank Tujuan"
          class="w-full"
        />
      </div>

      <div>
        <label class="block mb-1 font-medium text-sm">Pendapatan</label>
        <InputNumber
          v-model="form.pendapatan"
          mode="currency"
          currency="IDR"
          locale="id-ID"
          class="w-full"
        />
      </div>

      <div>
        <label class="block mb-1 font-medium text-sm">PDD</label>
        <InputNumber
          v-model="form.pdd"
          mode="currency"
          currency="IDR"
          locale="id-ID"
          class="w-full"
        />
      </div>

      <div>
        <label class="block mb-1 font-medium text-sm">Piutang</label>
        <InputNumber
          v-model="form.piutang"
          mode="currency"
          currency="IDR"
          locale="id-ID"
          class="w-full"
        />
      </div>
 
      <div class="md:col-span-2">
        <label class="block mb-1 font-medium text-sm">Info Potensi Piutang Pelayanan</label>
        <Textarea v-model="form.desc_piutang_pelayanan" rows="3" class="w-full" />
      </div>
 
      <div class="md:col-span-2">
        <label class="block mb-1 font-medium text-sm">Info Potensi Piutang Lain</label>
        <Textarea v-model="form.desc_piutang_lain" rows="3" class="w-full" />
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button
          label="Simpan"
          icon="pi pi-save"
          @click="submitForm"
          :loading="loadingSubmit"
          class="p-button-primary"
        />
        <Button label="Batal" severity="secondary" @click="closeModal" />
      </div>
    </template>
  </Dialog>
</template>
