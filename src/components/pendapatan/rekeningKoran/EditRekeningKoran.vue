<template>
  <Dialog v-model:visible="visible" modal header="Ubah Rekening Koran" :closable="true" 
    :style="{ width: '800px' }" @update:visible="handleClose">
    <div v-if="loading" class="flex justify-center items-center py-8">
      <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" />
    </div>
    
    <div v-else class="space-y-4">
      <!-- Data Rekening Koran Section -->
      <div class="border-b pb-4">
        <h4 class="text-lg font-semibold mb-3 text-[#17316E]">Data Rekening Koran</h4>
        
        <div class="grid grid-cols-2 gap-4">
          <!-- Tgl. RC -->
          <div class="flex flex-col gap-2">
            <label for="tgl_rc" class="font-medium">Tgl. RC <span class="text-red-500">*</span></label>
            <DatePicker 
              id="tgl_rc"
              v-model="form.tgl_rc" 
              dateFormat="yy-mm-dd" 
              placeholder="yyyy-mm-dd"
              :class="{ 'p-invalid': errors.tgl_rc }"
            />
            <small v-if="errors.tgl_rc" class="text-red-500">{{ errors.tgl_rc }}</small>
          </div>

          <!-- No. RC -->
          <div class="flex flex-col gap-2">
            <label for="no_rc" class="font-medium">No. RC <span class="text-red-500">*</span></label>
            <InputText 
              id="no_rc"
              v-model="form.no_rc" 
              placeholder="Masukkan No. RC"
              :class="{ 'p-invalid': errors.no_rc }"
            />
            <small v-if="errors.no_rc" class="text-red-500">{{ errors.no_rc }}</small>
          </div>

          <!-- Uraian (readonly) -->
          <div class="flex flex-col gap-2 col-span-2">
            <label for="uraian" class="font-medium">Uraian</label>
            <Textarea 
              id="uraian"
              v-model="form.uraian" 
              rows="2"
              readonly
              disabled
              class="bg-gray-100"
            />
          </div>

          <!-- Rekening Dari (readonly) -->
          <div class="flex flex-col gap-2">
            <label for="rek_dari" class="font-medium">Rekening Dari</label>
            <InputText 
              id="rek_dari"
              v-model="form.rek_dari" 
              readonly
              disabled
              class="bg-gray-100"
            />
          </div>

          <!-- Nama Pemilik Rekening (readonly) -->
          <div class="flex flex-col gap-2">
            <label for="nama_dari" class="font-medium">Nama Pemilik Rekening</label>
            <InputText 
              id="nama_dari"
              v-model="form.nama_dari" 
              readonly
              disabled
              class="bg-gray-100"
            />
          </div>

          <!-- Bank (readonly) -->
          <div class="flex flex-col gap-2">
            <label for="bank" class="font-medium">Bank</label>
            <InputText 
              id="bank"
              v-model="form.bank" 
              readonly
              disabled
              class="bg-gray-100"
            />
          </div>

          <!-- Debit/Kredit Display -->
          <div class="flex flex-col gap-2">
            <label class="font-medium">{{ form.debit > 0 ? 'Debit' : 'Kredit' }}</label>
            <InputNumber 
              :model-value="form.debit > 0 ? form.debit : form.kredit"
              mode="currency" 
              currency="IDR" 
              locale="id-ID"
              readonly
              disabled
              class="bg-gray-100"
            />
          </div>
        </div>
      </div>

      <!-- Hasil Klarifikasi Section -->
      <div class="pt-2">
        <h4 class="text-lg font-semibold mb-3 text-[#17316E]">Hasil Klarifikasi</h4>
        
        <div class="grid grid-cols-1 gap-4">
          <!-- Klarifikasi Monev (readonly) -->
          <div class="flex flex-col gap-2">
            <label for="akun_id" class="font-medium">Klarifikasi Monev</label>
            <InputText 
              id="akun_id"
              v-model="form.akun_nama" 
              readonly
              disabled
              class="bg-gray-100"
            />
          </div>

          <!-- Rekening DPA (editable dropdown) -->
          <div class="flex flex-col gap-2">
            <label for="rek_id" class="font-medium">Rekening DPA</label>
            <Select
              id="rek_id"
              v-model="form.rek_id"
              :options="rekeningDpaOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Pilih Rekening DPA"
              filter
              class="w-full"
              :class="{ 'p-invalid': errors.rek_id }"
            />
            <small v-if="errors.rek_id" class="text-red-500">{{ errors.rek_id }}</small>
          </div>

          <!-- Klarifikasi Langsung (editable dropdown) -->
          <div class="flex flex-col gap-2">
            <label for="akunls_id" class="font-medium">Klarifikasi Langsung <span class="text-red-500">*</span></label>
            <Select 
              id="akunls_id"
              v-model="form.akunls_id" 
              :options="akunOptions" 
              optionLabel="label"
              optionValue="value"
              placeholder="Pilih Akun Klarifikasi"
              filter
              :loading="loadingAkun"
              :class="{ 'p-invalid': errors.akunls_id }"
              class="w-full"
            />
            <small v-if="errors.akunls_id" class="text-red-500">{{ errors.akunls_id }}</small>
          </div>

          <!-- Klarifikasi Layanan -->
          <div class="flex flex-col gap-2">
            <label for="klarif_layanan" class="font-medium">Klarifikasi Layanan <span class="text-red-500">*</span></label>
            <InputNumber 
              id="klarif_layanan"
              v-model="form.klarif_layanan" 
              mode="currency" 
              currency="IDR" 
              locale="id-ID"
              placeholder="0"
              :class="{ 'p-invalid': errors.klarif_layanan }"
              @input="calculateTotal"
            />
            <small v-if="errors.klarif_layanan" class="text-red-500">{{ errors.klarif_layanan }}</small>
          </div>

          <!-- Klarifikasi Lain -->
          <div class="flex flex-col gap-2">
            <label for="klarif_lain" class="font-medium">Klarifikasi Lain <span class="text-red-500">*</span></label>
            <InputNumber 
              id="klarif_lain"
              v-model="form.klarif_lain" 
              mode="currency" 
              currency="IDR" 
              locale="id-ID"
              placeholder="0"
              :class="{ 'p-invalid': errors.klarif_lain }"
              @input="calculateTotal"
            />
            <small v-if="errors.klarif_lain" class="text-red-500">{{ errors.klarif_lain }}</small>
          </div>

          <!-- Total Klarifikasi (calculated) -->
          <div class="flex flex-col gap-2 bg-blue-50 p-3 rounded">
            <label class="font-medium">Total Klarifikasi</label>
            <div class="text-xl font-bold text-blue-700">
              {{ formatCurrency(totalKlarifikasi) }}
            </div>
            <small v-if="totalKlarifikasi > nominal" class="text-red-500">
              ⚠️ Total klarifikasi melebihi nominal {{ form.kredit > 0 ? 'kredit' : 'debit' }}
            </small>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button label="Batal" severity="secondary" @click="handleClose" :disabled="saving" />
        <Button 
          label="Simpan" 
          icon="pi pi-check" 
          @click="handleSave" 
          :loading="saving"
          :disabled="loading || totalKlarifikasi > nominal"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import { formatCurrency } from '@/utils/utils'
