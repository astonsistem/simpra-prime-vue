<script setup>
import { ref, onMounted } from 'vue'
import Calendar from 'primevue/calendar'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import SplitButton from 'primevue/splitbutton'
import api from '@/services/http.js'
import { useToast } from 'primevue/usetoast'

const toast = useToast()

const filters = ref({
  tahunPeriode: '',
  jenisPeriode: '',
  tglAwal: null,
  tglAkhir: null,
  bulanAwal: '',
  bulanAkhir: '',
  sumberTransaksi: '',
  caraPembayaran: '',
  bank: '',
  uraian: '',
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
  { label: 'Tunai', value: 'TUNAI' },
  { label: 'Jatim', value: 'JATIM' },
  { label: 'Mandiri', value: 'MANDIRI' },
  { label: 'BCA', value: 'BCA' },
])
const caraPembayaranOptions = ref([
  { label: 'Tunai', value: 'TUNAI' },
  { label: 'Transfer', value: 'TRANSFER' },
  { label: 'QRIS', value: 'QRIS' },
  { label: 'EDC', value: 'EDC' },
])

const data = ref([])
const totalRecords = ref(0)
const rows = ref(10)
const first = ref(0)
const loading = ref(false)

const sumberTransaksiOptions = [
  { label: '118', value: '118' },
  { label: 'SWAB', value: 'SWAB' },
]

const buildQuery = (page = 1, pageSize = rows.value) => {
  const q = {
    page,
    size: pageSize,
  }
  if (filters.value.tahunPeriode) q.year = filters.value.tahunPeriode
  if (filters.value.sumberTransaksi) q.sumber_transaksi = filters.value.sumberTransaksi
  if (filters.value.caraPembayaran) q.cara_pembayaran = filters.value.caraPembayaran
  if (filters.value.bank) q.bank = filters.value.bank
  if (filters.value.uraian) q.uraian = filters.value.uraian
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
    // Use correct API endpoint for BillingSwa
    const response = await api.get('/billing_swa', { params: query })
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
    sumberTransaksi: '',
    caraPembayaran: '',
    bank: '',
    uraian: '',
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

const handleEdit = (item) => {
  toast.add({
    severity: 'info',
    summary: 'Edit',
    detail: `Edit data: ${item.no_buktibayar || ''}`,
    life: 2000,
  })
}
const handleValidasi = (item) => {
  toast.add({
    severity: 'info',
    summary: 'Validasi',
    detail: `Validasi data: ${item.no_buktibayar || ''}`,
    life: 2000,
  })
}
const handleDelete = (item) => {
  toast.add({
    severity: 'warn',
    summary: 'Hapus',
    detail: `Hapus data: ${item.no_buktibayar || ''}`,
    life: 2000,
  })
}

onMounted(() => {
  loadData(1, rows.value)
})
</script>

<template>
  <div class="p-4">
    <div
      class="bg-white dark:bg-surface-900 rounded-2xl mb-6 px-6 py-4 border border-surface-200 dark:border-surface-700 w-full"
    >
      <h3 class="text-xl font-semibold text-[#17316E] mb-4">Filter Data</h3>
      <div class="grid grid-cols-3 gap-4">
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Tahun Periode</label>
          <Dropdown
            v-model="filters.tahunPeriode"
            :options="tahunPeriodeOptions"
            placeholder="Pilih Tahun"
            class="w-full"
          />
        </div>
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Jenis Periode</label>
          <Dropdown
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
            <Calendar v-model="filters.tglAwal" placeholder="Tgl Awal" showIcon class="w-full" />
          </div>
          <div>
            <label class="block mb-1 text-sm font-medium text-gray-700">Tgl Akhir</label>
            <Calendar v-model="filters.tglAkhir" placeholder="Tgl Akhir" showIcon class="w-full" />
          </div>
        </template>
        <template v-else-if="filters.jenisPeriode === 'bulan'">
          <div>
            <label class="block mb-1 text-sm font-medium text-gray-700">Bulan Awal</label>
            <Dropdown
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
            <Dropdown
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
          <label class="block mb-1 text-sm font-medium text-gray-700">Sumber Transaksi</label>
          <Dropdown
            v-model="filters.sumberTransaksi"
            :options="sumberTransaksiOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="-- Pilih Sumber Transaksi --"
            class="w-full"
          />
        </div>
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Cara Pembayaran</label>
          <Dropdown
            v-model="filters.caraPembayaran"
            :options="caraPembayaranOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="-- Cara Pembayaran --"
            class="w-full"
          />
        </div>
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Bank</label>
          <Dropdown
            v-model="filters.bank"
            :options="bankOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Pilih Bank"
            class="w-full"
          />
        </div>
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Uraian</label>
          <input
            v-model="filters.uraian"
            type="text"
            placeholder="Uraian"
            class="p-inputtext p-component w-full"
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
      class="bg-white dark:bg-surface-900 rounded-2xl my-6 px-6 py-4 border border-surface-200 dark:border-surface-700 w-full"
    >
      <div class="flex justify-between items-center mb-2">
        <h3 class="text-xl font-semibold text-[#17316E]">Data Billing Kasir</h3>
        <div class="flex gap-2">
          <Button
            label="Tarik Data"
            icon="pi pi-refresh"
            class="p-button-success"
            @click="tarikData"
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
        <Column header="Action" style="width: 10%">
          <template #body="slotProps">
            <SplitButton
              label="Aksi"
              icon="pi pi-ellipsis-v"
              size="small"
              severity="secondary"
              :model="[
                { label: 'Edit', icon: 'pi pi-pencil', command: () => handleEdit(slotProps.data) },
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
        <Column field="no_bayar" header="No Bayar" />
        <Column field="tgl_bayar" header="Tgl Bayar" />
        <Column field="pihak3" header="Pasien" />
        <Column field="uraian" header="Uraian" />
        <Column field="no_dokumen" header="No Dokumen" />
        <Column field="tgl_dokumen" header="Tgl Dokumen" />
        <Column field="sumber_transaksi" header="Sumber Transaksi" />
        <Column field="metode_pembayaran" header="Metode Bayar" />
        <Column field="cara_pembayaran" header="Cara Pembayaran" />
        <Column field="bank_tujuan" header="Bank" />
        <Column field="total" header="Jumlah Bruto" />
        <Column field="admin_kredit" header="Biaya Admin EDC" />
        <Column field="admin_debit" header="Biaya Admin QRIS" />
        <Column field="selisih" header="Selisih" />
        <Column field="jumlah_netto" header="Jumlah Netto" />
      </DataTable>
    </div>
    <Toast />
  </div>
</template>

<style scoped></style>
