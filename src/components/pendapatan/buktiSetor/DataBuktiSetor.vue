<script setup>
import { ref, onMounted } from 'vue'
import { FilterMatchMode } from '@primevue/core/api'
import Calendar from 'primevue/calendar'
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
import { useToast } from 'primevue/usetoast'
import DatePicker from 'primevue/datepicker'
import Toast from 'primevue/toast'

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
  bank: '',
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

const buildQuery = () => {
  const q = {}
  if (formFilters.value.tahunPeriode) q.year = formFilters.value.tahunPeriode
  // if (formFilters.value.jenisPeriode) q.periode = formFilters.value.jenisPeriode
  // if (formFilters.value.bank) q.bank = formFilters.value.bank
  // if (formFilters.value.uraian) q.uraian = formFilters.value.uraian
  // if (formFilters.value.jenisPeriode === 'tanggal') {
  //   if (formFilters.value.tglAwal) q.tgl_awal = formFilters.value.tglAwal
  //   if (formFilters.value.tglAkhir) q.tgl_akhir = formFilters.value.tglAkhir
  // }
  if (formFilters.value.tglAwal) q.tgl_awal = formatDateToYYYYMMDD(formFilters.value.tglAwal)
  if (formFilters.value.tglAkhir) q.tgl_akhir = formatDateToYYYYMMDD(formFilters.value.tglAkhir)
  // if (formFilters.value.jenisPeriode === 'bulan') {
  //   if (formFilters.value.bulanAwal) q.bulan_awal = formFilters.value.bulanAwal
  //   if (formFilters.value.bulanAkhir) q.bulan_akhir = formFilters.value.bulanAkhir
  // }

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
    const response = await api.get('/bukti_setor', { params: query })
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
    // jenisPeriode: '',
    tglAwal: null,
    tglAkhir: null,
    // bulanAwal: '',
    // bulanAkhir: '',
    // bank: '',
    // uraian: '',
  }
  first.value = 0
  loadData(1, rows.value)
}

const pullData = async () => {
  // try {
  //   const response = await api.post('/bukti_setor/pull_data_biling', payload)
  //   if (response.data.success) {
  //     toast.add({
  //       severity: 'success',
  //       summary: 'Berhasil',
  //       detail: 'Data berhasil ditarik',
  //       life: 3000,
  //     })
  //     loadData(1, rows.value)
  //   } else {
  //     toast.add({
  //       severity: 'warn',
  //       summary: 'Peringatan',
  //       detail: response.data.message || 'Tidak ada data baru untuk ditarik',
  //       life: 3000,
  //     })
  //   }
  // } catch (error) {
  //   console.error('Gagal menarik data:', error)
  //   toast.add({
  //     severity: 'error',
  //     summary: 'Gagal',
  //     detail: 'Gagal menarik data. Silakan coba lagi.',
  //     life: 3000,
  //   })
  // }
}

const searchData = () => {
  first.value = 0
  loadData(1, rows.value)
}

const handleView = (item) => {
  console.log('View item:', item)
  // TODO: Implement view functionality
}

const handleEdit = (item) => {
  console.log('Edit item:', item)
  // TODO: Implement edit functionality
}

const handleCetak = (item) => {
  console.log('Cetak item:', item)
  // TODO: Implement cetak functionality
}

const handleDelete = async (item) => {
  if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) return
  try {
    await api.delete(`/bukti_setor/${item.id}`)
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

onMounted(async () => {
  loadData(1, rows.value)
})

const onFilter = (event) => {
  filters.value = event.filters
  first.value = 0
  loadData(1, rows.value)
}

// const initFilters = () => {
//   filters.value = {
//     global: { value: null, matchMode: FilterMatchMode.CONTAINS },
//     no_bukti: { value: null, matchMode: FilterMatchMode.CONTAINS },
//     tgl_bukti: { value: null, matchMode: FilterMatchMode.DATE_IS },
//     bank: { value: null, matchMode: FilterMatchMode.CONTAINS },
//     uraian: { value: null, matchMode: FilterMatchMode.CONTAINS },
//     jumlah: { value: null, matchMode: FilterMatchMode.EQUALS },
//     status: { value: null, matchMode: FilterMatchMode.EQUALS },
//   }
// }

const initFilters = () => {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    tgl_setor: { value: null, matchMode: FilterMatchMode.DATE_IS },
    loket_kasir: { value: null, matchMode: FilterMatchMode.CONTAINS },
    rekening_dpa: { value: null, matchMode: FilterMatchMode.CONTAINS },
    bank: { value: null, matchMode: FilterMatchMode.CONTAINS },
    uraian: { value: null, matchMode: FilterMatchMode.CONTAINS },
    jml_kwitansi: { value: null, matchMode: FilterMatchMode.EQUALS },
    admin_edc: { value: null, matchMode: FilterMatchMode.EQUALS },
    admin_qris: { value: null, matchMode: FilterMatchMode.EQUALS },
    selisih: { value: null, matchMode: FilterMatchMode.EQUALS },
    total_setor: { value: null, matchMode: FilterMatchMode.EQUALS },
    status: { value: null, matchMode: FilterMatchMode.EQUALS },
  }
}
initFilters()

