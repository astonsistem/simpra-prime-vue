<script setup>
import { ref, onMounted } from 'vue'
import { FilterMatchMode } from '@primevue/core/api'
import Calendar from 'primevue/calendar'
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
import * as XLSX from 'xlsx'
import { useToast } from 'primevue/usetoast'
import ModalEditPenerimaan from '@/components/ModalEditPenerimaan.vue'
import modalBKU from './modal/modalBKU.vue'
const formatDateToYYYYMMDD = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Filter state
const tahunPeriodeOptions = Array.from(
  { length: 10 },
  (_, i) => `${new Date().getFullYear() - 5 + i}`
)
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
  tglAwal: null,
  tglAkhir: null,
  bulanAwal: '',
  bulanAkhir: '',
  akun: '',
  uraian: '',
})

const filters = ref()
const data = ref([])
const loading = ref(false)
const selectedItem = ref(null)
const totalRecords = ref(0)
const rows = ref(10)
const first = ref(0)
const toast = useToast()
const showModalEdit = ref(false)

const buildQuery = () => {
  const q = {}
  if (formFilters.value.tahunPeriode) q.year = formFilters.value.tahunPeriode
  if (formFilters.value.akun) q.akun = formFilters.value.akun
  if (formFilters.value.uraian) q.uraian = formFilters.value.uraian

  // Selalu kirim tanggal ke query
  if (formFilters.value.tglAwal) q.tgl_awal = formatDateToYYYYMMDD(formFilters.value.tglAwal)
  if (formFilters.value.tglAkhir) q.tgl_akhir = formatDateToYYYYMMDD(formFilters.value.tglAkhir)

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
    const response = await api.get('/bku', { params: query })
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
    tglAwal: null,
    tglAkhir: null,
    bulanAwal: '',
    bulanAkhir: '',
    akun: '',
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

const handleDelete = async (item) => {
  if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) return
  try {
    await api.delete(`/bku/${item.id}`)
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

const exportExcel = () => {
  try {
    const headers = [
      'No',
      'No BKU',
      'Tanggal BKU',
      'Tanggal Valid',
      'Jenis',
      'Tanggal PAD',
      'Uraian',
      'Total',
      'Pendapatan',
      'PDD',
      'Piutang',
      'Status',
    ]
    const excelData = data.value.map((item, index) => [
      item.no || index + 1,
      item.noBKU || '',
      item.tglBKU || '',
      item.tglValid || '',
      item.jenis || '',
      item.tglPAD || '',
      item.uraian || 0,
      item.total || 0,
      item.pendapatan || 0,
      item.PDD || 0,
      item.piutang || 0,
      item.status || 0,
    ])
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...excelData])
    worksheet['!cols'] = [
      { wch: 5 },
      { wch: 20 },
      { wch: 12 },
      { wch: 20 },
      { wch: 30 },
      { wch: 15 },
      { wch: 12 },
      { wch: 15 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
    ]
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Billing Swa')
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `billing_swa_${new Date().toISOString().split('T')[0]}.xlsx`)
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
    no_bku: { value: null, matchMode: FilterMatchMode.CONTAINS },
    tgl_bku: { value: null, matchMode: FilterMatchMode.DATE_IS },
    akun_kode: { value: null, matchMode: FilterMatchMode.CONTAINS },
    akun_nama: { value: null, matchMode: FilterMatchMode.CONTAINS },
    uraian: { value: null, matchMode: FilterMatchMode.CONTAINS },
    debit: { value: null, matchMode: FilterMatchMode.EQUALS },
    kredit: { value: null, matchMode: FilterMatchMode.EQUALS },
    status: { value: null, matchMode: FilterMatchMode.EQUALS },
  }
}

initFilters()

const clearFilter = () => {
  initFilters()
  loadData(1, rows.value)
}



const handleAdd = () => {
  showModalEdit.value = true
}

// const handleSaved = (payload) => {
//   showModalEdit.value = false
//   console.log('Data dari modal:', payload)
//   // Tambahkan proses penyimpanan atau logika lain sesuai kebutuhan
// }
</script>

