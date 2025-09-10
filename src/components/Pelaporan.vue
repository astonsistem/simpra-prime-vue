<script setup>
import { reactive, ref, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import api from '@/services/http.js'
import DatePicker from 'primevue/datepicker'

const toast = useToast()
const isDownloading = ref(false)

const route = useRoute()
const laporanSlug = computed(() => route.params.slug)

const laporan = ref({}) 
const formLaporan = ref(null)
const selectedTypeFile = ref('pdf')

const selectedDate = reactive({})
const selectedYear = reactive({})
const selectedMonth = reactive({})
const selectedRadio = reactive({})
const inputtedText = reactive({})

const user = JSON.parse(localStorage.getItem('user') || 'null')


const fileTypeOptions = [
  { label: 'PDF', value: 'pdf' },
  { label: 'Excel', value: 'xlsx' }
]
const monthOptions = Array.from({ length: 12 }, (_, i) => ({
  label: new Date(2024, i).toLocaleString('id-ID', { month: 'long' }),
  value: i + 1
}))

const submitFormLaporan = async () => {
  const form = formLaporan.value
  const formData = new FormData(form)
  const actionUrl = `/pelaporan-generate/${laporan.value.id}`

  isDownloading.value = true
  toast.add({
    id: 'loading-toast',
    severity: 'info',
    summary: 'Info',
    detail: 'Memproses data laporan...',
    life: 9999999,
  })

  try {
    const { data } = await api.post(actionUrl, formData)

    if (data.success) {
        window.open(data.url, '_blank')
        setTimeout(() => {
            api.delete(`/pelaporan-delete/${data.filename}`)
        }, 3000)
    } else {
        console.error('Gagal download laporan:', data.error)
        toast.add({
          severity: 'error',
          summary: 'Gagal',
          detail: Object.values(data.error).join('\n'),
          life: 3500,
        })
    }
  } catch (err) {
    console.error('Gagal download laporan:', err)
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: 'Terjadi kesalahan pada server. Silakan coba lagi.',
      life: 3500,
    })
  } finally {
    isDownloading.value = false
    toast.remove('loading-toast')
  }
}

const fetchLaporan = async () => {
  try {
    const res = await api.get(`/pelaporan/${laporanSlug.value}`)
    if (res.data) {
        laporan.value = res.data.data
    }
  } catch (error) {
    console.error('Gagal memuat data laporan:', error)
  }
}

watch(
  () => route.params.slug,
  async () => {
    await fetchLaporan()
    if (formLaporan.value) {
      formLaporan.value.reset()
    }
  },
  { immediate: true }
)

watch(() => laporan.value?.params, (params) => {
  params?.forEach(param => {
    if (param.type === 'date' && !selectedDate[param.key]) {
      selectedDate[param.key] = new Date()
    }else if (param.type === 'year' && !selectedYear[param.key]) {
      selectedYear[param.key] = new Date().getFullYear()
    }else if (param.type === 'month' && !selectedMonth[param.key]) {
      selectedMonth[param.key] = new Date().getMonth() + 1
    }
  })
}, { immediate: true })

</script>

<template>
  <form 
      ref="formLaporan" 
      class="p-4"
      @submit.prevent="submitFormLaporan">
    <div
      class="bg-surface-0 dark:bg-surface-900 rounded-2xl mb-6 px-6 py-4 md:px-6 md:py-3 border-b md:border border-surface-200 dark:border-surface-700 w-full sticky top-0 z-30"
    >
      <div class="flex items-center justify-between mb-4">
        <h3 v-if="laporan" class="text-xl font-semibold text-[#17316E] mb-4">({{ laporan.kode_laporan }}) {{ laporan.nama_laporan }}</h3>
        <Dropdown v-model="selectedTypeFile" :options="fileTypeOptions" option-label="label" option-value="value" class="w-32" />
        <input type="hidden" name="tipe_file_pelaporan" :value="selectedTypeFile" />
      </div>
      <div class="grid grid-cols-3 gap-4">
        <template v-for="param in laporan.params" :key="param.key">
          <div v-if="param.type === 'date'">
            <label class="block mb-1 text-sm font-medium text-gray-700">{{ param.name }}</label>
            <DatePicker
              v-model="selectedDate[param.key]" :placeholder="param.name" showIcon class="w-full" />
            <input type="hidden" :name="param.key" :value="selectedDate[param.key] instanceof Date
              ? `${selectedDate[param.key].getFullYear()}-${String(selectedDate[param.key].getMonth() + 1).padStart(2, '0')}-${String(selectedDate[param.key].getDate()).padStart(2, '0')}`
              : ''" />
          </div>
          <div v-else-if="param.type === 'year'">
            <label class="block mb-1 text-sm font-medium text-gray-700">{{ param.name }}</label>
            <InputNumber 
              v-model="selectedYear[param.key]" :min="2000" :max="2100" :useGrouping="false" :format="false" showButtons readonlyInput class="w-full" />
            <input type="hidden" :name="param.key" :value="selectedYear[param.key]" />
          </div>
          <div v-else-if="param.type === 'month'">
            <label class="block mb-1 text-sm font-medium text-gray-700">{{ param.name }}</label>
            <Dropdown
                v-model="selectedMonth[param.key]" :options="monthOptions" optionLabel="label" optionValue="value" class="w-full" />
            <input type="hidden" :name="param.key" :value="selectedMonth[param.key]" />
          </div>
          <div v-else-if="param.type === 'radio' || param.type === 'sql_combo'">
            <label class="form-label">{{ param.name }}</label>
            <Dropdown
                v-model="selectedRadio[param.key]" :options="param.data" optionLabel="name" optionValue="value" :placeholder="`Pilih ${param.name}`" class="w-full" />
            <input type="hidden" :name="param.key" :value="selectedRadio[param.key]" />
          </div>
          <div v-else-if="param.type === 'user'">
            <input type="hidden" :name="param.key" :value="user.id" />
          </div>
          <div v-else>
            <label class="form-label">{{ param.name }}</label>
            <InputText v-model="inputtedText[param.key]" :name="param.key" :placeholder="`Masukkan ${param.name}`" class="w-full" />
          </div>
        </template>
      </div>
      <div class="mt-4 flex gap-2">
        <Button label="Download Laporan" icon="pi pi-download" class="p-button-primary" type="submit" :loading="isDownloading" />
      </div>
    </div>
  </form>
</template>