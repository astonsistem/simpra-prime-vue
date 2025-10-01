<template>
  <FilterDataTable @search="searchData"></FilterDataTable>
  <div>
    <div
      class="bg-surface-0 dark:bg-surface-900 rounded-2xl mb-6 px-6 py-4 md:px-6 md:py-3 border-b md:border border-surface-200 dark:border-surface-700 w-full sticky top-0 z-30">
      <div class="flex justify-between items-center mb-2">
        <h3 class="text-xl font-semibold text-[#17316E]">Data Rekening Koran</h3>
      </div>
      <DataTable :filters="filters" :value="items" :loading="loading" responsiveLayout="scroll" paginator lazy
        showGridlines :totalRecords="total" :rows="rows" :first="first" :rowsPerPageOptions="[5, 10, 20, 50, 100, 1000]"
        @page="onPageChange" @filter="onTableUpdate" @sort="onTableUpdate" dataKey="id" filterDisplay="menu"
        currentPageReportTemplate="{first} to {last} of {totalRecords}" size="small"
        :rowStyle="rowStyle" :globalFilterFields="[
          'noBukti',
          'noSetor',
          'penyetor',
          'jenis',
          'rekeningDpa',
        ]" class="p-datatable-sm text-sm">
        <template #header>
          <div class="flex justify-between">
            <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined @click="clearFilter()" />
            <div class="flex gap-2">
              <Button label="Request Data dari Bank JATIM" icon="pi pi-sync" severity="info" size="small" class="p-button-border" @click="handleRequest" />
              <Button label="Import Bank Pilihan" icon="pi pi-search" severity="help" size="small" @click="handleImport" />
              <Button label="Export" icon="pi pi-file-excel" class="p-button-success" size="small" @click="handleExportExcel" />
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
                label: 'Ubah',
                icon: 'pi pi-pencil',
                // visible: () => !slotProps.data.is_valid,
                command: () => handleEdit(slotProps.data)
              },
              {
                label: 'PB',
                icon: 'pi pi-check',
                // visible: () => !slotProps.data.is_valid,
                command: () => handlePB(slotProps.data),
              },
              {
                label: 'BKU',
                icon: 'pi pi-dollar',
                // visible: () => !!slotProps.data.is_valid,
                command: () => handleBKU(slotProps.data),
              }

            ]" />

          </template>
        </Column>

        <Column field="no_rc" header="No. RC" sortable :showFilterMatchModes="false" :showClearButton="true"
          style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.no_rc }}
          </template>
          <template #filter="{ filterModel, applyFilter }">
            <InputText v-model="filterModel.value" @keyup.enter="applyFilter" placeholder="Search by No. RC" />
          </template>
        </Column>

        <Column field="tgl_rc" header="Tgl. RC" sortable :showFilterMatchModes="false" :showClearButton="true"
          style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.tgl_rc }}
          </template>
          <template #filter="{ filterModel, applyFilter }">
            <DatePicker v-model="filterModel.value" dateFormat="yy-mm-dd" placeholder="yyyy-dd-mm" />
          </template>
        </Column>

        <Column field="uraian" header="Uraian" sortable :showFilterMatchModes="false" :showClearButton="true">
          <template #body="{ data }">
            {{ data.uraian }}
          </template>
          <template #filter="{ filterModel, applyFilter }">
            <InputText v-model="filterModel.value" @keyup.enter="applyFilter" placeholder="Cari Uraian" />
          </template>
        </Column>

        <Column field="akun_data" header="Klarifikasi Monev" sortable :showFilterMatchModes="false" :showClearButton="true">
          <template #body="{ data }">
            {{ data.akun_data?.akun_nama }}
          </template>
          <template #filter="{ filterModel, applyFilter }">
            <InputText v-model="filterModel.value" @keyup.enter="applyFilter" placeholder="Cari Klarifikasi Monev" />
          </template>
        </Column>

        <Column field="akunls_data" header="Verifikasi Langsung" sortable :showFilterMatchModes="false" :showClearButton="true">
          <template #body="{ data }">
            {{ data.akunls_data?.akunls_nama }}
          </template>
          <template #filter="{ filterModel, applyFilter }">
            <InputText v-model="filterModel.value" @keyup.enter="applyFilter" placeholder="Cari Verifikasi Langsung" />
          </template>
        </Column>

        <Column field="bank" header="Bank" sortable :showFilterMatchModes="false" :showClearButton="true"
          style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.bank }}
          </template>
          <template #filter="{ filterModel, applyFilter }">
            <InputText v-model="filterModel.value" @keyup.enter="applyFilter" placeholder="Search by Bank" />
          </template>
        </Column>

        <Column field="pb" header="PB dari Bank" sortable :showFilterMatchModes="false"
          :showClearButton="true" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.pb }}
          </template>
          <template #filter="{ filterModel, applyFilter }">
            <InputText v-model="filterModel.value" @keyup.enter="applyFilter"
              placeholder="Search by PB dari Bank" />
          </template>
        </Column>

        <Column field="debit" header="Debit" sortable :showFilterMatchModes="false" :showClearButton="true"
          style="text-align: right">
          <template #body="slotProps">
            {{ formatCurrency(slotProps.data.debit) }}
          </template>
          <template #filter="{ filterModel, applyFilter }">
            <InputNumber v-model="filterModel.value" @keyup.enter="applyFilter" locale="id-ID"
              placeholder="masukkan Debit" />
          </template>
        </Column>

        <Column field="kredit" header="Kredit" sortable :showFilterMatchModes="false" :showClearButton="true"
          style="text-align: right">
          <template #body="slotProps">
            {{ formatCurrency(slotProps.data.kredit) }}
          </template>
          <template #filter="{ filterModel, applyFilter }">
            <InputNumber v-model="filterModel.value" @keyup.enter="applyFilter" locale="id-ID"
              placeholder="masukkan Kredit" />
          </template>
        </Column>

        <Column field="terklarifikasi" header="Terklarifikasi" sortable :showFilterMatchModes="false" :showClearButton="true"
          style="text-align: right">
          <template #body="slotProps">
            {{ formatCurrency(slotProps.data.terklarifikasi) }}
          </template>
          <template #filter="{ filterModel, applyFilter }">
            <InputNumber v-model="filterModel.value" @keyup.enter="applyFilter" locale="id-ID"
              placeholder="masukkan Terklarifikasi" />
          </template>
        </Column>

        <Column field="belum_terklarifikasi" header="Belum Terklarifikasi" sortable :showFilterMatchModes="false" :showClearButton="true"
          style="text-align: right">
          <template #body="slotProps">
            {{ formatCurrency(slotProps.data.belum_terklarifikasi) }}
          </template>
          <template #filter="{ filterModel, applyFilter }">
            <InputNumber v-model="filterModel.value" @keyup.enter="applyFilter" locale="id-ID"
              placeholder="masukkan Belum Terklarifikasi" />
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
        <template #paginatorstart>
          <span class="current-page-report">
            Showing {{ first + 1 }} to {{ first + rows }} of {{ total }} entries
          </span>
        </template>
      </DataTable>
    </div>
  </div>

  <RequestBankJatim v-model="modalRequest" />
  <ImportBankPilihan v-model="modalImport" @sync="() => loadData()" />

  <FormDataTransaksi v-model="modalForm" :item="selectedItem" @saved="onSaved" /> 

  <Dialog :visible="showModalCancelValidasi" @update:visible="showModalCancelValidasi = $event" modal
    header="Konfirmasi Batal Validasi" :closable="true" :style="{ width: '400px' }">
    <div class="p-4">
      <p>Apakah Anda yakin ingin membatalkan validasi data ini ?</p>
      <div class="flex justify-end gap-2 pt-4">
        <Button label="Ya, Batalkan Validasi" class="p-button-warning" @click="handleCancelValidasi" />
        <Button label="Tidak" class="p-button-secondary" @click="() => (showModalCancelValidasi = false)" />
      </div>
    </div>
  </Dialog>

  <Toast group="confirm" position="center">
    <template #message="slotProps">
      <div class="flex flex-col flex-1">
        <div class="text-center font-bold text-lg mb-2">
          {{ slotProps.message.summary }}
        </div>
        <div class="text-center text-sm mb-4">
          {{ slotProps.message.detail }}
        </div>
        <div class="flex gap-2">
          <Button label="Hapus" class="p-button-danger w-full" @click="onConfirmDelete(slotProps.message)"></Button>
          <Button label="Batal" class="p-button-text w-full" @click="toast.removeGroup('confirm')"></Button>
        </div>
      </div>
    </template>
  </Toast>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { formatCurrency } from '@/utils/utils';
