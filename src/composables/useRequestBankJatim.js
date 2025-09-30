import api from '@/api/client'
import { formatDateToYYYYMMDD as formatDate } from '@/utils/dateUtils'
import { ref } from 'vue'
import { useToast } from 'primevue'

export default function useRequestBankJatim() {
  const items = ref([])
  const responseCode = ref('')
  const responseDesc = ref('')
  const toast = useToast()

  async function request({ tglawal, tglakhir }) {
    try {
      const response = await api.post('/rekening_koran/request_bank_jatim', {
        tglawal: formatDate(tglawal),
        tglakhir: formatDate(tglakhir),
      })

      const data = response.data.data

      responseCode.value = data.responseCode
      responseDesc.value = data.responseDesc
      items.value = data.history

      return Promise.resolve(response)
    } catch (error) {
      console.error('error', error)
      toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 })
      return Promise.reject(error)
    }
  }

  async function sync({ tglawal, tglakhir }) {
    try {
      const response = await api.post('/rekening_koran/sync', {
        tglawal: formatDate(tglawal),
        tglakhir: formatDate(tglakhir),
      })
      const data = response.data.data

      if(response.data.success) {
        toast.add({ severity: 'success', summary: 'Success', detail: response.data.message, life: 3000 })
      }

      return Promise.resolve(response)
    } catch (error) {
      console.error('error', error)
      toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 })
      return Promise.reject(error)
    }
  }

  return {
    items,
    responseCode,
    responseDesc,
    request,
    sync,
  }
}
