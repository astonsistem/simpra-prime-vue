<script setup>
import { ref, onMounted } from 'vue'
import { FilterMatchMode } from '@primevue/core/api'
import DatePicker from 'primevue/datepicker'
import Select from 'primevue/select'
import Button from 'primevue/button'
import SplitButton from 'primevue/splitbutton'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Toast from 'primevue/toast'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import * as XLSX from 'xlsx'
import api from '@/services/http.js'
import { useToast } from 'primevue/usetoast'
import ModalSyncPenerimaan from '@/components/ModalSyncPenerimaan.vue'
import ModalEditPenerimaan from '@/components/ModalEditPenerimaan.vue'

const toast = useToast()

const formFilters = ref({
  tglAwal: null,
  tglAkhir: null,
  jenisPelayanan: '',
  penjamin: '',
  instalasi: '',
  status: '',
  tahunPeriode: '',
  jenisPeriode: '',
  bulanAwal: '',
  bulanAkhir: '',
  caraBayar: '',
})


const filters = ref()

const tahunPeriodeOptions = Array.from(
  { length: 10 },
  (_, i) => `${new Date().getFullYear() - 5 + i}`
)

const jenisPeriodeOptions = ref([
  { label: 'Bulanan', value: 'BULANAN' },
  { label: 'Tahunan', value: 'TAHUNAN' },
])

const jenisPelayananOptions = [
  { label: 'Semua', value: '' },
  { label: 'Rawat Jalan', value: 'Rawat Jalan' },
  { label: 'Rawat Inap', value: 'Rawat Inap' },
  { label: 'Farmasi', value: 'Farmasi' },
  { label: '118', value: '118' },
  { label: 'SWAB', value: 'SWAB' },
  { label: 'LAB', value: 'LAB' },
]

