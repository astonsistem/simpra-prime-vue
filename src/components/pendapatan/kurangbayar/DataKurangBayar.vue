<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
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
import api from '@/services/http.js'
import { useToast } from 'primevue/usetoast'
import ModalSyncPenerimaan from '@/components/ModalSyncPenerimaan.vue'
import ModalEditKurangBayar from '@/components/pendapatan/kurangbayar/ModalEditKurangBayar.vue'
import ModalValidasiKurangBayar from '@/components/pendapatan/kurangbayar/ModalValidasiKurangBayar.vue'
import Toast from 'primevue/toast'
import * as XLSX from 'xlsx'
import Dialog from 'primevue/dialog'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'

const toast = useToast()
const route = useRoute()

const formFilters = ref({
  jenis_periode: 'BULANAN',
  tahunPeriode: '',
  bulanAwal: null,
  bulanAkhir: null,
  tglAwal: null,
  tglAkhir: null,
})


const filters = ref()

const tahunPeriodeOptions = Array.from(
  { length: 10 },
  (_, i) => `${new Date().getFullYear() - 5 + i}`
)

const jenisPeriodeOptions = ref([
  { label: 'Bulanan', value: 'BULANAN' },
  { label: 'Tanggal', value: 'TANGGAL' },
])

const bulanOptions = ref([
    { label: 'Januari', value: 1 },
    { label: 'Februari', value: 2 },
    { label: 'Maret', value: 3 },
    { label: 'April', value: 4 },
    { label: 'Mei', value: 5 },
    { label: 'Juni', value: 6 },
    { label: 'Juli', value: 7 },
    { label: 'Agustus', value: 8 },
    { label: 'September', value: 9 },
    { label: 'Oktober', value: 10 },
    { label: 'November', value: 11 },
    { label: 'Desember', value: 12 },
])

const data = ref([])
const totalRecords = ref(0)
const rows = ref(10)
const first = ref(0)
const loading = ref(false)
const selectedItem = ref(null)
const showModalEdit = ref(false)
const showModalSync = ref(false)
const showSyncDialog = ref(false)
const syncOptions = ref([])
const selectedSync = ref(null)
const syncParams = ref([])
const syncForm = ref({})
const loadingSyncOptions = ref(false)
const loadingSync = ref(false)
const showModalValidasi = ref(false)
const validasiItem = ref(null)

// Helper function to format date to YYYY-MM-DD
const formatDateToYYYYMMDD = (date) => {
  if (!date) return null
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const buildQuery = (page = 1, pageSize = rows.value) => {
  const q = {
    page,
    size: pageSize,
  }
  if (formFilters.value.jenis_periode) q.jenis_periode = formFilters.value.jenis_periode
  if (formFilters.value.jenis_periode === 'BULANAN') {
    if (formFilters.value.tahunPeriode) q.year = formFilters.value.tahunPeriode
    if (formFilters.value.bulanAwal) q.month_start = formFilters.value.bulanAwal
    if (formFilters.value.bulanAkhir) q.month_end = formFilters.value.bulanAkhir
  } else if (formFilters.value.jenis_periode === 'TANGGAL') {
    if (formFilters.value.tglAwal) q.tgl_awal = formatDateToYYYYMMDD(formFilters.value.tglAwal)
    if (formFilters.value.tglAkhir) q.tgl_akhir = formatDateToYYYYMMDD(formFilters.value.tglAkhir)
  }

  if (filters.value) {
    Object.keys(filters.value).forEach((key) => {
      if (filters.value[key].value) {
        // Handle date filters specially
        if (key === 'tglBukti' || key === 'tglSetor') {
          q[key] = formatDateToYYYYMMDD(filters.value[key].value)
        } else {
          q[key] = filters.value[key].value
        }
      }
    })
  }

  return q
}

const loadData = async (page = 1, pageSize = rows.value) => {
  loading.value = true
  try {
    const query = buildQuery(page, pageSize)
    const currentPath = route.path

    let url = ''
    if (currentPath.includes('data-selisih')) {
      url = '/kurangbayar/data_selisih'
    } else if (currentPath.includes('data-transaksi')) {
      url = '/kurangbayar/penerimaan_transaksi'
    }

    if (url) {
      const response = await api.get(url, { params: query })
      if (response.data && response.data.items) {
        data.value = response.data.items.map((item, index) => ({
          ...item,
          no: (page - 1) * pageSize + index + 1,
        }))
        totalRecords.value = response.data.total ?? 0

        if (pageSize === totalRecords.value && pageSize > 100) {
          rows.value = 1000
        }
      }
    } else {
      console.warn('URL endpoint tidak valid untuk path:', currentPath)
      data.value = []
      totalRecords.value = 0
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

  if (event.rows === 1000) {
    loadData(1, totalRecords.value)
  } else {
    const page = event.page + 1
    loadData(page, event.rows)
  }
}

const resetFilter = () => {
  formFilters.value = {
    jenis_periode: 'BULANAN',
    tahunPeriode: '',
    bulanAwal: null,
    bulanAkhir: null,
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
      'No Bukti',
      'Tanggal Bukti',
      'Tanggal Setor',
      'No Setor',
      'Nominal',
      'Rekening DPA',
      'Loket Kasir',
      'Cara Pembayaran',
      'Bank',
      'Jenis',
    ]

    const excelData = data.value.map((item) => [
      item.noBukti || '',
      item.tglBukti || '',
      item.tglSetor || '',
      item.noSetor || '',
      item.nominal || 0,
      item.rekeningDpa || '',
      item.loketKasir || '',
      item.caraBayar || '',
      item.bank || '',
      item.jenis || '',
    ])

    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...excelData])

    const columnWidths = [
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
    ]
    worksheet['!cols'] = columnWidths

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Kurang Bayar')

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })

    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `kurang_bayar_${new Date().toISOString().split('T')[0]}.xlsx`)
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
    console.error('Gagal export Excel:', error)
    toast.add({
      severity: 'error',
      summary: 'Export Gagal',
      detail: 'Gagal mengekspor data ke Excel',
      life: 3000,
    })
  }
}

