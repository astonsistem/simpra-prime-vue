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

  async function loadData () {
    fetchData()
  }

  async function fetchData () {
    try {
      loading.value = true
      const response = await api.get('/kurangbayar/data_transaksi')
      console.log('response.data', response.data)
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

  return {
    loading,
    items,
    fetchData,
    loadData,
  }
}