const statusOptions = [
  { label: 'Semua', value: '' },
  { label: 'Selesai', value: 'selesai' },
  { label: 'Proses', value: 'proses' },
  { label: 'Batal', value: 'batal' },
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

const caraBayarOptions = ref([])
const penjaminOptions = ref([])
const instalasiOptions = ref([
  { label: 'IGD', value: 'IGD' },
  { label: 'Poli Umum', value: 'Poli Umum' },
  { label: 'Poli Gigi', value: 'Poli Gigi' },
])
const data = ref([])
const totalRecords = ref(0)
const rows = ref(10)
const first = ref(0)
const loading = ref(false)
const selectedItem = ref(null)
const showModalEdit = ref(false)
const showModalSync = ref(false)

const formatDate = (date) => {
  if (!date) return null
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}


const buildQuery = (page = 1, pageSize = rows.value) => {
  const q = {
    page,
    size: pageSize,
  }

  if (formFilters.value.tglAwal) q.tgl_awal = formatDate(formFilters.value.tglAwal)
  if (formFilters.value.tglAkhir) q.tgl_akhir = formatDate(formFilters.value.tglAkhir)
 if (formFilters.value.jenis_periode) q.jenis_periode = formFilters.value.jenis_periode
  if (formFilters.value.tahunPeriode) q.tahun_periode = formFilters.value.tahunPeriode
  if (formFilters.value.penjamin) q.penjamin = formFilters.value.penjamin
  if (formFilters.value.instalasi) q.instalasi = formFilters.value.instalasi
  if (formFilters.value.status) q.status = formFilters.value.status

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
    const query = buildQuery(page, pageSize)
    // Replace with real API endpoint
    const response = await api.get('/pendapatan_pelayanan', { params: query })
    if (response.data && response.data.items) {
      data.value = response.data.items.map((item, index) => ({
        ...item,
        no: (page - 1) * pageSize + index + 1,
      }))
      totalRecords.value = response.data.total ?? 0
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
  const page = event.page + 1
  loadData(page, event.rows)
}

const resetFilter = () => {
  formFilters.value = {
    tglAwal: null,
    tglAkhir: null,
    jenisPelayanan: '',
    penjamin: '',
    instalasi: '',
    status: '',
    tahunPeriode: '',
    jenisPeriode: 'null',
    bulanAwal: '',
    bulanAkhir: '',
    caraBayar: '',
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

const handleValidasi = (item) => {
  console.log('Validasi item:', item)
  // TODO: Implement validasi functionality
}

const handleBuktiBayar = (item) => {
  console.log('Bukti Bayar item:', item)
  // TODO: Implement bukti bayar functionality
}

const handleDelete = async (item) => {
  if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) return
  try {
    await api.delete(`/pendapatan_pelayanan/${item.id}`)
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

const fetchPenjamin = async () => {
  try {
    const response = await api.get('/penjamin')
    if (response.data && response.data.items) {
      penjaminOptions.value = response.data.items.map((item) => ({
        label: item.penjamin_nama,
        value: item.penjamin_id,
      }))
    }
    
  } catch (error) {
    console.error('Gagal memuat data penjamin:', error)
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
  await fetchPenjamin()
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
      'No Pendaftaran',
      'No RM',
      'Nama',
      'Tanggal Selesai',
      'Jenis Pelayanan',
      'Cara Bayar',
      'Instalasi',
      'Penjamin',
      'Petugas',
      'Jumlah Tagihan',
      'Status',
    ]

    // Prepare data for Excel
    const excelData = data.value.map((item, index) => [
      item.no || index + 1,
      item.noPendaftaran|| '',
      item.noRM || '',
      item.Nama|| '',
      item.tglSelesai || '',
      item.jenisPelayanan|| '',
      item.carabayar || '',
      item.instalasi || '',
      item.penjamin || '',
      item.petugas || '',
      item.jumlahTagihan || '',
      item.status || '',
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

const initFilters = () => {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    no_dokumen: { value: null, matchMode: FilterMatchMode.CONTAINS },
    tgl_dokumen: { value: null, matchMode: FilterMatchMode.DATE_IS },
    tglSelesai: { value: null, matchMode: FilterMatchMode.DATE_IS },
    cara_pembayaran: { value: null, matchMode: FilterMatchMode.EQUALS },
    penjamin_nama: { value: null, matchMode: FilterMatchMode.EQUALS },
    uraian: { value: null, matchMode: FilterMatchMode.CONTAINS },
    tgl_pendaftaran: { value: null, matchMode: FilterMatchMode.DATE_IS },
    no_RM: { value: null, matchMode: FilterMatchMode.CONTAINS },
    nama: { value: null, matchMode: FilterMatchMode.CONTAINS },
    penjamin: { value: null, matchMode: FilterMatchMode.CONTAINS }, 
    instalasi: { value: null, matchMode: FilterMatchMode.CONTAINS },   
    jenispelayanan: { value: null, matchMode: FilterMatchMode.CONTAINS },
    _petugas: { value: null, matchMode: FilterMatchMode.CONTAINS },
    cara_bayar: { value: null, matchMode: FilterMatchMode.CONTAINS },
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
class="bg-surface-0 dark:bg-surface-900 rounded-2xl my-6 px-6 py-4 md:px-6 md:py-3 border-b md:border border-surface-200 dark:border-surface-700 w-full sticky top-0 z-30"   
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
            placeholder="jenis Periode"
            class="w-full"
          />
        </div>
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
        <template v-if="formFilters.jenisPeriode === 'tanggal'">
        </template>
        <template v-else-if="formFilters.jenisPeriode === 'bulan'">
        </template>
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
        <h3 class="text-xl font-semibold text-[#17316E]">Data Pendapatan Pelayanan</h3>
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
        :rowsPerPageOptions="[5, 10, 20]"
        @page="onPageChange"
        @filter="onFilter"
        dataKey="id"
        filterDisplay="menu"
        :globalFilterFields="['no_dokumen', 'penjamin_nama', 'nama_pasien', 'uraian']"
        class="p-datatable-sm"
      >
        <template #header>
        </template>
        <Column field="no" header="No" style="width: 5%" />
        <Column header="No Pendaftaran" style="width: 15%">
          <template #body="slotProps">

          </template>
        </Column>
        <Column
          field="no_RM"
          header="No RM"
          :showFilterMatchModes="false"
          style="min-width: 12rem"
        >
          <template #body="{ data }">
            {{ data.no_dokumen }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search RM" />
          </template>
        </Column>
         <Column
          field="nama"
          header="Nama"
          :showFilterMatchModes="false"
          style="min-width: 12rem"
        >
          <template #body="{ data }">
            {{ data.no_dokumen }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search Nama" />
          </template>
        </Column>
         <Column
          field="tglSelesai"
          header="Tanggal Selesai"
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
          field="jenispelayanan"
          header="Jenis Pelayanan"
          :showFilterMatchModes="false"
          style="min-width: 12rem"
        >
          <template #body="{ data }">
            {{ data.no_dokumen }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search Jenis Pelayanan" />
          </template>
        </Column>

        <Column
          field="cara_bayar"
          header="Cara Bayar"
          :showFilterMatchModes="false"
          style="min-width: 12rem"
        >
          <template #body="{ data }">
            {{ data.uraian }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by Cara Bayar" />
          </template>
        </Column>

        <Column
          field="instalasi"
          header="Instalasi"
          :showFilterMatchModes="false"
          style="min-width: 12rem"
        >
          <template #body="{ data }">
            {{ data.uraian }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search Instalasi" />
          </template>
        </Column>
        <Column
          field="penjamin"
          header="Penjamin"
          :showFilterMatchModes="false"
          style="min-width: 12rem"
        >
          <template #body="{ data }">
            {{ data.no_pendaftaran }}
          </template>
          <template #filter="{ filterModel }">
            <InputText
              v-model="filterModel.value"
              type="text"
              placeholder="Search Penjamin"
            />
          </template>
        </Column>
        <Column
          field="_petugas"
          header="Petugas"
          :showFilterMatchModes="false"
          style="min-width: 12rem"
        >
          <template #body="{ data }">
            {{ data.nama_pasien }}
          </template>
          <template #filter="{ filterModel }">
            <InputText
              v-model="filterModel.value"
              type="text"
              placeholder="Search Petugas"
            />
          </template>
        </Column>
        <Column field="Jumlah" header="Jumlah Tagihan" style="text-align: right">
          <template #body="slotProps">
            {{ new Intl.NumberFormat('id-ID').format(slotProps.data.jumlah || 0) }}
          </template>
        </Column>         
        <Column field="terbayar" header="Status" style="text-align: right">
          <template #body="slotProps">
            {{ new Intl.NumberFormat('id-ID').format(slotProps.data.terbayar || 0) }}
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
