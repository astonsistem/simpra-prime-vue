import { ref } from 'vue'
import api from '@/api/client.js'
import { useToast } from 'primevue/usetoast'

export default function useDataTransaksi() {
  const loading = ref(false)
  const items = ref([])
  const toast = useToast()
  const filters = ref({})
  const rows = ref(10)
  const total = ref(0)
  const first = ref(0)
  const meta = ref({})

  async function loadData (params = {}) {
    fetchData(params)
  }

  async function fetchData (params = {}) {
    try {
      loading.value = true
      const response = await api.get('/kurangbayar/data_transaksi', {
        params: {
          page: first.value > 0 ? first.value : 1,
          per_page: rows.value,
          ...params
        }
      })
   
      items.value = response.data.data

      return Promise.resolve(response)

    } catch (error) {
      console.error('Error loading data transaksi:', error)
      toast.add({
        severity: 'error',
        summary: 'Gagal',
        detail: 'Gagal memuat data transaksi. Silakan coba lagi.',
        life: 3000
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
    loadData()
  }

  return {
    loading,
    items,
    filters,
    rows,
    total,
    first,
    meta,
    fetchData,
    loadData,
    onPageChange,
  }
}
