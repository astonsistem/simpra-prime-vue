import api from '../../api/client'
import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import { formatDateToYYYYMMDD } from '../../utils/dateUtils'

export default function useDataTransaksiForm() {
  const toast = useToast()
  const loading = ref(false)
  const selectedItem = ref(null)
  const visible = ref(false)
  const errors = ref({})

  async function show(item) {
    try {
      const response = await api.get(`/kurangbayar/data_selisih/${item.id}`)

      const { data } = response
      selectedItem.value = data.data

      return Promise.resolve(data)
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

      if(!data.sumber_id) {
        errors.value = {
          sumber_id: ['sumber_id is required']
        }
        throw new Error('sumber_id is required')
      }

      data.tgl_setor = formatDateToYYYYMMDD(data.tgl_setor)
      data.tgl_buktibayar = formatDateToYYYYMMDD(data.tgl_buktibayar)

      const response = await api.post('/kurangbayar/data_selisih', data)

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

  return {
    loading,
    selectedItem,
    errors,
    visible,
    show,
    store,
  }
}
