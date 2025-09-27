import { computed, ref } from 'vue'
import api from '@/api/client.js'
import { useToast } from 'primevue/usetoast'
import { FilterMatchMode } from '@primevue/core'
import { formatDateToYYYYMMDD } from '@/utils/dateUtils.js'
import { exportExcel as exportExcelUtils } from '../../utils/utils'

export default function useDataTransaksi() {
  const loading = ref(false)
  const items = ref([])
  const toast = useToast()
  const filters = ref({})
  const additionalFilters = ref({})
  const rows = ref(10)
  const total = ref(0)
  const first = ref(0)
  const last = ref(0)
  const meta = ref({})
  const sort = ref({})

  const buildFromFilters = computed(() => {
    const filterParams = {}
    Object.keys(filters.value).forEach((key) => {
      if (filters.value[key].value !== null) {
        filterParams[key] = filters.value[key].value
        // contains of tgl or tanggal
        if (key.includes('tgl') || key.includes('tanggal')) {
          filterParams[key] = formatDateToYYYYMMDD(filters.value[key].value)
        }
      }
    })
    Object.keys(additionalFilters.value).forEach((key) => {
      if(additionalFilters.value[key] !== null) {
        filterParams[key] = additionalFilters.value[key]
      }
    })
    return filterParams
  })

  initFilters()

  function initFilters() {
    filters.value = {
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      is_valid: { value: null, matchMode: FilterMatchMode.EQUALS },
      tgl_setor: { value: null, matchMode: FilterMatchMode.DATE_IS },
      no_buktibayar: { value: null, matchMode: FilterMatchMode.CONTAINS },
      tgl_buktibayar: { value: null, matchMode: FilterMatchMode.DATE_IS },
      penyetor: { value: null, matchMode: FilterMatchMode.CONTAINS },
      jenis: { value: null, matchMode: FilterMatchMode.CONTAINS },
      rekening_dpa: { value: null, matchMode: FilterMatchMode.CONTAINS },
      nilai: { value: null, matchMode: FilterMatchMode.EQUALS },
      tersetor: { value: null, matchMode: FilterMatchMode.EQUALS },
      export: {value: null}
    }
  }

  function setAdditionalFilter(data) {
    additionalFilters.value = data
  }

  async function loadData(params = {}) {
    fetchData(params)
  }

  function clearFilter() {
    initFilters()
    sort.value = {}

    loadData()
  }

  function update(event) {
    filters.value = event.filters
    first.value = 0



    // sort if exists
    if (event.sortField !== null && event.sortOrder !== null) {
      sort.value.sort_field = event.sortField
      sort.value.sort_order = event.sortOrder
    }
    else{
      sort.value = {}
    }
    
    setTimeout(() => {
      loadData({...sort.value})
    }, 300);
  }

  async function fetchData(params = {}) {
    try {
      loading.value = true
      const response = await api.get('/kurangbayar/data_selisih', {
        params: {
          page: 1,
          per_page: rows.value,
          ...buildFromFilters.value,
          ...params,
        },
      })

      const totalResult = params && params.export ? response.data.data?.length : response.data.meta?.total

      items.value = response.data.data
      total.value = totalResult || 0
      meta.value = response.data.meta

      return Promise.resolve(response)
    } catch (error) {
      console.error('Error loading data transaksi:', error)
      toast.add({
        severity: 'error',
        summary: 'Gagal',
        detail: 'Gagal memuat data transaksi. Silakan coba lagi.',
        life: 3000,
      })
      return Promise.reject(error)
    } finally {
      loading.value = false
    }
  }

  function onPageChange(event) {
    let page = event.rows === 1000 ? 1 : event.page + 1
    first.value = event.first
    if (rows.value > event.rows) {
      page = 1
      first.value = 0
    }
    rows.value = event.rows
    loadData({page, per_page: event.rows})
  }



  async function exportExcel(modul = 'Data Selisih')
  {
    try {
      const headers = [
        'No',
        'Tgl. Setor',
        'No Bukti',
        'Tgl. Bukti',
        'Penyetor',
        'Jenis',
        'Rekening DPA',
        'Nilai',
        'Tersetor',
      ]

      const response = await fetchData({ export: true })
      
      const dataExcel = response.data.data
      const excelData = dataExcel.map((item, index) => [
        item.no || index + 1,
        item.tgl_setor || '',
        item.no_buktibayar || '',
        item.tgl_buktibayar || '',
        item.penyetor || '',
        item.jenis || '',
        item.rekening_dpa?.rek_nama || '',
        item.nilai || 0,
        item.tersetor || 0
      ])
  
      exportExcelUtils(modul, excelData, headers)
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
    loading,
    items,
    filters,
    rows,
    total,
    first,
    last,
    meta,
    sort,
    setAdditionalFilter,
    clearFilter,
    update,
    fetchData,
    loadData,
    onPageChange,
    exportExcel,
  }
}