<template>
  <div class="p-4">
    <div        
      class="bg-surface-0 dark:bg-surface-900 rounded-2xl mb-6 px-6 py-4 md:px-6 md:py-3 border-b md:border border-surface-200 dark:border-surface-700 w-full sticky top-0 z-30"
    >
      <!-- <h3 class="text-xl font-semibold text-[#17316E] mb-4">Filter Data</h3> -->
      <div class="grid grid-cols-3 gap-4">
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Tahun Periode</label>
          <Select
            v-model="formFilters.tahunPeriode"
            :options="tahunPeriodeOptions"
            placeholder="Tahun Periode"
            class="w-full"
          />
        </div>
        <!-- <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Tanggal Awal</label>
          <Select
            v-model="formFilters.jenisPeriode"
            :options="jenisPeriodeOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Tanggal Per"
            class="w-full"
          />
        </div>
        <template v-if="formFilters.jenisPeriode === 'tanggal'">
          <div>
            <label class="block mb-1 text-sm font-medium text-gray-700">Tgl Awal</label>
            <Calendar
              v-model="formFilters.tglAwal"
              placeholder="Tgl Awal"
              showIcon
              class="w-full"
            />
          </div>
          <div>
            <label class="block mb-1 text-sm font-medium text-gray-700">Tgl Akhir</label>
            <Calendar
              v-model="formFilters.tglAkhir"
              placeholder="Tgl Akhir"
              showIcon
              class="w-full"
            />
          </div>
        </template>
        <template v-else-if="formFilters.jenisPeriode === 'bulan'">
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
          </div> -->
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
 
      </div>
      <div class="mt-4 flex gap-2">
        <Button label="Cari"  class="p-button-info" @click="searchData" />
        <Button
          label="Reset Filter"
          class="p-button-secondary"
          @click="resetFilter"
        />
         <Button
          label="Tarik Data Billing"
          class="p-button-warning"
          style="background-color: #ffa500; border: none; color: #fff"
          @click="openSyncDialog"
        />
      </div>
    </div>
    <div
      class="bg-surface-0 dark:bg-surface-900 rounded-2xl my-6 px-6 py-4 md:px-6 md:py-3 border-b md:border border-surface-200 dark:border-surface-700 w-full sticky top-0 z-30"
    >
      <div class="flex justify-between items-center mb-2">
        <h3 class="text-xl font-semibold text-[#17316E]">Data BKU</h3>
        <div class="flex gap-2">

            <Button
            label="Tambah Data"
            icon="pi pi-plus"
            class="p-button-primary"
            @click="handleAdd"
          />
            <modalBKU
    :visible="showModalEdit"
    @close="showModalEdit = false"
    @submit="handleSaved"
  />
          
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
        :loading="loading"
        responsiveLayout="scroll"
        paginator
        lazy
        :totalRecords="totalRecords"
        :rows="rows"
        :first="first"
        :rowsPerPageOptions="[5, 10, 20]"
        @page="onPageChange"
        @filter="onFilter"
        dataKey="id"
        filterDisplay="menu"
        :globalFilterFields="['no_bku', 'akun_kode', 'akun_nama', 'uraian']"
        class="p-datatable-sm"
      >
        <template #header>
          <div class="flex justify-between">
        
            <!-- 
            <IconField>
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
            </IconField>
            -->
          </div>
        </template>
        <Column field="no" header="No" style="width: 5%" />
        <Column header="Action" style="width: 15%">
          <template #body="slotProps">
           
          </template>
        </Column>
        <Column
          field="no_bku"
          header="No BKU"
          :showFilterMatchModes="false"
          style="min-width: 12rem"
        >
          <template #body="{ data }">
            {{ data.no_bku }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by No BKU" />
          </template>
        </Column>
        <Column
          field="tgl_bku"
          header="Tanggal BKU"
          :showFilterMatchModes="false"
          style="min-width: 12rem"
        >
          <template #body="{ data }">
            {{ data.tgl_bku }}
          </template>
          <template #filter="{ filterModel }">
            <DatePicker
              v-model="filterModel.value"
              dateFormat="dd/mm/yy"
              placeholder="dd/mm/yyyy"
            />
          </template>
        </Column>
        <Column
          field="tgl_bku"
          header="Tanggal Valid"
          :showFilterMatchModes="false"
          style="min-width: 12rem"
        >
          <template #body="{ data }">
            {{ data.tgl_bku }}
          </template>
          <template #filter="{ filterModel }">
            <DatePicker
              v-model="filterModel.value"
              dateFormat="dd/mm/yy"
              placeholder="dd/mm/yyyy"
            />
          </template>
        </Column>
         <Column
          field="uraian"
          header="Jenis"
          :showFilterMatchModes="false"
          style="min-width: 12rem"
        >
        <template #body="{ data }">
            {{ data.uraian }}
          </template>
          <!-- <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by Uraian" />
          </template> -->
        </Column>
        <!-- <Column
          field="akun_kode"
          header="Kode Akun"
          :showFilterMatchModes="false"
          style="min-width: 12rem"
        >
          <template #body="{ data }">
            {{ data.akun_kode }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by Kode Akun" />
          </template>
        </Column> -->
        <Column
          field="tgl_bku"
          header="Tanggal PAD"
          :showFilterMatchModes="false"
          style="min-width: 12rem"
        >
          <template #body="{ data }">
            {{ data.tgl_bku }}
          </template>
          <template #filter="{ filterModel }">
            <DatePicker
              v-model="filterModel.value"
              dateFormat="dd/mm/yy"
              placeholder="dd/mm/yyyy"
            />
          </template>
        </Column>
        <!-- <Column
          field="akun_nama"
          header="Nama Akun"
          :showFilterMatchModes="false"
          style="min-width: 12rem"
        >
          <template #body="{ data }">
            {{ data.akun_nama }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by Nama Akun" />
          </template>
        </Column> -->
        <Column
          field="uraian"
          header="Uraian"
          :showFilterMatchModes="false"
          style="min-width: 12rem"
        >
          <template #body="{ data }">
            {{ data.uraian }}
          </template>
          <!-- <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by Uraian" />
          </template> -->
        </Column>
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
         <Column
          field="uraian"
          header="Total"
          :showFilterMatchModes="false"
          style="min-width: 12rem"
        >
          <template #body="{ data }">
            {{ data.uraian }}
          </template>
          <!-- <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by Uraian" />
          </template> -->
        </Column>
        <!-- <Column field="debit" header="Debit" style="text-align: right">
          <template #body="slotProps">
            {{ new Intl.NumberFormat('id-ID').format(slotProps.data.debit || 0) }}
          </template>
        </Column> -->
        <Column
          field="uraian"
          header="Pendapatan"
          :showFilterMatchModes="false"
          style="min-width: 12rem"
        >
          <template #body="{ data }">
            {{ data.uraian }}
          </template>
          <!-- <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by Uraian" />
          </template> -->
        </Column>
        <!-- <Column field="kredit" header="Kredit" style="text-align: right">
          <template #body="slotProps">
            {{ new Intl.NumberFormat('id-ID').format(slotProps.data.kredit || 0) }}
          </template>
        </Column> -->
        <Column
          field="uraian"
          header="PDD"
          :showFilterMatchModes="false"
          style="min-width: 12rem"
        >
          <template #body="{ data }">
            {{ data.uraian }}
          </template>
        </Column>
        <Column
          field="uraian"
          header="Piutang"
          :showFilterMatchModes="false"
          style="min-width: 12rem"
        >
          <template #body="{ data }">
            {{ data.uraian }}
          </template>
        </Column>
        <Column field="status" header="Status" />
      </DataTable>
    </div>
    <ModalEditPenerimaan
      :id="selectedItem?.id"
      v-model="showModalEdit"
      :item="selectedItem"
      @saved="handleSaved"
    />
    <Toast />
  </div>
</template>

<style scoped>
.p-datatable .p-datatable-thead > tr > th {
  white-space: nowrap;
  text-align: center;
  padding: 0.5rem 0.75rem;
}

.p-datatable .p-datatable-tbody > tr > td {
  white-space: nowrap;
  padding: 0.5rem 0.75rem;
  vertical-align: middle;
}
</style>
