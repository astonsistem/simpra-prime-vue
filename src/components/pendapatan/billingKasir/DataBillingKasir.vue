<script setup>
import { ref, onMounted, watch } from 'vue'
import { FilterMatchMode } from '@primevue/core/api'
import DatePicker from 'primevue/datepicker'
import Select from 'primevue/select'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import SplitButton from 'primevue/splitbutton'
import api from '@/api/client.js'
import { useToast } from 'primevue/usetoast'
import ModalSyncPenerimaan from '@/components/ModalSyncPenerimaan.vue'
import ModalEditBillingKasir from '@/components/pendapatan/billingKasir/ModalEditBillingKasir.vue'
import ModalValidasiBillingKasir from './ModalValidasiBillingKasir.vue'
import Toast from 'primevue/toast'
import * as XLSX from 'xlsx'
import Dialog from 'primevue/dialog'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'

const toast = useToast()

const formFilters = ref({
  jenis_periode: 'BULANAN',
  tahunPeriode: '',
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

const bulanOptions = ref([
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
])

const data = ref([])
const totalRecords = ref(0)
const rows = ref(10)
const first = ref(0)
const loading = ref(false)
const selectedItem = ref(null)
const showModalEdit = ref(false)
const showModalSync = ref(false)
const showSyncDialog = ref(false)
const syncOptions = ref([])
const selectedSync = ref(null)
const syncParams = ref([])
const syncForm = ref({})
const loadingSyncOptions = ref(false)
const loadingSync = ref(false)
const showModalValidasi = ref(false)
const validasiItem = ref(null)
const showModalCancelValidasi = ref(false)
const cancelValidasiItem = ref(null)

// Helper function to format date to YYYY-MM-DD
const formatDateToYYYYMMDD = (date) => {
  if (!date) return null
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const buildQuery = (page = 1, pageSize = rows.value) => {
  const q = {
    page,
    size: 100,
  }
  if (formFilters.value.jenis_periode) q.periode = formFilters.value.jenis_periode
  if (formFilters.value.jenis_periode === 'BULANAN') {
    if (formFilters.value.tahunPeriode) {
      q.tahunPeriode = formFilters.value.tahunPeriode
    }
    if (formFilters.value.tahunPeriode && formFilters.value.bulanAwal) {
      const startDate = new Date(formFilters.value.tahunPeriode, formFilters.value.bulanAwal - 1, 1)
      q.tglAwal = formatDateToYYYYMMDD(startDate)
    }
    if (formFilters.value.tahunPeriode && formFilters.value.bulanAkhir) {
      const endDate = new Date(formFilters.value.tahunPeriode, formFilters.value.bulanAkhir, 0)
      q.tglAkhir = formatDateToYYYYMMDD(endDate)
    }
  } else if (formFilters.value.jenis_periode === 'TANGGAL') {
    if (formFilters.value.tglAwal) q.tgl_awal = formatDateToYYYYMMDD(formFilters.value.tglAwal)
    if (formFilters.value.tglAkhir) q.tgl_akhir = formatDateToYYYYMMDD(formFilters.value.tglAkhir)
  }

  if (filters.value) {
    Object.keys(filters.value).forEach((key) => {
      if (filters.value[key].value) {
        // Handle date filters specially
        if (key === 'tglBayar' || key === 'tglDokumen') {
          q[key] = formatDateToYYYYMMDD(filters.value[key].value)
        } else {
          q[key] = filters.value[key].value
        }
      }
    })
  }

  return q
}

const loadData = async (page = 1, pageSize = rows.value) => {
  loading.value = true
  try {
    const query = buildQuery(page, pageSize)
    const response = await api.get('/billing_kasir', { params: query })
    if (response.data && response.data.items) {
      data.value = response.data.items.map((item, index) => ({
        ...item,
        no: (page - 1) * pageSize + index + 1,
      }))
      totalRecords.value = response.data.total ?? 0

      // If "All" is selected, update rows to show total records
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

  // Handle "All" option (1000) - load all data in one page
  if (event.rows === 1000) {
    // This is the "All" option, load all data
    loadData(1, totalRecords.value)
  } else {
    const page = event.page + 1
    loadData(page, event.rows)
  }
}

const resetFilter = () => {
  formFilters.value = {
    jenis_periode: 'BULANAN',
    tahunPeriode: '',
    bulanAwal: null,
    bulanAkhir: null,
    tglAwal: null,
    tglAkhir: null,
  }
  first.value = 0
  loadData(1, rows.value)
}

const searchData = () => {
  first.value = 0
  loadData(1, rows.value)
}

const exportExcel = () => {
  try {
    // Prepare headers for Excel (excluding Action column)
    const headers = [
      'No',
      'No Bayar',
      'Tanggal Bayar',
      'Pasien',
      'Uraian',
      'No Dokumen',
      'Tanggal Dokumen',
      'Sumber Transaksi',
      'Instalasi',
      'Metode Bayar',
      'Cara Pembayaran',
      'Rekening DPA',
      'Bank',
      'Jumlah Bruto',
      'Biaya Admin EDC',
      'Biaya Admin QRIS',
      'Selisih',
      'Jumlah Netto',
    ]

    // Prepare data for Excel
    const excelData = data.value.map((item, index) => [
      item.no || index + 1,
      item.noBayar || '',
      item.tglBayar || '',
      item.pasien || '',
      item.uraian || '',
      item.noDokumen || '',
      item.tglDokumen || '',
      item.sumberTransaksi || '',
      item.instalasi || '',
      item.metodeBayar || '',
      item.caraBayar || '',
      item.rekeningDpa || '',
      item.bank || '',
      item.jumlahBruto || 0,
      item.biayaAdminEdc || 0,
      item.biayaAdminQris || 0,
      item.selisih || 0,
      item.jumlahNetto || 0,
    ])

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...excelData])

    // Set column widths
    const columnWidths = [
      { wch: 5 }, // No
      { wch: 20 }, // No Bayar
      { wch: 12 }, // Tanggal Bayar
      { wch: 20 }, // Pasien
      { wch: 30 }, // Uraian
      { wch: 15 }, // No Dokumen
      { wch: 12 }, // Tanggal Dokumen
      { wch: 15 }, // Sumber Transaksi
      { wch: 20 }, // Instalasi
      { wch: 15 }, // Metode Bayar
      { wch: 15 }, // Cara Pembayaran
      { wch: 15 }, // Rekening DPA
      { wch: 10 }, // Bank
      { wch: 15 }, // Jumlah Bruto
      { wch: 15 }, // Biaya Admin EDC
      { wch: 15 }, // Biaya Admin QRIS
      { wch: 15 }, // Selisih
      { wch: 15 }, // Jumlah Netto
    ]
    worksheet['!cols'] = columnWidths

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Billing Kasir')

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })

    // Download file
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `billing_kasir_${new Date().toISOString().split('T')[0]}.xlsx`)
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

const tarikData = () => {
  toast.add({
    severity: 'info',
    summary: 'Tarik Data',
    detail: 'Tarik Data belum diimplementasi',
    life: 2000,
  })
}

const handleAdd = () => {
  selectedItem.value = null
  showModalEdit.value = true
}

const handleEdit = async (item) => {
  if (item.tglValidasi) {
    toast.add({
      severity: 'warn',
      summary: 'Peringatan',
      detail: 'Data yang sudah divalidasi tidak dapat diubah.',
      life: 3000,
    })
    return
  }
  try {
   
    const response = await api.get(`/billing_kasir/${item.id}`)
    if (response.data) {
      selectedItem.value = response.data
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

const handleValidasi = async (item) => {
  if (item.tglValidasi) {
    toast.add({
      severity: 'warn',
      summary: 'Peringatan',
      detail: 'Data sudah divalidasi.',
      life: 3000,
    })
    return
  }
  try {
    
    const response = await api.get(`/billing_kasir/${item.id}`, {params: {
      action: 'validasi'
    }})
    if (response.data) {
      validasiItem.value = { ...response.data }
      showModalValidasi.value = true
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

const confirmCancelValidasi = (item) => {
  showModalCancelValidasi.value = true
  cancelValidasiItem.value = item
}

const handleCancelValidasi = async () => {
  const item = cancelValidasiItem.value
  if (!item.rcId) {
    toast.add({
      severity: 'warn',
      summary: 'Peringatan',
      detail: 'Data belum divalidasi.',
      life: 3000,
    })
    return
  }
  try {
 
    await api.put(`billing_kasir/cancel_validasi/penerimaan_layanan`, {
      id: item.id,
      rc_id: item.rcId,
    })
    
    toast.add({
      severity: 'success',
      summary: 'Berhasil',
      detail: 'Validasi berhasil dibatalkan',
      life: 3000,
    })
    cancelValidasiItem.value = null
    showModalCancelValidasi.value = false
    loadData(1, rows.value)
  } catch (error) {
    console.error('Gagal membatalkan validasi:', error)
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: 'Gagal membatalkan validasi. Silakan coba lagi.',
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}


const handleDelete = (item) => {
  toast.add({
    severity: 'warn',
    summary: 'Konfirmasi Hapus',
    detail: 'Apakah Anda yakin ingin menghapus data ini?',
    group: 'confirm',
    data: {
      id: item.id,
    },
  })
}

const onConfirmDelete = async (event) => {
  toast.removeGroup('confirm')
  const { id } = event.data
  try {
    await api.delete(`/billing_kasir/${id}`)
    toast.add({
      severity: 'success',
      summary: 'Berhasil',
      detail: 'Data berhasil dihapus',
      life: 3000,
    })
    loadData(1, rows.value)
  } catch (error) {
    console.error('Gagal menghapus data:', error)
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: 'Gagal menghapus data. Silakan coba lagi.',
      life: 3000,
    })
  }
}

const onReject = () => {
  toast.removeGroup('confirm')
}

const handleSaved = () => {
  showModalEdit.value = false
  loadData(1, rows.value)
}

const onFilter = (event) => {
  filters.value = event.filters
  first.value = 0
  loadData(1, rows.value)
}

const handleValidated = () => {
  showModalValidasi.value = false
  loadData(1, rows.value)
}

const initFilters = () => {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    noBayar: { value: null, matchMode: FilterMatchMode.CONTAINS },
    tglBayar: { value: null, matchMode: FilterMatchMode.DATE_IS },
    pasien: { value: null, matchMode: FilterMatchMode.CONTAINS },
    uraian: { value: null, matchMode: FilterMatchMode.CONTAINS },
    noDokumen: { value: null, matchMode: FilterMatchMode.CONTAINS },
    tglDokumen: { value: null, matchMode: FilterMatchMode.DATE_IS },
    sumberTransaksi: { value: null, matchMode: FilterMatchMode.CONTAINS },
    instalasi: { value: null, matchMode: FilterMatchMode.CONTAINS },
    metodeBayar: { value: null, matchMode: FilterMatchMode.CONTAINS },
    caraBayar: { value: null, matchMode: FilterMatchMode.CONTAINS },
    rekeningDpa: { value: null, matchMode: FilterMatchMode.CONTAINS },
    bank: { value: null, matchMode: FilterMatchMode.CONTAINS },
    jumlahBruto: { value: null, matchMode: FilterMatchMode.EQUALS },
    biayaAdminEdc: { value: null, matchMode: FilterMatchMode.EQUALS },
    biayaAdminQris: { value: null, matchMode: FilterMatchMode.EQUALS },
    selisih: { value: null, matchMode: FilterMatchMode.EQUALS },
    jumlahNetto: { value: null, matchMode: FilterMatchMode.EQUALS },
  }
}

initFilters()

const clearFilter = () => {
  initFilters()
  loadData(1, rows.value)
}

const openSyncDialog = async () => {
  showSyncDialog.value = true
  loadingSyncOptions.value = true
  try {
    const response = await api.get('/syncapi/list/BILLING KASIR')
    if (response.data && Array.isArray(response.data)) {
      syncOptions.value = response.data.map((item) => ({
        label: item.sinkronisasi_nama,
        value: item,
      }))
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: 'Gagal load opsi sinkronisasi',
      life: 3000,
    })
  } finally {
    loadingSyncOptions.value = false
    selectedSync.value = null
    syncParams.value = []
    syncForm.value = {}
  }
}

const isValidated = (rowData) => {
  return rowData.rcId && rowData.rcId > 0
}

onMounted(async () => {
  loadData(1, rows.value)
})

watch(selectedSync, (val) => {
  if (val && val.value && Array.isArray(val.value.sinkronisasi_param)) {
    syncParams.value = val.value.sinkronisasi_param
    // Reset form
    syncForm.value = {}
  } else {
    syncParams.value = []
    syncForm.value = {}
  }
})

const handleSyncSubmit = async () => {
  if (!selectedSync.value) {
    toast.add({
      severity: 'warn',
      summary: 'Peringatan',
      detail: 'Pilih jenis sinkronisasi',
      life: 3000,
    })
    return
  }
  // Validasi input
  for (const param of syncParams.value) {
    if (!syncForm.value[param.field]) {
      toast.add({
        severity: 'warn',
        summary: 'Peringatan',
        detail: `Isi ${param.label}`,
        life: 3000,
      })
      return
    }
  }
  loadingSync.value = true
  try {
    const payload = {
      param: syncParams.value.map((param) => ({
        field: param.field,
        label: param.label,
        type: param.type,
        value:
          param.type === 'date' && syncForm.value[param.field] instanceof Date
            ? syncForm.value[param.field].toISOString().split('T')[0]
            : syncForm.value[param.field],
      })),
    }
    await api.post(`/sinkronisasi/request/kasir/${selectedSync.value.value.id}`, payload)
    toast.add({
      severity: 'success',
      summary: 'Berhasil',
      detail: 'Sinkronisasi berhasil',
      life: 3000,
    })
    showSyncDialog.value = false
    loadData(1, rows.value)
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: 'Sinkronisasi gagal', life: 3000 })
  } finally {
    loadingSync.value = false
  }
}
</script>

<template>
  <div class="p-4">
    <!-- Filter Section -->
    <div
      class="bg-surface-0 dark:bg-surface-900 rounded-2xl mb-6 px-6 py-4 md:px-6 md:py-3 border-b md:border border-surface-200 dark:border-surface-700 w-full sticky top-0 z-30"
    >
      <h3 class="text-xl font-semibold text-[#17316E] mb-4">Filter Data</h3>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Jenis Periode</label>
          <Select
            v-model="formFilters.jenis_periode"
            :options="jenisPeriodeOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Jenis Periode"
            class="w-full"
          />
        </div>
        <template v-if="formFilters.jenis_periode === 'BULANAN'">
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
        <template v-if="formFilters.jenis_periode === 'TANGGAL'">
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
        <Button label="Cari" icon="pi pi-search" class="p-button-info" @click="searchData" />
        <Button
          label="Reset Filter"
          icon="pi pi-refresh"
          class="p-button-secondary"
          @click="resetFilter"
        />
        <Button
          label="Tarik Data Billing"
          icon="pi pi-refresh"
          class="p-button-warning"
          style="background-color: #ffa500; border: none; color: #fff"
          @click="openSyncDialog"
        />
      </div>
    </div>

    <!-- Data Table Section -->
    <div
      class="bg-surface-0 dark:bg-surface-900 rounded-2xl my-6 px-6 py-4 md:px-6 md:py-3 border-b md:border border-surface-200 dark:border-surface-700 w-full sticky top-0 z-30"
    >
      <div class="flex justify-between items-center mb-2">
        <h3 class="text-xl font-semibold text-[#17316E]">Data Biling Kasir</h3>
        <div class="flex gap-2">
          <Button
            label="Export Excel"
            icon="pi pi-file-excel"
            class="p-button-success"
            @click="exportExcel"
          />
        </div>
      </div>
      <DataTable
        :filters="filters"
        :value="data"
        responsiveLayout="scroll"
        paginator
        lazy
        :totalRecords="totalRecords"
        :rows="rows"
        :first="first"
        :rowsPerPageOptions="[5, 10, 20, 50, 100, 1000]"
        @page="onPageChange"
        @filter="onFilter"
        dataKey="id"
        filterDisplay="menu"
        :globalFilterFields="[
          'noBayar',
          'pasien',
          'uraian',
          'noDokumen',
          'sumberTransaksi',
          'instalasi',
          'metodeBayar',
          'caraBayar',
          'rekeningDpa',
          'bank',
        ]"
        class="p-datatable-sm"
      >
        <template #header>
          <div class="flex justify-between">
            <Button
              type="button"
              icon="pi pi-filter-slash"
              label="Clear"
              outlined
              @click="clearFilter()"
            />
            <!-- <IconField>
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
            </IconField> -->
          </div>
        </template>

        <Column field="no" header="No" style="width: 5%" />

        <Column
          field="rcId"
          header="#"
          style="width: 10%; text-align: center"
        >
          <template #body="{ data }">
            <i
              class="pi pi-check-circle"
              :class="[isValidated(data) ? 'text-green-500' : 'text-gray-300', 'cursor-pointer']"
              v-if="isValidated(data)"
            ></i>
          </template>
        </Column>

        <Column header="Action" style="width: 10%">
          <template #body="slotProps">
            <SplitButton
              label="Aksi"
              size="small"
              severity="secondary"
              :model="[
                { 
                  label: 'Ubah', 
                  icon: 'pi pi-pencil', 
                  visible: () => !isValidated(slotProps.data), 
                  command: () => handleEdit(slotProps.data) 
                },
                {
                  label: 'Validasi',
                  icon: 'pi pi-check',
                  visible: () => !isValidated(slotProps.data),
                  command: () => handleValidasi(slotProps.data),
                },
                {
                  label: 'Batal Validasi',
                  icon: 'pi pi-times-circle',
                  style: 'color: red;',
                  visible: () => !!isValidated(slotProps.data),
                  command: () => confirmCancelValidasi(slotProps.data),
                },
                {
                  label: 'Hapus',
                  icon: 'pi pi-trash',
                  visible: () => !isValidated(slotProps.data),
                  command: () => handleDelete(slotProps.data),
                },
              ]"
            />
          </template>
        </Column>

        <Column
          field="noBayar"
          header="No Bayar"
          :showFilterMatchModes="false"
          style="min-width: 12rem"
        >
          <template #body="{ data }">
            <span>{{ data.noBayar }}</span>
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by No Bayar" />
          </template>
        </Column>

        <Column
          field="tglBayar"
          header="Tanggal Bayar"
          :showFilterMatchModes="false"
          style="min-width: 12rem"
        >
          <template #body="{ data }">
            {{ data.tglBayar }}
          </template>
          <template #filter="{ filterModel }">
            <DatePicker
              v-model="filterModel.value"
              dateFormat="dd/mm/yy"
              placeholder="dd/mm/yyyy"
              :showTime="false"
              :showSeconds="false"
              :showMilliseconds="false"
            />
          </template>
        </Column>

        <Column
          field="pasien"
          header="Pasien"
          :showFilterMatchModes="false"
          style="min-width: 12rem"
        >
          <template #body="{ data }">
            {{ data.pasien }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by Pasien" />
          </template>
        </Column>

        <Column
          field="noDokumen"
          header="No Dokumen"
          :showFilterMatchModes="false"
          style="min-width: 12rem"
        >
          <template #body="{ data }">
            {{ data.noDokumen }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by No Dokumen" />
          </template>
        </Column>

        <Column
          field="tglDokumen"
          header="Tanggal Dokumen"
          :showFilterMatchModes="false"
          style="min-width: 12rem"
        >
          <template #body="{ data }">
            {{ data.tglDokumen }}
          </template>
          <template #filter="{ filterModel }">
            <DatePicker
              v-model="filterModel.value"
              dateFormat="dd/mm/yy"
              placeholder="dd/mm/yyyy"
              :showTime="false"
              :showSeconds="false"
              :showMilliseconds="false"
            />
          </template>
        </Column>

        <Column
          field="noClosingKasir"
          header="No Closing"
          :showFilterMatchModes="false"
          style="min-width: 12rem"
        >
          <template #body="{ data }">
            {{ data.noClosingKasir }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by No noClosingKasir" />
          </template>
        </Column>

        <Column
          field="sumberTransaksi"
          header="Sumber Transaksi"
          :showFilterMatchModes="false"
          style="min-width: 12rem"
        >
          <template #body="{ data }">
            {{ data.sumberTransaksi }}
          </template>
          <template #filter="{ filterModel }">
            <InputText
              v-model="filterModel.value"
              type="text"
              placeholder="Search by Sumber Transaksi"
            />
          </template>
        </Column>

        <Column
          field="instalasi"
          header="Instalasi"
          :showFilterMatchModes="false"
          style="min-width: 12rem"
        >
          <template #body="{ data }">
            {{ data.instalasi }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by Instalasi" />
          </template>
        </Column>

        <Column
          field="metodeBayar"
          header="Metode Bayar"
          :showFilterMatchModes="false"
          style="min-width: 12rem"
        >
          <template #body="{ data }">
            {{ data.metodeBayar }}
          </template>
          <template #filter="{ filterModel }">
            <InputText
              v-model="filterModel.value"
              type="text"
              placeholder="Search by Metode Bayar"
            />
          </template>
        </Column>

        <Column
          field="caraBayar"
          header="Cara Pembayaran"
          :showFilterMatchModes="false"
          style="min-width: 12rem"
        >
          <template #body="{ data }">
            {{ data.caraBayar }}
          </template>
          <template #filter="{ filterModel }">
            <InputText
              v-model="filterModel.value"
              type="text"
              placeholder="Search by Cara Pembayaran"
            />
          </template>
        </Column>

        <Column
          field="rekeningDpa"
          header="Rekening DPA"
          :showFilterMatchModes="false"
          style="min-width: 12rem"
        >
          <template #body="{ data }">
            {{ data.rekeningDpa }}
          </template>
          <template #filter="{ filterModel }">
            <InputText
              v-model="filterModel.value"
              type="text"
              placeholder="Search by Rekening DPA"
            />
          </template>
        </Column>

        <Column field="bank" header="Bank" :showFilterMatchModes="false" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.bank }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by Bank" />
          </template>
        </Column>

        <Column field="jumlahBruto" header="Jumlah Bruto" style="text-align: right">
          <template #body="slotProps">
            {{ new Intl.NumberFormat('id-ID').format(slotProps.data.jumlahBruto || 0) }}
          </template>
        </Column>

        <Column field="biayaAdminEdc" header="Biaya Admin EDC" style="text-align: right">
          <template #body="slotProps">
            {{ new Intl.NumberFormat('id-ID').format(slotProps.data.biayaAdminEdc || 0) }}
          </template>
        </Column>

        <Column field="biayaAdminQris" header="Biaya Admin QRIS" style="text-align: right">
          <template #body="slotProps">
            {{ new Intl.NumberFormat('id-ID').format(slotProps.data.biayaAdminQris || 0) }}
          </template>
        </Column>

        <Column field="selisih" header="Selisih" style="text-align: right">
          <template #body="slotProps">
            {{ new Intl.NumberFormat('id-ID').format(slotProps.data.selisih || 0) }}
          </template>
        </Column>

        <Column field="jumlahNetto" header="Jumlah Netto" style="text-align: right">
          <template #body="slotProps">
            {{ new Intl.NumberFormat('id-ID').format(slotProps.data.jumlahNetto || 0) }}
          </template>
        </Column>
      </DataTable>
    </div>

    <ModalSyncPenerimaan v-model="showModalSync" @sync="loadData" />
    <ModalEditBillingKasir v-model="showModalEdit" :item="selectedItem" @saved="handleSaved" />
    <ModalValidasiBillingKasir
      v-model="showModalValidasi"
      :item="validasiItem"
      @validated="handleValidated"
    />
    <Dialog
      :visible="showSyncDialog"
      @update:visible="showSyncDialog = $event"
      modal
      header="Tarik Data Billing Kasir"
      :closable="true"
      :style="{ width: '500px' }"
    >
      <div v-if="loadingSyncOptions" class="py-8 text-center">Loading...</div>
      <div v-else class="space-y-4">
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Jenis Sinkronisasi</label>
          <Dropdown
            v-model="selectedSync"
            :options="syncOptions"
            optionLabel="label"
            placeholder="Pilih Request"
            class="w-full"
          />
        </div>
        <div v-for="param in syncParams" :key="param.field">
          <label class="block mb-1 text-sm font-medium text-gray-700">{{ param.label }}</label>
          <Calendar
            v-if="param.type === 'date'"
            v-model="syncForm[param.field]"
            placeholder="Tanggal"
            showIcon
            class="w-full"
          />
          <InputText
            v-else
            v-model="syncForm[param.field]"
            :placeholder="param.label"
            class="w-full"
          />
        </div>
        <div class="flex justify-end gap-2 pt-4">
          <Button
            label="Sinkronisasi"
            icon="pi pi-sync"
            class="p-button-success"
            :loading="loadingSync"
            @click="handleSyncSubmit"
          />
          <Button
            label="Batal"
            class="p-button-secondary"
            @click="() => (showSyncDialog = false)"
          />
        </div>
      </div>
    </Dialog>
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
            <Button label="Ya" @click="onConfirmDelete(slotProps.message)" />
          </div>
        </div>
      </template>
    </Toast>
    <Dialog
      :visible="showModalCancelValidasi"
      @update:visible="showModalCancelValidasi = $event"
      modal
      header="Konfirmasi Batal Validasi"
      :closable="true"
      :style="{ width: '400px' }"
    >
      <div class="p-4">
        <p>Apakah Anda yakin ingin membatalkan validasi data ini?</p>
        <div class="flex justify-end gap-2 pt-4">
          <Button
            label="Ya, Batalkan Validasi"
            class="p-button-warning"
            @click="handleCancelValidasi"
          />
          <Button
            label="Tidak"
            class="p-button-secondary"
            @click="() => (showModalCancelValidasi = false)"
          />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<style scoped></style>
