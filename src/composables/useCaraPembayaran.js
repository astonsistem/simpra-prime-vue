import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import apiClient from '@/api/client'


export default function useCaraPembayaran() {
  const options = ref([])
  const toast = useToast()
  
  /**
   *
   * @param {*}
   * @returns { options, fetchList }
   */
  const fetchList = async (params = {}) => {
    if (options.value.length) return // Cek jika sudah ada data, tidak perlu fetch ulang
    try {
      const response = await apiClient.get('/carapembayaran/list?carapembayaran', {
        params: params,
      })
      if (response.data.data) {
        options.value = response.data.data.map((item) => ({
          label: item.bayar_nama,
          value: item.bayar_id,
        }))
      }
    } catch (error) {
      console.error('Error fetching cara pembayaran:', error)
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Gagal memuat data cara pembayaran',
        life: 3000,
      })
    }
  }

  return {
    options,
    fetchList,
  }
}
