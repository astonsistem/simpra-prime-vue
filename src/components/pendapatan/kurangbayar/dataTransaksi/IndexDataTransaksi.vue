<template>
  <FilterDataTable @search="searchData" @openSyncDialog="openSyncDialog" />
  <div>
    <div
      class="bg-surface-0 dark:bg-surface-900 rounded-2xl mb-6 px-6 py-4 md:px-6 md:py-3 border-b md:border border-surface-200 dark:border-surface-700 w-full sticky top-0 z-30">
      <DataTable :filters="filters" :value="items" :loading="loading" responsiveLayout="scroll" paginator lazy
        showGridlines :totalRecords="total" :rows="rows" :first="first" :rowsPerPageOptions="[5, 10, 20, 50, 100, 1000]"
        @page="onPageChange" @filter="onTableUpdate" @sort="onTableUpdate" dataKey="id" filterDisplay="menu"
        currentPageReportTemplate="{first} to {last} of {totalRecords}"
        :rowStyle="rowStyle" :globalFilterFields="[
          'noBukti',
          'noSetor',
          'penyetor',
          'jenis',
          'rekeningDpa',
        ]" class="p-datatable-sm">
        <template #header>
          <div class="flex justify-between">
            <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined @click="clearFilter()" />
            <div class="flex gap-2">
              <Button label="Tambah Data" icon="pi pi-plus" class="p-button-primary" @click="handleAdd" />
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

        <Column field="is_valid" sortable :showFilterMatchModes="false" :showApplyButton="false"
          style="width: 10%; text-align: center">
          <template #header>
            &nbsp;
          </template>
          <template #body="{ data }">
            <i v-if="data.is_valid" class="pi pi-check-circle text-green-500 cursor-pointer" @click="confirmCancelValidasi(data)"></i>
            <i v-else class="pi pi-check-circle text-gray-300 cursor-pointer" @click="handleValidasi(data)"></i>
          </template>
          <template #filter="{ filterModel, applyFilter }">
            <ToggleSwitch v-model="filterModel.value" @update:modelValue="applyFilter" />
            <span>{{ filterModel.value ? 'Tervalidasi' : 'Belum Tervalidasi' }}</span>
          </template>
        </Column>
        <Column header="Action" style="width: 15%">
          <template #body="slotProps">
            <SplitButton label="Aksi" size="small" severity="secondary" :model="[
              {
                label: 'Ubah',
                icon: 'pi pi-pencil',
                visible: () => !slotProps.data.is_valid,
                command: () => handleEdit(slotProps.data)
              },
              {
                label: 'Validasi',
                icon: 'pi pi-check',
                visible: () => !slotProps.data.is_valid,
                command: () => handleValidasi(slotProps.data),
              },
              {
                label: 'Setor',
                icon: 'pi pi-dollar',
                visible: () => !!slotProps.data.is_valid,
                command: () => handleSetor(slotProps.data),
              },
              {
                label: 'Batal Validasi',
                icon: 'pi pi-times-circle',
                style: () => ({ color: 'red' }),
                visible: () => !!slotProps.data.is_valid,
                command: () => confirmCancelValidasi(slotProps.data),
              },
              {
                label: 'Hapus',
                icon: 'pi pi-trash',
                visible: () => !slotProps.data.is_valid,
                command: () => handleDelete(slotProps.data),
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

        <Column field="no_buktibayar" header="No. Bukti" sortable :showFilterMatchModes="false" :showClearButton="true"
          style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.no_buktibayar }}
          </template>
          <template #filter="{ filterModel, applyFilter }">
            <InputText v-model="filterModel.value" @keyup.enter="applyFilter" placeholder="Search by No Bukti" />
          </template>
        </Column>

        <Column field="tgl_buktibayar" header="Tgl. Bukti" sortable :showFilterMatchModes="false"
          :showApplyButton="false" :showClearButton="true" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.tgl_buktibayar }}
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

        <Column field="bank_tujuan" header="Bank" sortable :showFilterMatchModes="false" :showClearButton="true"
          style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.bank_tujuan }}
          </template>
          <template #filter="{ filterModel, applyFilter }">
            <InputText v-model="filterModel.value" @keyup.enter="applyFilter" placeholder="Search by Bank" />
          </template>
        </Column>

        <Column field="sumber_transaksi" header="Sumber Transaksi" sortable :showFilterMatchModes="false"
          :showClearButton="true" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.sumber_transaksi }}
          </template>
          <template #filter="{ filterModel, applyFilter }">
            <InputText v-model="filterModel.value" @keyup.enter="applyFilter"
              placeholder="Search by Sumber Transaksi" />
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

        <Column field="jumlah" header="Tersetor" sortable :showFilterMatchModes="false" :showClearButton="true"
          style="text-align: right">
          <template #body="slotProps">
            {{ formatCurrency(slotProps.data.jumlah) }}
          </template>
          <template #filter="{ filterModel, applyFilter }">
            <InputNumber v-model="filterModel.value" @keyup.enter="applyFilter" locale="id-ID"
              placeholder="masukkan Jumlah" />
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

  <FormDataTransaksi v-model="modalForm" :item="selectedItem" @saved="onSaved" />
  
  <ValidasiDataTransaksi 
    v-model="showModalValidasi" 
    :item="selectedItem" 
    :bank="selectedItem?.bank_tujuan"
    :date="selectedItem?.tgl_setor"
    header="Selisih Kas" @validated="
    () => {
      showModalValidasi = false
      selectedItem = null
      loadData()
    }" />
    
  <ModalSetor
      v-model="showModalSetor"
      :item="selectedItem"
      @update:modelValue="() => {
        showModalSetor = false
        selectedItem = null
        loadData(1, rows)
      }"
  >
      <template #rekeningKoran="{ item }">
        {{  item  }}
      </template>
  </ModalSetor>

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
import useDataTransaksi from '@/composables/selisih/useDataTransaksi';
import useDataTransaksiActions from '@/composables/selisih/useDataTransaksiActions';
import FilterDataTable from '@/components/FilterDataTable.vue';
import ValidasiDataTransaksi from './ValidasiDataTransaksi.vue';
import ModalSetor from '../../CommonModalSetor.vue'


