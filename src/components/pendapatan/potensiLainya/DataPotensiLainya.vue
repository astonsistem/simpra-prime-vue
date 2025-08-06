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
import Menu from 'primevue/menu'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import api from '@/services/http.js'
import ModalSyncPenerimaan from './modal/TarikDataPotensiLainya.vue'
import ModalEditPenerimaan from './modal/EditPotensiLainya.vue'
import { useToast } from 'primevue/usetoast'
import Toast from 'primevue/toast'
import * as XLSX from 'xlsx'
import { reactive } from 'vue'
import TambahDataPotensiLainya from './modal/TambahDataPotensiLainya.vue'

// Filter state
const tahunPeriodeOptions = Array.from(
  { length: 10 },
  (_, i) => `${new Date().getFullYear() - 5 + i}`
)
const jenisPeriodeOptions = [
  { label: 'Tanggal', value: 'tanggal' },
  { label: 'Bulan', value: 'bulan' },
]
const bulanOptions = [
  { label: 'Januari', value: '01' },
  { label: 'Februari', value: '02' },
  { label: 'Maret', value: '03' },
  { label: 'April', value: '04' },
  { label: 'Mei', value: '05' },
  { label: 'Juni', value: '06' },
  { label: 'Juli', value: '07' },
  { label: 'Agustus', value: '08' },
  { label: 'September', value: '09' },
  { label: 'Oktober', value: '10' },
  { label: 'November', value: '11' },
  { label: 'Desember', value: '12' },
]

const formFilters = ref({
  tahunPeriode: '',
  jenisPeriode: '',
  tglAwal: null,
  tglAkhir: null,
  bulanAwal: '',
  bulanAkhir: '',
  pihak3: '',
  uraian: '',
})

const filters = ref()
const data = ref([])
const loading = ref(false)
const showModalSync = ref(false)
const showModalEdit = ref(false)
const selectedItem = ref(null)
const totalRecords = ref(0)
const rows = ref(10)
const first = ref(0)
const toast = useToast()

const buildQuery = () => {
  const q = {}
  if (formFilters.value.tahunPeriode) q.year = formFilters.value.tahunPeriode
  if (formFilters.value.jenisPeriode) q.periode = formFilters.value.jenisPeriode
  if (formFilters.value.pihak3) q.pihak3 = formFilters.value.pihak3
  if (formFilters.value.uraian) q.uraian = formFilters.value.uraian
  if (formFilters.value.jenisPeriode === 'tanggal') {
    if (formFilters.value.tglAwal) q.tgl_awal = formatDateToYYYYMMDD(formFilters.value.tglAwal)
    if (formFilters.value.tglAkhir) q.tgl_akhir = formatDateToYYYYMMDD(formFilters.value.tglAkhir)
  }
  if (formFilters.value.jenisPeriode === 'bulan') {
    if (formFilters.value.bulanAwal) q.bulan_awal = formFilters.value.bulanAwal
    if (formFilters.value.bulanAkhir) q.bulan_akhir = formFilters.value.bulanAkhir
  }

  if (filters.value) {
    Object.keys(filters.value).forEach((key) => {
      if (filters.value[key].value) {
        q[key] = filters.value[key].value
      }
    })
  }

  return q
}


const loadData = async (page = 1, pageSize = rows.value) => {
  loading.value = true
  try {
    const query = buildQuery()
    query.page = page
    query.size = pageSize
    const response = await api.get('/potensi_lain', { params: query })
    if (response.data && response.data.items) {
      data.value = response.data.items.map((item, index) => ({
        ...item,
        no: (page - 1) * pageSize + index + 1,
      }))
      totalRecords.value = response.data.total ?? 0
    }
  } catch (error) {
    console.error('Gagal memuat data:', error)
  } finally {
    loading.value = false
  }
}

const onPageChange = (event) => {
  first.value = event.first
  rows.value = event.rows
  const page = event.page + 1
  loadData(page, event.rows)
}

const resetFilter = () => {
  formFilters.value = {
    tahunPeriode: '',
    jenisPeriode: '',
    tglAwal: null,
    tglAkhir: null,
    bulanAwal: '',
    bulanAkhir: '',
    pihak3: '',
    uraian: '',
  }
  first.value = 0
  loadData(1, rows.value)
}

const searchData = () => {
  first.value = 0
  loadData(1, rows.value)
}

// const handleAdd = () => {
//   selectedItem.value = null
//   showModalEdit.value = true
// }

const handleEdit = (item) => {
  selectedItem.value = { ...item }
  showModalEdit.value = true
}

