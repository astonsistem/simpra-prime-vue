<script setup>
import { ref, onMounted, watch } from 'vue'
import { FilterMatchMode } from '@primevue/core/api'
import DatePicker from 'primevue/datepicker'
import Select from 'primevue/select'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import SplitButton from 'primevue/splitbutton'
import Menu from 'primevue/menu'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import { useToast } from 'primevue/usetoast'
import api from '@/services/http.js'
import ModalSyncPenerimaan from './modal/TarikDataPenerimaanLainya.vue'
import ModalEditPenerimaan from './modal/EditPenerimaan.vue'
import Toast from 'primevue/toast'
import * as XLSX from 'xlsx'
import ModalValidasiPenerimaan from './modal/ModalValidasiPenerimaan.vue'
import ModalSetorPenerimaan from './modal/ModalSetorPenerimaan.vue'

const toast = useToast()

const formFilters = ref({
  tahunPeriode: '',
  tglAwal: null,
  tglAkhir: null,
})

const filters = ref()
const tahunPeriodeOptions = Array.from(
  { length: 10 },
  (_, i) => `${new Date().getFullYear() - 5 + i}`
)
const data = ref([])
const totalRecords = ref(0)
const rows = ref(10)
const first = ref(0)
const loading = ref(false)
const showModalSync = ref(false)
const showModalEdit = ref(false)
const selectedItem = ref(null)
const showModalValidasi = ref(false)
const validasiItem = ref(null)
const showModalSetor = ref(false)
const setorItem = ref(null)

const buildQuery = (page = 1, pageSize = rows.value) => {
  const q = {
    page,
    size: pageSize,
  }
  if (formFilters.value.tahunPeriode) q.year = formFilters.value.tahunPeriode
  if (formFilters.value.tglAwal) q.tgl_awal = formFilters.value.tglAwal
  if (formFilters.value.tglAkhir) q.tgl_akhir = formFilters.value.tglAkhir
  if (filters.value) {
    Object.keys(filters.value).forEach((key) => {
      if (filters.value[key].value) {
        q[key] = filters.value[key].value
      }
    })
  }
  return q
}

const loadData = async (page = 1, pageSize = rows.value) => {
  loading.value = true
  try {
    const query = buildQuery(page, pageSize)
    const response = await api.get('/penerimaan_lain', { params: query })
    if (response.data && response.data.items) {
      data.value = response.data.items.map((item, index) => ({
        ...item,
        no: (page - 1) * pageSize + index + 1,
        akun_nama: item.akun_data?.akun_nama || '',
      }))
      totalRecords.value = response.data.total ?? response.data.items.length
    }
  } catch (error) {
    console.error('Gagal memuat data:', error)
    toast.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal memuat data', life: 3000 })
  } finally {
    loading.value = false
  }
}

const onPageChange = (event) => {
  first.value = event.first
  rows.value = event.rows
  const page = event.page + 1
  loadData(page, event.rows)
}

const resetFilter = () => {
  formFilters.value = {
    tahunPeriode: '',
    tglAwal: null,
    tglAkhir: null,
  }
  first.value = 0
  loadData(1, rows.value)
}

const searchData = () => {
  first.value = 0
  loadData(1, rows.value)
}

