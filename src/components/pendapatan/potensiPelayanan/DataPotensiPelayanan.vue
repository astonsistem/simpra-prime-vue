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
import ModalSyncPenerimaan from './modal/TarikDataPotensiPelayanan.vue'
import ModalEditPenerimaan from './modal/EditPotensiLainya.vue'
import { useToast } from 'primevue/usetoast'
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

const filters = ref({
  tahunPeriode: '',
  jenisPeriode: '',
  tglAwal: null,
  tglAkhir: null,
  bulanAwal: '',
  bulanAkhir: '',
  caraBayar: '',
  penjamin: '',
  instalasi: '',
})

const tableFilters = ref()

const caraBayarOptions = ref([])
const penjaminOptions = ref([])
const instalasiOptions = ref([])
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
  if (filters.value.tahunPeriode) q.year = filters.value.tahunPeriode
  if (filters.value.jenisPeriode) q.periode = filters.value.jenisPeriode
  if (filters.value.caraBayar) q.cara_bayar = filters.value.caraBayar
  if (filters.value.penjamin) q.penjamin = filters.value.penjamin
  if (filters.value.instalasi) q.instalasi = filters.value.instalasi
  if (filters.value.jenisPeriode === 'tanggal') {
    if (filters.value.tglAwal) q.tgl_awal = filters.value.tglAwal
    if (filters.value.tglAkhir) q.tgl_akhir = filters.value.tglAkhir
  }
  if (filters.value.jenisPeriode === 'bulan') {
    if (filters.value.bulanAwal) q.bulan_awal = filters.value.bulanAwal
    if (filters.value.bulanAkhir) q.bulan_akhir = filters.value.bulanAkhir
  }
  return q
}