import useRekeningKoran from '@/composables/useRekeningKoran';
import useDataTransaksiActions from '@/composables/selisih/useDataTransaksiActions';
import FilterDataTable from '@/components/FilterDataTable.vue';
import RequestBankJatim from './RequestBankJatim.vue';
import ImportBankPilihan from './ImportBankPilihan.vue';

const modalForm = ref(false)
const selectedItem = ref(null)
const toast = useToast()
const showModalValidasi = ref(false)
const showModalSetor = ref(false)
const showModalCancelValidasi = ref(false)
const modalRequest = ref(false)
const modalImport = ref(false)

const { create, show, destroy } = useDataTransaksiActions()
const { 
  items,
  first,
  rows,
  total,
  filters,
  sort,
  clearFilter,
  setAdditionalFilter,
  loading,
  loadData,
  update: onTableUpdate,
  onPageChange,
  exportExcel 
} = useRekeningKoran()

const emit = defineEmits(['search', 'openSyncDialog'])

onMounted(async () => {
  await loadData()
})

function searchData(data) {
  setAdditionalFilter(data)
  loadData()
}

function onSaved() {
  loadData({
    ...sort.value
  })
}

function handleRequest () {
  modalRequest.value = true
}

function handleImport() {
  modalImport.value = true
}

function handleExportExcel() {
  exportExcel()
}

function handleEdit(item) {
  show(item).then((data) => {
    selectedItem.value = data
    modalForm.value = true
  })
}

function handlePB(item) {
  selectedItem.value = item
  showModalValidasi.value = true
}

function handleBKU(item) {
  selectedItem.value = item
  showModalSetor.value = true
}



function handleDelete(item) {
  toast.add({
    severity: 'warn',
    summary: 'Konfirmasi Hapus',
    detail: 'Apakah Anda yakin ingin menghapus data ini?',
    group: 'confirm',
    data: {
      id: item.id,
    },
  })
}

function onConfirmDelete(event) {
  destroy(event.data).then(() => {
    loadData()
    toast.removeGroup('confirm')
  })
}

function rowStyle(rowData) {
  if (rowData.is_valid === true) return { backgroundColor: '#e4f6e8', color: '#419e56' }
}


</script>
