import { ref } from 'vue'
import api from '@/api/client.js'
import { useToast } from 'primevue/usetoast'
import { FilterMatchMode } from '@primevue/core'
import { formatDateToYYYYMMDD } from '@/utils/dateUtils.js'

export default function useDataTransaksi() {
  const loading = ref(false)
  const items = ref([])
  const toast = useToast()
  const filters = ref({})
  const rows = ref(10)
  const total = ref(0)
  const first = ref(0)
  const last = ref(0)
  const meta = ref({})

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
      jumlah: { value: null, matchMode: FilterMatchMode.EQUALS },
      cara_pembayaran: { value: null, matchMode: FilterMatchMode.CONTAINS },
      sumber_transaksi: { value: null, matchMode: FilterMatchMode.CONTAINS },
      bank_tujuan: { value: null, matchMode: FilterMatchMode.CONTAINS },
      export: {value: null}
    }
  }

  async function loadData(params = {}) {
    fetchData(params)
  }

  function clearFilter() {
    initFilters()
    loadData()
  }

  function update(event) {
    filters.value = event.filters
    first.value = 0

    // sort if exists
    const sort = {}
    if (event.sortField !== null && event.sortOrder !== null) {
      sort.sort_field = event.sortField
      sort.sort_order = event.sortOrder
    }
    
    setTimeout(() => {
      loadData({...sort})
    }, 300);
  }

  function buildFromFilters() {
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
    return filterParams
  }

  async function fetchData(params = {}) {
    try {
      loading.value = true
      const response = await api.get('/kurangbayar/data_transaksi', {
        params: {
          page: 1,
          per_page: rows.value,
          ...buildFromFilters(),
          ...params,
        },
      })

      items.value = response.data.data
      total.value = response.data.meta.total
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

  return {
    loading,
    items,
    filters,
    rows,
    total,
    first,
    last,
    meta,
    clearFilter,
    update,
    fetchData,
    loadData,
    onPageChange,
  }
}