const handleTerima = (item) => {
  console.log('Terima item:', item)
  // TODO: Implement terima functionality
}

const handleDelete = async (item) => {
  if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) return
  try {
    await api.delete(`/potensi_lain/${item.id}`)
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

const handleSaved = () => {
  showModalEdit.value = false
  toast.add({
    severity: 'success',
    summary: 'Berhasil',
    detail: 'Data berhasil disimpan',
    life: 3000,
  })
  loadData(1, rows.value)
}

onMounted(async () => {
  loadData(1, rows.value)
})

const onFilter = (event) => {
  filters.value = event.filters
  first.value = 0
  loadData(1, rows.value)
}

const initFilters = () => {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    no_dokumen: { value: null, matchMode: FilterMatchMode.CONTAINS },
    tgl_dokumen: { value: null, matchMode: FilterMatchMode.DATE_IS },
    pihak3: { value: null, matchMode: FilterMatchMode.CONTAINS },
    uraian: { value: null, matchMode: FilterMatchMode.CONTAINS },
    tgl_berlaku: { value: null, matchMode: FilterMatchMode.DATE_IS },
    tgl_akhir: { value: null, matchMode: FilterMatchMode.DATE_IS },
    total: { value: null, matchMode: FilterMatchMode.EQUALS },
    terbayar: { value: null, matchMode: FilterMatchMode.EQUALS },
    sisa: { value: null, matchMode: FilterMatchMode.EQUALS },
  }
}

initFilters()

const clearFilter = () => {
  initFilters()
  loadData(1, rows.value)
}

const showModal = ref(false)

function handleAdd() {
  showModal.value = true
}

function handleSave(data) {
  console.log("Data disimpan:", data)
}

const exportExcel = () => {
  try {
    // Prepare headers for Excel (excluding Action column)
    const headers = [
      'No',
      'No Dokumen',
      'Pihak ke-3',
      'Uraian',
      'Tgl Berlaku',
      'Tgl Berakhir',
      'Jumlah',
      'Terbayar',
      'Sisa Potensi',
    ]

    // Prepare data for Excel
    const excelData = data.value.map((item, index) => [
      item.no || index + 1,
      item.noDokumen || '',
      item.pihakke3 || '',
      item.uraian || '',
      item.tglBerlaku || '',
      item.tglAkhir || '',
      item.jumlah || 0,
      item.terbayar || 0,
      item.sisaPotensi || '',
    ])

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...excelData])

    // Set column widths
    const columnWidths = [
      { wch: 5 }, // No
      { wch: 20 }, // No Dokumen
      { wch: 12 }, // Pihak ke 3
      { wch: 20 }, // Uraian
      { wch: 30 }, // Tgl Berlaku
      { wch: 30 }, // Tgl Berakhir
      { wch: 15 }, // JUmlah
      { wch: 15 }, // Terbayar
      { wch: 15 }, // Sisa Potensi

    ]
    worksheet['!cols'] = columnWidths

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Potensi Lainya')

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })

    // Download file
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `potensi_lainya_${new Date().toISOString().split('T')[0]}.xlsx`)
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


