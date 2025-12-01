<!-- Perubahan uji push ke branch akrual -->
<script setup>
import { ref, onMounted } from 'vue'
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
import Toast from 'primevue/toast'
import * as XLSX from 'xlsx'
import ModalPotensiLainnya from '@/components/pendapatan/potensiLainnya/ModalPotensiLainnya.vue'
import ModalTarikPotensi from '@/components/pendapatan/ModalTarikPotensi.vue'
import ModalTerimaPotensi from '@/components/pendapatan/ModalTerimaPotensi.vue'
import ModalRincianPotensiLainnya from '@/components/pendapatan/potensiLainnya/ModalRincianPotensiLainnya.vue'

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

// Filter state
const toast = useToast()
const formFilters = ref({
  jenisPeriode: 'BULANAN',
  tahunPeriode: null,
  bulanAwal: null,
  bulanAkhir: null,
  tglAwal: null,
  tglAkhir: null,
})
const filters = ref()
const tahunPeriodeOptions = Array.from(
  { length: 10 },
  (_, i) => {
    const year = new Date().getFullYear() - 5 + i
    return { label: `${year}`, value: year }
  }
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
const buktiTagihanOptions = [
  { label: 'True', value: true },
  { label: 'False', value: false },
]
const akunOptions = ref([])
const caraPembayaranOptions = ref([])
const bankOptions = ref([])
const data = ref([])
const totalRecords = ref(0)
const rows = ref(10)
const first = ref(0)
const loading = ref(false)
const selectedItem = ref(null)
const showModal = ref(false)
const showModalTarik = ref(false)
const showModalTerima = ref(false)
const showModalRincian = ref(false)
const sortField = ref(null)
const sortOrder = ref(null)

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

  if (filters.value) {
    Object.keys(filters.value).forEach((key) => {
      if (filters.value[key].value !== null && filters.value[key].value !== undefined) {
        if (key === "sisa_potensi") {
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
    const response = await api.get('/potensi_lainnya', { params: query })
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
    jenisPeriode: 'BULANAN',
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

const handleAdd = () => {
  selectedItem.value = null
  showModal.value = true
}
const handleEdit = async (item) => {
  try {
    loading.value = true
    const response = await api.get(`/potensi_lainnya/${item.id}`)
    if (response.data) {
      selectedItem.value = { ...response.data }
      showModal.value = true
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
const handleTerima = async (item) => {
  if (item.sisa_potensi == 0 || item.is_buktitagihan) {
    toast.add({
      severity: 'warn',
      summary: 'Peringatan',
      detail: 'Data yang sudah lunas atau memiliki bukti tagihan tidak dapat melakukan aksi terima.',
      life: 3000,
    })
    return
  }
  try {
    loading.value = true
    const response = await api.get(`/potensi_lainnya/${item.id}`)
    if (response.data) {
      selectedItem.value = { ...response.data }
      showModalTerima.value = true
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
const handleRincian = async (item) => {
  if (item.is_buktitagihan) {
    toast.add({
      severity: 'warn',
      summary: 'Peringatan',
      detail: 'Data yang memiliki bukti tagihan tidak dapat membuat rincian.',
      life: 3000,
    })
    return
  }
  try {
    loading.value = true
    const response = await api.get(`/potensi_lainnya/${item.id}`)
    if (response.data) {
      selectedItem.value = { ...response.data }
      showModalRincian.value = true
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
const handleDelete = (item) => {
  if (item.terbayar != 0) {
    toast.add({
      severity: 'warn',
      summary: 'Peringatan',
      detail: 'Data yang sudah terbayar tidak dapat dihapus.',
      life: 3000,
    })
    return
  }
  toast.add({
      severity: 'warn',
      summary: 'Konfirmasi',
      detail: 'Apakah Anda yakin ingin menghapus data ini?',
      group: 'confirm',
      data: {
          url: `/potensi_lainnya/${item.id}`,
          title: 'hapus'
      }
  })
}
const onConfirmAction = async (event) => {
    toast.removeGroup('confirm')
    const { url, title } = event.data
    try {
        if (title === 'hapus') {
            await api.delete(url)
        } else {
            await api.get(url)
        }
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
  showModal.value = false
  showModalTarik.value = false
  showModalTerima.value = false
  first.value = 0
  loadData(1, rows.value)
}

const fetchAkun = async () => {
  try {
    const response = await api.get('/akun/list')
    if (response.data && response.data.data) {
      akunOptions.value = response.data.data.map((item) => ({
        label: item.akun_nama,
        value: item.akun_id,
      }))
    }
  } catch (error) {
    console.error('Gagal memuat data penjamin:', error)
  }
}
const fetchCaraPembayaran = async () => {
  try {
    const response = await api.get('/carapembayaran/list')
    if (response.data && response.data.data) {
      caraPembayaranOptions.value = response.data.data.map((item) => ({
        label: item.bayar_nama,
        value: item.bayar_nama,
      }))
    }
  } catch (error) {
    console.error('Gagal memuat data cara pembayaran:', error)
  }
}
const fetchBank = async () => {
  try {
    const response = await api.get('/bank/list')
    if (response.data && response.data.data) {
      bankOptions.value = response.data.data.map((item) => ({
        label: item.bank_nama,
        value: item.bank_nama,
      }))
    }
  } catch (error) {
    console.error('Gagal memuat data bank:', error)
  }
}

onMounted(async () => {
  await fetchAkun()
  await fetchCaraPembayaran()
  await fetchBank()
})


const exportExcel = () => {
  try {
    // Prepare headers for Excel (excluding Action column)
    const headers = [
      'No',
      'No Dokumen',
      'Tgl Dokumen',
      'Akun',
      'Pihak ke-3',
      'Uraian',
      'Tgl Berlaku',
      'Tgl Berakhir',
      'Jumlah',
      'Terbayar',
      'Sisa Potensi',
      'Bukti Tagihan',
    ]

    // Prepare data for Excel
    const excelData = data.value.map((item, index) => [
      item.no || index + 1,
      item.no_dokumen || '',
      item.tgl_dokumen || '',
      item.akun_nama || '',
      item.pihak3 || '',
      item.uraian || '',
      item.tgl_berlaku || '',
      item.tgl_akhir || '',
      item.total ?? 0,
      item.terbayar ?? 0,
      item.sisa_potensi ?? 0,
      item.is_buktitagihan ?? false,
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
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Potensi Lainnya')


    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })

    // Download file
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `potensi_lainnya_${new Date().toISOString().split('T')[0]}.xlsx`)
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
    no_dokumen: { value: null, matchMode: FilterMatchMode.CONTAINS },
    akun_nama: { value: null, matchMode: FilterMatchMode.EQUALS },
    pihak3: { value: null, matchMode: FilterMatchMode.CONTAINS },
    uraian: { value: null, matchMode: FilterMatchMode.CONTAINS },
    sisa_potensi: { value: null, matchMode: FilterMatchMode.EQUALS },
    is_buktitagihan: { value: null, matchMode: FilterMatchMode.EQUALS },
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

const onSort = (event) => {
  sortField.value = event.sortField
  sortOrder.value = event.sortOrder
  first.value = 0
  loadData(1, rows.value)
}
</script>

<template>
  <div class="p-4">
    <div
      class="bg-surface-0 dark:bg-surface-900 rounded-2xl my-6 px-6 py-4 md:px-6 md:py-3 border-b md:border border-surface-200 dark:border-surface-700 w-full sticky top-0 z-30"
    >
      <h3 class="text-xl font-semibold text-[#17316E] mb-4">Filter Data</h3>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              optionLabel="label"
              optionValue="value"
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
            />
          </div>
        </template>
      </div>
      <div class="mt-4 flex gap-2">
        <Button label="Cari" icon="pi pi-search" class="p-button-info" @click="searchData" />
        <Button
          label="Reset Filter"
          class="p-button-secondary"
          @click="resetFilter"
        />
      </div>
    </div>
    <div
      class="bg-surface-0 dark:bg-surface-900 rounded-2xl my-6 px-6 py-4 md:px-6 md:py-3 border-b md:border border-surface-200 dark:border-surface-700 w-full"
    >
      <div class="flex justify-between items-center mb-2">
        <Button label="Clear Column Filters" icon="pi pi-filter-slash" outlined @click="clearTableFilters" />
        <div class="flex gap-2">
          <Button label="Tambah Data" icon="pi pi-plus" class="p-button-success" @click="handleAdd" />
          <Button label="Tarik Data" icon="pi pi-download" class="p-button-success"  @click="showModalTarik = true" />
          <Button label="Export Excel" icon="pi pi-file-excel" class="p-button-success" @click="exportExcel"/>
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
                { label: 'Terima', icon: 'pi pi-check', command: () => handleTerima(slotProps.data) },
                { label: 'Rincian', icon: 'pi pi-book', command: () => handleRincian(slotProps.data) },
                { label: 'Hapus', icon: 'pi pi-trash', command: () => handleDelete(slotProps.data) },
              ]"
            />
          </template>
        </Column>
        <Column 
          field="no_dokumen" 
          header="No Dokumen" 
          :showFilterMatchModes="false" 
          style="min-width: 12rem"
        >
            <template #body="{ data }">
                {{ data.no_dokumen }}
            </template>
            <template #filter="{ filterModel }">
              <InputText v-model="filterModel.value" type="text" placeholder="Search No Dokumen" />
            </template>
        </Column>
        <Column 
          field="tgl_dokumen" 
          header="Tgl Dokumen" 
          sortable 
          style="min-width: 8rem"
        >
          <template #body="{ data }">
            {{ formatDateID(data.tgl_dokumen) }}
          </template>
        </Column>
        <Column
          field="akun_nama"
          header="Akun"
          :showFilterMatchModes="false"
          style="min-width: 8rem"
        >
          <template #body="{ data }">
            {{ data.akun_nama }}
          </template>
          <template #filter="{ filterModel }">
            <Dropdown
              v-model="filterModel.value"
              :options="akunOptions"
              optionLabel="label"
              optionValue="label"
              placeholder="Select Akun"
              class="p-column-filter"
              showClear
              filter
              filterPlaceholder="Search Akun"
            />
          </template>
        </Column>
        <Column 
          field="pihak3" 
          header="Pihak ke-3" 
          :showFilterMatchModes="false" 
          style="min-width: 12rem"
        >
            <template #body="{ data }">
                {{ data.pihak3 }}
            </template>
            <template #filter="{ filterModel }">
              <InputText v-model="filterModel.value" type="text" placeholder="Search Pihak ke-3" />
            </template>
        </Column>
        <Column 
          field="uraian" 
          header="Uraian" 
          :showFilterMatchModes="false" 
          style="min-width: 30rem"
        >
            <template #body="{ data }">
                {{ data.uraian }}
            </template>
            <template #filter="{ filterModel }">
                <InputText v-model="filterModel.value" type="text" placeholder="Search Uraian" />
            </template>
        </Column>
        <Column 
          field="tgl_berlaku" 
          header="Tgl Berlaku" 
          sortable 
          style="min-width: 8rem"
        >
          <template #body="{ data }">
            {{ formatDateID(data.tgl_berlaku) }}
          </template>
        </Column>
        <Column 
          field="tgl_akhir" 
          header="Tgl Berakhir" 
          sortable 
          style="min-width: 8rem"
        >
          <template #body="{ data }">
            {{ formatDateID(data.tgl_akhir) }}
          </template>
        </Column>
        <Column field="total" header="Jumlah" style="text-align: right">
            <template #body="slotProps">
                {{ new Intl.NumberFormat('id-ID').format(slotProps.data.total || 0) }}
            </template>
        </Column>
        <Column field="terbayar" header="Terbayar" style="text-align: right">
            <template #body="slotProps">
                {{ new Intl.NumberFormat('id-ID').format(slotProps.data.terbayar || 0) }}
            </template>
        </Column>
        <Column 
          field="sisa_potensi" 
          header="Sisa Potensi" 
          :showFilterMatchModes="false" 
          :showFilterMenu="true"
          style="text-align: right"
        >
            <template #body="slotProps">
                {{ new Intl.NumberFormat('id-ID').format(slotProps.data.sisa_potensi || 0) }}
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
        <Column
          field="is_buktitagihan"
          header="Bukti Tagihan"
          :showFilterMatchModes="false"
          style="min-width:6rem;text-align:center"
        >
          <template #body="{ data }">
            <i v-if="data.is_buktitagihan" class="pi pi-check text-green-500"></i>
            <i v-else class="pi pi-times text-red-500"></i>
          </template>
          <template #filter="{ filterModel }">
            <Dropdown
              v-model="filterModel.value"
              :options="buktiTagihanOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Select Bukti Tagihan"
              class="p-column-filter"
              showClear
            />
          </template>
        </Column>
      </DataTable>
    </div>
    <ModalPotensiLainnya 
      v-model="showModal" 
      :item="selectedItem" 
      :options="{
        akun: akunOptions,
      }"
      @saved="handleSaved" 
    />
    <ModalTarikPotensi
      v-model="showModalTarik" 
      jenis="lainnya"
      @saved="handleSaved"
    />
    <ModalTerimaPotensi
      v-model="showModalTerima" 
      :item="selectedItem"
      jenisPotensi="lainnya"
      :options="{
        akun: akunOptions,
        caraPembayaran: caraPembayaranOptions,
        bank: bankOptions,
      }"
      @saved="handleSaved"
    />
    <ModalRincianPotensiLainnya 
      v-model="showModalRincian" 
      :item="selectedItem" 
      :options="{
        akun: akunOptions,
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
  </div>
</template>

<style scoped>
.p-datatable .p-datatable-thead > tr > th {
  white-space: nowrap;
  text-align: center;
  padding: 0.5rem 0.75rem;
}
</style>