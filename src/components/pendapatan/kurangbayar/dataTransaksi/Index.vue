<template>
  <FilterDataTable @search="searchData" @openSyncDialog="openSyncDialog" />
  <div>
    <div
      class="bg-surface-0 dark:bg-surface-900 rounded-2xl mb-6 px-6 py-4 md:px-6 md:py-3 border-b md:border border-surface-200 dark:border-surface-700 w-full sticky top-0 z-30">
      <div class="flex justify-between items-center mb-2">
        <h3 class="text-xl font-semibold text-[#17316E]">Data Transaksi</h3>
        <div class="flex gap-2">
          <Button label="Tambah Data" icon="pi pi-plus" class="p-button-primary" @click="handleAdd" />
          <Button label="Export Excel" icon="pi pi-file-excel" class="p-button-success" @click="exportExcel" />
        </div>
      </div>
      <DataTable :filters="filters" :value="items" :loading="loading" responsiveLayout="scroll" paginator lazy
        :totalRecords="total" :rows="rows" :first="first" :rowsPerPageOptions="[5, 10, 20, 50, 100, 1000]"
        @page="onPageChange" @filter="onFilter" dataKey="id" filterDisplay="menu" :rowStyle="rowStyle" :globalFilterFields="[
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
          <template #body="{ index }">{{ first + index + 1 }}</template>
        </Column>

        <Column field="is_valid" :showFilterMatchModes="false" style="width: 10%; text-align: center">
          <template #header>
            <i class="pi pi-check-circle" style="font-size: 1rem"></i>
          </template>
          <template #body="{ data }">
            <i class="pi pi-check-circle"
              :class="[data.is_valid ? 'text-green-500' : 'text-gray-300', 'cursor-pointer']" v-if="data.is_valid"></i>
          </template>
          <template #filter="{ filterModel }">
            <Dropdown optionValue="value" optionLabel="label" v-model="filterModel.value"
              :options="[{ label: 'Tervalidasi', value: '1' }, { label: 'Belum Tervalidasi', value: '0' }]"
              placeholder="Filter Validasi" class="w-full" />
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
                style: 'color: red;',
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

        <Column field="tgl_setor" header="Tgl. Setor" :showFilterMatchModes="false" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.tgl_setor }}
          </template>
          <template #filter="{ filterModel }">
            <DatePicker v-model="filterModel.value" dateFormat="yy-mm-dd" placeholder="yyyy-dd-mm" />
          </template>
        </Column>

        <Column field="no_buktibayar" header="No. Bukti" :showFilterMatchModes="false" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.no_buktibayar }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by No Bukti" />
          </template>
        </Column>

        <Column field="tgl_buktibayar" header="Tgl. Bukti" :showFilterMatchModes="false" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.tgl_buktibayar }}
          </template>
          <template #filter="{ filterModel }">
            <DatePicker v-model="filterModel.value" dateFormat="yy-mm-dd" placeholder="yyyy-dd-mm" />
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

        <Column field="rekening_dpa" header="Rekening DPA" :showFilterMatchModes="false" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.rekening_dpa?.rek_nama ?? '' }}
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

  <ModalForm v-model="modalForm" :item="selectedItem" @saved="onSaved" />
  <ModalValidasi v-model="showModalValidasi" :item="selectedItem" header="Penerimaan Lainya" @validated="
    () => {
      showModalValidasi = false
      selectedItem = null
      loadData(1, rows)
    }
  " />
  <ModalSetor v-model="showModalSetor" :item="selectedItem" @update:modelValue="() => {
    showModalSetor = false
    selectedItem = null
    loadData(1, rows)
  }" />
  <Dialog :visible="showModalCancelValidasi" @update:visible="showModalCancelValidasi = $event" modal
    header="Konfirmasi Batal Validasi" :closable="true" :style="{ width: '400px' }">
    <div class="p-4">
      <p>Apakah Anda yakin ingin membatalkan validasi data no. bayar: <strong>{{ selectedItem.no_bayar }}</strong> ?</p>
      <div class="flex justify-end gap-2 pt-4">
        <Button label="Ya, Batalkan Validasi" class="p-button-warning" @click="handleCancelValidasi" />
        <Button label="Tidak" class="p-button-secondary" @click="() => (showModalCancelValidasi = false)" />
      </div>
    </div>
  </Dialog>

  <Dialog :visible="showModalCancelValidasi" @update:visible="showModalCancelValidasi = $event" modal
    header="Konfirmasi Batal Validasi" :closable="true" :style="{ width: '400px' }">
    <div class="p-4">
      <p>Apakah Anda yakin ingin membatalkan validasi data no. bayar: <strong>{{ selectedItem.no_bayar }}</strong> ?</p>
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
import useDataTransaksiForm from '@/composables/selisih/useDataTransaksiForm';
import FilterDataTable from '@/components/FilterDataTable.vue';
import ModalValidasi from './Validasi.vue';
import ModalForm from './Form.vue';

const modalForm = ref(false)
const selectedItem = ref(null)
const toast = useToast()
const showModalValidasi = ref(false)
const showModalSetor = ref(false)
const showModalCancelValidasi = ref(false)

const { create, show, validasi, destroy } = useDataTransaksiForm()
const { items, first, rows, total, filters, loading, loadData, onPageChange } = useDataTransaksi()
const emit = defineEmits(['search', 'openSyncDialog'])

onMounted(async () => {
  await loadData()
})

function searchData() {

}

function resetFilter() {
  first.value = 0
  loadData(1, rows.value)
}

function exportExcel() {

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

function handleValidasi(item)  {
  selectedItem.value = item
  showModalValidasi.value = true
}

function handleSetor(item) {
  console.log('item', item)
  selectedItem.value = item
  showModalSetor.value = true
}

const confirmCancelValidasi = (item) => {
  showModalCancelValidasi.value = true
  selectedItem.value = item
}

const handleCancelValidasi = async () => {
  try {
    const item = selectedItem.value

    if (!item.rc_id) {
      throw new Error("Data belum divalidasi");
    }

    await api.post(`/kurangbayar/data_transaksi/cancel_validation`, {
      id: item.id,
      rc_id: item.rc_id,
    })

    toast.add({
      severity: 'success',
      summary: 'Berhasil',
      detail: 'Validasi berhasil dibatalkan',
      life: 3000,
    })
    selectedItem.value.value = null
    showModalCancelValidasi.value = false
    loadData()
  } catch (error) {
    console.error('Gagal membatalkan validasi:', error)
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: error.response.data.message || 'Gagal membatalkan validasi. Silakan coba lagi.',
      life: 3000,
    })
  } finally {
    showModalCancelValidasi.value = false
    loading.value = false
  }
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

function onSaved() {
  loadData()
}

function openSyncDialog() {
  emit('openSyncDialog')
}

function onFilter() {

}

function rowStyle(rowData) {
  if (rowData.is_valid === true) return { backgroundColor: '#d4edda', color: '#155724' }
}


</script>
