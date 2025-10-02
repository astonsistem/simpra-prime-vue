import { ref } from 'vue'
import apiClient from '@/api/client'
import { useToast } from 'primevue/usetoast'
import { formatDateToYYYYMMDD } from '@/utils/dateUtils'

export default function useRekeningKoranPb() {
  const toast = useToast()
  const loading = ref(false)
  const pbData = ref(null)
  const linkedRecords = ref([])
  const unlinkedRecords = ref([])
  const unlinkedTotal = ref(0)
  const unlinkedPage = ref(1)
  const unlinkedPerPage = ref(10)

  /**
   * Get PB data for a specific rekening koran record
   * @param {string} rcId - The rc_id of the Bank Jatim record
   */
  const getPbData = async (rcId) => {
    loading.value = true
    try {
      const response = await apiClient.get(`/rekening_koran/pb/check/${rcId}`)
      pbData.value = response.data.data
      linkedRecords.value = response.data.linked_records || []
      return response.data
    } catch (error) {
      console.error('Error fetching PB data:', error)
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Gagal memuat data PB',
        life: 3000
      })
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * Get unlinked records (mutations that can be linked to this Bank Jatim record)
   * @param {string} tglRc - The tgl_rc of the Bank Jatim record
   * @param {number} page - Page number
   * @param {number} perPage - Records per page
   */
  const getUnlinkedRecords = async (tglRc, page = 1, perPage = 10) => {
    loading.value = true
    try {
      const response = await apiClient.get('/rekening_koran/pb/uncheck', {
        params: {
          tgl_rc: formatDateToYYYYMMDD(tglRc),
          page,
          per_page: perPage
        }
      })
      unlinkedRecords.value = response.data.data || []
      unlinkedTotal.value = response.data.total || 0
      unlinkedPage.value = response.data.current_page || 1
      unlinkedPerPage.value = response.data.per_page || 10
      return response.data
    } catch (error) {
      console.error('Error fetching unlinked records:', error)
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Gagal memuat data mutasi',
        life: 3000
      })
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * Update PB data (mutasi and pb_dari fields)
   * @param {string} rcId - The rc_id to update
   * @param {object} data - The data to update { mutasi, pb_dari }
   */
  const updatePb = async (rcId, data) => {
    loading.value = true
    try {
      const response = await apiClient.put(`/rekening_koran/pb/${rcId}`, data)
      toast.add({
        severity: 'success',
        summary: 'Berhasil',
        detail: response.data.message || 'Data PB berhasil diubah',
        life: 3000
      })
      return response.data
    } catch (error) {
      console.error('Error updating PB:', error)
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Gagal mengubah data PB',
        life: 3000
      })
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * Link a mutation to a Bank Jatim record
   * @param {string} rcId - The rc_id of the mutation to link
   * @param {string} pbRcId - The rc_id of the Bank Jatim record
   */
  const linkPb = async (rcId, pbRcId) => {
    loading.value = true
    try {
      const response = await apiClient.put(`/rekening_koran/pb_link/${rcId}`, {
        pb_rc_id: pbRcId
      })
      toast.add({
        severity: 'success',
        summary: 'Berhasil',
        detail: response.data.message || 'Mutasi berhasil ditautkan',
        life: 3000
      })
      return response.data
    } catch (error) {
      console.error('Error linking PB:', error)
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Gagal menautkan mutasi',
        life: 3000
      })
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * Cancel PB link for a mutation
   * @param {string} rcId - The rc_id of the mutation to unlink
   */
  const cancelPb = async (rcId) => {
    loading.value = true
    try {
      const response = await apiClient.put(`/rekening_koran/pb_cancel/${rcId}`)
      toast.add({
        severity: 'success',
        summary: 'Berhasil',
        detail: response.data.message || 'Penandaan PB berhasil dibatalkan',
        life: 3000
      })
      return response.data
    } catch (error) {
      console.error('Error canceling PB:', error)
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Gagal membatalkan PB',
        life: 3000
      })
      throw error
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    pbData,
    linkedRecords,
    unlinkedRecords,
    unlinkedTotal,
    unlinkedPage,
    unlinkedPerPage,
    getPbData,
    getUnlinkedRecords,
    updatePb,
    linkPb,
    cancelPb
  }
}
