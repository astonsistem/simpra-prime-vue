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
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import ModalBKU from '@/components/pendapatan/bku/ModalBKU.vue'

const rowStyle = (rowData) => {
  if (rowData.tgl_valid) return { backgroundColor: '#d4edda', color: '#155724' }
}

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
const statusOptions = [
  { label: 'Data Awal', value: 'data awal' },
  { label: 'Validasi', value: 'validasi' },
  { label: 'PAD', value: 'pad' },
]
const jenisBKUOptions = ref([])
const akunOptions = ref([])
const rekeningOptions = ref([])
const data = ref([])
const totalRecords = ref(0)
const rows = ref(10)
const first = ref(0)
const loading = ref(false)
const selectedItem = ref(null)
const showModal = ref(false)
const sortField = ref(null)
const sortOrder = ref(null)

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
        q[key] = filters.value[key].value
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
    const response = await api.get('/bku', { params: query })
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

const handleAdd = () => {
  selectedItem.value = null
  showModal.value = true
}
const handleEdit = async (item) => {
  if (item.pad_id || item.pad_tgl) {
    toast.add({
      severity: 'warn',
      summary: 'Peringatan',
      detail: 'Data yang sudah dikirim PAD tidak dapat melakukan aksi ubah.',
      life: 3000,
    })
    return
  }
  try {
    loading.value = true
    const response = await api.get(`/bku/${item.bku_id}`)
    if (response.data) {
      selectedItem.value = { ...response.data }
      showModal.value = true
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
const handleLihat = async (item) => {
  try {
    loading.value = true
    await exportPDF(item.bku_id)
  } catch (error) {
    console.error("Aksi Lihat gagal:", error)
    toast.add({
      severity: "error",
      summary: "Gagal",
      detail: "Aksi Lihat gagal. Silakan coba lagi.",
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}
const handleValidasi = async (item) => {
  if (item.tgl_valid) {
    toast.add({
      severity: 'warn',
      summary: 'Peringatan',
      detail: 'Data yang sudah divalidasi tidak dapat melakukan aksi validasi.',
      life: 3000,
    })
    return
  }
  toast.add({
      severity: 'warn',
      summary: 'Konfirmasi',
      detail: 'Apakah Anda yakin ingin memvalidasi data ini?',
      group: 'confirm',
      data: {
          url: `/bku/validasi/${item.bku_id}`,
          title: 'validasi'
      }
  })
}
const handleKirimPAD = async (item) => {
  if (!item.tgl_valid) {
    toast.add({
      severity: 'warn',
      summary: 'Peringatan',
      detail: 'Data yang belum divalidasi tidak dapat melakukan aksi kirim PAD.',
      life: 3000,
    })
    return
  }
  toast.add({
      severity: 'warn',
      summary: 'Konfirmasi',
      detail: 'Apakah Anda yakin ingin mengirim PAD data ini?',
      group: 'confirm',
      data: {
          url: `/bku/kirim_pad/${item.bku_id}`,
          title: 'kirim pad'
      }
  })
}
const handleBatalPAD = async (item) => {
  if (!item.pad_id) {
    toast.add({
      severity: 'warn',
      summary: 'Peringatan',
      detail: 'Data yang belum dikirim PAD tidak dapat melakukan aksi batal PAD.',
      life: 3000,
    })
    return
  }
  toast.add({
      severity: 'warn',
      summary: 'Konfirmasi',
      detail: 'Apakah Anda yakin ingin membatalkan PAD data ini?',
      group: 'confirm',
      data: {
          url: `/bku/batal_pad/${item.bku_id}`,
          title: 'batal pad'
      }
  })
}
const handleBatalValidasi = async (item) => {
  if (!item.tgl_valid) {
    toast.add({
      severity: 'warn',
      summary: 'Peringatan',
      detail: 'Data yang belum divalidasi tidak dapat melakukan aksi batal validasi.',
      life: 3000,
    })
    return
  }
  toast.add({
      severity: 'warn',
      summary: 'Konfirmasi',
      detail: 'Apakah Anda yakin ingin membatalkan validasi data ini?',
      group: 'confirm',
      data: {
          url: `/bku/batal_validasi/${item.bku_id}`,
          title: 'batal validasi'
      }
  })
}
const handleDelete = (item) => {
  if (item.tgl_valid) {
    toast.add({
      severity: 'warn',
      summary: 'Peringatan',
      detail: 'Data yang sudah valid tidak dapat dihapus.',
      life: 3000,
    })
    return
  }
  toast.add({
      severity: 'warn',
      summary: 'Konfirmasi',
      detail: 'Apakah Anda yakin ingin menghapus data ini?',
      group: 'confirm',
      data: {
          url: `/bku/${item.bku_id}`,
          title: 'hapus'
      }
  })
}
const onConfirmAction = async (event) => {
    toast.removeGroup('confirm')
    const { url, title } = event.data
    try {
        if (title === 'hapus') {
            await api.delete(url)
        } else {
            await api.get(url)
        }
        toast.add({
            severity: 'success',
            summary: 'Berhasil',
            detail: `Aksi ${title} berhasil dijalankan`,
            life: 3000,
        })
        first.value = 0
        loadData(1, rows.value)
    } catch (error) {
        console.error(`Gagal ${title}:`, error)
        toast.add({
            severity: 'error',
            summary: 'Gagal',
            detail: `Aksi ${title} gagal. Silakan coba lagi.`,
            life: 3000,
        })
    }
}
const onReject = () => {
    toast.removeGroup('confirm')
}
const handleSaved = () => {
  showModal.value = false
  first.value = 0
  loadData(1, rows.value)
}

const fetchJenisBKU = async () => {
  try {
    const response = await api.get('/jenis_bku/list')
    if (response.data && response.data.data) {
      jenisBKUOptions.value = response.data.data.map((item) => ({
        label: item.jenisbku_nama,
        value: item.jenisbku_id,
      }))
    }
  } catch (error) {
    console.error('Gagal memuat data jenis bku:', error)
  }
}
const fetchAkun = async () => {
  try {
    const response = await api.get('/akun/list')
    if (response.data && response.data.data) {
      akunOptions.value = response.data.data.map((item) => ({
        label: item.akun_nama,
        value: item.akun_id,
      }))
    }
  } catch (error) {
    console.error('Gagal memuat data akun:', error)
  }
}
const fetchRekening = async () => {
  try {
    const response = await api.get('/rekening/list')
    if (response.data && response.data.data) {
      rekeningOptions.value = response.data.data.map((item) => ({
        label: item.rek_nama,
        value: item.rek_id,
      }))
    }
  } catch (error) {
    console.error('Gagal memuat data rekening:', error)
  }
}

onMounted(async () => {
  await fetchJenisBKU()
  await fetchAkun()
  await fetchRekening()
})

const exportExcel = () => {
  try {
    // Prepare headers for Excel (excluding Action column)
    const headers = [
      'No',
      'No BKU',
      'Tgl BKU',
      'Tgl Valid',
      'Jenis',
      'Tgl PAD',
      'Uraian',
      'Total',
      'Pendapatan',
      'PDD',
      'Piutang',
      'Status',
    ]

    // Prepare data for Excel
    const excelData = data.value.map((item, index) => [
      item.no || index + 1,
      item.no_bku || '',
      item.tgl_bku || '',
      item.tgl_valid || '',
      item.jenis ?? 0,
      item.pad_tgl || '',
      item.uraian || '',
      item.total ?? 0,
      item.pendapatan ?? 0,
      item.pdd ?? 0,
      item.piutang ?? 0,
      item.status || '',
    ])

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...excelData])
    // Auto-fit columns
    worksheet['!cols'] = headers.map((header, i) => ({
      wch: Math.max(
        header.length,
        ...excelData.map(row =>
          row[i] ? row[i].toString().length : 0
        )
      ) + 2,
    }))
    XLSX.utils.book_append_sheet(workbook, worksheet, 'BKU')


    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })

    // Download file
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `bku_${new Date().toISOString().split('T')[0]}.xlsx`)
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

const initFilters = () => {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    no_bku: { value: null, matchMode: FilterMatchMode.CONTAINS },
    uraian: { value: null, matchMode: FilterMatchMode.CONTAINS },
    jenisbku_nama: { value: null, matchMode: FilterMatchMode.CONTAINS },
    status: { value: null, matchMode: FilterMatchMode.EQUALS },
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

async function exportPDF(bkuId) {
  const response = await api.get(`/bku/${bkuId}`)

  if (response.status !== 200) {
    throw new Error("Gagal ambil data dari API")
  }

  const { jenis, no_bku, tgl_bku, uraian, total, pendapatan, pdd, piutang, rincian } = response.data
  console.log(response)

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })
  const pageWidth = doc.internal.pageSize.getWidth()

  // === Logo ===
  const img = new Image()
  img.src = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTR8XOakzh-V_i0pMpEb2WRXmsm20150mz9WxBXNo_xU0fUURAEvwCYjZnGfV_VFUHi-S0&usqp=CAU"
  await new Promise((resolve) => (img.onload = resolve))
  const imgWidth = 40
  const imgHeight = 40
  const logoX = (pageWidth - imgWidth) / 2
  const logoY = 10
  doc.addImage(img, "PNG", logoX, logoY, imgWidth, imgHeight)

  let y = logoY + imgHeight + 15

  // ====== Jenis 1 ======
  if (jenis == 1) {
    doc.setFont("helvetica", "bold")
    doc.setFontSize(14)
    doc.text("Rekapitulasi Penyetoran Kas Harian", pageWidth / 2, y, { align: "center" })
    y += 20

    doc.setFont("helvetica", "normal")
    doc.setFontSize(12)

    const leftX = 50
    const midX = 95

    doc.text("No. BKU", leftX, y)
    doc.text(":", midX, y)
    doc.text(no_bku || "-", midX + 5, y)

    y += 10
    doc.text("Tgl. BKU", leftX, y)
    doc.text(":", midX, y)
    doc.text(formatDateID(tgl_bku) || "-", midX + 5, y)

    y += 10
    doc.text("Uraian", leftX, y)
    doc.text(":", midX, y)
    doc.text(uraian || "-", midX + 5, y)

    y += 15
    doc.text("Total", leftX, y)
    doc.text(":", midX, y)
    doc.text("Rp.", midX + 5, y)
    doc.text(total ? total.toLocaleString("id-ID") : "0", pageWidth - 60, y, { align: "right" })
  }

  // ====== Jenis 9 ======
  else if (jenis == 9) {
    doc.setFont("helvetica", "bold")
    doc.setFontSize(14)
    doc.text("Rekapitulasi Distribusi Kas Harian", pageWidth / 2, y, { align: "center" })
    y += 20

    doc.setFont("helvetica", "normal")
    doc.setFontSize(12)

    const leftX = 50
    const midX = 95

    doc.text("No. BKU", leftX, y)
    doc.text(":", midX, y)
    doc.text(no_bku || "-", midX + 5, y)

    y += 10
    doc.text("Tgl. BKU", leftX, y)
    doc.text(":", midX, y)
    doc.text(formatDateID(tgl_bku) || "-", midX + 5, y)

    y += 10
    doc.text("Uraian", leftX, y)
    doc.text(":", midX, y)
    doc.text(uraian || "-", midX + 5, y)

    y += 15
    doc.text("Total", leftX, y)
    doc.text(":", midX, y)
    doc.text("Rp.", midX + 5, y)
    doc.text(total ? total.toLocaleString("id-ID") : "0", pageWidth - 60, y, { align: "right" })
  }

  // ====== Jenis 2 ======
  else if (jenis == 2) {
    doc.setFont("helvetica", "bold")
    doc.text("Rekapitulasi Penerimaan Harian Kas Tunai", pageWidth / 2, y, { align: "center" })
    y += 8
    doc.setFont("helvetica", "normal")
    doc.text(`Tanggal ${formatDateID(tgl_bku)}`, pageWidth / 2, y, { align: "center" })
    y += 8
    doc.text(`No. ${no_bku}`, pageWidth / 2, y, { align: "center" })
    y += 15

    if (Array.isArray(rincian) && rincian.length > 0) {
      autoTable(doc, { 
        startY: y,
        head: [["No.", "Uraian", "Total", "Pendapatan", "PDD", "Piutang"]],
        body: rincian.map((row, i) => [
          i + 1,
          row.uraian,
          row.jumlah.toLocaleString("id-ID"),
          row.pendapatan.toLocaleString("id-ID"),
          row.pdd.toLocaleString("id-ID"),
          row.piutang.toLocaleString("id-ID"),
        ]),
        foot: [
          [
            { content: "Total", colSpan: 2, styles: { halign: "center", fontStyle: "bold" } }, 
            total.toLocaleString("id-ID"), 
            pendapatan.toLocaleString("id-ID"), 
            pdd.toLocaleString("id-ID"), 
            piutang.toLocaleString("id-ID")
          ]
        ],
        styles: {
          lineWidth: 0.2,   // thicker lines for all cells
          lineColor: [0, 0, 0], // black color
          fontSize: 12,
        },
      })
    } else {
      doc.text("Tidak ada data rincian", pageWidth / 2, y + 10, { align: "center" })
    }
  }

  // ====== Jenis 3 ======
  else if (jenis == 3) {
    doc.setFont("helvetica", "bold")
    doc.text("Rekapitulasi Penerimaan Langsung Bank Harian", pageWidth / 2, y, { align: "center" })
    y += 8
    doc.setFont("helvetica", "normal")
    doc.text(`Tanggal ${formatDateID(tgl_bku)}`, pageWidth / 2, y, { align: "center" })
    y += 8
    doc.text(`No. ${no_bku}`, pageWidth / 2, y, { align: "center" })
    y += 15

    if (Array.isArray(rincian) && rincian.length > 0) {
      autoTable(doc, { 
        startY: y,
        head: [["No.", "Uraian", "Total", "Pendapatan", "PDD", "Piutang"]],
        body: rincian.map((row, i) => [
          i + 1,
          row.uraian,
          row.jumlah.toLocaleString("id-ID"),
          row.pendapatan.toLocaleString("id-ID"),
          row.pdd.toLocaleString("id-ID"),
          row.piutang.toLocaleString("id-ID"),
        ]),
        foot: [
          [
            { content: "Total", colSpan: 2, styles: { halign: "center", fontStyle: "bold" } }, 
            total.toLocaleString("id-ID"), 
            pendapatan.toLocaleString("id-ID"), 
            pdd.toLocaleString("id-ID"), 
            piutang.toLocaleString("id-ID")
          ]
        ],
        styles: {
          lineWidth: 0.2,   // thicker lines for all cells
          lineColor: [0, 0, 0], // black color
          fontSize: 12,
        },
      })
    } else {
      doc.text("Tidak ada data rincian", pageWidth / 2, y + 10, { align: "center" })
    }
  }

  doc.save(`bku_${jenis}_${no_bku}.pdf`)
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
        <div class="flex gap-2">
          <Button label="Tambah Data" icon="pi pi-plus" class="p-button-success" @click="handleAdd" />
          <Button label="Export Excel" icon="pi pi-file-excel" class="p-button-success" @click="exportExcel"/>
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
        @sort="onSort"
        sortMode="single"
        dataKey="id"
        filterDisplay="menu"
        class="p-datatable-sm"
        :rowStyle="rowStyle"
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
                { label: 'Ubah', icon: 'pi pi-pencil', command: () => handleEdit(slotProps.data) },
                { label: 'Lihat', icon: 'pi pi-download', command: () => handleLihat(slotProps.data) },
                { label: 'Validasi', icon: 'pi pi-check', command: () => handleValidasi(slotProps.data) },
                { label: 'Kirim PAD', icon: 'pi pi-send', command: () => handleKirimPAD(slotProps.data) },
                { label: 'Batal PAD', icon: 'pi pi-times', command: () => handleBatalPAD(slotProps.data) },
                { label: 'Batal Validasi', icon: 'pi pi-times', command: () => handleBatalValidasi(slotProps.data) },
                { label: 'Hapus', icon: 'pi pi-trash', command: () => handleDelete(slotProps.data) },
              ]"
            />
          </template>
        </Column>
        <Column 
          field="no_bku" 
          header="No BKU" 
          :showFilterMatchModes="false" 
          style="min-width: 12rem"
        >
            <template #body="{ data }">
                {{ data.no_bku }}
            </template>
            <template #filter="{ filterModel }">
              <InputText v-model="filterModel.value" type="text" placeholder="Search No BKU" />
            </template>
        </Column>
        <Column 
          field="tgl_bku" 
          header="Tgl BKu" 
          sortable 
          style="min-width: 8rem"
        >
          <template #body="{ data }">
            {{ formatDateID(data.tgl_bku) }}
          </template>
        </Column>
        <Column 
          field="tgl_valid" 
          header="Tgl Valid" 
          sortable 
          style="min-width: 8rem"
        >
          <template #body="{ data }">
            {{ formatDateID(data.tgl_valid) }}
          </template>
        </Column>
        <Column
          field="jenisbku_nama"
          header="Jenis"
          :showFilterMatchModes="false"
          style="min-width:6rem;text-align:center"
        >
          <template #body="{ data }">
            {{ data.jenisbku_nama }}
          </template>
          <template #filter="{ filterModel }">
            <Dropdown
              v-model="filterModel.value"
              :options="jenisBKUOptions"
              optionLabel="label"
              optionValue="label"
              placeholder="Select Jenis"
              class="p-column-filter"
              showClear
            />
          </template>
        </Column>
        <Column 
          field="pad_tgl" 
          header="Tgl PAD" 
          sortable 
          style="min-width: 8rem"
        >
          <template #body="{ data }">
            {{ formatDateID(data.pad_tgl) }}
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
        <Column field="total" header="Total" style="text-align: right">
            <template #body="slotProps">
                {{ new Intl.NumberFormat('id-ID').format(slotProps.data.total || 0) }}
            </template>
        </Column>
        <Column field="pendapatan" header="Pendapatan" style="text-align: right">
            <template #body="slotProps">
                {{ new Intl.NumberFormat('id-ID').format(slotProps.data.pendapatan || 0) }}
            </template>
        </Column>
        <Column field="pdd" header="PDD" style="text-align: right">
            <template #body="slotProps">
                {{ new Intl.NumberFormat('id-ID').format(slotProps.data.pdd || 0) }}
            </template>
        </Column>
        <Column field="piutang" header="Piutang" style="text-align: right">
            <template #body="slotProps">
                {{ new Intl.NumberFormat('id-ID').format(slotProps.data.piutang || 0) }}
            </template>
        </Column>
        <Column
          field="status"
          header="Status"
          :showFilterMatchModes="false"
          style="min-width:6rem;text-align:center"
        >
          <template #body="{ data }">
            {{ data.status }}
          </template>
          <template #filter="{ filterModel }">
            <Dropdown
              v-model="filterModel.value"
              :options="statusOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Select Status"
              class="p-column-filter"
              showClear
            />
          </template>
        </Column>
      </DataTable>
    </div>
    <ModalBKU 
      v-model="showModal" 
      :item="selectedItem" 
      :options="{
        jenis: jenisBKUOptions,
        akun: akunOptions,
        rekening: rekeningOptions,
      }"
      @saved="handleSaved" 
    />
    <Toast />
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
            <Button label="Ya" @click="onConfirmAction(slotProps.message)" />
          </div>
        </div>
      </template>
    </Toast>
  </div>
</template>

<style scoped>
.p-datatable .p-datatable-thead > tr > th {
  white-space: nowrap;
  text-align: center;
  padding: 0.5rem 0.75rem;
}
</style>