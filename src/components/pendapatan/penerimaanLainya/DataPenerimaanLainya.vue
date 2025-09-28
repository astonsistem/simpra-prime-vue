<script setup>
import { ref, onMounted, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import api from '@/api/client.js'
import ModalSyncPenerimaan from './modal/TarikDataPenerimaanLainya.vue'
import ModalEditPenerimaan from './modal/EditPenerimaan.vue'
import { usePenerimaanLain } from '@/composables/usePenerimaanLain'
import { FilterMatchMode } from '@primevue/core/api'
import ModalValidasi from '../ModalValidasi.vue'
import ModalSetor from '../CommonModalSetor.vue'

const toast = useToast()
const { 
  bulanOptions, 
  tahunPeriodeOptions,
  jenisPeriodeOptions,
  filters,
  formFilters,
  data,
  totalRecords,
  loading,
  loadData,
  initFilters,
  clearFilters,
  exportExcel: exportExcelPenerimaanLain
} = usePenerimaanLain()


const rows = ref(10)
const first = ref(0)
const showModalSync = ref(false)
const showModalEdit = ref(false)
const selectedItem = ref(null)
const showModalValidasi = ref(false)
const showModalSetor = ref(false)

watch(() => filters.value, (newVal) => {
  if (newVal.jumlahBruto.min !== null || newVal.jumlahBruto.max !== null) {
    newVal.jumlahBruto.matchMode = FilterMatchMode.BETWEEN
    filters.value.jumlahBruto.value = true
  } else {
    newVal.jumlahBruto.matchMode = FilterMatchMode.EQUALS
    filters.value.jumlahBruto.value = null
  }
  if (newVal.jumlahNetto.min !== null || newVal.jumlahNetto.max !== null) {
    newVal.jumlahNetto.matchMode = FilterMatchMode.BETWEEN
    filters.value.jumlahNetto.value = true
  } else {
    newVal.jumlahNetto.matchMode = FilterMatchMode.EQUALS
    filters.value.jumlahNetto.value = null
  }
}, { deep: true })

const rowStyle = (rowData) => {
  if (rowData.is_valid === true) return { backgroundColor: '#d4edda', color: '#155724' }
}


const onPageChange = (event) => {
  let page = event.rows === 1000 ? 1 : event.page + 1
  first.value = event.first
  if (rows.value > event.rows) {
    page = 1
    first.value = 0
  }
  rows.value = event.rows
  loadData(page, event.rows)
}

const resetFilter = () => {
  initFilters()
  first.value = 0
  rows.value = 10
  loadData(1, rows.value)
}

const searchData = () => {
  first.value = 0
  loadData(1, rows.value)
}

const isValidated = (rowData) => {
  return rowData.rc_id && parseInt(rowData.rc_id) > 0
}

const exportExcel = async () => {
  await exportExcelPenerimaanLain('Penerimaan Lainya')
}

const handleAdd = async () => {

  try {
    loading.value = true
    const response = await api.get(`/penerimaan_lain/create`)
    if (response.data) {
      selectedItem.value = response.data.data
      selectedItem.value.total = null
      showModalEdit.value = true
    } else {
      toast.add({
        severity: 'error',
        summary: 'Gagal',
        detail: 'Gagal memuat detail data',
        life: 3000,
      })
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: 'Gagal memuat detail data',
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}

const handleEdit = async (item) => {
  if (item.tgl_validasi) {
    toast.add({
      severity: 'warn',
      summary: 'Peringatan',
      detail: 'Data yang sudah divalidasi tidak dapat diubah.',
      life: 3000,
    })
    return
  }
  try {
    loading.value = true
    const response = await api.get(`/penerimaan_lain/${item.id}`)
    if (response.data) {
      selectedItem.value = response.data.data
      showModalEdit.value = true
    } else {
      toast.add({
        severity: 'error',
        summary: 'Gagal',
        detail: 'Gagal memuat detail data',
        life: 3000,
      })
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: 'Gagal memuat detail data',
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}

const handleValidasi = async (item) => {
  if (item.rc_id) {
    toast.add({
      severity: 'warn',
      summary: 'Peringatan',
      detail: 'Data sudah divalidasi.',
      life: 3000,
    })
    return
  }
  try {
    loading.value = true
    const response = await api.get(`/penerimaan_lain/${item.id}`)
    if (response.data) {
      selectedItem.value = response.data.data
      showModalValidasi.value = true
    } else {
      toast.add({
        severity: 'error',
        summary: 'Gagal',
        detail: 'Gagal memuat detail data',
        life: 3000,
      })
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: 'Gagal memuat detail data',
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}

const handleSetor = async (item) => {
  try {
    loading.value = true
    const response = await api.get(`/penerimaan_lain/${item.id}`)
    if (response.data) {
      selectedItem.value = response.data.data
      showModalSetor.value = true
    } else {
      toast.add({
        severity: 'error',
        summary: 'Gagal',
        detail: 'Gagal memuat data setor',
        life: 3000,
      })
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: 'Gagal memuat data setor',
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}
const showModalCancelValidasi = ref(false)

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

    await api.post(`penerimaan_lain/cancel_validasi/penerimaan_lain`, {
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
    loadData(1, rows.value)
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

const handleDelete = (item) => {
  toast.add({
    severity: 'warn',
    summary: 'Konfirmasi Hapus',
    detail: 'Apakah Anda yakin ingin menghapus data ini?',
    group: 'confirm',
    data: { id: item.id },
  })
}

const onConfirmDelete = async (event) => {
  toast.removeGroup('confirm')
  const { id } = event.data
  try {
    await api.delete(`/penerimaan_lain/${id}`)
    toast.add({
      severity: 'success',
      summary: 'Berhasil',
      detail: 'Data berhasil dihapus',
      life: 3000,
    })
    loadData(1, rows.value)
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: 'Gagal menghapus data. Silakan coba lagi.',
      life: 3000,
    })
  }
}

const onReject = () => {
  toast.removeGroup('confirm')
}

const handleSaved = () => {
  showModalEdit.value = false
  loadData(1, rows.value)
}

onMounted(async () => {
  loadData(1, rows.value)
})

const onFilter = (event) => {
  filters.value = event.filters
  first.value = 0
  loadData(1, rows.value)
}



initFilters()

</script>

<template>
  <div class="p-4">
    <div
      class="bg-surface-0 dark:bg-surface-900 rounded-2xl mb-6 px-6 py-4 md:px-6 md:py-3 border-b md:border border-surface-200 dark:border-surface-700 w-full sticky top-0 z-30"
    >
      <h3 class="text-xl font-semibold text-[#17316E] mb-4">Filter Data</h3>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2">
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Jenis Periode</label>
          <Select
            v-model="formFilters.jenis_periode"
            :options="jenisPeriodeOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Jenis Periode"
            class="w-full"
          />
        </div>
        <template v-if="formFilters.jenis_periode === 'BULANAN'">
          <div>
            <label class="block mb-1 text-sm font-medium text-gray-700">Tahun Periode</label>
            <Select
              v-model="formFilters.tahunPeriode"
              :options="tahunPeriodeOptions"
              placeholder="Tahun Periode"
              class="w-full"
            />
          </div>
          <div>
            <label class="block mb-1 text-sm font-medium text-gray-700">Bulan Awal</label>
            <Select
              v-model="formFilters.bulanAwal"
              :options="bulanOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Bulan Awal"
              class="w-full"
            />
          </div>
          <div>
            <label class="block mb-1 text-sm font-medium text-gray-700">Bulan Akhir</label>
            <Select
              v-model="formFilters.bulanAkhir"
              :options="bulanOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Bulan Akhir"
              class="w-full"
            />
          </div>
        </template>
        <template v-if="formFilters.jenis_periode === 'TANGGAL'">
          <div>
            <label class="block mb-1 text-sm font-medium text-gray-700">Tanggal Awal</label>
            <DatePicker
              v-model="formFilters.tglAwal"
              placeholder="Tanggal Awal"
              showIcon
              class="w-full"
              dateFormat="dd/mm/yy"
              :showTime="false"
              :showSeconds="false"
              :showMilliseconds="false"
            />
          </div>
          <div>
            <label class="block mb-1 text-sm font-medium text-gray-700">Tanggal Akhir</label>
            <DatePicker
              v-model="formFilters.tglAkhir"
              placeholder="Tanggal Akhir"
              showIcon
              class="w-full"
              dateFormat="dd/mm/yy"
              :showTime="false"
              :showSeconds="false"
              :showMilliseconds="false"
            />
          </div>
        </template>
      </div>
      <div class="mt-2 flex gap-2">
        <Button label="Cari" icon="pi pi-search" class="p-button-info" @click="searchData" />
        <Button
          label="Reset Filter"
          icon="pi pi-refresh"
          class="p-button-secondary"
          @click="resetFilter"
        />
        <Button
          label="Tarik Data Billing"
          icon="pi pi-refresh"
          class="p-button-warning"
          style="background-color: #ffa500; border: none; color: #fff"
          @click="showModalSync = true"
        />
      </div>
    </div>
    <div
      class="bg-surface-0 dark:bg-surface-900 rounded-2xl my-6 px-6 py-4 md:px-6 md:py-3 border-b md:border border-surface-200 dark:border-surface-700 w-full sticky top-0 z-30"
    >
      <div class="flex justify-between items-center mb-2">
        <h3 class="text-xl font-semibold text-[#17316E]">Data Penerimaan Lainnya</h3>
        <div class="flex gap-2">
          <Button
            label="Tambah Data"
            icon="pi pi-plus"
            class="p-button-primary"
            @click="handleAdd"
          />
          <!-- <Button
            label="Tarik Data"
            icon="pi pi-refresh"
            class="p-button-success"
            @click="showModalSync = true"
          /> -->
          <Button
            label="Export Excel"
            icon="pi pi-file-excel"
            class="p-button-success"
            @click="exportExcel"
          />
        </div>
      </div>

      <DataTable
        :filters="filters"
        :value="data"
        :loading="loading"
        responsiveLayout="scroll"
        paginator
        lazy
        :totalRecords="totalRecords"
        :rows="rows"
        :first="first"
        :rowsPerPageOptions="[5, 10, 20, 50, 100, 1000]"
        @page="onPageChange"
        @filter="onFilter"
        dataKey="id"
        filterDisplay="menu"
        :globalFilterFields="['no_bayar', 'pihak3', 'uraian', 'no_dokumen', 'akun_nama']"
        class="p-datatable-sm"
        showGridlines
        stripedRows
        :rowStyle="rowStyle"
      >
        <template #header>
          <div class="flex justify-between">
            <Button
              type="button"
              icon="pi pi-filter-slash"
              label="Clear"
              outlined
              @click="clearFilters()"
            />
            <IconField>
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
            </IconField>
          </div>
        </template>
        <template #empty>
            <div class="flex items-center text-gray-500 min-h-24">
              <i class="pi pi-info-circle mr-2" style="font-size: 1.5rem"></i>
              <p>Data Kosong</p>
            </div>
          </template>
        <Column field="no" header="No" style="width: 5%">
          <template #body="slotProps">
            {{ slotProps.index + 1 + first }}
          </template>
        </Column>
        <Column field="validated" :showFilterMatchModes="false" style="width: 10%; text-align: center">
          <template #header>
            <i class="pi pi-check-circle" style="font-size: 1rem"></i>
          </template>
          <template #body="{ data }">
            <i class="pi pi-check-circle"
              :class="[isValidated(data) ? 'text-green-500' : 'text-gray-300', 'cursor-pointer']"
              v-if="isValidated(data)"></i>
          </template>
          <template #filter="{ filterModel }">
            <Dropdown optionValue="value" optionLabel="label" v-model="filterModel.value" :options="[{ label: 'Tervalidasi', value: '1' }, { label: 'Belum Tervalidasi', value: '0' }]"
              placeholder="Filter Validasi" class="w-full" />
          </template>
        </Column>
        <Column header="Action" style="width: 15%">
          <template #body="slotProps">
            <SplitButton label="Aksi" size="small" severity="secondary" :model="[
              {
                label: 'Ubah',
                icon: 'pi pi-pencil',
                visible: () => !isValidated(slotProps.data),
                command: () => handleEdit(slotProps.data)
              },
              {
                label: 'Validasi',
                icon: 'pi pi-check',
                visible: () => !isValidated(slotProps.data),
                command: () => handleValidasi(slotProps.data),
              },
              {
                label: 'Setor',
                icon: 'pi pi-dollar',
                visible: () => !!isValidated(slotProps.data),
                command: () => handleSetor(slotProps.data),
              },
              {
                label: 'Batal Validasi',
                icon: 'pi pi-times-circle',
                style: 'color: red;',
                visible: () => !!isValidated(slotProps.data),
                command: () => confirmCancelValidasi(slotProps.data),
              },
              {
                label: 'Hapus',
                icon: 'pi pi-trash',
                visible: () => !isValidated(slotProps.data),
                command: () => handleDelete(slotProps.data),
              },
              
            ]" />

          </template>
        </Column>
        <Column
          field="no_bayar"
          header="No Bayar"
          :showFilterMatchModes="false"
          style="min-width: 12rem"
        >
          <template #body="{ data }">
            {{ data.no_bayar }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by No Bayar" />
          </template>
        </Column>
        <Column
          field="tgl_bayar"
          header="Tgl Bayar"
          :showFilterMatchModes="false"
          style="min-width: 12rem"
        >
          <template #body="{ data }">
            {{ data.tgl_bayar }}
          </template>
          <template #filter="{ filterModel }">
            <DatePicker
              v-model="filterModel.value"
              dateFormat="yy-mm-dd"
              placeholder="yyyy-mm-dd"
            />
          </template>
        </Column>
        <Column
          field="pihak3"
          header="Pihak3"
          :showFilterMatchModes="false"
          style="min-width: 12rem"
        >
          <template #body="{ data }">
            {{ data.pihak3 }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by Pihak3" />
          </template>
        </Column>
        <Column
          field="uraian"
          header="Uraian"
          :showFilterMatchModes="false"
          style="min-width: 12rem"
        >
          <template #body="{ data }">
            {{ data.uraian }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by Uraian" />
          </template>
        </Column>
        <Column
          field="no_dokumen"
          header="No Dokumen"
          :showFilterMatchModes="false"
          style="min-width: 12rem"
        >
          <template #body="{ data }">
            {{ data.no_dokumen }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by No Dokumen" />
          </template>
        </Column>
        <Column
          field="tgl_dokumen"
          header="Tgl Dokumen"
          :showFilterMatchModes="false"
          style="min-width: 12rem"
        >
          <template #body="{ data }">
            {{ data.tgl_dokumen }}
          </template>
          <template #filter="{ filterModel }">
            <DatePicker
              v-model="filterModel.value"
              dateFormat="yy-mm-dd"
              placeholder="yyyy-mm-dd"
            />
          </template>
        </Column>
        <Column
          field="cara_pembayaran"
          header="Cara Pembayaran"
          :showFilterMatchModes="false"
          style="min-width: 12rem"
        >
          <template #body="{ data }">
            {{ data.cara_pembayaran }}
          </template>
          <template #filter="{ filterModel }">
            <InputText
              v-model="filterModel.value"
              type="text"
              placeholder="Search by Cara Pembayaran"
            />
          </template>
        </Column>
        <Column
          field="rekening_dpa"
          header="Rekening DPA"
          :showFilterMatchModes="false"
          style="min-width: 12rem"
        >
          <template #body="{ data }">
            {{ data.rekening_dpa?.rek_nama || '-' }}
          </template>
          <template #filter="{ filterModel }">
            <InputText
              v-model="filterModel.value"
              type="text"
              placeholder="Search by Rekening DPA"
            />
          </template>
        </Column>
        <Column
          field="bank_tujuan"
          header="Bank"
          :showFilterMatchModes="false"
          style="min-width: 12rem"
        >
          <template #body="{ data }">
            {{ data.bank_tujuan }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by Bank" />
          </template>
        </Column>
        <Column field="jumlahBruto" header="Jumlah Bruto" :showFilterMatchModes="false" style="text-align: right">
          <template #body="slotProps">
            {{ new Intl.NumberFormat('id-ID').format(slotProps.data.total) }}
          </template>
          <template #filter="{ filterCallback, filterModel }">
            <div class="flex flex-col gap-2">
              <InputNumber
                v-model="filterModel.min"
                @change="filterCallback()"
                placeholder="Min"
                locale="id-ID"
                size="small"
                style="width: 100%"
              />
              <InputNumber
                v-model="filterModel.max"
                @change="filterCallback()"
                placeholder="Max"
                locale="id-ID"
                size="small"
                style="width: 100%"
              />
            </div>
          </template>
        </Column>
        <Column field="admin_kredit" header="Biaya Admin EDC" style="text-align: right">
          <template #body="slotProps">
            {{ new Intl.NumberFormat('id-ID').format(slotProps.data.admin_kredit || 0) }}
          </template>
        </Column>
        <Column field="admin_debit" header="Biaya Admin QRIS" style="text-align: right">
          <template #body="slotProps">
            {{ new Intl.NumberFormat('id-ID').format(slotProps.data.admin_debit || 0) }}
          </template>
        </Column>
        <Column field="selisih" header="Selisih" style="text-align: right">
          <template #body="slotProps">
            {{ new Intl.NumberFormat('id-ID').format(slotProps.data.selisih || 0) }}
          </template>
        </Column>
        <Column field="jumlah_netto" header="Jumlah Netto" style="text-align: right">
          <template #body="slotProps">
            {{ new Intl.NumberFormat('id-ID').format(slotProps.data.jumlah_netto) }}
          </template>
        </Column>
      </DataTable>
    </div>
    <ModalSyncPenerimaan v-model="showModalSync" @sync="loadData" />
    <ModalEditPenerimaan
      v-model="showModalEdit" 
      :item="selectedItem"
      @saved="handleSaved"
    />
    <ModalValidasi
      v-model="showModalValidasi"
      :item="selectedItem"
      header="Penerimaan Lainya"
      @validated="
        () => {
          showModalValidasi = false
          selectedItem = null
          loadData(1, rows)
        }
      "
    />
    <ModalSetor
      v-model="showModalSetor"
      :item="selectedItem"
      @update:modelValue="() => {
        showModalSetor = false
        selectedItem = null
        loadData(1, rows)
      }"
    />
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
    <Toast position="center" group="confirm">
      <template #message="slotProps">
        <div class="flex flex-col items-center" style="flex: 1">
          <div class="text-center">
            <i class="pi pi-exclamation-triangle" style="font-size: 3rem"></i>
            <h4>{{ slotProps.message.summary }}</h4>
            <p>{{ slotProps.message.detail }}</p>
          </div>
          <div class="grid grid-cols-2 gap-4 mt-4">
            <Button label="Tidak" @click="onReject()" />
            <Button label="Ya" @click="onConfirmDelete(slotProps.message)" />
          </div>
        </div>
      </template>
    </Toast>
    <Toast />
  </div>
</template>

<style scoped>
.p-datatable .p-datatable-thead > tr > th {
  white-space: nowrap;
  text-align: center;
  padding: 0.5rem 0.75rem;
}

.p-datatable .p-datatable-tbody > tr > td {
  white-space: nowrap;
  padding: 0.5rem 0.75rem;
  vertical-align: middle;
}
</style>