const modalForm = ref(false)
const selectedItem = ref(null)
const toast = useToast()
const showModalValidasi = ref(false)
const showModalSetor = ref(false)
const showModalCancelValidasi = ref(false)

const { create, show, destroy, cancelValidation } = useDataTransaksiActions()
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
} = useDataTransaksi()

const emit = defineEmits(['search', 'openSyncDialog'])

// experimental
const periodFilters = ref({})

onMounted(async () => {
  await loadData()
})

function searchData(data) {
  console.log('Search data:', data)
  setAdditionalFilter(data)

  loadData()
}

function onSaved() {
  loadData({
    ...sort.value
  })
}

function handleExportExcel() {
  exportExcel()
}

function handleAdd() {
  create().then((data) => {
    selectedItem.value = data
    modalForm.value = true
  })
}

function handleEdit(item) {
  show(item).then((data) => {
    selectedItem.value = data
    modalForm.value = true
  })
}

function handleValidasi(item) {
  selectedItem.value = item
  showModalValidasi.value = true
}

function handleSetor(item) {
  selectedItem.value = item
  showModalSetor.value = true
}

const confirmCancelValidasi = (item) => {
  showModalCancelValidasi.value = true
  selectedItem.value = item
}

const handleCancelValidasi = () => {
  cancelValidation(selectedItem.value).then(() => {
    console.log('Data berhasil dibatalkan validasi')
    loadData()
    selectedItem.value = null
    showModalCancelValidasi.value = false
  })
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

function openSyncDialog() {
  emit('openSyncDialog')
}

function rowStyle(rowData) {
  if (rowData.is_valid === true) return { backgroundColor: '#e4f6e8', color: '#419e56' }
}


</script>
