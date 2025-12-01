<script setup>
import { ref, onMounted, watch } from 'vue'
import { FilterMatchMode } from '@primevue/core/api'
import DatePicker from 'primevue/datepicker'
import Select from 'primevue/select'
import Button from 'primevue/button'
import SplitButton from 'primevue/splitbutton'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Toast from 'primevue/toast'
import InputText from 'primevue/inputtext'
import * as XLSX from 'xlsx'
import api from '@/api/client.js'
import { useToast } from 'primevue/usetoast'
import ModalEditPendapatanPelayanan from '@/components/pendapatan/pendapatanPelayanan/ModalEditPendapatanPelayanan.vue'
import ModalPenjamin1 from '@/components/pendapatan/pendapatanPelayanan/ModalPenjamin1.vue'
import TablePenjamin1 from '@/components/pendapatan/pendapatanPelayanan/TablePenjamin1.vue'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'

const rowStyle = (rowData) => {
  if (rowData.is_valid === true) return { backgroundColor: '#d4edda', color: '#155724' }
}

const formatDateToYYYYMMDD = (date) => {
  if (!date) return null
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
function formatDateID(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID')
}

const activeIndex = ref(0) 
const toast = useToast()
const formFilters = ref({
  jenisPelayanan: '',
  jenisPeriode: '',
  tahunPeriode: null,
  bulanAwal: null,
  bulanAkhir: null,
  tglAwal: null,
  tglAkhir: null,
})
const formFiltersP1 = ref({
  jenisPelayanan: '',
  jenisPeriode: '',
  tahunPeriode: null,
  bulanAwal: null,
  bulanAkhir: null,
  tglAwal: null,
  tglAkhir: null,
})
const filters = ref()
const tahunPeriodeOptions = Array.from(
  { length: 10 },
  (_, i) => `${new Date().getFullYear() - 5 + i}`
)
const jenisPeriodeOptions = ref([
  { label: 'Bulanan', value: 'BULANAN' },
  { label: 'Tanggal', value: 'TANGGAL' },
])
const statusOptions = [
  { label: 'Valid', value: true },
  { label: 'Invalid', value: false },
]
const penjamin1Options = [
  { label: 'True', value: true },
  { label: 'False', value: false },
]
const bulanOptions = [
  { label: 'Januari', value: 1 },
  { label: 'Februari', value: 2 },
  { label: 'Maret', value: 3 },
  { label: 'April', value: 4 },
  { label: 'Mei', value: 5 },
  { label: 'Juni', value: 6 },
  { label: 'Juli', value: 7 },
  { label: 'Agustus', value: 8 },
  { label: 'September', value: 9 },
  { label: 'Oktober', value: 10 },
  { label: 'November', value: 11 },
  { label: 'Desember', value: 12 },
]
const jenisPelayananOptions = ref([])
const caraBayarOptions = ref([])
const penjaminOptions = ref([])
const instalasiOptions = ref([])
const loketOptions = ref([])
const kasirOptions = ref([])
const data = ref([])
const totalRecords = ref(0)
const rows = ref(10)
const first = ref(0)
const loading = ref(false)
const selectedItem = ref(null)
const showModalEdit = ref(false)
const showModalPenjamin1 = ref(false)
const sortField = ref(null)
const sortOrder = ref(null)
const tablePenjamin1 = ref(null)

const buildQuery = (page = 1, pageSize = rows.value) => {
  const q = {
    page,
    size: pageSize,
  }
  if (formFilters.value.jenisPeriode) q.periode = formFilters.value.jenisPeriode
  if (formFilters.value.jenisPeriode === 'BULANAN') {
    if (formFilters.value.tahunPeriode) {
      q.tahun_periode = formFilters.value.tahunPeriode
    }
    if (formFilters.value.bulanAwal && formFilters.value.bulanAkhir) {
      if (!formFilters.value.tahunPeriode) {
        toast.add({
          severity: 'warn',
          summary: 'Peringatan',
          detail: 'Filter Tahun Periode harus terisi ketika Bulan Awal atau Bulan Akhir terisi.',
          life: 3000,
        })
        return null
      }
      const year = formFilters.value.tahunPeriode || new Date().getFullYear()
      const startDate = new Date(year, formFilters.value.bulanAwal - 1, 1)
      const endDate = new Date(year, formFilters.value.bulanAkhir, 0)
      q.tgl_awal = formatDateToYYYYMMDD(startDate)
      q.tgl_akhir = formatDateToYYYYMMDD(endDate)
    } else if (formFilters.value.bulanAwal || formFilters.value.bulanAkhir) {
      if (!formFilters.value.tahunPeriode) {
        toast.add({
          severity: 'warn',
          summary: 'Peringatan',
          detail: 'Filter Tahun Periode harus terisi ketika Bulan Awal atau Bulan Akhir terisi.',
          life: 3000,
        })
        return null
      }
      toast.add({
        severity: 'warn',
        summary: 'Peringatan',
        detail: 'Filter Bulan Awal dan Bulan Akhir harus terisi semua ketika salah satu terisi.',
        life: 3000,
      })
      return null
    }
  } else if (formFilters.value.jenisPeriode === 'TANGGAL') {
    if (formFilters.value.tglAwal && formFilters.value.tglAkhir) {
      q.tgl_awal = formatDateToYYYYMMDD(formFilters.value.tglAwal)
      q.tgl_akhir = formatDateToYYYYMMDD(formFilters.value.tglAkhir)
    } else if (formFilters.value.tglAwal || formFilters.value.tglAkhir) {
      toast.add({
        severity: 'warn',
        summary: 'Peringatan',
        detail: 'Filter Tanggal Awal dan Tanggal Akhir harus terisi semua ketika salah satu terisi.',
        life: 3000,
      })
      return null
    }
  }

  if (formFilters.value.jenisPelayanan) q.jenis_pelayanan = formFilters.value.jenisPelayanan

  if (filters.value) {
    Object.keys(filters.value).forEach((key) => {
      if (filters.value[key].value !== null && filters.value[key].value !== undefined) {
        if (key === "total") {
          q[key] = {
            value: filters.value[key].value,
            matchMode: filters.value[key].matchMode
          }
        } else {
          q[key] = filters.value[key].value
        }
      }
    })
  }

  if (sortField.value) {
    q.sortField = sortField.value
    q.sortOrder = sortOrder.value === 1 ? 'asc' : 'desc'
  }

  return q
}
const loadData = async (page = 1, pageSize = rows.value) => {
  loading.value = true
  try {
    const query = buildQuery(page, pageSize)
    if (!query) {
      loading.value = false
      return
    }
    const response = await api.get('/pendapatan_pelayanan', { params: query })
    if (response.data && response.data.items) {
      data.value = response.data.items.map((item, index) => ({
        ...item,
        no: (page - 1) * pageSize + index + 1,
      }))
      totalRecords.value = response.data.total ?? 0
      if (pageSize === totalRecords.value && pageSize > 100) {
        rows.value = 1000
      }
    }
  } catch (error) {
    console.error('Gagal memuat data:', error)
    toast.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal memuat data', life: 3000 })
  } finally {
    loading.value = false
  }
}
const onPageChange = (event) => {
  first.value = event.first
  rows.value = event.rows
  if (event.rows === 1000) {
    loadData(1, totalRecords.value)
  } else {
    const page = event.page + 1
    loadData(page, event.rows)
  }
}

const resetFilter = () => {
  formFilters.value = {
    jenisPelayanan: '',
    jenisPeriode: '',
    tahunPeriode: null,
    bulanAwal: null,
    bulanAkhir: null,
    tglAwal: null,
    tglAkhir: null,
  }
  first.value = 0
  data.value = []
  totalRecords.value = 0 
}
const searchData = () => {
  first.value = 0
  loadData(1, rows.value)
}

const resetFilterP1 = () => {
  formFiltersP1.value = {
    jenisPelayanan: '',
    jenisPeriode: '',
    tahunPeriode: null,
    bulanAwal: null,
    bulanAkhir: null,
    tglAwal: null,
    tglAkhir: null,
  }
}
const searchDataP1 = () => {
  tablePenjamin1.value.loadData()
}

const handleEdit = async (item) => {
  if (item.is_valid) {
    toast.add({
      severity: 'warn',
      summary: 'Peringatan',
      detail: 'Data yang sudah tervalidasi tidak dapat diubah.',
      life: 3000,
    })
    return
  }
  try {
    loading.value = true
    const response = await api.get(`/pendapatan_pelayanan/${item.id}`)
    if (response.data) {
      selectedItem.value = { ...response.data }
      showModalEdit.value = true
    } else {
      toast.add({
        severity: 'error',
        summary: 'Gagal',
        detail: 'Gagal memuat detail data',
        life: 3000,
      })
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: 'Gagal memuat detail data',
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}
const handlePenjamin1 = async (item) => {
  try {
    loading.value = true
    const response = await api.get(`/pendapatan_pelayanan/${item.id}`)
    if (response.data) {
      selectedItem.value = { ...response.data }
      showModalPenjamin1.value = true
    } else {
      toast.add({
        severity: 'error',
        summary: 'Gagal',
        detail: 'Gagal memuat detail data',
        life: 3000,
      })
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: 'Gagal memuat detail data',
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}
const handleTarik = (item) => {
  if (item.is_valid) {
    toast.add({
      severity: 'warn',
      summary: 'Peringatan',
      detail: 'Data yang sudah tervalidasi tidak dapat diubah.',
      life: 3000,
    })
    return
  }
  toast.add({
    severity: 'warn',
    summary: 'Konfirmasi',
    detail: 'Apakah Anda yakin ingin tarik ulang data ini?',
    group: 'confirm',
    data: {
      url: `/pendapatan_pelayanan/tarik/${item.id}`,
      title: 'tarik ulang'
    }
  })
}
const handleSync1 = (item) => {
  if (item.is_valid) {
    toast.add({
      severity: 'warn',
      summary: 'Peringatan',
      detail: 'Data yang sudah tervalidasi tidak dapat diubah.',
      life: 3000,
    })
    return
  }
  toast.add({
    severity: 'warn',
    summary: 'Konfirmasi',
    detail: 'Apakah Anda yakin ingin sinkron fase 1 data ini?',
    group: 'confirm',
    data: {
      url: `/pendapatan_pelayanan/sinkron_fase1/${item.id}`,
      title: 'sinkron fase 1'
    }
  })
}
const handleSync2 = (item) => {
  if (item.is_valid) {
    toast.add({
      severity: 'warn',
      summary: 'Peringatan',
      detail: 'Data yang sudah tervalidasi tidak dapat diubah.',
      life: 3000,
    })
    return
  }
  toast.add({
    severity: 'warn',
    summary: 'Konfirmasi',
    detail: 'Apakah Anda yakin ingin sinkron fase 2 data ini?',
    group: 'confirm',
    data: {
      url: `/pendapatan_pelayanan/sinkron_fase2/${item.id}`,
      title: 'sinkron fase 2'
    }
  })
}
const handleValidasi = (item) => {
  if (item.is_valid) {
    toast.add({
      severity: 'warn',
      summary: 'Peringatan',
      detail: 'Data yang sudah tervalidasi.',
      life: 3000,
    })
    return
  }
  toast.add({
    severity: 'warn',
    summary: 'Konfirmasi',
    detail: 'Apakah Anda yakin ingin validasi data ini?',
    group: 'confirm',
    data: {
      url: `/pendapatan_pelayanan/validasi/${item.id}`,
      title: 'validasi'
    }
  })
}
const handleBatalValidasi = (item) => {
  if (!item.is_valid) {
    toast.add({
      severity: 'warn',
      summary: 'Peringatan',
      detail: 'Data yang belum tervalidasi tidak dapat dibatalkan validasinya.',
      life: 3000,
    })
    return
  }
  toast.add({
    severity: 'warn',
    summary: 'Konfirmasi',
    detail: 'Apakah Anda yakin ingin membatalkan validasi data ini?',
    group: 'confirm',
    data: {
      url: `/pendapatan_pelayanan/cancel_validasi/${item.id}`,
      title: 'validasi'
    }
  })
}
const onConfirmAction = async (event) => {
  toast.removeGroup('confirm')
  const { url, title } = event.data
  try {
    await api.get(url)
    toast.add({
      severity: 'success',
      summary: 'Berhasil',
      detail: `Aksi ${title} berhasil dijalankan`,
      life: 3000,
    })
    first.value = 0
    loadData(1, rows.value)
  } catch (error) {
    console.error(`Gagal ${title}:`, error)
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: `Aksi ${title} gagal. Silakan coba lagi.`,
      life: 3000,
    })
  }
}
const onReject = () => {
  toast.removeGroup('confirm')
}
const handleSaved = () => {
  showModalEdit.value = false
  first.value = 0
  loadData(1, rows.value)
}

const fetchJenisPelayanan = async () => {
  try {
    const response = await api.get('/sumbertransaksi/list')
    if (response.data && response.data.data) {
      jenisPelayananOptions.value = response.data.data.map((item) => ({
        label: item.sumber_nama,
        value: item.sumber_nama,
      }))
    }
  } catch (error) {
    console.error('Gagal memuat data jenis pelayanan:', error)
  }
}
const fetchCaraBayar = async () => {
  try {
    const response = await api.get('/carabayar/list')
    if (response.data && response.data.data) {
      caraBayarOptions.value = response.data.data.map((item) => ({
        label: item.carabayar_nama,
        value: item.carabayar_nama,
        id: item.carabayar_id,
      }))
    }
  } catch (error) {
    console.error('Gagal memuat data cara bayar:', error)
  }
}
const fetchPenjamin = async () => {
  try {
    const response = await api.get('/penjamin/list')
    if (response.data && response.data.data) {
      penjaminOptions.value = response.data.data.map((item) => ({
        label: item.penjamin_nama,
        value: item.penjamin_nama,
        id: item.penjamin_id,
      }))
    }
  } catch (error) {
    console.error('Gagal memuat data penjamin:', error)
  }
}
const fetchInstalasi = async () => {
  try {
    const response = await api.get('/instalasi/list')
    if (response.data && response.data.data) {
      instalasiOptions.value = response.data.data.map((item) => ({
        label: item.instalasi_nama,
        value: item.instalasi_id,
      }))
    }
  } catch (error) {
    console.error('Gagal memuat data instalasi:', error)
  }
}
const fetchLoket = async () => {
  try {
    const response = await api.get('/loket/list')
    if (response.data && response.data.data) {
      loketOptions.value = response.data.data.map((item) => ({
        label: item.loket_nama,
        value: item.loket_id,
      }))
    }
  } catch (error) {
    console.error('Gagal memuat data loket:', error)
  }
}
const fetchKasir = async () => {
  try {
    const response = await api.get('/kasir/list')
    if (response.data && response.data.data) {
      kasirOptions.value = response.data.data.map((item) => ({
        label: item.kasir_nama,
        value: item.kasir_id,
      }))
    }
  } catch (error) {
    console.error('Gagal memuat data kasir:', error)
  }
}

onMounted(async () => {
  await fetchJenisPelayanan()
  await fetchCaraBayar()
  await fetchPenjamin()
  await fetchInstalasi()
  await fetchLoket()
  await fetchKasir()
})

const exportExcel = () => {
  try {
    // Prepare headers for Excel (excluding Action column)
    const headers = [
      'No',
      'Tgl Pendaftaran',
      'No Pendaftaran',
      'No RM',
      'Nama',
      'Tanggal Selesai',
      'Jenis Pelayanan',
      'Cara Bayar',
      'Instalasi',
      'Penjamin',
      'Tagihan RS',
      'Tagihan Dijamin',
      'Yg Dibayar Pasien',
      'Pendapatan',
      'Piutang',
      'PDD',
      'Status',
      'Penjamin > 1',
    ]

    // Prepare data for Excel
    const excelData = data.value.map((item, index) => [
      item.no || index + 1,
      item.tgl_pendaftaran || '',
      item.no_pendaftaran || '',
      item.no_rekam_medik || '',
      item.pasien_nama || '',
      item.tgl_pelayanan || '',
      item.jenis_tagihan || '',
      item.carabayar_nama || '',
      item.instalasi_nama || '',
      item.penjamin_nama || '',
      item.total ?? 0,
      item.tagihan_dijamin ?? 0,
      item.tagihan_sharing ?? 0,
      item.pendapatan ?? 0,
      item.piutang ?? 0,
      item.pdd ?? 0,
      item.is_valid ? 'valid' : 'invalid',
      item.is_penjaminlebih1 ?? false,
    ])


    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...excelData])
    // Auto-fit columns
    worksheet['!cols'] = headers.map((header, i) => ({
      wch: Math.max(
        header.length,
        ...excelData.map(row =>
          row[i] ? row[i].toString().length : 0
        )
      ) + 2,
    }))
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pendapatan Pelayanan')


    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })

    // Download file
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `pendapatan_pelayanan_${new Date().toISOString().split('T')[0]}.xlsx`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.add({
      severity: 'success',
      summary: 'Export Berhasil',
      detail: 'Data berhasil diekspor ke Excel',
      life: 3000,
    })
  } catch (error) {
    console.error('Gagal export Excel:', error)
    toast.add({
      severity: 'error',
      summary: 'Export Gagal',
      detail: 'Gagal mengekspor data ke Excel',
      life: 3000,
    })
  }
}
const exportExcelP1 = () => {
  try {
    // Prepare headers for Excel (excluding Action column)
    const headers = [
      'No',
      'Tgl Pendaftaran',
      'No Pendaftaran',
      'No RM',
      'Nama',
      'Tanggal Selesai',
      'Jenis Pelayanan',
      'Cara Bayar',
      'Penjamin',
      'Nilai',
      'Status',
    ]

    // Prepare data for Excel
    const excelData = tablePenjamin1.value.data.map((item, index) => [
      item.no || index + 1,
      item.tgl_pendaftaran || '',
      item.no_pendaftaran || '',
      item.no_rekam_medik || '',
      item.pasien_nama || '',
      item.tgl_pelayanan || '',
      item.jenis_tagihan || '',
      item.carabayar_nama || '',
      item.penjamin_nama || '',
      item.total_dijamin ?? 0,
      item.status || '',
    ])


    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...excelData])
    // Auto-fit columns
    worksheet['!cols'] = headers.map((header, i) => ({
      wch: Math.max(
        header.length,
        ...excelData.map(row =>
          row[i] ? row[i].toString().length : 0
        )
      ) + 2,
    }))
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Penjamin')


    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })

    // Download file
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `penjamin_${new Date().toISOString().split('T')[0]}.xlsx`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.add({
      severity: 'success',
      summary: 'Export Berhasil',
      detail: 'Data berhasil diekspor ke Excel',
      life: 3000,
    })
  } catch (error) {
    console.error('Gagal export Excel:', error)
    toast.add({
      severity: 'error',
      summary: 'Export Gagal',
      detail: 'Gagal mengekspor data ke Excel',
      life: 3000,
    })
  }
}