const loadData = async (page = 1, pageSize = rows.value) => {
  loading.value = true
  try {
    const query = buildQuery()
    query.page = page
    query.size = pageSize
    const response = await api.get('/potensi_pelayanan', { params: query })
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
  filters.value = {
    tahunPeriode: '',
    jenisPeriode: '',
    tglAwal: null,
    tglAkhir: null,
    bulanAwal: '',
    bulanAkhir: '',
    caraBayar: '',
    penjamin: '',
    instalasi: '',
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

const handleRincian = (item) => {
  console.log('Rincian item:', item)
  // TODO: Implement rincian functionality
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

const fetchInstalasi = async () => {
  try {
    const response = await api.get('/instalasi')
    if (response.data && response.data.items) {
      instalasiOptions.value = response.data.items.map((item) => ({
        label: item.instalasi_nama,
        value: item.instalasi_id,
      }))
    }
  } catch (error) {
    console.error('Gagal memuat data instalasi:', error)
  }
}

const initTableFilters = () => {
  tableFilters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    no_dokumen: { value: null, matchMode: FilterMatchMode.CONTAINS },
    tgl_dokumen: { value: null, matchMode: FilterMatchMode.DATE_IS },
    cara_pembayaran: { value: null, matchMode: FilterMatchMode.CONTAINS },
    penjamin_nama: { value: null, matchMode: FilterMatchMode.CONTAINS },
    uraian: { value: null, matchMode: FilterMatchMode.CONTAINS },
    tgl_pendaftaran: { value: null, matchMode: FilterMatchMode.DATE_IS },
    no_pendaftaran: { value: null, matchMode: FilterMatchMode.CONTAINS },
    nama_pasien: { value: null, matchMode: FilterMatchMode.CONTAINS },
    jumlah: { value: null, matchMode: FilterMatchMode.EQUALS },
    terbayar: { value: null, matchMode: FilterMatchMode.EQUALS },
    sisa_potensi: { value: null, matchMode: FilterMatchMode.EQUALS },
  }
}

const clearTableFilter = () => {
  initTableFilters()
}

onMounted(async () => {
  await fetchCaraBayar()
  await fetchPenjamin()
  await fetchInstalasi()
  loadData(1, rows.value)
  initTableFilters()
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
          <label class="block mb-1 text-sm font-medium text-gray-700">Tahun Periode</label>
          <Select
            v-model="filters.tahunPeriode"
            :options="tahunPeriodeOptions"
            placeholder="Tahun Periode"
            class="w-full"
          />
        </div>
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Jenis Periode</label>
          <Select
            v-model="filters.jenisPeriode"
            :options="jenisPeriodeOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Jenis Periode"
            class="w-full"
          />
        </div>
        <template v-if="filters.jenisPeriode === 'tanggal'">
          <div>
            <label class="block mb-1 text-sm font-medium text-gray-700">Tgl Awal</label>
            <DatePicker v-model="filters.tglAwal" placeholder="Tgl Awal" showIcon class="w-full" />
          </div>
          <div>
            <label class="block mb-1 text-sm font-medium text-gray-700">Tgl Akhir</label>
            <DatePicker
              v-model="filters.tglAkhir"
              placeholder="Tgl Akhir"
              showIcon
              class="w-full"
            />
          </div>
        </template>
        <template v-else-if="filters.jenisPeriode === 'bulan'">
          <div>
            <label class="block mb-1 text-sm font-medium text-gray-700">Bulan Awal</label>
            <Select
              v-model="filters.bulanAwal"
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
              v-model="filters.bulanAkhir"
              :options="bulanOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Bulan Akhir"
              class="w-full"
            />
          </div>
        </template>
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Cara Bayar</label>
          <Select
            v-model="filters.caraBayar"
            :options="caraBayarOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Cara Bayar"
            class="w-full"
          />
        </div>
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Penjamin</label>
          <Select
            v-model="filters.penjamin"
            :options="penjaminOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Penjamin"
            class="w-full"
          />
        </div>
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Instalasi</label>
          <Select
            v-model="filters.instalasi"
            :options="instalasiOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Instalasi"
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
        <h3 class="text-xl font-semibold text-[#17316E]">Data Potensi Pelayanan</h3>
        <div class="flex gap-2">
          <Button
            label="Tambah Data"
            icon="pi pi-plus"
            class="p-button-primary"
            @click="handleAdd"
          />
          <Button
            label="Tarik Data"
            icon="pi pi-refresh"
            class="p-button-success"
            @click="showModalSync = true"
          />
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
        :filters="tableFilters"
        filterDisplay="menu"
        :globalFilterFields="['no_dokumen', 'penjamin_nama', 'nama_pasien', 'uraian']"
      >
        <template #header>
          <div class="flex justify-between">
            <Button
              type="button"
              icon="pi pi-filter-slash"
              label="Clear"
              outlined
              @click="clearTableFilter()"
            />
            <IconField>
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText v-model="tableFilters['global'].value" placeholder="Keyword Search" />
            </IconField>
          </div>
        </template>
        <Column field="no" header="No" style="width: 5%" />
        <Column header="Action" style="width: 15%">
          <template #body="slotProps">
            <SplitButton
              label="Aksi"
              icon="pi pi-ellipsis-v"
              size="small"
              severity="secondary"
              :model="[
                { label: 'Ubah', icon: 'pi pi-pencil', command: () => handleEdit(slotProps.data) },
                {
                  label: 'Terima',
                  icon: 'pi pi-check',
                  command: () => handleTerima(slotProps.data),
                },
                {
                  label: 'Rincian',
                  icon: 'pi pi-list',
                  command: () => handleRincian(slotProps.data),
                },
                {
                  label: 'Hapus',
                  icon: 'pi pi-trash',
                  command: () => handleDelete(slotProps.data),
                },
              ]"
            />
          </template>
        </Column>
        <Column field="no_dokumen" header="No Dokumen" :showFilterMatchModes="false">
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by No Dokumen" />
          </template>
        </Column>
        <Column field="tgl_dokumen" header="Tgl Dokumen" :showFilterMatchModes="false">
          <template #filter="{ filterModel }">
            <DatePicker
              v-model="filterModel.value"
              dateFormat="dd/mm/yy"
              placeholder="dd/mm/yyyy"
            />
          </template>
        </Column>
        <Column field="cara_pembayaran" header="Cara Bayar" :showFilterMatchModes="false">
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by Cara Bayar" />
          </template>
        </Column>
        <Column field="penjamin_nama" header="Penjamin" :showFilterMatchModes="false">
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by Penjamin" />
          </template>
        </Column>
        <Column field="uraian" header="Uraian" :showFilterMatchModes="false">
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by Uraian" />
          </template>
        </Column>
        <Column field="tgl_pendaftaran" header="Tgl Pendaftaran" :showFilterMatchModes="false">
          <template #filter="{ filterModel }">
            <DatePicker
              v-model="filterModel.value"
              dateFormat="dd/mm/yy"
              placeholder="dd/mm/yyyy"
            />
          </template>
        </Column>
        <Column field="no_pendaftaran" header="No Pendaftaran" :showFilterMatchModes="false">
          <template #filter="{ filterModel }">
            <InputText
              v-model="filterModel.value"
              type="text"
              placeholder="Search by No Pendaftaran"
            />
          </template>
        </Column>
        <Column field="nama_pasien" header="Nama Pasien" :showFilterMatchModes="false">
          <template #filter="{ filterModel }">
            <InputText
              v-model="filterModel.value"
              type="text"
              placeholder="Search by Nama Pasien"
            />
          </template>
        </Column>
        <Column
          field="jumlah"
          header="Jumlah"
          style="text-align: right"
          :showFilterMatchModes="false"
        >
          <template #body="slotProps">
            {{ new Intl.NumberFormat('id-ID').format(slotProps.data.jumlah || 0) }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by Jumlah" />
          </template>
        </Column>
        <Column
          field="terbayar"
          header="Terbayar"
          style="text-align: right"
          :showFilterMatchModes="false"
        >
          <template #body="slotProps">
            {{ new Intl.NumberFormat('id-ID').format(slotProps.data.terbayar || 0) }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by Terbayar" />
          </template>
        </Column>
        <Column
          field="sisa_potensi"
          header="Sisa Potensi"
          style="text-align: right"
          :showFilterMatchModes="false"
        >
          <template #body="slotProps">
            {{ new Intl.NumberFormat('id-ID').format(slotProps.data.sisa_potensi || 0) }}
          </template>
          <template #filter="{ filterModel }">
            <InputText
              v-model="filterModel.value"
              type="text"
              placeholder="Search by Sisa Potensi"
            />
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

<style scoped>
.p-datatable .p-datatable-thead > tr > th {
  white-space: nowrap;
  text-align: center;
  padding: 0.5rem 0.75rem;
}
</style>