const formatDateToYYYYMMDD = (date) => {
  if (!date) return null
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

  const payload = {
  tglAwal: formatDateToYYYYMMDD(formFilters.value.tglAwal),
  tglAkhir: formatDateToYYYYMMDD(formFilters.value.tglAkhir),
}

  
</script>

<template>
  <div class="p-4">
    <div
      class="bg-surface-0 dark:bg-surface-900 rounded-2xl mb-6 px-6 py-4 md:px-6 md:py-3 border-b md:border border-surface-200 dark:border-surface-700 w-full sticky top-0 z-30">
      <h3 class="text-xl font-semibold text-[#17316E] mb-4">Filter Data</h3>
      <div class="grid grid-cols-4 gap-4">
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Tahun Periode</label>
          <Select v-model="formFilters.tahunPeriode" :options="tahunPeriodeOptions" placeholder="Tahun Periode"
            class="w-full" />
        </div>
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Tanggal Awal</label>
          <DatePicker v-model="formFilters.tglAwal" placeholder="Tanggal Awal" showIcon dropdownIcon="pi pi-angle-down"
            class="w-full" dateFormat="dd/mm/yy"
            :showTime="false"
            :showSeconds="false"
            :showMilliseconds="false"/>
        </div>
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Tanggal Akhir</label>
          <DatePicker v-model="formFilters.tglAkhir" placeholder="Tanggal Akhir" showIcon
            dropdownIcon="pi pi-angle-down" class="w-full" dateFormat="dd/mm/yy"
            :showTime="false"
            :showSeconds="false"
            :showMilliseconds="false" />
        </div>
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Jenis Periode</label>
          <Select v-model="formFilters.jenisPeriode" :options="jenisPeriodeOptions" optionLabel="label"
            optionValue="value" placeholder="Jenis Periode" class="w-full" />
        </div>
        <template v-if="formFilters.jenisPeriode === 'tanggal'">
          <!-- <div>
            <label class="block mb-1 text-sm font-medium text-gray-700">Tgl Awal</label>
            <DatePicker
              v-model="formFilters.tglAwal"
              placeholder="Tgl Awal"
              showIcon
              class="w-full"
            />
          </div> -->
          <!-- <div>
            <label class="block mb-1 text-sm font-medium text-gray-700">Tgl Akhir</label>
            <DatePicker
              v-model="formFilters.tglAkhir"
              placeholder="Tgl Akhir"
              showIcon
              class="w-full"
            />
          </div> -->
        </template>
        <template v-else-if="formFilters.jenisPeriode === 'bulan'">
          <!-- <div>
            <label class="block mb-1 text-sm font-medium text-gray-700">Bulan Awal</label>
            <Select
              v-model="formFilters.bulanAwal"
              :options="bulanOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Bulan Awal"
              class="w-full"
            />
          </div> -->
          <!-- <div>
            <label class="block mb-1 text-sm font-medium text-gray-700">Bulan Akhir</label>
            <Select
              v-model="formFilters.bulanAkhir"
              :options="bulanOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Bulan Akhir"
              class="w-full"
            />
          </div> -->
        </template>
        <!-- <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Pihak 3</label>
          <InputText v-model="formFilters.pihak3" placeholder="Pihak 3" class="w-full" />
        </div>
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Uraian</label>
          <InputText v-model="formFilters.uraian" placeholder="Uraian" class="w-full" />
        </div> -->
      </div>
      <div class="mt-4 flex gap-2">
        <!-- <Button label="Cari" icon="pi pi-search" class="p-button-info" @click="searchData" /> -->
        <Button label="Cari" class="p-button-info" @click="searchData" />
        <!-- <Button
          label="Reset Filter"
          icon="pi pi-refresh"
          class="p-button-secondary"
          @click="resetFilter"
        /> -->
        <Button label="Reset Filter" class="p-button-secondary" @click="resetFilter" />
        <Button label="Tarik Data Biling" severity="warning" class="p-button-warn" />
      </div>
    </div>


    <div
      class="bg-surface-0 dark:bg-surface-900 rounded-2xl my-6 px-6 py-4 md:px-6 md:py-3 border-b md:border border-surface-200 dark:border-surface-700 w-full sticky top-0 z-30">
      <div class="flex justify-between items-center mr-8">
        <div class="mb-3 p-4">
          <h2 class="text-xl font-bold text-[#17316E]">Data Potensi Lainya</h2>
        </div>
        <div class="flex gap-2">
          <Button label="Tambah Data" icon="pi pi-plus" class="p-button-success rounded" @click="handleAdd" />
          <template>
            <div>

              <TambahDataPotensiLainya :visible="showModal" @update:visible="showModal = $event" @save="handleSave" />
            </div>
          </template>
          <Button label="Export Excel" icon="pi pi-download" @click="exportExcel" class="p-button-success ml-5" />
        </div>

      </div>

      <div class="flex justify-between items-center mb-2">
        <!-- <h3 class="text-xl font-semibold text-[#17316E]">Data Potensi Lainnya</h3> -->
        <div class="flex gap-2">
          <!-- <Button
            label="Tambah Data"
            icon="pi pi-plus"
            class="p-button-primary"
            @click="handleAdd"
          /> -->
          <!-- <Button
            label="Tarik Data"
            icon="pi pi-refresh"
            class="p-button-success"
            @click="showModalSync = true"
          /> -->
          <!-- <Button label="Export Excel" icon="pi pi-file-excel" class="p-button-success" /> -->
        </div>
      </div>
      <DataTable :filters="filters" :value="data" :loading="loading" responsiveLayout="scroll" paginator lazy
        :totalRecords="totalRecords" :rows="rows" :first="first" :rowsPerPageOptions="[5, 10, 20]" @page="onPageChange"
        @filter="onFilter" dataKey="id" filterDisplay="menu" :globalFilterFields="['no_dokumen', 'pihak3', 'uraian']"
        class="p-datatable-sm">

        <template #header>
          <div class="flex justify-between">
            <!-- <Button
              type="button"
              icon="pi pi-filter-slash"
              label="Clear"
              outlined
              @click="clearFilter()"
            /> -->
            <!-- <IconField>
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
            </IconField> -->
          </div>
        </template>
        <Column field="no" header="No" style="width: 5%" />
        <Column header="Action" style="width: 15%">
          <template #body="slotProps">
            <SplitButton label="Action" icon="pi pi-pen-to-square" size="small" severity="secondary" :model="[
              { label: 'Ubah', icon: 'pi pi-pencil', command: () => handleEdit(slotProps.data) },
              {
                label: 'Terima',
                icon: 'pi pi-check',
                command: () => handleTerima(slotProps.data),
              },
              {
                label: 'Hapus',
                icon: 'pi pi-trash',
                command: () => handleDelete(slotProps.data),
              },
            ]" />
          </template>
        </Column>
        <Column field="no_dokumen" header="No Dokumen" :showFilterMatchModes="false" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.no_dokumen }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by No Dokumen" />
          </template>
        </Column>

        <Column field="pihak3" header="Pihak ke-3" :showFilterMatchModes="false" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.pihak3 }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by Pihak ke-3" />
          </template>
        </Column>
        <Column field="uraian" header="Uraian" :showFilterMatchModes="false" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.uraian }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by Uraian" />
          </template>
        </Column>
        <!-- <Column
          field="tgl_dokumen"
          header="Tgl Dokumen"
          :showFilterMatchModes="false"
          style="min-width: 12rem"
        >
          <template #body="{ data }">
            {{ data.tgl_dokumen }}
          </template>
          <template #filter="{ filterModel }">
            <DatePicker
              v-model="filterModel.value"
              dateFormat="dd/mm/yy"
              placeholder="dd/mm/yyyy"
            />
          </template>
        </Column> -->
        <!-- <Column
          field="pihak3"
          header="Pihak ke-3"
          :showFilterMatchModes="false"
          style="min-width: 12rem"
        >
          <template #body="{ data }">
            {{ data.pihak3 }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by Pihak ke-3" />
          </template>
        </Column> -->
        <!-- <Column
          field="uraian"
          header="Uraian"
          :showFilterMatchModes="false"
          style="min-width: 12rem"
        >
          <template #body="{ data }">
            {{ data.uraian }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by Uraian" />
          </template>
        </Column> -->
        <Column field="tgl_berlaku" header="Tgl Berlaku" :showFilterMatchModes="false" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.tgl_berlaku }}
          </template>
          <template #filter="{ filterModel }">
            <DatePicker v-model="filterModel.value" dateFormat="dd/mm/yy" placeholder="dd/mm/yyyy" />
          </template>
        </Column>
        <Column field="tgl_akhir" header="Tgl Berakhir" :showFilterMatchModes="false" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.tgl_akhir }}
          </template>
          <template #filter="{ filterModel }">
            <DatePicker v-model="filterModel.value" dateFormat="dd/mm/yy" placeholder="dd/mm/yyyy" />
          </template>
        </Column>

        <Column field="total" header="Jumlah" style="text-align: left">
          <template #body="slotProps">
            {{ new Intl.NumberFormat('id-ID').format(slotProps.data.total || 0) }}
          </template>
        </Column>
        <Column field="terbayar" header="Terbayar" style="text-align: left">
          <template #body="slotProps">
            {{ new Intl.NumberFormat('id-ID').format(slotProps.data.terbayar || 0) }}
          </template>
        </Column>
        <Column field="sisa" header="Sisa Potensi" style="text-align: center">
          <template #body="slotProps">
            {{ new Intl.NumberFormat('id-ID').format(slotProps.data.sisa || 0) }}
          </template>
        </Column>
      </DataTable>
    </div>
    <ModalSyncPenerimaan v-model="showModalSync" @sync="loadData" />
    <ModalEditPenerimaan :id="selectedItem?.id" v-model="showModalEdit" :item="selectedItem" @saved="handleSaved" />
    <Toast />
  </div>
</template>

<style scoped>
.p-datatable .p-datatable-thead>tr>th {
  white-space: nowrap;
  text-align: center;
  padding: 0.5rem 0.75rem;
}

.p-datatable .p-datatable-tbody>tr>td {
  white-space: nowrap;
  padding: 0.5rem 0.75rem;
  vertical-align: middle;
}
</style>
