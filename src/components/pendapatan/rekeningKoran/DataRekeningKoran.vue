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
import api from '@/services/http.js'
import { useToast } from 'primevue/usetoast'
import Toast from 'primevue/toast'
import * as XLSX from 'xlsx'

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
]);

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
]);

const data = ref([])
const totalRecords = ref(0)
const rows = ref(10)
const first = ref(0)
const loading = ref(false)

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
        if (key === 'tgl_rc') {
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
    const response = await api.get('/rekening_koran', { params: query })
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

const tarikData = () => {
  toast.add({
    severity: 'info',
    summary: 'Tarik Data',
    detail: 'Fitur ini belum diimplementasikan',
    life: 2000,
  })
}

const exportExcel = () => {
  try {
    const headers = [
      'No',
      'No RC',
      'Tanggal RC',
      'Uraian',
      'Klasifikasi Monev',
      'Verifikasi Langsung',
      'Rekening DPA',
      'Bank',
      'PB dari Bank',
      'Debit',
      'Kredit',
      'Terklasifikasi',
      'Belum Klarifikasi',
      'Status',
    ]

    const excelData = data.value.map((item, index) => [
      item.no || index + 1,
      item.no_rc || '',
      item.tgl_rc || '',
      item.uraian || '',
      '', // Klasifikasi Monev - Not in API
      '', // Verifikasi Langsung - Not in API
      item.akun_data.akun_nama || '',
      item.bank || '',
      item.pb_dari || '',
      item.debit || 0,
      item.kredit || 0,
      '', // Terklasifikasi - Not in API
      '', // Belum Klarifikasi - Not in API
      item.status || '',
    ])

    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...excelData])

    const columnWidths = [
      { wch: 5 },
      { wch: 15 },
      { wch: 15 },
      { wch: 30 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
    ]
    worksheet['!cols'] = columnWidths

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekening Koran')

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })

    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `rekening_koran_${new Date().toISOString().split('T')[0]}.xlsx`)
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

const onFilter = (event) => {
  filters.value = event.filters
  first.value = 0
  loadData(1, rows.value)
}

const initFilters = () => {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    no_rc: { value: null, matchMode: FilterMatchMode.CONTAINS },
    tgl_rc: { value: null, matchMode: FilterMatchMode.DATE_IS },
    uraian: { value: null, matchMode: FilterMatchMode.CONTAINS },
    rekening_dpa: { value: null, matchMode: FilterMatchMode.CONTAINS },
    bank: { value: null, matchMode: FilterMatchMode.CONTAINS },
    pb_dari_bank: { value: null, matchMode: FilterMatchMode.CONTAINS },
    debit: { value: null, matchMode: FilterMatchMode.EQUALS },
    kredit: { value: null, matchMode: FilterMatchMode.EQUALS },
    terklarifikasi: { value: null, matchMode: FilterMatchMode.CONTAINS },
  }
}

initFilters()

const clearFilter = () => {
  initFilters()
  loadData(1, rows.value)
}

onMounted(async () => {
  loadData(1, rows.value)
})

const handleView = (data) => {
  console.log('View:', data)
  toast.add({
    severity: 'info',
    summary: 'Info',
    detail: 'Fungsi Lihat belum diimplementasikan',
    life: 3000,
  })
}

const handleEdit = (data) => {
  console.log('Edit:', data)
  toast.add({
    severity: 'info',
    summary: 'Info',
    detail: 'Fungsi Ubah belum diimplementasikan',
    life: 3000,
  })
}

const handleDelete = (data) => {
  console.log('Delete:', data)
  toast.add({
    severity: 'info',
    summary: 'Info',
    detail: 'Fungsi Hapus belum diimplementasikan',
    life: 3000,
  })
}
</script>

