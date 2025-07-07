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
import { useToast } from 'primevue/usetoast'
import ModalSyncPenerimaan from '@/components/ModalSyncPenerimaan.vue'
import ModalEditPenerimaan from '@/components/ModalEditPenerimaan.vue'
import Toast from 'primevue/toast'

const toast = useToast()

const filters = ref({
  tahunPeriode: '',
  jenisPeriode: '',
  tglAwal: null,
  tglAkhir: null,
  bulanAwal: '',
  bulanAkhir: '',
  loketKasir: '',
  bank: '',
  caraPembayaran: '',
  noClosingKasir: '',
  caraBayar: '',
  penjamin: '',
})

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
const loketKasirOptions = ref([
  { label: 'Loket 1', value: 'Loket 1' },
  { label: 'Loket 2', value: 'Loket 2' },
])
const bankOptions = ref([
  { label: 'Mandiri', value: 'Mandiri' },
  { label: 'BRI', value: 'BRI' },
  { label: 'BCA', value: 'BCA' },
])
const caraPembayaranOptions = ref([
  { label: 'Tunai', value: 'Tunai' },
  { label: 'Kartu Debit', value: 'Kartu Debit' },
  { label: 'Transfer', value: 'Transfer' },
])
const caraBayarOptions = ref([])
const penjaminOptions = ref([])

const data = ref([])
const totalRecords = ref(0)
const rows = ref(10)
const first = ref(0)
const loading = ref(false)
const selectedItem = ref(null)
const showModalEdit = ref(false)
const showModalSync = ref(false)

const buildQuery = (page = 1, pageSize = rows.value) => {
  const q = {
    page,
    size: pageSize,
  }
  if (filters.value.tahunPeriode) q.year = filters.value.tahunPeriode
  if (filters.value.loketKasir) q.loket = filters.value.loketKasir
  if (filters.value.bank) q.bank = filters.value.bank
  if (filters.value.caraPembayaran) q.cara_pembayaran = filters.value.caraPembayaran
  if (filters.value.noClosingKasir) q.no_closingkasir = filters.value.noClosingKasir
  if (filters.value.jenisPeriode) q.periode = filters.value.jenisPeriode
  if (filters.value.tglAwal && filters.value.jenisPeriode === 'tanggal')
    q.tgl_awal = filters.value.tglAwal
  if (filters.value.tglAkhir && filters.value.jenisPeriode === 'tanggal')
    q.tgl_akhir = filters.value.tglAkhir
  if (filters.value.bulanAwal && filters.value.jenisPeriode === 'bulan')
    q.bulan_awal = filters.value.bulanAwal
  if (filters.value.bulanAkhir && filters.value.jenisPeriode === 'bulan')
    q.bulan_akhir = filters.value.bulanAkhir
  return q
}

const loadData = async (page = 1, pageSize = rows.value) => {
  loading.value = true
  try {
    const query = buildQuery(page, pageSize)
    // Replace with real API endpoint
    const response = await api.get('/billing_kasir', { params: query })
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
    tahunPeriode: '',
    jenisPeriode: '',
    tglAwal: null,
    tglAkhir: null,
    bulanAwal: '',
    bulanAkhir: '',
    loketKasir: '',
    bank: '',
    caraPembayaran: '',
    noClosingKasir: '',
    caraBayar: '',
    penjamin: '',
  }
  first.value = 0
  loadData(1, rows.value)
}

const searchData = () => {
  first.value = 0
  loadData(1, rows.value)
}

const exportExcel = () => {
  toast.add({
    severity: 'info',
    summary: 'Export',
    detail: 'Export Excel belum diimplementasi',
    life: 2000,
  })
}

const tarikData = () => {
  toast.add({
    severity: 'info',
    summary: 'Tarik Data',
    detail: 'Tarik Data belum diimplementasi',
    life: 2000,
  })
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
    await api.delete(`/billing_kasir/${item.id}`)
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

onMounted(async () => {
  await fetchCaraBayar()
  await fetchPenjamin()
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
        <h3 class="text-xl font-semibold text-[#17316E]">Data Billing Kasir</h3>
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
                  label: 'Bukti Bayar',
                  icon: 'pi pi-file',
                  command: () => handleBuktiBayar(slotProps.data),
                },
                {
                  label: 'Validasi',
                  icon: 'pi pi-check',
                  command: () => handleValidasi(slotProps.data),
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
        <Column field="cara_pembayaran" header="Cara Bayar" />
        <Column field="penjamin_nama" header="Penjamin" />
        <Column field="uraian" header="Uraian" />
        <Column field="tgl_pendaftaran" header="Tgl Pendaftaran" />
        <Column field="no_pendaftaran" header="No Pendaftaran" />
        <Column field="nama_pasien" header="Nama Pasien" />
        <Column field="total" header="Total" style="text-align: right">
          <template #body="slotProps">
            {{ new Intl.NumberFormat('id-ID').format(slotProps.data.total || 0) }}
          </template>
        </Column>
        <Column field="admin_debit" header="Admin Debit" style="text-align: right">
          <template #body="slotProps">
            {{ new Intl.NumberFormat('id-ID').format(slotProps.data.admin_debit || 0) }}
          </template>
        </Column>
        <Column field="admin_kredit" header="Admin Kredit" style="text-align: right">
          <template #body="slotProps">
            {{ new Intl.NumberFormat('id-ID').format(slotProps.data.admin_kredit || 0) }}
          </template>
        </Column>
        <Column field="selisih" header="Selisih" style="text-align: right">
          <template #body="slotProps">
            {{ new Intl.NumberFormat('id-ID').format(slotProps.data.selisih || 0) }}
          </template>
        </Column>
        <Column field="jumlah_netto" header="Jumlah Netto" style="text-align: right">
          <template #body="slotProps">
            {{ new Intl.NumberFormat('id-ID').format(slotProps.data.jumlah_netto || 0) }}
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