const clearFilter = () => {
  initFilters()
  loadData(1, rows.value)
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
      <!-- <h3 class="text-xl font-semibold text-[#17316E] mb-4">Filter Data</h3> -->
      <div class="grid grid-cols-3 gap-4">
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Tahun Periode</label>
          <Select v-model="formFilters.tahunPeriode" :options="tahunPeriodeOptions" placeholder="Tahun Periode"
            class="w-full" />
        </div>
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Tanggal Awal</label>
          <DatePicker v-model="formFilters.tglAwal" placeholder="Tanggal Awal" showIcon dropdownIcon="pi pi-angle-down"
            class="w-full" dateFormat="dd/mm/yy" :showTime="false" :showSeconds="false" :showMilliseconds="false" />
        </div>
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Tanggal Akhir</label>
          <DatePicker v-model="formFilters.tglAkhir" placeholder="Tanggal Akhir" showIcon
            dropdownIcon="pi pi-angle-down" class="w-full" dateFormat="dd/mm/yy" :showTime="false" :showSeconds="false"
            :showMilliseconds="false" />
        </div>
        <!-- <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Jenis Periode</label>
          <Select
            v-model="formFilters.jenisPeriode"
            :options="jenisPeriodeOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Jenis Periode"
            class="w-full"
          />
        </div> -->
        <!-- <template v-if="formFilters.jenisPeriode === 'tanggal'">
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
        </template> -->
        <!-- <template v-else-if="formFilters.jenisPeriode === 'bulan'">
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
        </template> -->
        <!-- <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Bank</label>
          <InputText v-model="formFilters.bank" placeholder="Bank" class="w-full" />
        </div>
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Uraian</label>
          <InputText v-model="formFilters.uraian" placeholder="Uraian" class="w-full" />
        </div> -->
      </div>
      <div class="mt-4 flex gap-2">
        <Button label="Cari" class="p-button-info" @click="searchData" />
        <Button label="Reset Filter" class="p-button-secondary" @click="resetFilter" />
        <Button label="Tarik Data Biling" class="p-button-warn" @click="pullData" />
      </div>
    </div>
    <div
      class="bg-surface-0 dark:bg-surface-900 rounded-2xl my-6 px-6 py-4 md:px-6 md:py-3 border-b md:border border-surface-200 dark:border-surface-700 w-full sticky top-0 z-30">
      <div class="flex justify-between items-center mb-2">
        <h3 class="text-xl font-semibold text-[#17316E]">Data Bukti Setor</h3>
        <div class="flex gap-2">
          <!-- <Button label="Export Excel" icon="pi pi-file-excel" class="p-button-success" /> -->
        </div>
      </div>
      <DataTable :filters="filters" :value="data" :loading="loading" responsiveLayout="scroll" paginator lazy
        :totalRecords="totalRecords" :rows="rows" :first="first" :rowsPerPageOptions="[5, 10, 20]" @page="onPageChange"
        @filter="onFilter" dataKey="id" filterDisplay="menu" :globalFilterFields="['no_bukti', 'bank', 'uraian']"
        class="p-datatable-sm">
        <template #header>
          <div class="flex justify-between">
          </div>
        </template>

        <Column field="no" header="No" style="width: 5%" />

        <Column header="Action" style="width: 15%">
          <template #body="slotProps">
            <SplitButton label="Aksi" icon="pi pi-pen-to-square" size="small" severity="secondary" :model="[
              { label: 'Lihat', icon: 'pi pi-eye', command: () => handleView(slotProps.data) },
              { label: 'Ubah', icon: 'pi pi-pencil', command: () => handleEdit(slotProps.data) },
              { label: 'Cetak', icon: 'pi pi-print', command: () => handleCetak(slotProps.data) },
              { label: 'Hapus', icon: 'pi pi-trash', command: () => handleDelete(slotProps.data) },
            ]" />
          </template>
        </Column>

        <Column field="tgl_setor" header="Tanggal Setor" :showFilterMatchModes="false" style="min-width: 12rem">
          <template #body="{ data }">{{ data.tgl_setor }}</template>
          <template #filter="{ filterModel }">
            <DatePicker v-model="filterModel.value" dateFormat="dd/mm/yy" placeholder="dd/mm/yyyy" />
          </template>
        </Column>

        <Column field="loket_kasir" header="Loket Kasir" :showFilterMatchModes="false" style="min-width: 12rem">
          <template #body="{ data }">{{ data.loket_kasir }}</template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" placeholder="Cari Loket Kasir" />
          </template>
        </Column>

        <Column field="rekening_dpa" header="No Rekening DPA" :showFilterMatchModes="false" style="min-width: 12rem">
          <template #body="{ data }">{{ data.rekening_dpa }}</template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" placeholder="Cari No Rekening DPA" />
          </template>
        </Column>

        <Column field="bank" header="Bank" :showFilterMatchModes="false" style="min-width: 12rem">
          <template #body="{ data }">{{ data.bank }}</template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" placeholder="Cari Bank" />
          </template>
        </Column>

        <Column field="uraian" header="Uraian" :showFilterMatchModes="false" style="min-width: 12rem">
          <template #body="{ data }">{{ data.uraian }}</template>
        </Column>

        <Column field="jml_kwitansi" header="Jumlah Kwitansi" :showFilterMatchModes="false" style="min-width: 12rem">
          <template #body="{ data }">{{ data.jml_kwitansi }}</template>
        </Column>

        <Column field="admin_edc" header="Biaya Admin EDC" :showFilterMatchModes="false" style="min-width: 12rem">
          <template #body="{ data }">{{ data.admin_edc }}</template>
        </Column>

        <Column field="admin_qris" header="Biaya Admin QRIS" :showFilterMatchModes="false" style="min-width: 12rem">
          <template #body="{ data }">{{ data.admin_qris }}</template>
        </Column>

        <Column field="selisih" header="Selisih" :showFilterMatchModes="false" style="min-width: 12rem">
          <template #body="{ data }">{{ data.selisih }}</template>
        </Column>

        <Column field="total_setor" header="Total Setor" :showFilterMatchModes="false" style="min-width: 12rem">
          <template #body="{ data }">{{ data.total_setor }}</template>
        </Column>

        <!-- <Column field="status" header="Status" /> -->
      </DataTable>

    </div>
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