const initFilters = () => {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    no_pendaftaran: { value: null, matchMode: FilterMatchMode.CONTAINS },
    no_rekam_medik: { value: null, matchMode: FilterMatchMode.CONTAINS },
    pasien_nama: { value: null, matchMode: FilterMatchMode.CONTAINS },
    carabayar_nama: { value: null, matchMode: FilterMatchMode.EQUALS },
    penjamin_nama: { value: null, matchMode: FilterMatchMode.EQUALS },
    total: { value: null, matchMode: FilterMatchMode.EQUALS },
    is_valid: { value: null, matchMode: FilterMatchMode.EQUALS },
    is_penjaminlebih1: { value: null, matchMode: FilterMatchMode.EQUALS },
  }
}
initFilters()

const onFilter = (event) => {
  filters.value = event.filters
  first.value = 0
  loadData(1, rows.value)
}
const clearTableFilters = () => {
  initFilters()
  first.value = 0
  loadData(1, rows.value)
}

const clearTableFiltersP1 = () => {
  tablePenjamin1.value.clearTableFilters()
}

const onSort = (event) => {
  sortField.value = event.sortField
  sortOrder.value = event.sortOrder
  first.value = 0
  loadData(1, rows.value)
}

watch(showModalPenjamin1, (newVal, oldVal) => {
  if (!newVal && oldVal) {
    first.value = 0
    loadData(1, rows.value)
  }
})
</script>

