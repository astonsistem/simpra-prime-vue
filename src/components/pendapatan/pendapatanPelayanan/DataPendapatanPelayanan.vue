<script setup>
import { ref } from 'vue'
import Calendar from 'primevue/calendar'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

const filters = ref({
  tglAwal: null,
  tglAkhir: null,
  jenisPelayanan: null,
  penjamin: null,
  instalasi: null,
  status: null,
})

const jenisPelayananOptions = ['Semua', 'Rawat Jalan', 'Rawat Inap']
const penjaminOptions = ['-- Pilih Penjamin --', 'BPJS', 'Mandiri', 'Asuransi']
const instalasiOptions = ['-- Pilih Instalasi --', 'IGD', 'Poli Umum', 'Poli Gigi']
const statusOptions = ['Semua', 'Selesai', 'Proses', 'Batal']

const data = ref([
  {
    no: 1,
    noPendaftaran: 'REG001234',
    noRM: '',
    nama: '',
    tanggalSelesai: '',
    jenisPelayanan: '',
    caraBayar: '',
    penjamin: '',
    petugas: '',
    jumlahTagihan: '',
    status: '',
  },
])

const resetFilter = () => {
  filters.value = {
    tglAwal: null,
    tglAkhir: null,
    jenisPelayanan: null,
    penjamin: null,
    instalasi: null,
    status: null,
  }
}
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
            placeholder="Jenis Pelayanan"
            class="w-full"
          />
        </div>

        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Penjamin</label>
          <Dropdown
            v-model="filters.penjamin"
            :options="penjaminOptions"
            placeholder="-- Pilih Penjamin --"
            class="w-full"
          />
        </div>

        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Instalasi User</label>
          <Dropdown
            v-model="filters.instalasi"
            :options="instalasiOptions"
            placeholder="-- Pilih Instalasi --"
            class="w-full"
          />
        </div>

        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Status</label>
          <Dropdown
            v-model="filters.status"
            :options="statusOptions"
            placeholder="Status"
            class="w-full"
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
