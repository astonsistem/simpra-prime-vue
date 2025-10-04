<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="BKU Rekening Koran"
    :style="{ width: '50rem' }"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
  >
    <div class="p-4">
      <!-- Data BKU Bank Section -->
      <div class="mb-4 p-4 bg-gray-50 rounded-lg">
        <h4 class="text-lg font-semibold mb-3 text-[#17316E]">Data BKU Bank</h4>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Data BKU Bank</label>
            <p class="text-sm text-gray-600">#{{ formData.bku_id || 'Auto Generate' }}</p>
          </div>
        </div>
      </div>

      <!-- Form Fields -->
      <div class="grid grid-cols-2 gap-4">
        <!-- Left Column -->
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tgl. RC</label>
            <InputText 
              v-model="formData.tgl_rc" 
              readonly
              class="w-full bg-gray-100" 
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">No RC</label>
            <InputText 
              v-model="formData.no_rc" 
              readonly
              class="w-full bg-gray-100" 
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Uraian</label>
            <Textarea
              v-model="formData.uraian"
              readonly
              rows="3"
              class="w-full bg-gray-100"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Bank</label>
            <InputText 
              v-model="formData.bank" 
              readonly
              class="w-full bg-gray-100" 
            />
            <small v-if="errors.bank" class="text-red-500">{{ errors.bank }}</small>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Debit</label>
            <InputNumber 
              v-model="formData.debit" 
              readonly
              locale="id-ID"
              :minFractionDigits="0"
              :maxFractionDigits="2"
              class="w-full"
            />
          </div>
        </div>

        <!-- Right Column -->
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Mutasi</label>
            <div class="flex items-center">
              <Checkbox 
                v-model="formData.mutasi" 
                :binary="true"
                class="mr-2"
              />
              <div class="text-sm">{{ formData.mutasi ? 'Checked' : 'Unchecked' }}</div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Klarifikasi Langsung</label>
            <InputText 
              v-model="formData.klarif_langsung" 
              readonly
              class="w-full bg-gray-100" 
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">No. BKU <span class="text-red-500">*</span></label>
            <InputText 
              v-model="formData.no_bku" 
              placeholder="Contoh: MUTASI/01"
              class="w-full"
              :class="{ 'p-invalid': errors.no_bku }"
            />
            <small v-if="errors.no_bku" class="text-red-500">{{ errors.no_bku }}</small>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Keterangan BKU <span class="text-red-500">*</span></label>
            <Textarea
              v-model="formData.ket_bku"
              rows="3"
              placeholder="Contoh: Droping ke bendahara pengeluaran"
              class="w-full"
              :class="{ 'p-invalid': errors.ket_bku }"
            />
            <small v-if="errors.ket_bku" class="text-red-500">{{ errors.ket_bku }}</small>
          </div>
          <!-- BKU Type Info -->
          <div class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div class="flex items-center">
              <i class="pi pi-info-circle text-blue-600 mr-2"></i>
              <div>
                <p class="text-sm font-medium text-blue-800">Jenis BKU: {{ getBkuType(formData, formData.mutasi) }} </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      
    </div>

    <template #footer>
      <Button 
        label="Batal" 
        icon="pi pi-times" 
        @click="closeModal" 
        class="p-button-text" 
      />
      <Button
        label="Kirim PAD"
        icon="pi pi-send"
        @click="handleKirimPAD"
        :loading="loading"
        class="p-button-success"
      />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import useBankTujuan from '@/composables/useBankTujuan'
import useBkuRekeningKoran from '@/composables/useBkuRekeningKoran'
import useRekeningKoranEdit from '@/composables/useRekeningKoranEdit'

const props = defineProps({
  item: {
    type: Object,
    default: null,
  }
})

const emit = defineEmits(['update:modelValue', 'saved'])
const toast = useToast()
const visible = defineModel()
const loading = ref(false)
const errors = ref({})

// Bank options
const { options: bankOptions, fetchList: fetchBankList } = useBankTujuan()

// BKU Rekening Koran composable
const { createBkuFromRekeningKoran, getBkuType } = useBkuRekeningKoran()

// Rekening Koran Edit composable
const { show } = useRekeningKoranEdit()

const defaultForm = {
  bku_id: null,
  tgl_rc: '',
  no_rc: '',
  uraian: '',
  bank: '',
  debit: 0,
  kredit: 0,
  mutasi: false,
  klarif_langsung: '',
  no_bku: '',
  ket_bku: '',
  rc_id: null
}