const exportExcel = () => {
  try {
    const headers = [
      'No',
      'No Bayar',
      'Tanggal Bayar',
      'Pasien',
      'Uraian',
      'No Dokumen',
      'Tanggal Dokumen',
      'Sumber Transaksi',
      'Instalasi',
      'Metode Bayar',
      'Cara Pembayaran',
      'Rekening DPA',
      'Bank',
      'Jumlah Bruto',
      'Biaya Admin EDC',
      'Biaya Admin QRIS',
      'Selisih',
      'Jumlah Netto',
    ]
    const excelData = data.value.map((item, index) => [
      item.no || index + 1,
      item.no_bayar || '',
      item.tgl_bayar || '',
      item.pihak3 || '',
      item.uraian || '',
      item.no_dokumen || '',
      item.tgl_dokumen || '',
      item.sumber_transaksi || '',
      item.instalasi || '',
      item.metode_pembayaran || '',
      item.cara_pembayaran || '',
      item.rekening_dpa || '',
      item.bank_tujuan || '',
      item.total || 0,
      item.admin_kredit || 0,
      item.admin_debit || 0,
      item.selisih || 0,
      item.jumlah_netto || 0,
    ])
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...excelData])
    worksheet['!cols'] = Array(headers.length).fill({ wch: 15 })
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Penerimaan Lainnya')
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute(
      'download',
      `penerimaan_lainnya_${new Date().toISOString().split('T')[0]}.xlsx`
    )
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.add({
      severity: 'success',
      summary: 'Export Berhasil',
      detail: 'Data berhasil diekspor ke Excel',
      life: 3000,
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Export Gagal',
      detail: 'Gagal mengekspor data ke Excel',
      life: 3000,
    })
  }
}

const handleAdd = () => {
  selectedItem.value = null
  showModalEdit.value = true
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
      selectedItem.value = { ...response.data }
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
  if (item.tgl_validasi) {
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
      validasiItem.value = { ...response.data }
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
    // Ambil data setor dari backend (endpoint sama seperti validasi, bisa disesuaikan jika berbeda)
    const response = await api.get(`/penerimaan_lain/${item.id}`)
    if (response.data) {
      setorItem.value = { ...response.data }
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

const handleBuktiBayar = (item) => {
  console.log('Bukti Bayar item:', item)
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
  toast.add({
    severity: 'success',
    summary: 'Berhasil',
    detail: 'Data berhasil disimpan',
    life: 3000,
  })
  loadData(1, rows.value)
}

onMounted(() => {
  loadData(1, rows.value)
})

let debounceTimer = null

watch(
  filters,
  () => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      loadData(1, rows.value)
    }, 500)
  },
  { deep: true }
)

const initFilters = () => {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    no_bayar: { value: null, matchMode: FilterMatchMode.CONTAINS },
    tgl_bayar: { value: null, matchMode: FilterMatchMode.DATE_IS },
    pihak3: { value: null, matchMode: FilterMatchMode.CONTAINS },
    uraian: { value: null, matchMode: FilterMatchMode.CONTAINS },
    no_dokumen: { value: null, matchMode: FilterMatchMode.CONTAINS },
    tgl_dokumen: { value: null, matchMode: FilterMatchMode.DATE_IS },
    sumber_transaksi: { value: null, matchMode: FilterMatchMode.CONTAINS },
    instalasi: { value: null, matchMode: FilterMatchMode.CONTAINS },
    metode_pembayaran: { value: null, matchMode: FilterMatchMode.CONTAINS },
    cara_pembayaran: { value: null, matchMode: FilterMatchMode.CONTAINS },
    rekening_dpa: { value: null, matchMode: FilterMatchMode.CONTAINS },
    bank_tujuan: { value: null, matchMode: FilterMatchMode.CONTAINS },
    total: { value: null, matchMode: FilterMatchMode.EQUALS },
    admin_kredit: { value: null, matchMode: FilterMatchMode.EQUALS },
    admin_debit: { value: null, matchMode: FilterMatchMode.EQUALS },
    selisih: { value: null, matchMode: FilterMatchMode.EQUALS },
    jumlah_netto: { value: null, matchMode: FilterMatchMode.EQUALS },
  }
}

initFilters()

const clearFilter = () => {
  initFilters()
  loadData(1, rows.value)
}
</script>

