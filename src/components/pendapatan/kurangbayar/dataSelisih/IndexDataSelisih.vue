<template>
  <FilterDataTable @search="searchData"/>
  <div>
    <div
      class="bg-surface-0 dark:bg-surface-900 rounded-2xl mb-6 px-6 py-4 md:px-6 md:py-3 border-b md:border border-surface-200 dark:border-surface-700 w-full sticky top-0 z-30">
      <div class="flex justify-between items-center mb-2">
      </div>
      <DataTable :filters="filters" :value="items" :loading="loading" responsiveLayout="scroll" paginator lazy
        showGridlines stripedRows :totalRecords="total" :rows="rows" :first="first" :rowsPerPageOptions="[5, 10, 20, 50, 100, 1000]"
        @page="onPageChange" @filter="onTableUpdate" @sort="onTableUpdate" dataKey="id" filterDisplay="menu"
        currentPageReportTemplate="{first} to {last} of {totalRecords}"
        :rowStyle="rowStyle" :globalFilterFields="[
          'no_bukti',
          'penyetor',
          'jenis',
          'rekening_dpa',
          'tgl_setor',
          'tgl_bukti',
        ]" class="p-datatable-sm">
        <template #header>
          <div class="flex justify-between">
            <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined @click="clearFilter()" />
            <div class="flex gap-2">
              <Button label="Export Excel" icon="pi pi-file-excel" class="p-button-success" @click="handleExportExcel" />
            </div>
          </div>
        </template>

        <template #empty>
          <div class="flex items-center text-gray-500 min-h-24">
            <i class="pi pi-info-circle mr-2" style="font-size: 1.5rem"></i>
            <p>Data Kosong</p>
          </div>
        </template>

        <Column field="no" header="No" style="width: 5%;text-align: center">
          <template #body="{ index }">{{ first + index + 1 }}</template>
        </Column>

        <Column header="Action" style="width: 15%">
          <template #body="slotProps">
            <SplitButton label="Aksi" size="small" severity="secondary" :model="[
              {
                label: 'Setor',
                icon: 'pi pi-pencil',
                // visible: () => !dataTransaksiExists(slotProps.data),
                command: () => handleSetor(slotProps.data),
              },
              {
                label: 'Rincian Setor',
                icon: 'pi pi-send',
                // visible: () => !!slotProps.data.is_valid,
                command: () => handleRincianSetor(slotProps.data),
              },

            ]" />

          </template>
        </Column>

        <Column field="tgl_setor" header="Tgl. Setor" sortable :showFilterMatchModes="false" :showClearButton="true"
          style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.tgl_setor }}
          </template>
          <template #filter="{ filterModel, applyFilter }">
            <DatePicker v-model="filterModel.value" dateFormat="yy-mm-dd" placeholder="yyyy-dd-mm" />
          </template>
        </Column>

        <Column field="no_bukti" header="No. Bukti" sortable :showFilterMatchModes="false" :showClearButton="true"
          style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.no_bukti }}
          </template>
          <template #filter="{ filterModel, applyFilter }">
            <InputText v-model="filterModel.value" @keyup.enter="applyFilter" placeholder="Search by No Bukti" />
          </template>
        </Column>

        <Column field="tgl_bukti" header="Tgl. Bukti" sortable :showFilterMatchModes="false"
          :showApplyButton="false" :showClearButton="true" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.tgl_bukti }}
          </template>
          <template #filter="{ filterModel, applyFilter }">
            <DatePicker v-model="filterModel.value" @update:modelValue="applyFilter" dateFormat="yy-mm-dd"
              placeholder="yyyy-dd-mm" />
          </template>
        </Column>

        <Column field="penyetor" header="Penyetor" sortable :showFilterMatchModes="false" :showClearButton="true">
          <template #body="{ data }">
            {{ data.penyetor }}
          </template>
          <template #filter="{ filterModel, applyFilter }">
            <InputText v-model="filterModel.value" @keyup.enter="applyFilter" placeholder="Cari Penyetor" />
          </template>
        </Column>

        <Column field="jenis" header="Jenis" sortable :showFilterMatchModes="false" :showClearButton="true">
          <template #body="{ data }">
            {{ data.jenis }}
          </template>
          <template #filter="{ filterModel, applyFilter }">
            <InputText v-model="filterModel.value" @keyup.enter="applyFilter" placeholder="Cari Jenis" />
          </template>
        </Column>

        <Column field="rekening_dpa" header="Rekening DPA" :showFilterMatchModes="false"
          :showClearButton="true" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.rekening_dpa?.rek_nama ?? '' }}
          </template>
          <template #filter="{ filterModel, applyFilter }">
            <InputText v-model="filterModel.value" @keyup.enter="applyFilter" placeholder="Search by Rekening DPA" />
          </template>
        </Column>

        <Column field="nilai" header="Nilai" sortable :showFilterMatchModes="false" :showClearButton="true"
          style="text-align: right">
          <template #body="slotProps">
            {{ formatCurrency(slotProps.data.nilai) }}
          </template>
          <template #filter="{ filterModel, applyFilter }">
            <InputNumber v-model="filterModel.value" @keyup.enter="applyFilter" locale="id-ID"
              placeholder="Masukkan Nilai" />
          </template>
        </Column>

        <Column field="tersetor" header="Tersetor" sortable :showFilterMatchModes="false" :showClearButton="true"
          style="text-align: right">
          <template #body="slotProps">
            {{ formatCurrency(slotProps.data.tersetor) }}
          </template>
          <template #filter="{ filterModel, applyFilter }">
            <InputNumber v-model="filterModel.value" @keyup.enter="applyFilter" locale="id-ID"
              placeholder="Masukkan Tersetor" />
          </template>
        </Column>
        <template #paginatorstart>
          <span class="current-page-report">
            Showing {{ first + 1 }} to {{ first + rows }} of {{ total }} entries
          </span>
        </template>
      </DataTable>
    </div>
  </div>

  <FormDataSelisih v-model="modalForm" :item="selectedItem" @saved="onSaved" />
    
  <RincianSetor
      v-model="showModalSetor"
      :item="selectedItem"
      :items="selectedItem?.data_transaksi || []"
      @deleted="onDeletedRincianSetor"
      @update:modalValue="() => {
        selectedItem = null
        loadData()
      }"
  ></RincianSetor>

