import api from "../../api/client"
import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'

export default function useDataTransaksiForm() {
  const toast = useToast()
  const loading = ref(false)
  const selectedItem = ref(null)
  const visible = ref(false)

  async function create () {
    try {
      const { data } = await api.get('/kurangbayar/data_transaksi')
      console.log('create', data)
      selectedItem.value = data.data
      return Promise.resolve(data)
    } catch (error) {
      console.error('Error creating data transaksi:', error)
      toast.add({
        severity: 'error',
        summary: 'Gagal',
        detail: 'Gagal membuat data transaksi. Silakan coba lagi.',
        life: 3000
      })
      return Promise.reject(error)
      
    }
  }

  return {
    loading,
    selectedItem,
    visible,
    create
  }
}
