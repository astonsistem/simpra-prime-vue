<script setup>
import { ref, onMounted } from 'vue'
import Calendar from 'primevue/calendar'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import api from '@/services/http.js'
import { useToast } from 'primevue/usetoast'

const toast = useToast()

const filters = ref({
  tglAwal: null,
  tglAkhir: null,
  jenisPelayanan: '',
  penjamin: '',
  instalasi: '',
  status: '',
})

const jenisPelayananOptions = [
  { label: 'Semua', value: '' },
  { label: 'Rawat Jalan', value: 'Rawat Jalan' },
  { label: 'Rawat Inap', value: 'Rawat Inap' },
  { label: 'Farmasi', value: 'Farmasi' },
  { label: '118', value: '118' },
  { label: 'SWAB', value: 'SWAB' },
  { label: 'LAB', value: 'LAB' },
]
const penjaminOptions = ref([])
const instalasiOptions = ref([])
const statusOptions = [
  { label: 'Semua', value: '' },
  { label: 'Selesai', value: 'selesai' },
  { label: 'Proses', value: 'proses' },
  { label: 'Batal', value: 'batal' },
]

const data = ref([])
const totalRecords = ref(0)
const rows = ref(10)
const first = ref(0)
const loading = ref(false)

const fetchPenjamin = async () => {
  // Dummy fetch, replace with real API if available
  const res = await import('@/api/dummyData/Penjamin.json')
  penjaminOptions.value = res.default.data.map((item) => ({
    label: item.nama_penjamin,
    value: item.id_penjamin,
  }))
}
const fetchInstalasi = async () => {
  // Dummy fetch, replace with real API if available
  instalasiOptions.value = [
    { label: 'IGD', value: 'IGD' },
    { label: 'Poli Umum', value: 'Poli Umum' },
    { label: 'Poli Gigi', value: 'Poli Gigi' },
  ]
}

const buildQuery = (page = 1, pageSize = rows.value) => {
  const q = {
    page,
    size: pageSize,
  }
  if (filters.value.tglAwal) q.tgl_awal = filters.value.tglAwal
  if (filters.value.tglAkhir) q.tgl_akhir = filters.value.tglAkhir
  if (filters.value.jenisPelayanan) q.jenis_pelayanan = filters.value.jenisPelayanan
  if (filters.value.penjamin) q.penjamin = filters.value.penjamin
  if (filters.value.instalasi) q.instalasi = filters.value.instalasi
  if (filters.value.status) q.status = filters.value.status
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
  filters.value = {
    tglAwal: null,
    tglAkhir: null,
    jenisPelayanan: '',
    penjamin: '',
    instalasi: '',
    status: '',
  }
  first.value = 0
  loadData(1, rows.value)
}

const searchData = () => {
  first.value = 0
  loadData(1, rows.value)
}

onMounted(async () => {
  await fetchPenjamin()
  await fetchInstalasi()
  loadData(1, rows.value)
})
</script>

<template>
  <div class="p-4">
    <div
      class="bg-surface-0 dark:bg-surface-900 rounded-2xl mb-6 px-6 py-4 md:px-6 md:py-3 border-b md:border border-surface-200 dark:border-surface-700 w-full sticky top-0 z-30"
    >
      <h3 class="text-xl font-semibold text-[#17316E] mb-4">Filter Data</h3>
      <div class="grid grid-cols-3 gap-4">
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Tgl Awal</label>
          <Calendar v-model="filters.tglAwal" placeholder="Tgl Awal" showIcon class="w-full" />
        </div>
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Tgl Akhir</label>
          <Calendar v-model="filters.tglAkhir" placeholder="Tgl Akhir" showIcon class="w-full" />
        </div>
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Jenis Pelayanan</label>
          <Dropdown
            v-model="filters.jenisPelayanan"
            :options="jenisPelayananOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Jenis Pelayanan"
            class="w-full"
          />
        </div>
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Penjamin</label>
          <Dropdown
            v-model="filters.penjamin"
            :options="penjaminOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="-- Pilih Penjamin --"
            class="w-full"
          />
        </div>
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Instalasi User</label>
          <Dropdown
            v-model="filters.instalasi"
            :options="instalasiOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="-- Pilih Instalasi --"
            class="w-full"
          />
        </div>
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Status</label>
          <Dropdown
            v-model="filters.status"
            :options="statusOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Status"
            class="w-full"
          />
        </div>
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
        <h3 class="text-xl font-semibold text-[#17316E]">Data Pendapatan Pelayanan</h3>
        <div class="flex gap-2">
          <Button label="Tarik Data" icon="pi pi-refresh" class="p-button-success" />
          <Button label="Export Excel" icon="pi pi-file-excel" class="p-button-success" />
        </div>
      </div>
      <DataTable
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
        class="p-datatable-sm"
      >
        <Column field="no" header="No" style="width: 3rem" />
        <Column field="no_pendaftaran" header="No Pendaftaran" />
        <Column field="tgl_pendaftaran" header="Tgl Pendaftaran" />
        <Column field="no_rekam_medik" header="No RM" />
        <Column field="pasien_nama" header="Nama" />
        <Column field="tgl_pelayanan" header="Tanggal Selesai" />
        <Column field="jenis_tagihan" header="Jenis Pelayanan" />
        <Column field="carabayar_nama" header="Cara Bayar" />
        <Column field="penjamin_nama" header="Penjamin" />
        <Column field="inv" header="Petugas" />
        <Column field="total" header="Jumlah Tagihan" />
        <Column field="status_id" header="Status" />
      </DataTable>
    </div>
    <Toast />
  </div>
</template>

<style scoped></style>
