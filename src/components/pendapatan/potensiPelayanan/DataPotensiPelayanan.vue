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
import api from '@/services/http.js'
import { useToast } from 'primevue/usetoast'
import ModalSyncPenerimaan from '@/components/ModalSyncPenerimaan.vue'
import ModalEditPenerimaan from '@/components/ModalEditPenerimaan.vue'
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
      q.tgl_awal = formatDateToYYYYMMDD(startDate)
    }
    if (formFilters.value.tahunPeriode && formFilters.value.bulanAkhir) {
      const endDate = new Date(formFilters.value.tahunPeriode, formFilters.value.bulanAkhir, 0)
      q.tgl_akhir = formatDateToYYYYMMDD(endDate)
    }
  } else if (formFilters.value.jenis_periode === 'TANGGAL') {
    if (formFilters.value.tglAwal) q.tgl_awal = formatDateToYYYYMMDD(formFilters.value.tglAwal)
    if (formFilters.value.tglAkhir) q.tgl_akhir = formatDateToYYYYMMDD(formFilters.value.tglAkhir)
  }
  

  if (filters.value) {
    Object.keys(filters.value).forEach((key) => {
      if (filters.value[key].value) {
        if (key === 'tgl_selesai') {
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
    const response = await api.get('/potensi_pelayanan', { params: query })
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

const handleAdd = () => {
  selectedItem.value = null
  showModalEdit.value = true
}

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
    await api.delete(`/potensi_pelayanan/${item.id}`)
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

const fetchCaraBayar = async () => {
  try {
    const response = await api.get('/carabayar')
    if (response.data && response.data.items) {
      caraBayarOptions.value = response.data.items.map((item) => ({
        label: item.carabayar_nama,
        value: item.carabayar_id,
      }))
    }
  } catch (error) {
    console.error('Gagal memuat data cara bayar:', error)
  }
}



const generateTahunPeriodeOptions = () => {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let year = currentYear - 5; year <= currentYear + 1; year++) {
    years.push({ label: year.toString(), value: year.toString() })
  }
  tahunPeriodeOptions.value = years
}

onMounted(async () => {
  generateTahunPeriodeOptions()
  await fetchCaraBayar()
  loadData(1, rows.value)
})

const onFilter = (event) => {
  filters.value = event.filters
  first.value = 0
  loadData(1, rows.value)
}
const exportExcel = () => {
  try {
    // Prepare headers for Excel (excluding Action column)
    const headers = [
      'No',
      'No Dokumen',
      'Tanggal Dokumen',
      'Cara Bayar',
      'Penjamin',
      'Uraian',
      'Tanggal Pendaftaran',
      'No Pendaftaran',
      'Nama Pasien',
      'Jumlah',
      'Terbayar',
      'Sisa Potensi',
    ]

    // Prepare data for Excel
    const excelData = data.value.map((item, index) => ({
      No: item.no || index + 1,
      'No Dokumen': item.no_dokumen || '',
      'Tanggal Dokumen': item.tgl_dokumen || '',
      'Cara Bayar': item.cara_bayar || '',
      Penjamin: item.penjamin || '',
      Uraian: item.uraian || '',
      'Tanggal Pendaftaran': item.tgl_pendaftaran || '',
      'No Pendaftaran': item.no_pendaftaran || '',
      'Nama Pasien': item.nama || '',
      Jumlah: item.jumlah || 0,
      Terbayar: item.terbayar || 0,
      'Sisa Potensi': item.sisa_potensi || 0,
    }))

    const worksheet = XLSX.utils.json_to_sheet(excelData)

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pendapatan Pelayanan')

    // Auto-fit columns
    const columnWidths = Object.keys(excelData[0] || {}).map((key) => ({
      wch: Math.max(key.length, ...excelData.map((row) => (row[key] ? row[key].toString().length : 0))) + 2,
    }))
    worksheet['!cols'] = columnWidths

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })

    // Download file
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `potensi_pelayanan_${new Date().toISOString().split('T')[0]}.xlsx`)
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
    tgl_dokumen: { value: null, matchMode: FilterMatchMode.DATE_IS },
    cara_bayar: { value: null, matchMode: FilterMatchMode.CONTAINS },
    penjamin: { value: null, matchMode: FilterMatchMode.CONTAINS },
    uraian: { value: null, matchMode: FilterMatchMode.CONTAINS },
    tgl_pendaftaran: { value: null, matchMode: FilterMatchMode.DATE_IS },
    no_pendaftaran: { value: null, matchMode: FilterMatchMode.CONTAINS },
    nama: { value: null, matchMode: FilterMatchMode.CONTAINS },
    jumlah: { value: null, matchMode: FilterMatchMode.EQUALS },
    terbayar: { value: null, matchMode: FilterMatchMode.EQUALS },
    sisa_potensi: { value: null, matchMode: FilterMatchMode.EQUALS },
  }
}

initFilters()

const clearFilter = () => {
  initFilters()
  loadData(1, rows.value)
}
</script>

<template>
  <div class="p-4">
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
      </div>
    </div>
    <div
      class="bg-surface-0 dark:bg-surface-900 rounded-2xl my-6 px-6 py-4 md:px-6 md:py-3 border-b md:border border-surface-200 dark:border-surface-700 w-full sticky top-0 z-30"
    >
      <div class="flex justify-between items-center mb-2">
        <h3 class="text-xl font-semibold text-[#17316E]">Data Potensi Pelayanan</h3>
        <div class="flex gap-2">
          <Button
            label="Tarik Data"
            icon="pi pi-download"
            class="p-button-success"
            @click="showModalSync = true"
          />
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
        dataKey="id"
        filterDisplay="menu"
        :globalFilterFields="['no_dokumen', 'tgl_dokumen', 'cara_bayar', 'penjamin', 'uraian', 'tgl_pendaftaran', 'no_pendaftaran', 'nama']"
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
                {
                  label: 'Hapus',
                  icon: 'pi pi-trash',
                  command: () => handleDelete(slotProps.data),
                },
              ]"
            />
          </template>
        </Column>
        <Column field="no_dokumen" header="No Dokumen" :showFilterMatchModes="false" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.no_dokumen || '-' }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by No Dokumen" />
          </template>
        </Column>
        <Column field="tgl_dokumen" header="Tanggal Dokumen" :showFilterMatchModes="false" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.tgl_dokumen || '-' }}
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
        <Column field="cara_bayar" header="Cara Bayar" :showFilterMatchModes="false" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.cara_bayar || '-' }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by Cara Bayar" />
          </template>
        </Column>
        <Column field="penjamin" header="Penjamin" :showFilterMatchModes="false" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.penjamin || '-' }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by Penjamin" />
          </template>
        </Column>
        <Column field="uraian" header="Uraian" :showFilterMatchModes="false" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.uraian || '-' }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by Uraian" />
          </template>
        </Column>
        <Column field="tgl_pendaftaran" header="Tanggal Pendaftaran" :showFilterMatchModes="false" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.tgl_pendaftaran || '-' }}
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
        <Column field="no_pendaftaran" header="No Pendaftaran" :showFilterMatchModes="false" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.no_pendaftaran || '-' }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by No Pendaftaran" />
          </template>
        </Column>
        <Column field="nama" header="Nama Pasien" :showFilterMatchModes="false" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.nama || '-' }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by Nama Pasien" />
          </template>
        </Column>
        <Column field="jumlah" header="Jumlah" style="text-align: right">
          <template #body="slotProps">
            {{ new Intl.NumberFormat('id-ID').format(slotProps.data.jumlah || 0) }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by Jumlah" />
          </template>
        </Column>
        <Column field="terbayar" header="Terbayar" style="text-align: right">
          <template #body="slotProps">
            {{ new Intl.NumberFormat('id-ID').format(slotProps.data.terbayar || 0) }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by Terbayar" />
          </template>
        </Column>
        <Column field="sisa_potensi" header="Sisa Potensi" style="text-align: right">
          <template #body="slotProps">
            {{ new Intl.NumberFormat('id-ID').format(slotProps.data.sisa_potensi || 0) }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by Sisa Potensi" />
          </template>
        </Column>
      </DataTable>
    </div>
    <ModalSyncPenerimaan v-model="showModalSync" @sync="loadData" />
    <ModalEditPenerimaan
      :id="selectedItem?.id"
      v-model="showModalEdit"
      :item="selectedItem"
      @saved="handleSaved"
    />
    <Toast />
  </div>
</template>

<style scoped></style>