import useRekeningKoranEdit from '@/composables/useRekeningKoranEdit'
import useMasterAkun from '@/composables/useMasterAkun'
import { formatDateToYYYYMMDD } from '@/utils/dateUtils'
import useRekeningDpa from '@/composables/useRekeningDpa'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  item: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'saved'])

const toast = useToast()
const { updateRekeningKoran, loading: saving } = useRekeningKoranEdit()
const { fetchAkunKlarifikasi, loading: loadingAkun } = useMasterAkun()
const { options: rekeningDpaOptions, fetchList: fetchRekeningDpa } = useRekeningDpa()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const loading = ref(false)
const akunOptions = ref([])
const errors = ref({})

const form = ref({
  rc_id: null,
  tgl_rc: null,
  no_rc: '',
  uraian: '',
  rek_dari: '',
  nama_dari: '',
  bank: '',
  debit: 0,
  kredit: 0,
  akun_id: null,
  akun_nama: '',
  akunls_id: null,
  rek_id: null,
  klarif_layanan: 0,
  klarif_lain: 0
})

const totalKlarifikasi = computed(() => {
  return (form.value.klarif_layanan || 0) + (form.value.klarif_lain || 0)
})

const nominal = computed(() => {
  return form.value.kredit > 0 ? form.value.kredit : form.value.debit
})

