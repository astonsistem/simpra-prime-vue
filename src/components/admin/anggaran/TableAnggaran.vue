<script setup>
import { ref, onMounted } from 'vue'
import { FilterMatchMode } from '@primevue/core/api'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'

const anggarans = ref([])
const loading = ref(true)
const filters = ref()

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
  initFilters()
})

function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value)
}

function confirmDelete(anggaran) {
  // Implement delete confirmation logic
  console.log('Deleting anggaran:', anggaran)
}

const initFilters = () => {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    tahun: { value: null, matchMode: FilterMatchMode.EQUALS },
    kode_rekening: { value: null, matchMode: FilterMatchMode.CONTAINS },
    nama_rekening: { value: null, matchMode: FilterMatchMode.CONTAINS },
    jumlah: { value: null, matchMode: FilterMatchMode.EQUALS },
  }
}

const clearFilter = () => {
  initFilters()
}
</script>

<template>
  <div class="card">
    <DataTable
      :value="anggarans"
      :paginator="true"
      :rows="10"
      dataKey="id"
      :loading="loading"
      :filters="filters"
      filterDisplay="menu"
      :globalFilterFields="['tahun', 'kode_rekening', 'nama_rekening']"
    >
      <template #header>
        <div class="flex justify-between items-center">
          <h5 class="m-0">Anggaran</h5>
          <div class="flex gap-2">
            <Button
              type="button"
              icon="pi pi-filter-slash"
              label="Clear"
              outlined
              @click="clearFilter()"
            />
            <IconField>
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
            </IconField>
            <Button
              label="Add Anggaran"
              icon="pi pi-plus"
              class="p-button-success"
              @click="$emit('add')"
            />
          </div>
        </div>
      </template>
      <Column field="tahun" header="Tahun" :sortable="true" :showFilterMatchModes="false">
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" placeholder="Search by Tahun" />
        </template>
      </Column>
      <Column
        field="kode_rekening"
        header="Kode Rekening"
        :sortable="true"
        :showFilterMatchModes="false"
      >
        <template #filter="{ filterModel }">
          <InputText
            v-model="filterModel.value"
            type="text"
            placeholder="Search by Kode Rekening"
          />
        </template>
      </Column>
      <Column field="nama_rekening" header="Nama Rekening" :showFilterMatchModes="false">
        <template #filter="{ filterModel }">
          <InputText
            v-model="filterModel.value"
            type="text"
            placeholder="Search by Nama Rekening"
          />
        </template>
      </Column>
      <Column field="jumlah" header="Jumlah Anggaran" :showFilterMatchModes="false">
        <template #body="slotProps">
          {{ formatCurrency(slotProps.data.jumlah) }}
        </template>
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" placeholder="Search by Jumlah" />
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
