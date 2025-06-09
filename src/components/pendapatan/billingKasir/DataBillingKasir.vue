<script setup>
import { ref } from 'vue'
import Calendar from 'primevue/calendar'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

const filters = ref({
  tahunPeriode: null,
  jenisPeriode: null,
  tglAwal: null,
  tglAkhir: null,
  loketKasir: null,
  bank: null,
  caraPembayaran: null,
  noClosingKasir: '',
})

const tahunPeriodeOptions = ['2023', '2024', '2025']
const jenisPeriodeOptions = ['Bulanan', 'Tahunan']
const loketKasirOptions = ['-- Pilih Loket Kasir --', 'Loket 1', 'Loket 2']
const bankOptions = ['Mandiri', 'BRI', 'BCA']
const caraPembayaranOptions = ['-- Cara Pembayaran --', 'Tunai', 'Kartu Debit', 'Transfer']

const data = ref([
  {
    no: 1,
    noPendaftaran: 'REG001234',
    noRM: '001122',
    nama: 'Budi Santoso',
    tanggalSelesai: '2025-06-01',
    jenisPelayanan: 'Rawat Jalan',
    caraBayar: 'Tunai',
    penjamin: 'Mandiri',
    petugas: 'Admin A',
    jumlahTagihan: '1.500.000',
    status: 'Selesai',
  },
])

const resetFilter = () => {
  filters.value = {
    tahunPeriode: null,
    jenisPeriode: null,
    tglAwal: null,
    tglAkhir: null,
    loketKasir: null,
    bank: null,
    caraPembayaran: null,
    noClosingKasir: '',
  }
}
</script>

<template>
  <div class="p-4">
    <!-- FILTER SECTION -->
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
          <label class="block mb-1 text-sm font-medium text-gray-700">Tgl Awal</label>
          <Calendar v-model="filters.tglAwal" placeholder="Tgl Awal" showIcon class="w-full" />
        </div>

        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Tgl Akhir</label>
          <Calendar v-model="filters.tglAkhir" placeholder="Tgl Akhir" showIcon class="w-full" />
        </div>

        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Jenis Periode</label>
          <Dropdown
            v-model="filters.jenisPeriode"
            :options="jenisPeriodeOptions"
            placeholder="Jenis Periode"
            class="w-full"
          />
        </div>

        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Loket Kasir</label>
          <Dropdown
            v-model="filters.loketKasir"
            :options="loketKasirOptions"
            placeholder="-- Pilih Loket Kasir --"
            class="w-full"
          />
        </div>

        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Bank</label>
          <Dropdown
            v-model="filters.bank"
            :options="bankOptions"
            placeholder="Pilih Bank"
            class="w-full"
          />
        </div>

        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Cara Pembayaran</label>
          <Dropdown
            v-model="filters.caraPembayaran"
            :options="caraPembayaranOptions"
            placeholder="-- Cara Pembayaran --"
            class="w-full"
          />
        </div>

        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">No. Closing Kasir</label>
          <input
            v-model="filters.noClosingKasir"
            type="text"
            placeholder="No. Closing Kasir"
            class="p-inputtext p-component w-full"
          />
        </div>
      </div>

      <div class="mt-4 flex gap-2">
        <Button label="Cari" icon="pi pi-search" class="p-button-info" />
        <Button
          label="Reset Filter"
          icon="pi pi-refresh"
          class="p-button-secondary"
          @click="resetFilter"
        />
      </div>
    </div>

    <!-- DATA TABLE SECTION -->
    <div
      class="bg-white dark:bg-surface-900 rounded-2xl my-6 px-6 py-4 border border-surface-200 dark:border-surface-700 w-full"
    >
      <div class="flex justify-between items-center mb-2">
        <h3 class="text-xl font-semibold text-[#17316E]">Data Pendapatan Pelayanan</h3>
        <div class="flex gap-2">
          <Button label="Tarik Data" icon="pi pi-refresh" class="p-button-success" />
          <Button label="Export Excel" icon="pi pi-file-excel" class="p-button-success" />
        </div>
      </div>

      <DataTable :value="data" responsiveLayout="scroll">
        <Column field="no" header="No" style="width: 3rem" />
        <Column field="noPendaftaran" header="No Pendaftaran" />
        <Column field="noRM" header="No RM" />
        <Column field="nama" header="Nama" />
        <Column field="tanggalSelesai" header="Tanggal Selesai" />
        <Column field="jenisPelayanan" header="Jenis Pelayanan" />
        <Column field="caraBayar" header="Cara Bayar" />
        <Column field="penjamin" header="Penjamin" />
        <Column field="petugas" header="Petugas" />
        <Column field="jumlahTagihan" header="Jumlah Tagihan" />
        <Column field="status" header="Status" />
      </DataTable>
    </div>
  </div>
</template>

<style scoped></style>
