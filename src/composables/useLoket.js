import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import apiClient from '@/api/client'


export default function useLoket() {
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
      const response = await apiClient.get('/loket/list?loket', {
        params: params,
      })
      if (response.data.data) {
        options.value = response.data.data.map((item) => ({
          label: item.loket_nama,
          value: item.loket_id,
        }))
      }
    } catch (error) {
      console.error('Error fetching loket:', error)
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Gagal memuat data loket',
        life: 3000,
      })
    }
  }

  return {
    options,
    fetchList,
  }
}
