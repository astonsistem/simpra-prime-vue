import { ref } from 'vue'
import usePeriodeFilter from '@/composables/usePeriodeFilter'
import { formatDateToYYYYMMDD } from '@/utils/dateUtils.js'
import apiClient from '@/api/client'
import { useToast } from 'primevue'
import { FilterMatchMode } from '@primevue/core/api'
import { exportExcel as exportExcelUtil } from '../utils/utils'

export function usePenerimaanLain() {
  const { bulanOptions, tahunPeriodeOptions, jenisPeriodeOptions, formFilters } = usePeriodeFilter()

  const filters = ref()
  const loading = ref(false)
  const data = ref([])
  const rows = ref(10)
  const totalRecords = ref(0)
  const toast = useToast()
  const PATH ='/penerimaan_lain' 

  function initFilters() {
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
      cara_pembayaran: { value: null, matchMode: FilterMatchMode.CONTAINS },
      rekening_dpa: { value: null, matchMode: FilterMatchMode.CONTAINS },
      bank_tujuan: { value: null, matchMode: FilterMatchMode.CONTAINS },
      total: { value: null, matchMode: FilterMatchMode.EQUALS },
      admin_kredit: { value: null, matchMode: FilterMatchMode.EQUALS },
      admin_debit: { value: null, matchMode: FilterMatchMode.EQUALS },
      selisih: { value: null, matchMode: FilterMatchMode.EQUALS },
      is_valid: { value: null, matchMode: FilterMatchMode.EQUALS },
      jumlahBruto: { value: null, min: null, max: null, matchMode: FilterMatchMode.BETWEEN },
      jumlahNetto: { value: null, min: null, max: null, matchMode: FilterMatchMode.BETWEEN },
      export: {value: null}
    }

    formFilters.value = {
      jenis_periode: 'BULANAN',
      tahunPeriode: '',
      bulanAwal: null,
      bulanAkhir: null,
      tglAwal: null,
      tglAkhir: null,
    }
  }

  function clearFilters () {
    initFilters()
    loadData(1, rows.value)
  }

  function buildQuery(page = 1, pageSize = 10) {
    const q = {
      page,
      size: pageSize,
    }
    if (formFilters.value.jenis_periode) q.periode = formFilters.value.jenis_periode
    if (formFilters.value.jenis_periode === 'BULANAN') {
      if (formFilters.value.tahunPeriode) {
        q.tahunPeriode = formFilters.value.tahunPeriode
      }
      if (formFilters.value.bulanAwal) {
        const year = formFilters.value.tahunPeriode || new Date().getFullYear()
        const startDate = new Date(year, formFilters.value.bulanAwal - 1, 1)
        q.tglAwal = formatDateToYYYYMMDD(startDate)
      }
      if (formFilters.value.bulanAkhir) {
        const year = formFilters.value.tahunPeriode || new Date().getFullYear()
        const endDate = new Date(year, formFilters.value.bulanAkhir, 0)
        q.tglAkhir = formatDateToYYYYMMDD(endDate)
      }
    } else if (formFilters.value.jenis_periode === 'TANGGAL') {
      if (formFilters.value.tglAwal) q.tglAwal = formatDateToYYYYMMDD(formFilters.value.tglAwal)
      if (formFilters.value.tglAkhir) q.tglAkhir = formatDateToYYYYMMDD(formFilters.value.tglAkhir)
    }

    if (filters.value) {
      Object.keys(filters.value).forEach((key) => {

        if (filters.value[key].value) {
          // Handle date filters specially
          if (key === 'tgl_bayar' || key === 'tgl_dokumen') {
            q[key] = formatDateToYYYYMMDD(filters.value[key].value)
          } else {
            q[key] = filters.value[key].value
          }
        }

        // jumlahBruto filter (between)
        if (key === 'jumlahBruto') {
          if (filters.value[key]?.min !== null) {
            q['jumlahBrutoMin'] = filters.value[key].min
          }
          if (filters.value[key]?.max !== null) {
            q['jumlahBrutoMax'] = filters.value[key].max
          }
        }
        // jumlahNetto filter (between)
        if (key === 'jumlahNetto') {
          if (filters.value[key]?.min !== null) {
            q['jumlahNettoMin'] = filters.value[key].min
          }
          if (filters.value[key]?.max !== null) {
            q['jumlahNettoMax'] = filters.value[key].max
          }
        }
      })
    }

    return q
  }

  async function loadData(page = 1, pageSize = 10) {
    return await fetchData(PATH, page, pageSize)
  }

  async function fetchData(path, page = 1, pageSize = 10) {
    try {
      const query = buildQuery(page, pageSize)

      const response = await apiClient.get(path, { params: query })
      if (response.data && response.data.data) {
        data.value = response.data.data
        totalRecords.value = response.data?.meta?.total ?? 0
      }
    } catch (error) {
      console.error('Gagal memuat data:', error)
      toast.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal memuat data', life: 3000 })
    } finally {
      loading.value = false
    }
  }

  async function exportExcel(modul = 'Penerimaan Lain')
  {
    try {
      const headers = [
        'No',
        'No Bayar',
        'Tanggal Bayar',
        'Pihak3',
        'Uraian',
        'No Dokumen',
        'Tanggal Dokumen',
        'Sumber Transaksi',
        'Instalasi',
        'Cara Pembayaran',
        'Rekening DPA',
        'Bank',
        'Jumlah Bruto',
        'Biaya Admin EDC',
        'Biaya Admin QRIS',
        'Selisih',
        'Jumlah Netto',
      ]
  
      filters.value.export.value = true
      
      const response = await apiClient.get(PATH, {params: buildQuery()})
      
      filters.value.export.value = null
      
      const dataExcel = response.data.data
      const excelData = dataExcel.map((item, index) => [
        item.no || index + 1,
        item.no_bayar || '',
        item.tgl_bayar || '',
        item.pihak3 || '',
        item.uraian || '',
        item.no_dokumen || '',
        item.tgl_dokumen || '',
        item.sumber_transaksi || '',
        item.instalasi || '',
        item.cara_pembayaran || '',
        item.rekening_dpa?.rek_nama || '',
        item.bank_tujuan || '',
        item.total || 0,
        item.admin_kredit || 0,
        item.admin_debit || 0,
        item.selisih || 0,
        item.jumlah_netto || 0,
      ])
  
      exportExcelUtil(modul, excelData, headers)
        .then(() => {
            toast.add({
            severity: 'success',
            summary: 'Export Berhasil',
            detail: 'Data berhasil diekspor ke Excel',
            life: 3000,
          })
        })
        .catch((error) => {
          console.error('Gagal mengekspor data ke Excel:', error)
          toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Gagal mengekspor data ke Excel',
            life: 3000,
          })
        })
      
    } catch (error) {
      console.error("Error export ", error)
    }
  }

  return {
    bulanOptions,
    tahunPeriodeOptions,
    jenisPeriodeOptions,
    formFilters,
    filters,
    loading,
    data,
    rows,
    totalRecords,
    loadData,
    buildQuery,
    exportExcel,
    clearFilters,
    initFilters,
  }
}
