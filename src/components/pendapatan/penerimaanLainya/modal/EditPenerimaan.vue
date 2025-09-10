<script setup>
import { ref, watch, computed } from 'vue'
import api from '@/api/client.js'
import { useToast } from 'primevue/usetoast'
import FormJenisPenerimaan from '@/components/form/JenisPenerimaan.vue'

// Props
const props = defineProps({
  item: { type: Object, required: false, default: null }, // pakai item bukan id
  visible: { type: Boolean, required: true },
})

// Emits
const emit = defineEmits(['update:visible', 'saved'])

// State
const form = ref({})
const errors = ref({})
const isEdit = ref(false)
const loadingSubmit = ref(false)
const toast = useToast()
const optionsCaraPembayaran = ref([
  { label: 'Tunai', value: 'TUNAI' },
  { label: 'Transfer', value: 'TRANSFER' },
  { label: 'EDC', value: 'EDC' },
  { label: 'QRIS', value: 'QRIS' },
  { label: 'S-TAPAY', value: 'STPAY' },
  { label: 'UE Reader', value: 'READER' },
])

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

const optionsRekeningDpa = ref([])
const fetchRekeningDpa = async () => {
  if (optionsRekeningDpa.value.length) return; // Cek jika sudah ada data, tidak perlu fetch ulang
  try {
    const response = await api.get('/akun/list/pendapatan')

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

watch(
  () => props.item,
  (newItem) => {
    isEdit.value = !!(newItem && newItem.id)
    fetchBankTujuan()
    fetchRekeningDpa()
    
    if (isEdit.value) {
      form.value = props.item
    } else {
      resetForm()
    }
  },
  { immediate: true }
)

watch(() => props.visible, (newVal) => {
  if (!newVal) {
    resetForm()
    errors.value = {}
    loadingSubmit.value = false
  }
})

const jumlahNetto = computed(() => {
  return (
    parseInt(form.value.total || 0) -
    parseInt(form.value.admin_kredit || 0) -
    parseInt(form.value.admin_debit || 0) -
    parseInt(form.value.selisih || 0)
  ) || 0
})

watch(jumlahNetto, (newVal) => {
  form.value.jumlah_netto = newVal
})

function resetForm() {
  Object.keys(form.value).forEach((key) => {
    if (typeof form.value[key] === 'string') {
      form.value[key] = ''
    } else if (typeof form.value[key] === 'number') {
      form.value[key] = 0
    } else {
      form.value[key] = null
    }
  })
}

function closeModal() {
  emit('update:visible', false)
}

async function submitForm() {
  loadingSubmit.value = true
  const payload = form.value
  errors.value = {}

  try {
    if (isEdit.value) {
      await api.put(`/penerimaan_lain/${payload.id}`, payload)
    } else {
      await api.post('/penerimaan_lain', payload)
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
    loadingSubmit.value = false
  }
}

</script>

<template>
  <Dialog
    :visible="visible"
    @update:visible="(val) => emit('update:visible', val)"
    modal
    :closable="false"
    :header="isEdit ? 'Ubah Data Penerimaan #' + form.id : 'Tambah Data Penerimaan'"
    :style="{ width: '60rem' }"
    :breakpoints="{ '1199px': '95vw', '575px': '95vw' }"
  >
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-8 text-sm">
      <Fieldset legend="Informasi Billing">
        <!-- No Dokumen -->
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">No Dokumen</label>
          <InputText v-model="form.no_dokumen" placeholder="Nomor Dokumen" class="w-full" :invalid="errors?.no_dokumen?.length" />
          <Message v-if="errors.no_dokumen" severity="error" size="small" variant="simple">{{ errors?.no_dokumen[0] }}</Message>
        </div>
        
        <!-- Tgl Dokumen (dropdown) -->
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">Tgl Dokumen</label>
          <DatePicker
              v-model="form.tgl_dokumen"
              showIcon
              date-format="dd/mm/yy"
              placeholder="Tgl. Dokumen"
              class="w-full"
              :invalid="errors?.tgl_dokumen?.length"
            />
          <Message v-if="errors.tgl_dokumen" severity="error" size="small" variant="simple">{{ errors?.tgl_dokumen[0] }}</Message>
        </div>
        
        <!-- Jumlah Bruto -->
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">Jumlah Bruto</label>
          <InputNumber
            v-model="form.total"
            placeholder="Jumlah Bruto"
            class="w-full"
            mode="currency"
            currency="IDR"
            locale="id-ID"
            :invalid="errors?.total?.length"
          />
          <div v-if="errors.total" class="text-red-500 text-sm mt-1">{{ errors?.total[0] }}</div>
        </div>
        
        <!-- Biaya Admin EDC -->
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">Biaya Admin EDC</label>
          <InputNumber
            v-model="form.admin_kredit"
            placeholder="Biaya Admin EDC"
            class="w-full"
            mode="currency"
            currency="IDR"
            locale="id-ID"
            :invalid="errors?.admin_kredit?.length"
          />
        </div>
        <Message v-if="errors.admin_kredit" severity="error" size="small" variant="simple">{{ errors?.admin_kredit[0] }}</Message>
        
        <!-- Biaya Admin QRIS -->
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">Biaya Admin QRIS</label>
          <InputNumber
            v-model="form.admin_debit"
            placeholder="Biaya Admin QRIS"
            class="w-full"
            mode="currency"
            currency="IDR"
            locale="id-ID"
            :invalid="errors?.admin_debit?.length"
          />
          <Message v-if="errors.admin_debit" severity="error" size="small" variant="simple">{{ errors?.admin_debit[0] }}</Message>
        </div>
        
        <!-- Selisih -->
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">Selisih</label>
          <InputNumber
            v-model="form.selisih"
            placeholder="Selisih"
            class="w-full"
            mode="currency"
            currency="IDR"
            locale="id-ID"
            :invalid="errors?.selisih?.length"
          />
          <Message v-if="errors.selisih" severity="error" size="small" variant="simple">{{ errors?.selisih[0] }}</Message>
        </div>
        
        <!-- Jumlah Netto -->
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">Jumlah Netto</label>
          <InputNumber
            v-model="form.jumlah_netto"
            placeholder="Jumlah Netto"
            class="w-full"
            mode="currency"
            currency="IDR"
            locale="id-ID"
            readonly
            disabled
          />
          <Message v-if="errors.jumlah_netto" severity="error" size="small" variant="simple">{{ errors?.jumlah_netto[0] }}</Message>
        </div>
        
        <!-- Cara Pembayaran (dropdown) -->
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">Cara Pembayaran</label>
          <Dropdown
            v-model="form.cara_pembayaran"
            :options="optionsCaraPembayaran"
            optionLabel="label"
            optionValue="value"
            placeholder="Pilih Cara Pembayaran"
            class="w-full"
          />
          <Message v-if="errors.cara_pembayaran" severity="error" size="small" variant="simple">{{ errors?.cara_pembayaran[0] }}</Message>
        </div>
        
        <!-- Bank Tujuan (dropdown) -->
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">Bank Tujuan</label>
          <Dropdown
            v-model="form.bank_tujuan"
            :options="optionsBankTujuan" 
            optionLabel="label"
            optionValue="value"
            placeholder="Pilih Bank Tujuan"
            class="w-full"
          />
          <Message v-if="errors.bank_tujuan" severity="error" size="small" variant="simple">{{ errors?.bank_tujuan[0] }}</Message>
        </div>
        
        <!-- PDD -->
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">PDD</label>
          <InputNumber
            v-model="form.pdd"
            placeholder="PDD"
            class="w-full"
            mode="currency"
            currency="IDR"
            locale="id-ID"
          />
          <Message v-if="errors.pdd" severity="error" size="small" variant="simple">{{ errors?.pdd[0] }}</Message>
        </div>
        
      </Fieldset>
      <Fieldset legend="Informasi Detail">
        <!-- Jenis Penerimaan (dropdown) -->
          <div class="mb-4">
            <label class="block mb-1 text-sm font-medium text-gray-700">Jenis Penerimaan</label>
            <FormJenisPenerimaan v-model="form.akun_id" dataKey="akun_id" :invalid="errors?.akun_id?.length" class="w-full" />
            <Message v-if="errors.akun_id" severity="error" size="small" variant="simple">{{ errors?.akun_id[0] }}</Message>
          </div>
          
          <!-- Tgl. Bayar (dropdown) -->
          <div class="mb-4">
            <label class="block mb-1 text-sm font-medium text-gray-700">Tgl. Bayar</label>
            <DatePicker
              v-model="form.tgl_bayar"
              showIcon
              date-format="dd/mm/yy"
              placeholder="Tgl. Bayar"
              class="w-full"
              :invalid="errors?.tgl_bayar?.length"
            />
            <div v-if="errors.tgl_bayar" class="text-red-500 text-sm mt-1">{{ errors?.tgl_bayar[0] }}</div>
          </div>
          
          <!-- No. Bayar -->
          <div class="mb-4">
            <label class="block mb-1 text-sm font-medium text-gray-700">No. Bayar</label>
            <InputText v-model="form.no_bayar" placeholder="Nomor Bayar" class="w-full" :invalid="errors?.no_bayar?.length" />
            <Message v-if="errors.no_bayar" severity="error" size="small" variant="simple">{{ errors?.no_bayar[0] }}</Message>
          </div>
          
          <!-- pihak3 -->
          <div class="mb-4">
            <label class="block mb-1 text-sm font-medium text-gray-700">Pihak 3</label>
            <InputText v-model="form.pihak3" placeholder="Pihak 3" class="w-full" :invalid="errors?.pihak3?.length" />
            <div v-if="errors.pihak3" class="text-red-500 text-sm mt-1">{{ errors?.pihak3[0] }}</div>
          </div>
          
          <!-- Uraian -->
          <div class="lg:col-span-3 mb-4">
            <label class="block mb-1 text-sm font-medium text-gray-700">Uraian</label>
            <Textarea v-model="form.uraian" placeholder="Uraian" rows="3" class="w-full" :invalid="errors?.uraian?.length" />
            <div v-if="errors.uraian" class="text-red-500 text-sm mt-1">{{ errors?.uraian[0] }}</div>
          </div>
          <!-- rekening dpa -->
          <div class="mb-4">
            <label class="block mb-1 text-sm font-medium text-gray-700">Rekening DPA</label>
            <Dropdown
              v-model="form.rek_id"
              :options="optionsRekeningDpa"
              optionLabel="label"
              optionValue="value"
              placeholder="Pilih Rekening DPA"
              class="w-full"
              :invalid="errors?.rek_id?.length"
            />
            <Message v-if="errors.rek_id" severity="error" size="small" variant="simple">{{ errors?.rek_id[0] }}</Message>
          </div>
          <div class="mb-4">
            <label class="block mb-1 font-medium text-sm">Info Potensi Piutang Pelayanan</label>
            <Textarea v-model="form.desc_piutang_pelayanan" rows="3" class="w-full" />
            <Message v-if="errors.desc_piutang_pelayanan" severity="error" size="small" variant="simple">{{ errors?.desc_piutang_pelayanan[0] }}</Message>
          </div>
    
          <div class="mb-4">
            <label class="block mb-1 font-medium text-sm">Info Potensi Piutang Lain</label>
            <Textarea v-model="form.desc_piutang_lain" rows="3" class="w-full" />
            <Message v-if="errors.desc_piutang_lain" severity="error" size="small" variant="simple">{{ errors?.desc_piutang_lain[0] }}</Message>
          </div>
      </Fieldset>
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
