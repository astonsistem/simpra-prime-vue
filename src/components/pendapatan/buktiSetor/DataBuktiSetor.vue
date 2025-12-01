<!-- Perubahan uji push ke branch akrual -->
<script setup>
import { ref, onMounted } from 'vue'
import { FilterMatchMode } from '@primevue/core/api'
import DatePicker from 'primevue/datepicker'
import Select from 'primevue/select'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import SplitButton from 'primevue/splitbutton'
import api from '@/api/client.js'
import { useToast } from 'primevue/usetoast'
import Toast from 'primevue/toast'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatCurrency } from '@/utils/utils'
import ModalSetor from '@/components/pendapatan/billingKasir/ModalSetorBillingKasir.vue'

const formatDateToYYYYMMDD = (date) => {
  if (!date) return null
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
function formatDateID(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID')
}

// Filter state
const toast = useToast()
const formFilters = ref({
  jenisPeriode: 'BULANAN',
  tahunPeriode: null,
  bulanAwal: null,
  bulanAkhir: null,
  tglAwal: null,
  tglAkhir: null,
})
const filters = ref()
const tahunPeriodeOptions = Array.from(
  { length: 10 },
  (_, i) => {
    const year = new Date().getFullYear() - 5 + i
    return { label: `${year}`, value: year }
  }
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
const bankOptions = ref([])
const data = ref([])
const totalRecords = ref(0)
const rows = ref(10)
const first = ref(0)
const loading = ref(false)
const selectedItem = ref(null)
const showModalSetor = ref(false)
const sortField = ref(null)
const sortOrder = ref(null)
const modalSetor = ref(null)

const buildQuery = (page = 1, pageSize = rows.value) => {
  const q = {
    page,
    size: pageSize,
  }
  if (formFilters.value.jenisPeriode) q.periode = formFilters.value.jenisPeriode
  if (formFilters.value.jenisPeriode === 'BULANAN') {
    if (formFilters.value.tahunPeriode) {
      q.tahun_periode = formFilters.value.tahunPeriode
    }
    if (formFilters.value.bulanAwal && formFilters.value.bulanAkhir) {
      if (!formFilters.value.tahunPeriode) {
        toast.add({
          severity: 'warn',
          summary: 'Peringatan',
          detail: 'Filter Tahun Periode harus terisi ketika Bulan Awal atau Bulan Akhir terisi.',
          life: 3000,
        })
        return null
      }
      const year = formFilters.value.tahunPeriode || new Date().getFullYear()
      const startDate = new Date(year, formFilters.value.bulanAwal - 1, 1)
      const endDate = new Date(year, formFilters.value.bulanAkhir, 0)
      q.tgl_awal = formatDateToYYYYMMDD(startDate)
      q.tgl_akhir = formatDateToYYYYMMDD(endDate)
    } else if (formFilters.value.bulanAwal || formFilters.value.bulanAkhir) {
      if (!formFilters.value.tahunPeriode) {
        toast.add({
          severity: 'warn',
          summary: 'Peringatan',
          detail: 'Filter Tahun Periode harus terisi ketika Bulan Awal atau Bulan Akhir terisi.',
          life: 3000,
        })
        return null
      }
      toast.add({
        severity: 'warn',
        summary: 'Peringatan',
        detail: 'Filter Bulan Awal dan Bulan Akhir harus terisi semua ketika salah satu terisi.',
        life: 3000,
      })
      return null
    }
  } else if (formFilters.value.jenisPeriode === 'TANGGAL') {
    if (formFilters.value.tglAwal && formFilters.value.tglAkhir) {
      q.tgl_awal = formatDateToYYYYMMDD(formFilters.value.tglAwal)
      q.tgl_akhir = formatDateToYYYYMMDD(formFilters.value.tglAkhir)
    } else if (formFilters.value.tglAwal || formFilters.value.tglAkhir) {
      toast.add({
        severity: 'warn',
        summary: 'Peringatan',
        detail: 'Filter Tanggal Awal dan Tanggal Akhir harus terisi semua ketika salah satu terisi.',
        life: 3000,
      })
      return null
    }
  }

  if (filters.value) {
    Object.keys(filters.value).forEach((key) => {
      if (filters.value[key].value !== null && filters.value[key].value !== undefined) {
        if (key === "total_setor") {
          q[key] = {
            value: filters.value[key].value,
            matchMode: filters.value[key].matchMode
          }
        } else {
          q[key] = filters.value[key].value
        }
      }
    })
  }

  if (sortField.value) {
    q.sortField = sortField.value
    q.sortOrder = sortOrder.value === 1 ? 'asc' : 'desc'
  }

  return q
}
const loadData = async (page = 1, pageSize = rows.value) => {
  loading.value = true
  try {
    const query = buildQuery(page, pageSize)
    if (!query) {
      loading.value = false
      return
    }
    const response = await api.get('/bukti_setor', { params: query })
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
    jenisPeriode: 'BULANAN',
    tahunPeriode: null,
    bulanAwal: null,
    bulanAkhir: null,
    tglAwal: null,
    tglAkhir: null,

  }
  first.value = 0
  data.value = []
  totalRecords.value = 0 
}
const searchData = () => {
  first.value = 0
  loadData(1, rows.value)
}

const handleSetor = async (item) => {
  try {
    loading.value = true
    const response = await api.get(`/bukti_setor/${item.rc_id}`)
    if (response.data) {
      selectedItem.value = { ...response.data }
      showModalSetor.value = true
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
const handleCetak = async (item) => {
  try {
    loading.value = true
    await exportPDF(item.rc_id)
  } catch (error) {
    console.error("Aksi Cetak gagal:", error)
    toast.add({
      severity: "error",
      summary: "Gagal",
      detail: "Aksi Cetak gagal. Silakan coba lagi.",
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}

const fetchBank = async () => {
  try {
    const response = await api.get('/bank/list')
    if (response.data && response.data.data) {
      bankOptions.value = response.data.data.map((item) => ({
        label: item.bank_nama,
        value: item.bank_id,
      }))
    }
  } catch (error) {
    console.error('Gagal memuat data bank:', error)
  }
}

onMounted(async () => {
  await fetchBank()
})

const initFilters = () => {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    uraian: { value: null, matchMode: FilterMatchMode.CONTAINS },
    bank: { value: null, matchMode: FilterMatchMode.CONTAINS },
    total_setor: { value: null, matchMode: FilterMatchMode.EQUALS },
  }
}
initFilters()

const onFilter = (event) => {
  filters.value = event.filters
  first.value = 0
  loadData(1, rows.value)
}
const clearTableFilters = () => {
  initFilters()
  first.value = 0
  loadData(1, rows.value)
}

const onSort = (event) => {
  sortField.value = event.sortField
  sortOrder.value = event.sortOrder
  first.value = 0
  loadData(1, rows.value)
}

function hitungTotalBruto(items) {
  return formatCurrency(
    items.reduce((total, item) => total + parseInt(item.total || 0), 0)
  )
}

function hitungTotalNetto(items) {
  return formatCurrency(
    items.reduce((total, item) => total + parseInt(item.total_jumlah_netto || 0), 0)
  )
}

async function exportPDF(rcId) {
  // API 1 endpoint utama yang sudah ada
  const response = await api.get(`/billing_kasir/setor/${rcId}`)

  if (response.data.status !== 200) {
    throw new Error("Gagal ambil data dari API")
  }

  const { rekening_koran, billing_kasir, penerimaan_selisih, penerimaan_lain } =
    response.data.data

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4"
  })
  const pageWidth = doc.internal.pageSize.getWidth()

  // === Logo ===
  const img = new Image()
  img.src = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTR8XOakzh-V_i0pMpEb2WRXmsm20150mz9WxBXNo_xU0fUURAEvwCYjZnGfV_VFUHi-S0&usqp=CAU"
  await new Promise((resolve) => (img.onload = resolve))
  const imgWidth = 40
  const imgHeight = 40
  const x = (pageWidth - imgWidth) / 2
  const y = 10
  doc.addImage(img, "PNG", x, y, imgWidth, imgHeight)

  // === Judul ===
  doc.setFontSize(18)
  doc.text("Bukti Setor", pageWidth / 2, y + imgHeight + 10, { align: "center" })

  // === Tabel Form (rekening_koran) ===
  const fieldLabels = {
    tgl_rc: "Tanggal RC",
    no_rc: "No RC",
    nominal: "Nominal",
    uraian: "Uraian",
    bank: "Bank",
  }

  const formRows = Object.entries(rekening_koran ?? {})
    .filter(([key]) => key in fieldLabels)
    .map(([key, value]) => {
      let displayValue = value ?? ""
      if (key == "nominal") {
        displayValue = formatCurrency(displayValue)
      }
      return [fieldLabels[key], displayValue]
    })

  autoTable(doc, {
    startY: y + imgHeight + 20,
    body: formRows,
  })

  let tableY = doc.lastAutoTable.finalY + 10

  // === Table Config
  const defaultTableConfig = {
    styles: {
      fontSize: 7, // smaller font
      cellPadding: 2,
      overflow: "linebreak",
      lineWidth: 0.2,   // thicker lines for all cells
      lineColor: [0, 0, 0], // black color
    },
    headStyles: {
      fillColor: [41, 128, 185], // blue
      textColor: 255,
      halign: "center",
      valign: "middle",
      fontSize: 7,
      lineWidth: 0.2,   // thicker lines for all cells
      lineColor: [0, 0, 0], // black color
    },
    tableWidth: "wrap", // more precise
    margin: { left: 15, right: 15 },
    didDrawPage: function (data) {
      doc.setFontSize(7)
      doc.text(
        `Page ${doc.internal.getNumberOfPages()}`,
        data.settings.margin.left,
        doc.internal.pageSize.getHeight() - 5
      )
    },
    didDrawTable: function (data) {
      const tableWidth = data.table.width
      const safeMargin = 15 // minimal margin
      let centerX = (pageWidth - tableWidth) / 2
      if (centerX < safeMargin) centerX = safeMargin
      data.settings.margin.left = centerX
    }
  }

  // === Billing Kasir ===
  // Body
  const mapBillingKasir = (items) => {
    if (!items || items.length === 0) {
      return [["Data Kosong"]];
    }
    return items.map((v, i) => [
      i + 1, // No
      v.no_buktibayar ?? "-",
      formatDateID(v.tgl_buktibayar),
      v.no_closingkasir ?? "-",
      v.pasien_nama ?? "-",
      v.no_pendaftaran ?? "-",
      formatDateID(v.tgl_pelayanan),
      v.jenis_tagihan ?? "-",
      v.carabayar_nama ?? "-",
      v.cara_pembayaran ?? "-",
      v.bank_tujuan ?? "-",
      formatCurrency(v.total), 
      formatCurrency(v.jumlah_netto > 0 ? v.jumlah_netto : v.total_jumlah_netto)
    ])
  }
  const headersBillingKasir = [
    "No",
    "No.\nKwitansi",
    "Tgl.\nKwitansi",
    "No Closing",
    "Nama\nPasien",
    "No.\nPendaftaran",
    "Tgl.\nPelayanan",
    "Jenis\nTagihan",
    "Metode\nBayar",
    "Cara\nPembayaran",
    "Bank",
    "Jumlah\nBruto",
    "Jumlah\nNetto"
  ]
  const bodyBillingKasir = mapBillingKasir(billing_kasir)
  // Footer
  const footerBillingkasir = [
    [
      { content: "Total", colSpan: headersBillingKasir.length - 2, styles: { halign: "right", fontStyle: "bold" } },
      hitungTotalBruto(billing_kasir),
      hitungTotalNetto(billing_kasir),
    ]
  ]
  doc.text("Billing Kasir", pageWidth / 2, tableY, { align: "center" })
  autoTable(doc, { 
    ...defaultTableConfig,
    startY: tableY + 5, 
    head: [headersBillingKasir], 
    body: bodyBillingKasir,
    foot: footerBillingkasir,
    columnStyles: {
      1: { cellWidth: 35, overflow: "linebreak" }, // No. Kwitansi
      4: { cellWidth: 40, overflow: "linebreak" }, // Nama Pasien
      5: { cellWidth: 35, overflow: "linebreak" }, // No. Pendaftaran
      11: { cellWidth: 20, halign: "right" },      // Jumlah Bruto
      12: { cellWidth: 20, halign: "right" },      // Jumlah Netto
    }
  })
  tableY = doc.lastAutoTable.finalY + 10

  // === Penerimaan Selisih ===
  // Body
  const mapPenerimaanSelisih = (items) => {
    if (!items || items.length === 0) {
      return [["Data Kosong"]];
    }
    return items.map((v, i) => [
      i + 1, // No
      v.no_buktibayar ?? "-",
      formatDateID(v.tgl_buktibayar),
      v.no_closingkasir ?? "-",
      v.pasien_nama ?? "-",
      v.no_pendaftaran ?? "-",
      formatDateID(v.tgl_pelayanan),
      v.jenis_tagihan ?? "-",
      v.carabayar_nama ?? "-",
      v.cara_pembayaran ?? "-",
      v.bank_tujuan ?? "-",
      formatCurrency(v.total), 
      formatCurrency(v.total_jumlah_netto), 
    ])
  }
  const headersPenerimaanSelisih = [
    "No",
    "No.\nKwitansi",
    "Tgl.\nKwitansi",
    "No Closing",
    "Nama\nPasien",
    "No.\nPendaftaran",
    "Tgl.\nPelayanan",
    "Jenis\nTagihan",
    "Metode\nBayar",
    "Cara\nPembayaran",
    "Bank",
    "Jumlah\nBruto",
    "Jumlah\nNetto"
  ]
  const bodyPenerimaanSelisih = mapPenerimaanSelisih(penerimaan_selisih)
  // Footer
  const footerPenerimaanSelisih = [
    [
      { content: "Total", colSpan: headersPenerimaanSelisih.length - 2, styles: { halign: "right", fontStyle: "bold" } },
      hitungTotalBruto(penerimaan_selisih),
      hitungTotalNetto(penerimaan_selisih),
    ]
  ]
  doc.text("Penerimaan Selisih", pageWidth / 2, tableY, { align: "center" })
  autoTable(doc, {
    ...defaultTableConfig,
    startY: tableY + 5,
    head: [headersPenerimaanSelisih],
    body: bodyPenerimaanSelisih,
    foot: footerPenerimaanSelisih,
    columnStyles: {
      1: { cellWidth: 35, overflow: "linebreak" }, // No. Kwitansi
      4: { cellWidth: 40, overflow: "linebreak" }, // Nama Pasien
      5: { cellWidth: 35, overflow: "linebreak" }, // No. Pendaftaran
      11: { cellWidth: 20, halign: "right" },      // Jumlah Bruto
      12: { cellWidth: 20, halign: "right" },      // Jumlah Netto
    }
  })
  tableY = doc.lastAutoTable.finalY + 10

  // === Penerimaan Lain ===
  // Body
  const mapPenerimaanLain = (items) => {
    if (!items || items.length === 0) {
      return [["Data Kosong"]];
    }
    return items.map((v, i) => [
      i + 1, // No
      v.no_bayar ?? "-",
      formatDateID(v.tgl_bayar),
      v.pihak3 ?? "-",
      v.uraian ?? "-",
      v.no_dokumen ?? "-",
      formatDateID(v.tgl_dokumen),
      v.sumber?.sumber_nama ?? "-", // handle nested object
      v.cara_pembayaran ?? "-",
      v.bank_tujuan ?? "-",
      formatCurrency(v.total), 
      formatCurrency(v.total_jumlah_netto), 
    ])
  }
  const headersPenerimaanLain = [
    "No",
    "No.\nBayar",
    "Tgl.\nBayar",
    "Penyetor",
    "Uraian",
    "No.\nDokumen",
    "Tgl.\nDokumen",
    "Sumber\nTransaksi",
    "Cara\nPembayaran",
    "Bank",
    "Jumlah\nBruto",
    "Jumlah\nNetto"
  ]
  const bodyPenerimaanLain = mapPenerimaanLain(penerimaan_lain)
  // Footer
  const footerPenerimaanLain = [
    [
      { content: "Total", colSpan: headersPenerimaanLain.length - 2, styles: { halign: "right", fontStyle: "bold" } },
      hitungTotalBruto(penerimaan_lain),
      hitungTotalNetto(penerimaan_lain),
    ]
  ]
  doc.text("Penerimaan Lain", pageWidth / 2, tableY, { align: "center" })
  autoTable(doc, {
    ...defaultTableConfig,
    startY: tableY + 5,
    head: [headersPenerimaanLain],
    body: bodyPenerimaanLain,
    foot: footerPenerimaanLain,
    columnStyles: {
      1: { cellWidth: 35, overflow: "linebreak" }, // No. Bayar
      3: { cellWidth: 40, overflow: "linebreak" }, // Penyetor
      4: { cellWidth: 40, overflow: "linebreak" }, // Uraian
      5: { cellWidth: 35, overflow: "linebreak" }, // No. Dokumen
      11: { cellWidth: 20, halign: "right" },      // Jumlah Bruto
      12: { cellWidth: 20, halign: "right" },      // Jumlah Netto
    }
  })
  tableY = doc.lastAutoTable.finalY + 10

  doc.save(`bukti_setor_${rcId}.pdf`)
}
</script>

<template>
  <div class="p-4">
    <div
      class="bg-surface-0 dark:bg-surface-900 rounded-2xl my-6 px-6 py-4 md:px-6 md:py-3 border-b md:border border-surface-200 dark:border-surface-700 w-full sticky top-0 z-30"
    >
      <h3 class="text-xl font-semibold text-[#17316E] mb-4">Filter Data</h3>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Jenis Periode</label>
          <Select
            v-model="formFilters.jenisPeriode"
            :options="jenisPeriodeOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Jenis Periode"
            class="w-full"
          />
        </div>
        <template v-if="formFilters.jenisPeriode === 'BULANAN'">
          <div>
            <label class="block mb-1 text-sm font-medium text-gray-700">Tahun Periode</label>
            <Select
              v-model="formFilters.tahunPeriode"
              :options="tahunPeriodeOptions"
              optionLabel="label"
              optionValue="value"
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
        <template v-if="formFilters.jenisPeriode === 'TANGGAL'">
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
            />
          </div>
        </template>
      </div>
      <div class="mt-4 flex gap-2">
        <Button label="Cari" icon="pi pi-search" class="p-button-info" @click="searchData" />
        <Button
          label="Reset Filter"
          class="p-button-secondary"
          @click="resetFilter"
        />
      </div>
    </div>
    <div
      class="bg-surface-0 dark:bg-surface-900 rounded-2xl my-6 px-6 py-4 md:px-6 md:py-3 border-b md:border border-surface-200 dark:border-surface-700 w-full"
    >
      <div class="flex justify-between items-center mb-2">
        <Button label="Clear Column Filters" icon="pi pi-filter-slash" outlined @click="clearTableFilters" />
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
        @sort="onSort"
        sortMode="single"
        dataKey="id"
        filterDisplay="menu"
        class="p-datatable-sm"
      >
        <template #header>
        </template>
        <Column field="no" header="No" style="width: 5%" />
        <Column header="Action" style="width: 10%">
          <template #body="slotProps">
            <SplitButton
              label="Action" 
              icon="pi pi-ellipsis-v"
              size="small"
              severity="secondary"
              :model="[
                { label: 'Setor', icon: 'pi pi-money-bill', command: () => handleSetor(slotProps.data) },
                { label: 'Cetak', icon: 'pi pi-download', command: () => handleCetak(slotProps.data) },
              ]"
            />
          </template>
        </Column>
        <Column 
          field="tgl_rc" 
          header="Tgl Setor (Tgl RC)" 
          sortable 
          style="min-width: 8rem"
        >
          <template #body="{ data }">
            {{ formatDateID(data.tgl_rc) }}
          </template>
        </Column>
        <Column 
          field="uraian" 
          header="Uraian" 
          :showFilterMatchModes="false" 
          style="min-width: 30rem"
        >
            <template #body="{ data }">
                {{ data.uraian }}
            </template>
            <template #filter="{ filterModel }">
                <InputText v-model="filterModel.value" type="text" placeholder="Search Uraian" />
            </template>
        </Column>
        <Column
          field="bank"
          header="Bank"
          :showFilterMatchModes="false"
          style="min-width: 8rem"
        >
          <template #body="{ data }">
            {{ data.bank }}
          </template>
          <template #filter="{ filterModel }">
            <Dropdown
              v-model="filterModel.value"
              :options="bankOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Select Bank"
              class="p-column-filter"
              showClear
            />
          </template>
        </Column>
        <Column field="kredit" header="Nilai RC" style="text-align: right">
            <template #body="slotProps">
                {{ new Intl.NumberFormat('id-ID').format(slotProps.data.kredit || 0) }}
            </template>
        </Column>
        <Column field="volume" header="Jumlah Kwitansi" style="text-align: right">
            <template #body="slotProps">
                {{ new Intl.NumberFormat('id-ID').format(slotProps.data.volume || 0) }}
            </template>
        </Column>
        <Column field="total_kwitansi" header="Total Kwitansi" style="text-align: right">
            <template #body="slotProps">
                {{ new Intl.NumberFormat('id-ID').format(slotProps.data.total_kwitansi || 0) }}
            </template>
        </Column>
        <Column field="admin_kredit" header="Admin EDC" style="text-align: right">
            <template #body="slotProps">
                {{ new Intl.NumberFormat('id-ID').format(slotProps.data.admin_kredit || 0) }}
            </template>
        </Column>
        <Column field="admin_debit" header="Admin QRIS" style="text-align: right">
            <template #body="slotProps">
                {{ new Intl.NumberFormat('id-ID').format(slotProps.data.admin_debit || 0) }}
            </template>
        </Column>
        <Column 
          field="total_setor" 
          header="Total Setor" 
          :showFilterMatchModes="false" 
          :showFilterMenu="true"
          style="text-align: right"
        >
            <template #body="slotProps">
                {{ new Intl.NumberFormat('id-ID').format(slotProps.data.total_setor || 0) }}
            </template>
            <template #filter="{ filterModel }">
              <Dropdown
                v-model="filterModel.matchMode"
                :options="[
                  { label: 'Kurang dari', value: FilterMatchMode.LESS_THAN },
                  { label: 'Lebih dari', value: FilterMatchMode.GREATER_THAN },
                  { label: 'Kurang dari sama dengan', value: FilterMatchMode.LESS_THAN_OR_EQUAL_TO },
                  { label: 'Lebih dari sama dengan', value: FilterMatchMode.GREATER_THAN_OR_EQUAL_TO },
                  { label: 'Sama dengan', value: FilterMatchMode.EQUALS },
                  { label: 'Tidak sama dengan', value: FilterMatchMode.NOT_EQUALS }
                ]"
                optionLabel="label"
                optionValue="value"
                class="w-full mb-2"
              />
              <InputNumber 
                v-model="filterModel.value" 
                class="w-full"
                placeholder="Masukkan angka" 
                mode="currency"
                currency="IDR"
                locale="id-ID"
              />
            </template>
        </Column>
      </DataTable>
    </div>
    <ModalSetor 
      ref="modalSetor"
      v-model="showModalSetor" 
      :item="selectedItem" 
    />
    <Toast />
  </div>
</template>

<style scoped>
.p-datatable .p-datatable-thead > tr > th {
  white-space: nowrap;
  text-align: center;
  padding: 0.5rem 0.75rem;
}
</style>