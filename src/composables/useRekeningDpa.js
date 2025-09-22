import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import apiClient from '@/api/client'

export default function useRekeningDpa() {
  const options = ref([])
  const toast = useToast()

  const fetchList = async () => {
    if (options.value.length) return // Cek jika sudah ada data, tidak perlu fetch ulang

    try {
      const response = await apiClient.get('/akun/list/pendapatan')
  
      if (response.data.data) {
        options.value = response.data.data.map((item) => ({
          value: item.rek_id,
          label: item.rek_nama,
        }))
      }
    } catch (error) {
      console.log('error fetch rekening dpa', error)
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Gagal memuat data rekening dpa',
        life: 3000,
      })
    }
  }

  return {
    options,
    fetchList,
  }
}