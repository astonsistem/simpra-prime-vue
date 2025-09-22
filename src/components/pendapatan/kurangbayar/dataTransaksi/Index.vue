<template>
  <FilterDataTable @search="searchData" @openSyncDialog="openSyncDialog" />
  <div>
    <div
      class="bg-surface-0 dark:bg-surface-900 rounded-2xl mb-6 px-6 py-4 md:px-6 md:py-3 border-b md:border border-surface-200 dark:border-surface-700 w-full sticky top-0 z-30">
      <div class="flex justify-between items-center mb-2">
        <h3 class="text-xl font-semibold text-[#17316E]">Data Transaksi</h3>
        <div class="flex gap-2">
          <Button label="Tambah Data" icon="pi pi-plus" class="p-button-primary" @click="add" />
          <Button label="Export Excel" icon="pi pi-file-excel" class="p-button-success" @click="exportExcel" />
        </div>
      </div>
      <DataTable :filters="filters" :value="items" :loading="loading" responsiveLayout="scroll" paginator lazy
        :totalRecords="totalRecords" :rows="rows" :first="first" :rowsPerPageOptions="[5, 10, 20, 50, 100, 1000]"
        @page="onPageChange" @filter="onFilter" dataKey="id" filterDisplay="menu" :globalFilterFields="[
          'noBukti',
          'noSetor',
          'penyetor',
          'jenis',
          'rekeningDpa',
        ]" class="p-datatable-sm">
        <template #header>
          <div class="flex justify-between">
            <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined @click="clearFilter()" />
          </div>
        </template>

        <template #empty>
          <div class="flex items-center text-gray-500 min-h-24">
            <i class="pi pi-info-circle mr-2" style="font-size: 1.5rem"></i>
            <p>Data Kosong</p>
          </div>
        </template>

        <Column field="no" header="No" style="width: 5%;">
          <template #body="{ index }">{{ first + index + 1}}</template>
        </Column>

        <Column field="no_buktibayar" header="No Bukti" :showFilterMatchModes="false" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.no_buktibayar }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by No Bukti" />
          </template>
        </Column>

        <Column field="tgl_buktibayar" header="Tanggal Bukti" :showFilterMatchModes="false" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.tgl_buktibayar }}
          </template>
          <template #filter="{ filterModel }">
            <DatePicker v-model="filterModel.value" dateFormat="yy-mm-dd" placeholder="yyyy-dd-mm" />
          </template>
        </Column>

        <Column field="tglSetor" header="Tanggal Setor" :showFilterMatchModes="false" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.tglSetor }}
          </template>
          <template #filter="{ filterModel }">
            <DatePicker v-model="filterModel.value" dateFormat="yy-mm-dd" placeholder="yyyy-dd-mm" />
          </template>
        </Column>

        <Column field="noSetor" header="No Setor" :showFilterMatchModes="false" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.noSetor }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by No Setor" />
          </template>
        </Column>

        <Column field="penyetor" header="Penyetor" :showFilterMatchModes="false">
          <template #body="{ data }">
            {{ data.penyetor }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Cari Penyetor" />
          </template>
        </Column>

        <Column field="jenis" header="Jenis" :showFilterMatchModes="false">
          <template #body="{ data }">
            {{ data.jenis }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Cari Jenis" />
          </template>
        </Column>

        <Column field="rekeningDpa" header="Rekening DPA" :showFilterMatchModes="false" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.rekeningDpa }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by Rekening DPA" />
          </template>
        </Column>

        <Column field="jumlah" header="Jumlah" style="text-align: right">
          <template #body="slotProps">
            {{ formatCurrency(slotProps.data.jumlah) }}
          </template>
          <template #filter="{ filterModel }">
            <InputNumber v-model="filterModel.value" locale="id-ID" placeholder="masukkan Jumlah" />
          </template>
        </Column>
      </DataTable>
    </div>
  </div>

  <ModalForm v-model="modalForm" />
</template>

<script setup>
import FilterDataTable from '@/components/FilterDataTable.vue';
import { formatCurrency } from '@/utils/utils';
import useDataTransaksi from  '@/composables/useDataTransaksi';
import ModalForm from './Form.vue';
import { ref, onMounted } from 'vue';

const { items, meta, loading, loadData } = useDataTransaksi()
const emit = defineEmits(['search', 'openSyncDialog'])
const modalForm = ref(false)

onMounted( () => {
  // await loadData()
})

function searchData () {

}

function add () {
  modalForm.value = true
}

function openSyncDialog () {
  emit('openSyncDialog')
}
</script>
