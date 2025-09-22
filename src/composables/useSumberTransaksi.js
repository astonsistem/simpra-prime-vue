import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import apiClient from '@/api/client'

export default function useSumberTransaksi() {
  const options = ref([])
  const toast = useToast()
  /**
   * 
   * @param {string} params.sumber_jenis - Jenis sumber transaksi yang ingin diambil
   * e.g: 
   * useSumberTransaksi({ sumber_jenis: 'Lainnya' })
   * @returns 
   */

  const fetchList = async (params = {}) => {
    if (options.value.length) return // Cek jika sudah ada data, tidak perlu fetch ulang
    try {
      const response = await apiClient.get('/sumbertransaksi/list?sumber-transaksi', {
        params: { ...params },
      })

      if (response.data.data) {
        options.value = response.data.data.map((item) => ({
          value: item.sumber_id,
          label: item.sumber_nama,
        }))
      }
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Gagal memuat data sumber transaksi',
        life: 3000,
      })
    }
  }

  return {
    options,
    fetchList,
  }
}