const tarikData = () => {
  toast.add({
    severity: 'info',
    summary: 'Tarik Data',
    detail: 'Tarik Data belum diimplementasi',
    life: 2000,
  })
}

const handleAdd = () => {
  selectedItem.value = null
  showModalEdit.value = true
}

const handleEdit = async (item) => {
  if (item.tglValidasi) {
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
    const response = await api.get(`/kurang_bayar/${item.id}`)
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
  if (item.tglValidasi) {
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
    const response = await api.get(`/kurang_bayar/${item.id}`)
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

const handleBuktiBayar = (item) => {
  console.log('Bukti Bayar item:', item)
}

const handleDelete = (item) => {
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

const onConfirmDelete = async (event) => {
  toast.removeGroup('confirm')
  const { id } = event.data
  try {
    await api.delete(`/kurang_bayar/${id}`)
    toast.add({
      severity: 'success',
      summary: 'Berhasil',
      detail: 'Data berhasil dihapus',
      life: 3000,
    })
    loadData(1, rows.value)
  } catch (error) {
    console.error('Gagal menghapus data:', error)
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

const onFilter = (event) => {
  filters.value = event.filters
  first.value = 0
  loadData(1, rows.value)
}

const handleValidated = () => {
  showModalValidasi.value = false
  loadData(1, rows.value)
}

const initFilters = () => {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    noBukti: { value: null, matchMode: FilterMatchMode.CONTAINS },
    tglBukti: { value: null, matchMode: FilterMatchMode.DATE_IS },
    tglSetor: { value: null, matchMode: FilterMatchMode.DATE_IS },
    noSetor: { value: null, matchMode: FilterMatchMode.CONTAINS },
    rekeningDpa: { value: null, matchMode: FilterMatchMode.CONTAINS },
    loketKasir: { value: null, matchMode: FilterMatchMode.CONTAINS },
    caraBayar: { value: null, matchMode: FilterMatchMode.CONTAINS },
    bank: { value: null, matchMode: FilterMatchMode.CONTAINS },
    jenis: { value: null, matchMode: FilterMatchMode.CONTAINS },
  }
}

initFilters()

const clearFilter = () => {
  initFilters()
  loadData(1, rows.value)
}

const openSyncDialog = async () => {
  showSyncDialog.value = true
  loadingSyncOptions.value = true
  try {
    const response = await api.get('/syncapi/list/KURANG BAYAR')
    if (response.data && Array.isArray(response.data)) {
      syncOptions.value = response.data.map((item) => ({
        label: item.sinkronisasi_nama,
        value: item,
      }))
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: 'Gagal load opsi sinkronisasi',
      life: 3000,
    })
  } finally {
    loadingSyncOptions.value = false
    selectedSync.value = null
    syncParams.value = []
    syncForm.value = {}
  }
}

onMounted(async () => {
  loadData(1, rows.value)
})

watch(selectedSync, (val) => {
  if (val && val.value && Array.isArray(val.value.sinkronisasi_param)) {
    syncParams.value = val.value.sinkronisasi_param
    syncForm.value = {}
  } else {
    syncParams.value = []
    syncForm.value = {}
  }
})

watch(
  () => route.path,
  () => {
    loadData(1, rows.value)
  },
  { immediate: true }
)

const handleSyncSubmit = async () => {
  if (!selectedSync.value) {
    toast.add({
      severity: 'warn',
      summary: 'Peringatan',
      detail: 'Pilih jenis sinkronisasi',
      life: 3000,
    })
    return
  }
  for (const param of syncParams.value) {
    if (!syncForm.value[param.field]) {
      toast.add({
        severity: 'warn',
        summary: 'Peringatan',
        detail: `Isi ${param.label}`,
        life: 3000,
      })
      return
    }
  }
  loadingSync.value = true
  try {
    const payload = {
      param: syncParams.value.map((param) => ({
        field: param.field,
        label: param.label,
        type: param.type,
        value:
          param.type === 'date' && syncForm.value[param.field] instanceof Date
            ? syncForm.value[param.field].toISOString().split('T')[0]
            : syncForm.value[param.field],
      }))
    }
    await api.post(`/sinkronisasi/request/kurang_bayar/${selectedSync.value.value.id}`, payload)
    toast.add({
      severity: 'success',
      summary: 'Berhasil',
      detail: 'Sinkronisasi berhasil',
      life: 3000,
    })
    showSyncDialog.value = false
    loadData(1, rows.value)
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: 'Sinkronisasi gagal', life: 3000 })
  } finally {
    loadingSync.value = false
  }
}
</script>

<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4 text-[#17316E]">Kurang Bayar/Selisih</h1>

    <div class="flex gap-2 mb-4">
      <router-link to="/kas/kurang-bayar/data-transaksi" v-slot="{ navigate, isActive }">
        <Button
          label="Data Transaksi"
          @click="navigate"
          :class="{'p-button-info': isActive, 'p-button-secondary': !isActive}"
        />
      </router-link>
      <router-link to="/kas/kurang-bayar/data-selisih" v-slot="{ navigate, isActive }">
        <Button
          label="Data Selisih Kurang Bayar/Setor"
          @click="navigate"
          :class="{'p-button-info': isActive, 'p-button-secondary': !isActive}"
        />
      </router-link>
    </div>

    <div>
      <div
        class="bg-surface-0 dark:bg-surface-900 rounded-2xl mb-6 px-6 py-4 md:px-6 md:py-3 border-b md:border border-surface-200 dark:border-surface-700 w-full sticky top-0 z-30"
      >
        <h3 class="text-xl font-semibold text-[#17316E] mb-4">Filter Data</h3>
        <div class="grid grid-cols-4 gap-4">
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
        <div class="mt-4 flex gap-2">
          <Button label="Cari" icon="pi pi-search" class="p-button-info" @click="searchData" />
          <Button
            label="Reset Filter"
            icon="pi pi-refresh"
            class="p-button-secondary"
            @click="resetFilter"
          />
          <Button
            label="Tarik Data Kurang Bayar"
            icon="pi pi-refresh"
            class="p-button-warning"
            style="background-color: #ffa500; border: none; color: #fff"
            @click="openSyncDialog"
          />
        </div>
      </div>
      

      <div
        class="bg-surface-0 dark:bg-surface-900 rounded-2xl my-6 px-6 py-4 md:px-6 md:py-3 border-b md:border border-surface-200 dark:border-surface-700 w-full sticky top-0 z-30"
      >
        <div class="flex justify-between items-center mb-2">
          <h3 class="text-xl font-semibold text-[#17316E]">Data Kurang Bayar</h3>
          <div class="flex gap-2">
            <Button
              label="Tambah Data"
              icon="pi pi-plus"
              class="p-button-primary"
              @click="handleAdd"
            />
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
          :globalFilterFields="[
            'noBukti',
            'tglBukti',
            'tglSetor',
            'noSetor',
            'rekeningDpa',
            'loketKasir',
            'caraBayar',
            'bank',
            'jenis',
          ]"
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
            </div>
          </template>

          <Column field="noBukti" header="No Bukti" :showFilterMatchModes="false" style="min-width: 12rem">
            <template #body="{ data }">
              {{ data.noBukti }}
            </template>
            <template #filter="{ filterModel }">
              <InputText v-model="filterModel.value" type="text" placeholder="Search by No Bukti" />
            </template>
          </Column>

          <Column field="tglBukti" header="Tanggal Bukti" :showFilterMatchModes="false" style="min-width: 12rem">
            <template #body="{ data }">
              {{ data.tglBukti }}
            </template>
            <template #filter="{ filterModel }">
              <DatePicker v-model="filterModel.value" dateFormat="dd/mm/yy" placeholder="dd/mm/yyyy" />
            </template>
          </Column>

          <Column field="tglSetor" header="Tanggal Setor" :showFilterMatchModes="false" style="min-width: 12rem">
            <template #body="{ data }">
              {{ data.tglSetor }}
            </template>
            <template #filter="{ filterModel }">
              <DatePicker v-model="filterModel.value" dateFormat="dd/mm/yy" placeholder="dd/mm/yyyy" />
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

          <Column field="nominal" header="Nominal" style="text-align: right">
            <template #body="slotProps">
              {{ new Intl.NumberFormat('id-ID').format(slotProps.data.nominal || 0) }}
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

          <Column field="loketKasir" header="Loket Kasir" :showFilterMatchModes="false" style="min-width: 12rem">
            <template #body="{ data }">
              {{ data.loketKasir }}
            </template>
            <template #filter="{ filterModel }">
              <InputText v-model="filterModel.value" type="text" placeholder="Search by Loket Kasir" />
            </template>
          </Column>

          <Column field="caraBayar" header="Cara Pembayaran" :showFilterMatchModes="false" style="min-width: 12rem">
            <template #body="{ data }">
              {{ data.caraBayar }}
            </template>
            <template #filter="{ filterModel }">
              <InputText v-model="filterModel.value" type="text" placeholder="Search by Cara Pembayaran" />
            </template>
          </Column>

          <Column field="bank" header="Bank" :showFilterMatchModes="false" style="min-width: 12rem">
            <template #body="{ data }">
              {{ data.bank }}
            </template>
            <template #filter="{ filterModel }">
              <InputText v-model="filterModel.value" type="text" placeholder="Search by Bank" />
            </template>
          </Column>

          <Column field="jenis" header="Jenis" :showFilterMatchModes="false" style="min-width: 12rem">
            <template #body="{ data }">
              {{ data.jenis }}
            </template>
            <template #filter="{ filterModel }">
              <InputText v-model="filterModel.value" type="text" placeholder="Search by Jenis" />
            </template>
          </Column>
        </DataTable>
      </div>
    </div>


    <ModalSyncPenerimaan v-model="showModalSync" @sync="loadData" />
    <ModalEditKurangBayar v-model="showModalEdit" :item="selectedItem" @saved="handleSaved" />
    <ModalValidasiKurangBayar
      v-model="showModalValidasi"
      :item="validasiItem"
      @validated="handleValidated"
    />
    <Dialog
      :visible="showSyncDialog"
      @update:visible="showSyncDialog = $event"
      modal
      header="Tarik Data Kurang Bayar"
      :closable="true"
    >
      <div v-if="loadingSyncOptions">
        Loading...
      </div>
      <div v-else>
        <div class="p-field mb-4">
          <label for="syncType" class="block mb-2 font-semibold">Pilih Jenis Sinkronisasi</label>
          <Dropdown
            id="syncType"
            v-model="selectedSync"
            :options="syncOptions"
            optionLabel="label"
            placeholder="Pilih jenis sinkronisasi"
            class="w-full"
          />
        </div>
        <div v-if="selectedSync && syncParams.length > 0">
          <div v-for="param in syncParams" :key="param.field" class="p-field mb-4">
            <label :for="param.field" class="block mb-2 font-semibold">{{ param.label }}</label>
            <InputText
              v-if="param.type === 'string'"
              :id="param.field"
              v-model="syncForm[param.field]"
              type="text"
              class="w-full"
            />
            <Calendar
              v-if="param.type === 'date'"
              :id="param.field"
              v-model="syncForm[param.field]"
              dateFormat="yy-mm-dd"
              showIcon
              class="w-full"
            />
          </div>
        </div>
      </div>
      <template #footer>
        <Button
          label="Batal"
          icon="pi pi-times"
          @click="showSyncDialog = false"
          class="p-button-text"
        />
        <Button
          label="Tarik Data"
          icon="pi pi-cloud-download"
          @click="handleSyncSubmit"
          :loading="loadingSync"
          :disabled="!selectedSync"
        />
      </template>
    </Dialog>
    <Toast group="confirm">
      <template #message="slotProps">
        <div class="flex flex-col flex-1">
          <div class="text-center font-bold text-lg mb-2">
            {{ slotProps.message.summary }}
          </div>
          <div class="text-center text-sm mb-4">
            {{ slotProps.message.detail }}
          </div>
          <div class="flex gap-2">
            <Button
              label="Hapus"
              class="p-button-danger w-full"
              @click="onConfirmDelete(slotProps.message)"
            ></Button>
            <Button
              label="Batal"
              class="p-button-text w-full"
              @click="onReject"
            ></Button>
          </div>
        </div>
      </template>
    </Toast>
    <Toast />
  </div>
</template>