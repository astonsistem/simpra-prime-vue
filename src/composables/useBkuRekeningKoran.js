import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import apiClient from '@/api/client'

export default function useBkuRekeningKoran() {
  const loading = ref(false)
  const toast = useToast()

  /**
   * Create BKU from Rekening Koran data and send to PAD Online
   * @param {Object} payload - BKU data payload
   * @returns {Promise}
   */
  const createBkuFromRekeningKoran = async (payload) => {
    loading.value = true
    try {
      const response = await apiClient.post('/rekening_koran/bku', payload)
      return response.data
    } catch (error) {
      console.error('Error creating BKU from Rekening Koran:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * Check if rekening koran item can create BKU
   * Based on requirements: akunls_id is null and bku_id is null
   * @param {Object} item - Rekening koran item
   * @returns {Boolean}
   */
  const canCreateBku = (item) => {
    return !item.akunls_id && !item.bku_id
  }

  /**
   * Get BKU type based on business rules
   * @param {Object} item - Rekening koran item
   * @param {Boolean} mutasi - Mutasi checkbox value
   * @returns {String}
   */
  const getBkuType = (item, mutasi = false) => {
    if (item.debit > 0 && !mutasi) {
      return 'Pengeluaran Kas' // Pengeluaran Kas
    } else if (item.debit > 0 && mutasi) {
      return 'Pindah Kas' // Pindah Kas
    } else if (item.kredit > 0 && mutasi) {
      return 'Penerimaan Kas' // Penerimaan Kas
    }
    return 'unknown'
  }

  /**
   * Get BKU jenis ID based on type
   * @param {String} type - BKU type
   * @returns {Number}
   */
  const getBkuJenisId = (type) => {
    switch (type) {
      case 'penerimaan': return 7  // Penerimaan Kas
      case 'pindah_kas': return 8  // Pindah Kas  
      case 'pengeluaran': return 9 // Pengeluaran Kas
      default: return null
    }
  }

  /**
   * Validate BKU form data
   * @param {Object} formData - Form data to validate
   * @returns {Object} - Validation result with errors
   */
  const validateBkuForm = (formData) => {
    const errors = {}
    
    if (!formData.bank_id) {
      errors.bank_id = 'Bank harus dipilih'
    }
    
    if (!formData.no_bku || formData.no_bku.trim() === '') {
      errors.no_bku = 'No. BKU harus diisi'
    }
    
    if (!formData.ket_bku || formData.ket_bku.trim() === '') {
      errors.ket_bku = 'Keterangan BKU harus diisi'
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }

  return {
    loading,
    createBkuFromRekeningKoran,
    canCreateBku,
    getBkuType,
    getBkuJenisId,
    validateBkuForm
  }
}
