<script setup>
import { ref, onMounted } from 'vue'
import DatePicker from 'primevue/datepicker'
import Select from 'primevue/select'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import SplitButton from 'primevue/splitbutton'
import Menu from 'primevue/menu'
import api from '@/services/http.js'
import ModalSyncPenerimaan from '../potensiLainya/modal/TarikDataPotensiLainya.vue'
import ModalEditPenerimaan from '../potensiLainya/modal/EditPotensiLainya.vue'
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
  pihak3: '',
  uraian: '',
})

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
  if (filters.value.pihak3) q.pihak3 = filters.value.pihak3
  if (filters.value.uraian) q.uraian = filters.value.uraian
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
  filters.value = {
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
          <label class="block mb-1 text-sm font-medium text-gray-700">Pihak 3</label>
          <InputText v-model="filters.pihak3" placeholder="Pihak 3" class="w-full" />
        </div>
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Uraian</label>
          <InputText v-model="filters.uraian" placeholder="Uraian" class="w-full" />
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
        <h3 class="text-xl font-semibold text-[#17316E]">Data Potensi Lainnya</h3>
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
      >
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
                  label: 'Hapus',
                  icon: 'pi pi-trash',
                  command: () => handleDelete(slotProps.data),
                },
              ]"
            />
          </template>
        </Column>
        <Column field="no_dokumen" header="No Dokumen" />
        <Column field="tgl_dokumen" header="Tgl Dokumen" />
        <Column field="pihak3" header="Pihak ke-3" />
        <Column field="uraian" header="Uraian" />
        <Column field="tgl_berlaku" header="Tgl Berlaku" />
        <Column field="tgl_akhir" header="Tgl Berakhir" />
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
        <Column field="sisa" header="Sisa Potensi" style="text-align: right">
          <template #body="slotProps">
            {{ new Intl.NumberFormat('id-ID').format(slotProps.data.sisa || 0) }}
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

.p-datatable .p-datatable-tbody > tr > td {
  white-space: nowrap;
  padding: 0.5rem 0.75rem;
  vertical-align: middle;
}
</style>
