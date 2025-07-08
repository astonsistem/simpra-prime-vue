<script setup>
import { ref, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'

const anggarans = ref([])
const loading = ref(true)

// Dummy data for now
const dummyAnggarans = [
  {
    id: 1,
    tahun: 2024,
    kode_rekening: '4.1.1.01.01',
    nama_rekening: 'Pendapatan Asli Daerah',
    jumlah: 1000000000,
  },
  {
    id: 2,
    tahun: 2024,
    kode_rekening: '4.1.1.02.01',
    nama_rekening: 'Pajak Hotel',
    jumlah: 500000000,
  },
]

onMounted(() => {
  anggarans.value = dummyAnggarans
  loading.value = false
})

function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value)
}

function confirmDelete(anggaran) {
  // Implement delete confirmation logic
  console.log('Deleting anggaran:', anggaran)
}
</script>

<template>
  <div class="card">
    <DataTable :value="anggarans" :paginator="true" :rows="10" dataKey="id" :loading="loading">
      <template #header>
        <div class="flex justify-between items-center">
          <h5 class="m-0">Anggaran</h5>
          <Button
            label="Add Anggaran"
            icon="pi pi-plus"
            class="p-button-success"
            @click="$emit('add')"
          />
        </div>
      </template>
      <Column field="tahun" header="Tahun" :sortable="true"></Column>
      <Column field="kode_rekening" header="Kode Rekening" :sortable="true"></Column>
      <Column field="nama_rekening" header="Nama Rekening"></Column>
      <Column field="jumlah" header="Jumlah Anggaran">
        <template #body="slotProps">
          {{ formatCurrency(slotProps.data.jumlah) }}
        </template>
      </Column>
      <Column header="Actions">
        <template #body="slotProps">
          <Button
            icon="pi pi-pencil"
            class="p-button-rounded p-button-success mr-2"
            @click="$emit('edit', slotProps.data)"
          />
          <Button
            icon="pi pi-trash"
            class="p-button-rounded p-button-warning"
            @click="confirmDelete(slotProps.data)"
          />
        </template>
      </Column>
    </DataTable>
  </div>
</template>