<template>
    <div class="card">
      <TabView v-model:activeIndex="activeIndex">
        <TabPanel header="Data Transaksi">
          <div class="p-4">
            <div class="bg-surface-0 dark:bg-surface-900 rounded-2xl my-6 px-6 py-4 md:px-6 md:py-3 border-b md:border border-surface-200 dark:border-surface-700 w-full sticky top-0 z-30">
              <h3 class="text-xl font-semibold text-[#17316E] mb-4">Filter Data</h3>
              <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label class="block mb-1 text-sm font-medium text-gray-700">Jenis Pelayanan</label>
                  <Select
                    v-model="formFilters.jenisPelayanan"
                    :options="jenisPelayananOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Jenis Pelayanan"
                    class="w-full"
                  />
                </div>
                <div>
                  <label class="block mb-1 text-sm font-medium text-gray-700">Jenis Periode</label>
                  <Select
                    v-model="formFilters.jenisPeriode"
                    :options="jenisPeriodeOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Jenis Periode"
                    class="w-full"
                  />
                </div>
                <template v-if="formFilters.jenisPeriode === 'BULANAN'">
                  <div>
                    <label class="block mb-1 text-sm font-medium text-gray-700">Tahun Periode</label>
                    <Select
                      v-model="formFilters.tahunPeriode"
                      :options="tahunPeriodeOptions"
                      placeholder="Tahun Periode"
                      class="w-full"
                    />
                  </div>
                  <div>
                    <label class="block mb-1 text-sm font-medium text-gray-700">Bulan Awal</label>
                    <Select
                      v-model="formFilters.bulanAwal"
                      :options="bulanOptions"
                      optionLabel="label"
                      optionValue="value"
                      placeholder="Bulan Awal"
                      class="w-full"
                    />
                  </div>
                  <div>
                    <label class="block mb-1 text-sm font-medium text-gray-700">Bulan Akhir</label>
                    <Select
                      v-model="formFilters.bulanAkhir"
                      :options="bulanOptions"
                      optionLabel="label"
                      optionValue="value"
                      placeholder="Bulan Akhir"
                      class="w-full"
                    />
                  </div>
                </template>
                <template v-if="formFilters.jenisPeriode === 'TANGGAL'">
                  <div>
                    <label class="block mb-1 text-sm font-medium text-gray-700">Tanggal Awal</label>
                    <DatePicker
                      v-model="formFilters.tglAwal"
                      placeholder="Tanggal Awal"
                      showIcon
                      class="w-full"
                      dateFormat="dd/mm/yy"
                      :showTime="false"
                      :showSeconds="false"
                      :showMilliseconds="false"
                    />
                  </div>
                  <div>
                    <label class="block mb-1 text-sm font-medium text-gray-700">Tanggal Akhir</label>
                    <DatePicker
                      v-model="formFilters.tglAkhir"
                      placeholder="Tanggal Akhir"
                      showIcon
                      class="w-full"
                      dateFormat="dd/mm/yy"
                      :showTime="false"
                      :showSeconds="false"
                      :showMilliseconds="false"
                    />
                  </div>
                </template>
              </div>
              <div class="mt-4 flex gap-2">
                <Button label="Cari"  class="p-button-info" @click="searchData" />
                <Button
                  label="Reset Filter"
                  class="p-button-secondary"
                  @click="resetFilter"
                />
              </div>
            </div>
            <div class="bg-surface-0 dark:bg-surface-900 rounded-2xl my-6 px-6 py-4 md:px-6 md:py-3 border-b md:border border-surface-200 dark:border-surface-700 w-full sticky top-0 z-30">
              <div class="flex justify-between items-center mb-2">
                <div class="flex gap-2">
                  <Button label="Clear Column Filters" icon="pi pi-filter-slash" outlined @click="clearTableFilters" />
                </div>
                <div class="flex gap-2">
                  <Button label="Export Excel" icon="pi pi-download" class="p-button-success" @click="exportExcel" />
                </div>
              </div>
              <DataTable
                :filters="filters"
                :value="data"
                :loading="loading"
                responsiveLayout="scroll"
                paginator
                lazy
                :totalRecords="totalRecords"
                :rows="rows"
                :first="first"
                :rowsPerPageOptions="[5, 10, 20, 50, 100, 1000]"
                @page="onPageChange"
                @filter="onFilter"
                @sort="onSort"
                sortMode="single"
                dataKey="id"
                filterDisplay="menu"
                class="p-datatable-sm"
                :rowStyle="rowStyle"
              >
                <template #header>
                </template>
                <Column field="no" header="No" style="width: 5%" />
                <Column header="Action" style="width: 10%">
                  <template #body="slotProps">
                    <SplitButton 
                      label="Action" 
                      icon="pi pi-ellipsis-v" 
                      size="small" 
                      severity="secondary"
                      :model="[
                        { label: 'Ubah', icon: 'pi pi-pencil', command: () => handleEdit(slotProps.data) },
                        { label: 'Tarik Ulang', icon: 'pi pi-refresh', command: () => handleTarik(slotProps.data), },
                        { label: 'Sinkron Fase 1', icon: 'pi pi-sync', command: () => handleSync1(slotProps.data), },
                        { label: 'Sinkron Fase 2', icon: 'pi pi-sync', command: () => handleSync2(slotProps.data), },
                        { label: 'Penjamin > 1', icon: 'pi pi-users', command: () => handlePenjamin1(slotProps.data), },
                        { label: 'Validasi', icon: 'pi pi-check', command: () => handleValidasi(slotProps.data), },
                        { label: 'Batal Validasi', icon: 'pi pi-times', command: () => handleBatalValidasi(slotProps.data), },
                      ]"
                    />
                  </template>
                </Column>
                <Column 
                  field="tgl_pendaftaran" 
                  header="Tgl Pendaftaran" 
                  sortable 
                  style="min-width: 8rem"
                >
                  <template #body="{ data }">
                    {{ formatDateID(data.tgl_pendaftaran) }}
                  </template>
                </Column>
                <Column 
                  field="no_pendaftaran" 
                  header="No Pendaftaran" 
                  :showFilterMatchModes="false" 
                  style="width: 15%"
                >
                  <template #body="{ data }">
                    {{ data.no_pendaftaran }}
                  </template>
                  <template #filter="{ filterModel }">
                    <InputText v-model="filterModel.value" type="text" placeholder="Search No Pendaftaran" />
                  </template>
                </Column>
                <Column 
                  field="no_rekam_medik" 
                  header="No RM" 
                  :showFilterMatchModes="false" 
                  style="min-width: 8rem"
                >
                  <template #body="{ data }">
                    {{ data.no_rekam_medik }}
                  </template>
                  <template #filter="{ filterModel }">
                    <InputText v-model="filterModel.value" type="text" placeholder="Search No RM" />
                  </template>
                </Column>
                <Column 
                  field="pasien_nama" 
                  header="Nama" 
                  :showFilterMatchModes="false" 
                  style="min-width: 12rem"
                >
                  <template #body="{ data }">
                    {{ data.pasien_nama }}
                  </template>
                  <template #filter="{ filterModel }">
                    <InputText v-model="filterModel.value" type="text" placeholder="Search Nama" />
                  </template>
                </Column>
                <Column field="tgl_pelayanan" header="Tgl Selesai" sortable style="min-width: 8rem">
                  <template #body="{ data }">
                    {{ formatDateID(data.tgl_pelayanan) }}
                  </template>
                </Column>
                <Column field="jenis_tagihan" header="Jenis Pelayanan" style="min-width: 8rem">
                  <template #body="{ data }">
                    {{ data.jenis_tagihan }}
                  </template>
                </Column>
                <Column
                  field="carabayar_nama"
                  header="Cara Bayar"
                  :showFilterMatchModes="false"
                  style="min-width: 8rem"
                >
                  <template #body="{ data }">
                    {{ data.carabayar_nama }}
                  </template>
                  <template #filter="{ filterModel }">
                    <Dropdown
                      v-model="filterModel.value"
                      :options="caraBayarOptions"
                      optionLabel="label"
                      optionValue="value"
                      placeholder="Select Cara Bayar"
                      class="p-column-filter"
                      showClear
                    />
                  </template>
                </Column>
                <Column
                  field="penjamin_nama"
                  header="Penjamin"
                  :showFilterMatchModes="false"
                  style="min-width: 12rem"
                >
                  <template #body="{ data }">
                    {{ data.penjamin_nama }}
                  </template>
                  <template #filter="{ filterModel }">
                    <Dropdown
                      v-model="filterModel.value"
                      :options="penjaminOptions"
                      optionLabel="label"
                      optionValue="value"
                      placeholder="Select Penjamin"
                      class="p-column-filter"
                      showClear
                      filter
                      filterPlaceholder="Search Penjamin"
                    />
                  </template>
                </Column>
                <Column 
                  field="total" 
                  header="Tagihan RS" 
                  :showFilterMatchModes="false" 
                  :showFilterMenu="true"
                  style="text-align: right"
                >
                  <template #body="slotProps">
                      {{ new Intl.NumberFormat('id-ID').format(slotProps.data.total || 0) }}
                  </template>
                  <template #filter="{ filterModel }">
                    <Dropdown
                      v-model="filterModel.matchMode"
                      :options="[
                        { label: 'Kurang dari', value: FilterMatchMode.LESS_THAN },
                        { label: 'Lebih dari', value: FilterMatchMode.GREATER_THAN },
                        { label: 'Kurang dari sama dengan', value: FilterMatchMode.LESS_THAN_OR_EQUAL_TO },
                        { label: 'Lebih dari sama dengan', value: FilterMatchMode.GREATER_THAN_OR_EQUAL_TO },
                        { label: 'Sama dengan', value: FilterMatchMode.EQUALS },
                        { label: 'Tidak sama dengan', value: FilterMatchMode.NOT_EQUALS }
                      ]"
                      optionLabel="label"
                      optionValue="value"
                      class="w-full mb-2"
                    />
                    <InputNumber 
                      v-model="filterModel.value" 
                      class="w-full"
                      placeholder="Masukkan angka" 
                      mode="currency"
                      currency="IDR"
                      locale="id-ID"
                    />
                  </template>
                </Column>
                <Column field="tagihan_dijamin" header="Tagihan Dijamin" style="text-align: right">
                  <template #body="{ data }">
                    {{ new Intl.NumberFormat('id-ID').format(data.tagihan_dijamin || 0) }}
                  </template>
                </Column>
                <Column field="tagihan_sharing" header="Yg Dibayar Pasien" style="min-width: 6rem; text-align: right">
                  <template #body="{ data }">
                    {{ new Intl.NumberFormat('id-ID').format(data.tagihan_sharing || 0) }}
                  </template>
                </Column>
                <Column field="pendapatan" header="Pendapatan" style="text-align: right">
                  <template #body="{ data }">
                    {{ new Intl.NumberFormat('id-ID').format(data.pendapatan || 0) }}
                  </template>
                </Column>
                <Column field="piutang" header="Piutang" style="text-align: right">
                  <template #body="{ data }">
                    {{ new Intl.NumberFormat('id-ID').format(data.piutang || 0) }}
                  </template>
                </Column>
                <Column field="pdd" header="PDD" style="text-align: right">
                  <template #body="{ data }">
                    {{ new Intl.NumberFormat('id-ID').format(data.pdd || 0) }}
                  </template>
                </Column>
                <Column
                  field="is_valid"
                  header="Status"
                  :showFilterMatchModes="false"
                  style="min-width:6rem"
                >
                  <template #body="{ data }">
                    {{ data.is_valid ? 'Valid' : 'Invalid' }}
                  </template>
                  <template #filter="{ filterModel }">
                    <Dropdown
                      v-model="filterModel.value"
                      :options="statusOptions"
                      optionLabel="label"
                      optionValue="value"
                      placeholder="Select Status"
                      class="p-column-filter"
                      showClear
                    />
                  </template>
                </Column>
                <Column
                  field="is_penjaminlebih1"
                  header="Penjamin > 1"
                  :showFilterMatchModes="false"
                  style="min-width:6rem;text-align:center"
                >
                  <template #body="{ data }">
                    <i v-if="data.is_penjaminlebih1" class="pi pi-check text-green-500"></i>
                    <i v-else class="pi pi-times text-red-500"></i>
                  </template>
                  <template #filter="{ filterModel }">
                    <Dropdown
                      v-model="filterModel.value"
                      :options="penjamin1Options"
                      optionLabel="label"
                      optionValue="value"
                      placeholder="Select Penjamin > 1"
                      class="p-column-filter"
                      showClear
                    />
                  </template>
                </Column>
              </DataTable>
            </div>
          </div>
        </TabPanel>
        <TabPanel header="Data Penjamin > 1">
          <div class="p-4">
            <div class="bg-surface-0 dark:bg-surface-900 rounded-2xl my-6 px-6 py-4 md:px-6 md:py-3 border-b md:border border-surface-200 dark:border-surface-700 w-full sticky top-0 z-30">
              <h3 class="text-xl font-semibold text-[#17316E] mb-4">Filter Data</h3>
              <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label class="block mb-1 text-sm font-medium text-gray-700">Jenis Pelayanan</label>
                  <Select
                    v-model="formFiltersP1.jenisPelayanan"
                    :options="jenisPelayananOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Jenis Pelayanan"
                    class="w-full"
                  />
                </div>
                <div>
                  <label class="block mb-1 text-sm font-medium text-gray-700">Jenis Periode</label>
                  <Select
                    v-model="formFiltersP1.jenisPeriode"
                    :options="jenisPeriodeOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Jenis Periode"
                    class="w-full"
                  />
                </div>
                <template v-if="formFiltersP1.jenisPeriode === 'BULANAN'">
                  <div>
                    <label class="block mb-1 text-sm font-medium text-gray-700">Tahun Periode</label>
                    <Select
                      v-model="formFiltersP1.tahunPeriode"
                      :options="tahunPeriodeOptions"
                      placeholder="Tahun Periode"
                      class="w-full"
                    />
                  </div>
                  <div>
                    <label class="block mb-1 text-sm font-medium text-gray-700">Bulan Awal</label>
                    <Select
                      v-model="formFiltersP1.bulanAwal"
                      :options="bulanOptions"
                      optionLabel="label"
                      optionValue="value"
                      placeholder="Bulan Awal"
                      class="w-full"
                    />
                  </div>
                  <div>
                    <label class="block mb-1 text-sm font-medium text-gray-700">Bulan Akhir</label>
                    <Select
                      v-model="formFiltersP1.bulanAkhir"
                      :options="bulanOptions"
                      optionLabel="label"
                      optionValue="value"
                      placeholder="Bulan Akhir"
                      class="w-full"
                    />
                  </div>
                </template>
                <template v-if="formFiltersP1.jenisPeriode === 'TANGGAL'">
                  <div>
                    <label class="block mb-1 text-sm font-medium text-gray-700">Tanggal Awal</label>
                    <DatePicker
                      v-model="formFiltersP1.tglAwal"
                      placeholder="Tanggal Awal"
                      showIcon
                      class="w-full"
                      dateFormat="dd/mm/yy"
                      :showTime="false"
                      :showSeconds="false"
                      :showMilliseconds="false"
                    />
                  </div>
                  <div>
                    <label class="block mb-1 text-sm font-medium text-gray-700">Tanggal Akhir</label>
                    <DatePicker
                      v-model="formFiltersP1.tglAkhir"
                      placeholder="Tanggal Akhir"
                      showIcon
                      class="w-full"
                      dateFormat="dd/mm/yy"
                      :showTime="false"
                      :showSeconds="false"
                      :showMilliseconds="false"
                    />
                  </div>
                </template>
              </div>
              <div class="mt-4 flex gap-2">
                <Button label="Cari"  class="p-button-info" @click="searchDataP1" />
                <Button
                  label="Reset Filter"
                  class="p-button-secondary"
                  @click="resetFilterP1"
                />
              </div>
            </div>
            <div class="bg-surface-0 dark:bg-surface-900 rounded-2xl my-6 px-6 py-4 md:px-6 md:py-3 border-b md:border border-surface-200 dark:border-surface-700 w-full sticky top-0 z-30">
              <div class="flex justify-between items-center mb-2">
                <Button label="Clear Column Filters" icon="pi pi-filter-slash" outlined @click="clearTableFiltersP1" />
                <div class="flex gap-2">
                  <Button label="Export Excel" icon="pi pi-download" class="p-button-success" @click="exportExcelP1" />
                </div>
              </div>
              <TablePenjamin1
                ref="tablePenjamin1"
                :tableFilters="formFiltersP1"
                :options="{
                  jenisPelayanan: jenisPelayananOptions,
                  carabayar: caraBayarOptions,
                  penjamin: penjaminOptions,
                  instalasi: instalasiOptions,
                  loket: loketOptions,
                  kasir: kasirOptions,
                }"
              />
            </div>
          </div>
        </TabPanel>
      </TabView>
    </div>
    <ModalEditPendapatanPelayanan 
      v-model="showModalEdit" 
      :item="selectedItem" 
      :options="{
        jenisPelayanan: jenisPelayananOptions,
        carabayar: caraBayarOptions,
        penjamin: penjaminOptions,
        instalasi: instalasiOptions,
        loket: loketOptions,
        kasir: kasirOptions,
      }"
      @saved="handleSaved" 
    />
    <ModalPenjamin1 
      v-model="showModalPenjamin1" 
      :item="selectedItem" 
      :options="{
        jenisPelayanan: jenisPelayananOptions,
        carabayar: caraBayarOptions,
        penjamin: penjaminOptions,
        instalasi: instalasiOptions,
        loket: loketOptions,
        kasir: kasirOptions,
      }"
    />
    <Toast />
    <Toast position="center" group="confirm">
      <template #message="slotProps">
        <div class="flex flex-col items-center" style="flex: 1">
          <div class="text-center">
            <i class="pi pi-exclamation-triangle" style="font-size: 3rem"></i>
            <h4>{{ slotProps.message.summary }}</h4>
            <p>{{ slotProps.message.detail }}</p>
          </div>
          <div class="grid grid-cols-2 gap-4 mt-4">
            <Button label="Tidak" @click="onReject()" />
            <Button label="Ya" @click="onConfirmAction(slotProps.message)" />
          </div>
        </div>
      </template>
    </Toast>
</template>

<style scoped></style>