<template>
  <div class="p-4">
    <div
      class="bg-surface-0 dark:bg-surface-900 rounded-2xl mb-6 px-6 py-4 md:px-6 md:py-3 border-b md:border border-surface-200 dark:border-surface-700 w-full sticky top-0 z-30"
    >
      <h3 class="text-xl font-semibold text-[#17316E] mb-1">Penerimaan Lainnya</h3>
      <div class="text-sm text-gray-500 mb-4">Kelola data Penerimaan Lainnya</div>
      <div class="grid grid-cols-3 gap-4 mb-2">
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
          <label class="block mb-1 text-sm font-medium text-gray-700">Tanggal Awal</label>
          <DatePicker
            v-model="formFilters.tglAwal"
            placeholder="Tanggal Awal"
            showIcon
            class="w-full"
          />
        </div>
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Tanggal Akhir</label>
          <DatePicker
            v-model="formFilters.tglAkhir"
            placeholder="Tanggal Akhir"
            showIcon
            class="w-full"
          />
        </div>
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
        :rows="rows"
        :rowsPerPageOptions="[5, 10, 20]"
        @page="onPageChange"
        dataKey="id"
        filterDisplay="menu"
        :globalFilterFields="['no_bayar', 'pihak3', 'uraian', 'no_dokumen', 'akun_nama']"
        class="p-datatable-sm"
      >
        <template #header>
          <div class="flex justify-between">
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
          </div>
        </template>
        <Column field="no" header="No" style="width: 5%" />
        <Column header="Action" style="width: 15%">
          <template #body="slotProps">
            <SplitButton
              label="Aksi"
              icon="pi pi-ellipsis-v"
              size="small"
              severity="secondary"
              :model="[
                {
                  label: 'Ubah',
                  icon: 'pi pi-pencil',
                  command: () => handleEdit(slotProps.data),
                },
                {
                  label: 'Setor',
                  icon: 'pi pi-dollar',
                  command: () => handleSetor(slotProps.data),
                },
                {
                  label: 'Validasi',
                  icon: 'pi pi-check',
                  command: () => handleValidasi(slotProps.data),
                },
                {
                  label: 'Hapus',
                  icon: 'pi pi-trash',
                  command: () => handleDelete(slotProps.data),
                },
              ]"
            />
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
              dateFormat="dd/mm/yy"
              placeholder="dd/mm/yyyy"
            />
          </template>
        </Column>
        <Column
          field="pihak3"
          header="Pasien"
          :showFilterMatchModes="false"
          style="min-width: 12rem"
        >
          <template #body="{ data }">
            {{ data.pihak3 }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by Pasien" />
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
              dateFormat="dd/mm/yy"
              placeholder="dd/mm/yyyy"
            />
          </template>
        </Column>
        <Column
          field="sumber_transaksi"
          header="Sumber Transaksi"
          :showFilterMatchModes="false"
          style="min-width: 12rem"
        >
          <template #body="{ data }">
            {{ data.sumber_transaksi }}
          </template>
          <template #filter="{ filterModel }">
            <InputText
              v-model="filterModel.value"
              type="text"
              placeholder="Search by Sumber Transaksi"
            />
          </template>
        </Column>
        <Column
          field="instalasi"
          header="Instalasi"
          :showFilterMatchModes="false"
          style="min-width: 12rem"
        >
          <template #body="{ data }">
            {{ data.instalasi }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by Instalasi" />
          </template>
        </Column>
        <Column
          field="metode_pembayaran"
          header="Metode Bayar"
          :showFilterMatchModes="false"
          style="min-width: 12rem"
        >
          <template #body="{ data }">
            {{ data.metode_pembayaran }}
          </template>
          <template #filter="{ filterModel }">
            <InputText
              v-model="filterModel.value"
              type="text"
              placeholder="Search by Metode Bayar"
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
            {{ data.rekening_dpa }}
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
        <Column field="total" header="Jumlah Bruto" style="text-align: right">
          <template #body="slotProps">
            {{ new Intl.NumberFormat('id-ID').format(slotProps.data.total) }}
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
      :visible="showModalEdit"
      :item="selectedItem"
      @update:visible="showModalEdit = $event"
      @saved="handleSaved"
    />
    <ModalValidasiPenerimaan
      v-model="showModalValidasi"
      :item="validasiItem"
      @validated="
        () => {
          showModalValidasi = false
          loadData(1, rows.value)
        }
      "
    />
    <ModalSetorPenerimaan
      v-model="showModalSetor"
      :item="setorItem"
      @setor="() => loadData(1, rows.value)"
    />
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
