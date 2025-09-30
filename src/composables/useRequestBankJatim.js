import api from '@/api/client'
import { formatDateToYYYYMMDD as formatDate } from '@/utils/dateUtils'
import { ref } from 'vue'

export default function useRequestBankJatim () {
    const items = ref([])
    const responseCode = ref('')
    const responseDesc = ref('')

    async function request ({ tglawal, tglakhir }) {
        try {
            const response = await api.post('/rekening_koran/request_bank_jatim', {
                tglawal: formatDate(tglawal), 
                tglakhir: formatDate(tglakhir)
            })

            const data = response.data.data

            responseCode.value = data.responseCode
            responseDesc.value = data.responseDesc
            items.value = data.history

            return Promise.resolve(response)     
        } catch (error) {
            return Promise.reject(error)
        }
    }

    async function sync () {
        try {
            const response = await api.post('/rekening_koran/request_bank_jatim', {
                tglawal: formatDate(tglawal), 
                tglakhir: formatDate(tglakhir)
            })

            const data = response.data.data

            responseCode.value = data.responseCode
            responseDesc.value = data.responseDesc
            items.value = data.history

            return Promise.resolve(response)     
        } catch (error) {
            return Promise.reject(error)
        }
    }

    return {
        items,
        responseCode,
        responseDesc,
        request,
        sync
    }
}