<template>
  <Dialog :visible="modelValue" @update:visible="closeModal" modal
    :style="{ width: '35rem' }">
    <template #header>
      <div class="flex items-center justify-between w-full">
        <div>Validasi {{ header }}</div>
      </div>
    </template>
    <div class="p-4 space-y-4">
      <Fieldset :legend="`Data ${header}`">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mb-2 ml-4">
          <!-- grid 2 column -->
          <div>Tgl Setor</div>
          <div>: <span class="font-bold">{{ item?.tgl_setor || '-' }}</span></div>

          <div>Penyetor</div>
          <div>: <span class="font-bold">{{ item?.penyetor || '-' }}</span></div>

          <div>Jumlah Setor</div>
          <div>: <span class="font-bold">{{ formatCurrency(item?.jumlah) }}</span></div>

          <div>Jumlah Netto</div>
          <div>: <span class="font-bold">{{ formatCurrency(jumlahNetto) }}</span></div>

          <div>Bank</div>
          <div>: <span class="font-bold">{{ props.bank }}</span></div>
      
        </div>
      </Fieldset>
      <!-- Search -->
      <div class="my-0">&nbsp;</div>
      <Fieldset legend="Pilih Rekening Koran (RC)">
        <FormRekeningKoran 
          v-model="form.rc_id" 
          v-model:selection="selectedRc"
          v-model:bank="props.bank" 
          v-model:tgl_rc="props.date"
          placeholder="Rekening Koran" 
          class="w-full" 
          :errorMessage="errors?.rc_id?.length ? errors?.rc_id[0] : ''" 
          :invalid="errors?.rc_id?.length"
          @row-select="selectedRc = $event" />

        <div v-if="selectedRc && selectedRc.rc_id" class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm m-4">
          <!-- grid 2 column -->
          <div>No. Referensi</div>
          <div>: <span class="font-bold">{{ selectedRc?.no_rc || '-' }}</span></div>

          <div>Tgl. Referensi</div>
          <div>: <span class="font-bold">{{ selectedRc?.tgl_rc || '-' }}</span></div>

          <div>Nominal</div>
          <div>: <span class="font-bold">{{ selectedRc?.nominal || '-' }}</span></div>

          <div>Bank</div>
          <div>: <span class="font-bold">{{ selectedRc?.bank || '-' }}</span></div>

          <div>Uraian</div>
          <div>: <span class="font-bold">{{ selectedRc.uraian }}</span></div>
      
        </div>
      </Fieldset>

    </div>
    <template #footer>
      <Button label="Batal" class="p-button-secondary" @click="closeModal" />
      <Button label="Validasi" class="p-button-success" :disabled="!form.rc_id || loading" @click="doValidasi"
        :loading="loading" />
    </template>
  </Dialog>
</template>
<script setup>
import { computed, ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import api from '@/api/client.js'
import { formatCurrency } from '@/utils/utils'
import FormRekeningKoran from '@/components/form/RekeningKoran.vue'
// import { date } from '@primeuix/themes/aura/datepicker'

const props = defineProps({
  modelValue: Boolean,
  item: Object,
  bank: String,
  date: String,
  header: {
    type: String,
    default: 'Penerimaan',
  }
})
const emit = defineEmits(['update:modelValue', 'validated'])
const toast = useToast()
const selectedRc = ref(null)
const loading = ref(false)
const form = ref({
  rc_id: null,
})
const errors = ref({})

watch(
  () => props.modelValue,
  async (val) => {
    selectedRc.value = null
    if(val) {
      form.value.rc_id = getRcId()
    }
  }
)

const jumlahNetto = computed(() => {
  if (!props.item) return 0

  return (
    parseInt(props.item.jumlah || 0) -
    parseInt(props.item.admin_kredit || 0) -
    parseInt(props.item.admin_debit || 0) 
  )
})


function getRcId() {
  return props.item.rc_id 
    ? props.item.rc_id : props.item.rcId
    ? props.item.rcId : null
}

function closeModal() {
  emit('update:modelValue', false)
}

async function doValidasi() {
  loading.value = true
  try {
    // Call validasi API here, using props.item.id and selectedRc.value
    // TODO: Backend needs to be updated to handle this POST request.
    // The endpoint should be `/billing_kasir/validasi` and it should accept a JSON payload
    // with `id` and `rc_id`.
    if (!selectedRc.value || !selectedRc.value.rc_id) {
      toast.add({ severity: 'error', summary: 'Gagal', detail: 'Pilih Rekening Koran terlebih dahulu', life: 3000 })
      loading.value = false
      return
    }

    await api.post(`/kurangbayar/data_transaksi/validation`, {
      id: props.item.id,
      rc_id: selectedRc.value.rc_id,
    })
    toast.add({
      severity: 'success',
      summary: 'Validasi Berhasil',
      detail: 'Data berhasil divalidasi',
      life: 3000,
    })
    emit('validated')
    closeModal()
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: 'Validasi gagal', life: 3000 })
  } finally {
    loading.value = false
  }
}
</script>
