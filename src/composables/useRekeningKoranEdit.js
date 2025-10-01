import { ref } from 'vue'
import api from '@/api/client'

export default function useRekeningKoranEdit() {
  const loading = ref(false)
  const error = ref(null)

  /**
   * Update rekening koran
   * @param {string|number} id - RC ID
   * @param {Object} data - Data to update
   * @returns {Promise<Object>}
   */
  async function updateRekeningKoran(id, data) {
    loading.value = true
    error.value = null
    try {
      const response = await api.put(`/rekening_koran/${id}`, data)
      return response.data
    } catch (err) {
      error.value = err
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    updateRekeningKoran
  }
}