watch(() => props.item, async (newItem) => {
  if (newItem && props.modelValue) {
    await loadData(newItem)
  }
}, { immediate: true })

watch(() => props.modelValue, async (newValue) => {
  if (newValue && props.item) {
    await loadData(props.item)
  }
})

async function loadData(item) {
  loading.value = true
  errors.value = {}
  
  try {
    // Populate form
    form.value = {
      rc_id: item.rc_id,
      tgl_rc: formatDateToYYYYMMDD(item.tgl_rc),
      no_rc: item.no_rc,
      uraian: item.uraian || '',
      rek_dari: item.rek_dari || '',
      nama_dari: item.nama_dari || '',
      bank: item.bank || '',
      debit: item.debit || 0,
      kredit: item.kredit || 0,
      akun_id: item.akun_id,
      akun_nama: item.akun_data?.akun_nama || '',
      akunls_id: item.akunls_id,
      rek_id: item.rekening_dpa?.rek_id || item.rek_id || null,
      klarif_layanan: item.klarif_layanan || 0,
      klarif_lain: item.klarif_lain || 0
    }

    // Load akun options based on kredit/debit
    const type = form.value.kredit > 0 ? 'kredit' : 'debit'
    const akuns = await fetchAkunKlarifikasi(type)
    
    akunOptions.value = akuns.map(akun => ({
      label: `${akun.akun_kode} - ${akun.akun_nama}`,
      value: akun.akun_id
    }))

    // Load Rekening DPA options
    await fetchRekeningDpa()

  } catch (error) {
    console.error('Error loading data:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Gagal memuat data',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

function calculateTotal() {
  // Trigger reactivity for computed totalKlarifikasi
}

function validateForm() {
  errors.value = {}
  let isValid = true

  if (!form.value.tgl_rc) {
    errors.value.tgl_rc = 'Tanggal RC harus diisi'
    isValid = false
  }

  if (!form.value.no_rc) {
    errors.value.no_rc = 'No. RC harus diisi'
    isValid = false
  }

  if (!form.value.akunls_id) {
    errors.value.akunls_id = 'Klarifikasi Langsung harus dipilih'
    isValid = false
  }

  if (form.value.klarif_layanan < 0) {
    errors.value.klarif_layanan = 'Klarifikasi Layanan tidak boleh negatif'
    isValid = false
  }

  if (form.value.klarif_lain < 0) {
    errors.value.klarif_lain = 'Klarifikasi Lain tidak boleh negatif'
    isValid = false
  }

  if (totalKlarifikasi.value > nominal.value) {
    errors.value.klarif_layanan = 'Total klarifikasi melebihi nominal'
    isValid = false
  }

  return isValid
}

async function handleSave() {
  if (!validateForm()) {
    toast.add({
      severity: 'warn',
      summary: 'Validasi Gagal',
      detail: 'Mohon lengkapi form dengan benar',
      life: 3000
    })
    return
  }

  try {
    const payload = {
      tgl_rc: formatDateToYYYYMMDD(form.value.tgl_rc),
      no_rc: form.value.no_rc,
      akunls_id: form.value.akunls_id,
      rek_id: form.value.rek_id || null,
      klarif_layanan: form.value.klarif_layanan || 0,
      klarif_lain: form.value.klarif_lain || 0
    }

    await updateRekeningKoran(form.value.rc_id, payload)

    toast.add({
      severity: 'success',
      summary: 'Berhasil',
      detail: 'Data rekening koran berhasil diubah',
      life: 3000
    })

    emit('saved')
    handleClose()

  } catch (error) {
    console.error('Error saving:', error)
    
    // Handle validation errors from backend
    if (error.response?.data?.detail) {
      const details = error.response.data.detail
      details.forEach(err => {
        if (err.loc && err.loc[1]) {
          errors.value[err.loc[1]] = err.msg
        }
      })
    }

    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.response?.data?.message || 'Gagal menyimpan data',
      life: 3000
    })
  }
}

function handleClose() {
  visible.value = false
  errors.value = {}
}
</script>

<style scoped>
:deep(.p-invalid) {
  border-color: #ef4444;
}
</style>