const formData = ref({})

const getBkuTypeDescription = () => {
  const type = getBkuType.value
  switch (type) {
    case 'pengeluaran': return 'Debit > 0 dan mutasi tidak dicentang'
    case 'pindah_kas': return 'Debit > 0 dan mutasi dicentang'
    case 'penerimaan': return 'Kredit > 0 dan mutasi dicentang'
    default: return 'Kondisi tidak sesuai dengan rule BKU'
  }
}

watch(
  () => visible.value,
  async (newVal) => {
    if (newVal && props.item) {
      await loadData()
    }
  }
)

const loadData = async () => {
  if (!props.item?.rc_id) return

  try {
    loading.value = true
    
    // Fetch detailed rekening koran data
    const rekeningKoranData = await show(props.item.rc_id)
    
    // Populate form data
    formData.value = {
      bku_id: null,
      tgl_rc: rekeningKoranData.data?.tgl_rc || props.item.tgl_rc || '',
      no_rc: rekeningKoranData.data?.no_rc || props.item.no_rc || '',
      uraian: rekeningKoranData.data?.uraian || props.item.uraian || '',
      bank: rekeningKoranData.data?.bank || props.item.bank || '',
      debit: rekeningKoranData.data?.debit || props.item.debit || 0,
      kredit: rekeningKoranData.data?.kredit || props.item.kredit || 0,
      mutasi: false, // Default unchecked
      klarif_langsung: rekeningKoranData.data?.akunls_data?.akunls_nama || props.item.akunls_data?.akunls_nama || '',
      no_bku: '', // User input required
      ket_bku: '', // User input required
    }
  } catch (error) {
    console.error('Error loading BKU data:', error)
    // Fallback to props.item data
    formData.value = {
      bku_id: null,
      tgl_rc: props.item.tgl_rc || '',
      no_rc: props.item.no_rc || '',
      uraian: props.item.uraian || '',
      bank: props.item.bank || '',
      debit: props.item.debit || 0,
      kredit: props.item.kredit || 0,
      mutasi: false,
      klarif_langsung: props.item.akunls_data?.akunls_nama || '',
      no_bku: '',
      ket_bku: '',
    }
  } finally {
    loading.value = false
  }
}

// Methods
const resetForm = () => {
  formData.value = { ...defaultForm }
  errors.value = {}
}

const validateForm = () => {
  errors.value = {}
  
  if (!formData.value.bank) {
    errors.value.bank = 'Bank harus dipilih'
  }
  
  if (!formData.value.no_bku) {
    errors.value.no_bku = 'No. BKU harus diisi'
  }
  
  if (!formData.value.ket_bku) {
    errors.value.ket_bku = 'Keterangan BKU harus diisi'
  }
  
  return Object.keys(errors.value).length === 0
}


const handleKirimPAD = async () => {
  if (!validateForm()) {
    toast.add({
      severity: 'warn',
      summary: 'Validasi Gagal',
      detail: 'Mohon lengkapi semua field yang wajib diisi',
      life: 3000,
    })
    return
  }

  loading.value = true
  try {
    const payload = {
      rekening_koran_id: props.item.rc_id,
      bank: formData.value.bank,
      mutasi: formData.value.mutasi,
      no_bku: formData.value.no_bku,
      ket_bku: formData.value.ket_bku,
      bku_type: getBkuType(formData.value, formData.value.mutasi)
    }

    await createBkuFromRekeningKoran(payload)
    
    toast.add({
      severity: 'success',
      summary: 'Berhasil',
      detail: 'BKU berhasil dibuat dan dikirim ke PAD Online',
      life: 3000,
    })

    emit('saved')
    closeModal()
  } catch (error) {
    console.error('Error creating BKU:', error)
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: error.response?.data?.message || 'Gagal membuat BKU. Silakan coba lagi.',
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

// Watchers
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
    
    // Populate form with rekening koran data
    formData.value = {
      ...defaultForm,
      tgl_rc: newItem.tgl_rc,
      no_rc: newItem.no_rc,
      uraian: newItem.uraian,
      debit: newItem.debit || 0,
      kredit: newItem.kredit || 0,
      klarif_langsung: newItem.akunls_data?.akunls_nama || '',
      mutasi: false, // Default unchecked
      no_bku: '', // User input required
      ket_bku: '' // User input required
    }
  },
  { immediate: true }
)

// Lifecycle
onMounted(() => {
  fetchBankList()
})
</script>
