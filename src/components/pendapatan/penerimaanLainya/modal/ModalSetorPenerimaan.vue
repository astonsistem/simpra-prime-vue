<script setup>
import { ref, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import api from '@/services/http.js'

const props = defineProps({
  modelValue: Boolean,
  item: Object,
})
const emit = defineEmits(['update:modelValue', 'setor'])

const toast = useToast()
const loading = ref(false)
const rekeningKoran = ref([])
const totalSetor = ref(0)
const selectedRekening = ref(null)

const loadSetorData = async (id) => {
  loading.value = true
  rekeningKoran.value = []
  totalSetor.value = 0
  selectedRekening.value = null
  try {
    const response = await api.get(`/penerimaan_lain/${id}`)
    if (response.data) {
      rekeningKoran.value = response.data.rekening_koran || []
      totalSetor.value = response.data.total_setor || 0
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: 'Gagal memuat data setor',
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue && props.item) {
      loadSetorData(props.item.id)
    }
  }
)

const handleValidasiSetor = async () => {
  if (!selectedRekening.value) {
    toast.add({
      severity: 'warn',
      summary: 'Peringatan',
      detail: 'Pilih rekening terlebih dahulu',
      life: 3000,
    })
    return
  }
  loading.value = true
  try {
    // Endpoint validasi setor, sesuaikan jika berbeda
    const payload = {
      id: props.item.id,
      rc_id: selectedRekening.value.id,
      akun_id: props.item.akun_id,
    }
    const response = await api.post('/penerimaan_lain/validasi', payload)
    if (response.data && response.data.status === 200) {
      toast.add({
        severity: 'success',
        summary: 'Berhasil',
        detail: 'Setor berhasil divalidasi',
        life: 3000,
      })
      emit('setor')
      emit('update:modelValue', false)
    } else {
      toast.add({
        severity: 'error',
        summary: 'Gagal',
        detail: response.data?.message || 'Gagal validasi setor',
        life: 3000,
      })
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: 'Gagal validasi setor',
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <Dialog
    :visible="props.modelValue"
    :modal="true"
    :closable="true"
    :style="{ width: '600px' }"
    header="Setor Penerimaan Lainnya"
    @hide="() => emit('update:modelValue', false)"
  >
    <div v-if="props.item">
      <div class="mb-4">
        <div class="font-semibold">
          No Bayar: <span class="font-normal">{{ props.item.no_bayar }}</span>
        </div>
        <div class="font-semibold">
          Tanggal Bayar: <span class="font-normal">{{ props.item.tgl_bayar }}</span>
        </div>
        <div class="font-semibold">
          Total Setor:
          <span class="font-normal">{{
            totalSetor.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })
          }}</span>
        </div>
      </div>
      <div class="mb-4">
        <DataTable
          :value="rekeningKoran"
          selectionMode="single"
          :selection="selectedRekening"
          @update:selection="selectedRekening = $event"
          dataKey="id"
          :loading="loading"
          class="p-datatable-sm"
        >
          <Column field="id" header="ID" />
          <Column field="tgl_transaksi" header="Tanggal" />
          <Column field="uraian" header="Uraian" />
          <Column field="kredit" header="Kredit" />
        </DataTable>
      </div>
      <div class="flex justify-end gap-2">
        <Button
          label="Batal"
          class="p-button-secondary"
          @click="() => emit('update:modelValue', false)"
        />
        <Button
          label="Validasi Setor"
          class="p-button-success"
          :loading="loading"
          @click="handleValidasiSetor"
        />
      </div>
    </div>
  </Dialog>
</template>
