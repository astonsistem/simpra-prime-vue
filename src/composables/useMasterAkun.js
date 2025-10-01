import { ref } from 'vue'
import api from '@/api/client'

export default function useMasterAkun() {
  const loading = ref(false)
  const error = ref(null)
  const akuns = ref([])

  /**
   * Fetch akun list for klarifikasi langsung dropdown
   * @param {string} type - 'kredit' or 'debit'
   * @param {string} search - Optional search query
   * @returns {Promise<Array>}
   */
  async function fetchAkunKlarifikasi(type, search = '') {
    loading.value = true
    error.value = null

    try {
      const params = { type }
      if (search) {
        params.search = search
      }

      const response = await api.get('/master_akun/klarifikasi', { params })
      akuns.value = response.data.data || []
      return akuns.value
    } catch (err) {
      error.value = err
      console.error('Error fetching akun klarifikasi:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch all master akun list
   * @param {string} search - Optional search query
   * @returns {Promise<Array>}
   */
  async function fetchAllAkun(search = '') {
    loading.value = true
    error.value = null

    try {
      const params = {}
      if (search) {
        params.search = search
      }

      const response = await api.get('/master_akun/list', { params })
      akuns.value = response.data.data || []
      return akuns.value
    } catch (err) {
      error.value = err
      console.error('Error fetching master akun:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    akuns,
    fetchAkunKlarifikasi,
    fetchAllAkun
  }
}
