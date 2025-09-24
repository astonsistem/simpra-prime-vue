import api from '../../api/client'
import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'

export default function useDataTransaksiForm() {
  const toast = useToast()
  const loading = ref(false)
  const selectedItem = ref(null)
  const visible = ref(false)
  const errors = ref({})

  async function create() {
    try {
      const { data } = await api.get('/kurangbayar/data_transaksi/create')

      selectedItem.value = data.data
      return Promise.resolve(data.data)
    } catch (error) {
      console.error('Error creating data transaksi:', error)
      toast.add({
        severity: 'error',
        summary: 'Gagal',
        detail: 'Gagal melakukan aksi create. Silakan coba lagi.',
        life: 3000,
      })
      errors.value = error.response.data
      return Promise.reject(error)
    }
  }

  async function show(item) {
    try {
      const { data } = await api.get(`/kurangbayar/data_transaksi/${item.id}`)

      selectedItem.value = data.data
      return Promise.resolve(data.data)
    } catch (error) {
      console.error('Error fetch show data transaksi:', error)
      toast.add({
        severity: 'error',
        summary: 'Gagal',
        detail: 'Gagal fetch show data transaksi. Silakan coba lagi.',
        life: 3000,
      })
      errors.value = error.response.data
      return Promise.reject(error)
    }
  }

  async function store(data) {
    try {
      loading.value = true
      errors.value = {}

      const response = await api.post('/kurangbayar/data_transaksi', data)

      if (response.status === 200) {
        toast.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Data berhasil disimpan',
          life: 3000,
        })
      }
      return Promise.resolve(response)
    } catch (error) {
      console.error('Error creating data transaksi:', error)
      toast.add({
        severity: 'error',
        summary: 'Gagal',
        detail: 'Gagal membuat data transaksi. Silakan coba lagi.',
        life: 3000,
      })

      if (error.type === 'validation') {
        errors.value = error.errors
      }

      return Promise.reject(error)
    } finally {
      loading.value = false
    }
  }

  async function update(data) {
    try {
      loading.value = true
      errors.value = {}

      const response = await api.put(`/kurangbayar/data_transaksi/${data.id}`, data)

      console.log('response update', response)

      if (response.status === 200) {
        toast.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Data berhasil disimpan',
          life: 3000,
        })
      }
      return Promise.resolve(response)
    } catch (error) {
      console.error('Error updating data transaksi:', error)
      toast.add({
        severity: 'error',
        summary: 'Gagal',
        detail: 'Gagal update data transaksi. Silakan coba lagi.',
        life: 3000,
      })

      if (error.type === 'validation') {
        errors.value = error.errors
      }

      return Promise.reject(error)
    } finally {
      loading.value = false
    }
  }

  async function destroy(data) {
    const { id } = data
    try {
      const response = await api.delete(`/kurangbayar/data_transaksi/${id}`)
      toast.add({
        severity: 'success',
        summary: 'Berhasil',
        detail: 'Data berhasil dihapus',
        life: 3000,
      })
      return Promise.resolve(response)
    } catch (error) {
      console.error('Gagal menghapus data:', error)
      toast.add({
        severity: 'error',
        summary: 'Gagal',
        detail: 'Gagal menghapus data. Silakan coba lagi.',
        life: 3000,
      })
      return Promise.reject(error)
    }
  }

  async function validasi(data) {
    if (data.rc_id) {
      toast.add({
        severity: 'warn',
        summary: 'Peringatan',
        detail: 'Data sudah divalidasi.',
        life: 3000,
      })
      return
    }
    try {
      loading.value = true
      const response = await api.get(`/kurangbayar/data_transaksi/${data.id}`)

      if (!response.data) {
        throw new Error('Gagal memuat detail data')
      }

      toast.add({
        severity: 'success',
        summary: 'Berhasil',
        detail: 'Data berhasil divalidasi',
        life: 3000,
      })

      return Promise.resolve(response)
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Gagal',
        detail: 'Gagal memuat detail data',
        life: 3000,
      })
      return Promise.reject(error)
    } finally {
      loading.value = false
    }
  }

  async function cancelValidation(item) {
    try {
      if (!item.rc_id) {
        throw new Error('Data belum divalidasi')
      }

      const response = await api.post(`/kurangbayar/data_transaksi/cancel_validation`, {
        id: item.id,
        rc_id: item.rc_id,
      })

      toast.add({
        severity: 'success',
        summary: 'Berhasil',
        detail: 'Validasi berhasil dibatalkan',
        life: 3000,
      })
      return Promise.resolve(response)
    } catch (error) {
      console.error('Gagal membatalkan validasi:', error)
      toast.add({
        severity: 'error',
        summary: 'Gagal',
        detail: error.response.data.message || 'Gagal membatalkan validasi. Silakan coba lagi.',
        life: 3000,
      })
      return Promise.reject(error)
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    selectedItem,
    errors,
    visible,
    create,
    show,
    store,
    update,
    validasi,
    destroy,
    cancelValidation,
  }
}