</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { formatCurrency } from '@/utils/utils';
import useDataSelisih from '@/composables/selisih/useDataSelisih';
import useDataSelisihActions from '@/composables/selisih/useDataSelisihActions';
import FilterDataTable from '@/components/FilterDataTable.vue';
import FormDataSelisih from './FormDataSelisih.vue';
import RincianSetor from './RincianSetor.vue'


const modalForm = ref(false)
const selectedItem = ref(null)

const toast = useToast()
const showModalSetor = ref(false)

const { show } = useDataSelisihActions()
const { 
  items,
  first,
  rows,
  total,
  filters,
  sort,
  clearFilter,
  loading,
  loadData,
  searchData,
  update: onTableUpdate,
  onPageChange,
  exportExcel 
} = useDataSelisih()

onMounted(async () => {
  await loadData()
})


function onSaved() {
  loadData({
    ...sort.value
  })
  
  setTimeout(() => {
    if(selectedItem.value) {
      handleRincianSetor(selectedItem.value)
    }
  }, 300)
}

function handleExportExcel() {
  exportExcel()
}

function handleSetor(item) {
  show(item).then((data) => {
    selectedItem.value = data.data
    modalForm.value = true
  })
}

function handleRincianSetor(item) {
  show(item).then((data) => {
    selectedItem.value = data.data
    selectedItem.value.data_transaksi = data.data_transaksi
    showModalSetor.value = true
  })
}

function onDeletedRincianSetor() {
   show(selectedItem.value).then((data) => {
    selectedItem.value = data.data
    selectedItem.value.data_transaksi = data.data_transaksi
  })
}

function dataTransaksiExists(rowData) {
  return (rowData.data_transaksi_exists === true)
}

function rowStyle(rowData) {
  if ( dataTransaksiExists(rowData) ) return { backgroundColor: '#e4f6e8', color: '#419e56' }
}


</script>