<template>
  <div class="p-4">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-[#17316E]">Rekening Koran</h2>
      <p class="text-gray-500">Kelola data Rekening Koran</p>
    </div>

    <!-- Filter Section -->
    <div
      class="bg-surface-0 dark:bg-surface-900 rounded-2xl mb-6 px-6 py-4 md:px-6 md:py-3 border-b md:border border-surface-200 dark:border-surface-700 w-full"
    >
      <h3 class="text-xl font-semibold text-[#17316E] mb-4">Filter Data</h3>
      <div class="grid grid-cols-4 gap-4">
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
          @click="tarikData"
        />
      </div>
    </div>

    <!-- Data Table Section -->
    <div
      class="bg-surface-0 dark:bg-surface-900 rounded-2xl my-6 px-6 py-4 md:px-6 md:py-3 border-b md:border border-surface-200 dark:border-surface-700 w-full"
    >
      <div class="flex justify-between items-center mb-2">
        <h3 class="text-xl font-semibold text-[#17316E]">Data Rekening Koran</h3>
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
        dataKey="rc_id"
        filterDisplay="menu"
        :globalFilterFields="['no_rc', 'uraian', 'rekening_dpa', 'bank', 'pb_dari_bank']"
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
          </div>
        </template>

        <Column field="no" header="No" style="width: 5%"></Column>
        <Column field="action" header="Action" :showFilterMatchModes="false" style="width: 10%">
          <template #body="slotProps">
            <SplitButton
              label="Action"
              icon="pi pi-ellipsis-v"
              size="small"
              severity="secondary"
              :model="[
                { label: 'Lihat', icon: 'pi pi-eye', command: () => handleView(slotProps.data) },
                { label: 'Ubah', icon: 'pi pi-pencil', command: () => handleEdit(slotProps.data) },
                {
                  label: 'Hapus',
                  icon: 'pi pi-trash',
                  command: () => handleDelete(slotProps.data),
                },
              ]"
            />
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by Action" />
          </template>
        </Column>
        <Column field="no_rc" header="No RC" :showFilterMatchModes="false">
          <template #body="{ data }">
            {{ data.no_rc }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by No RC" />
          </template>
        </Column>
        <Column field="tgl_rc" header="Tanggal RC" :showFilterMatchModes="false">
          <template #body="{ data }">
            {{ data.tgl_rc }}
          </template>
          <template #filter="{ filterModel }">
            <DatePicker
              v-model="filterModel.value"
              dateFormat="dd/mm/yy"
              placeholder="dd/mm/yyyy"
            />
          </template>
        </Column>
        <Column field="uraian" header="Uraian" :showFilterMatchModes="false">
          <template #body="{ data }">
            {{ data.uraian }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by Uraian" />
          </template>
        </Column>
        <Column field="klasifikasi_monev" header="Klasifikasi Monev">
          <template #body> - </template>
        </Column>
        <Column field="verifikasi_langsung" header="Verifikasi Langsung">
          <template #body> - </template>
        </Column>
        <Column field="rekening_dpa" header="Rekening DPA" :showFilterMatchModes="false">
          <template #body="{ data }">
            {{ data.akun_data ? data.akun_data.akun_nama : '-' }}
          </template>
          <template #filter="{ filterModel }">
            <InputText
              v-model="filterModel.value"
              type="text"
              placeholder="Search by Rekening DPA"
            />
          </template>
        </Column>
        <Column field="bank" header="Bank" :showFilterMatchModes="false">
          <template #body="{ data }">
            {{ data.bank }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by Bank" />
          </template>
        </Column>
        <Column field="pb_dari_bank" header="PB dari Bank" :showFilterMatchModes="false">
          <template #body="{ data }">
            {{ data.pb_dari || '-' }}
          </template>
          <template #filter="{ filterModel }">
            <InputText
              v-model="filterModel.value"
              type="text"
              placeholder="Search by PB dari Bank"
            />
          </template>
        </Column>
        <Column
          field="debit"
          header="Debit"
          :showFilterMatchModes="false"
          style="text-align: right"
        >
          <template #body="slotProps">
            {{ new Intl.NumberFormat('id-ID').format(slotProps.data.debit || 0) }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by Debit" />
          </template>
        </Column>
        <Column
          field="kredit"
          header="Kredit"
          :showFilterMatchModes="false"
          style="text-align: right"
        >
          <template #body="slotProps">
            {{ new Intl.NumberFormat('id-ID').format(slotProps.data.kredit || 0) }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by Kredit" />
          </template>
        </Column>
        <Column field="terklarifikasi" header="Terklarifikasi" :showFilterMatchModes="false">
          <template #body> - </template>
          <template #filter="{ filterModel }">
            <InputText
              v-model="filterModel.value"
              type="text"
              placeholder="Search by Terklarifikasi"
            />
          </template>
        </Column>
        <Column field="belum_klarifikasi" header="Belum Klarifikasi">
          <template #body> - </template>
        </Column>
        <Column field="status" header="Status">
          <template #body="{ data }">
            {{ data.status || '-' }}
          </template>
        </Column>
      </DataTable>
    </div>
    <Toast />
  </div>
</template>

<style scoped></style>
