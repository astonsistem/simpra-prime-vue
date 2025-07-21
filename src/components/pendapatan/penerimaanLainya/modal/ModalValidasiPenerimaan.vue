<template>
  <Dialog
    :visible="modelValue"
    @update:visible="closeModal"
    modal
    header="Validasi Penerimaan Lainnya"
    :style="{ width: '40rem' }"
  >
    <div class="p-4 space-y-4">
      <div>
        <h4 class="font-semibold mb-2">Data Penerimaan</h4>
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div>
            No Bayar: <span class="font-bold">{{ item?.no_bayar || '-' }}</span>
          </div>
          <div>
            Tanggal Bayar: <span class="font-bold">{{ item?.tgl_bayar || '-' }}</span>
          </div>
          <div>
            Pihak 3: <span class="font-bold">{{ item?.pihak3 || '-' }}</span>
          </div>
          <div>
            Jumlah Bruto: <span class="font-bold">{{ formatNumber(item?.total) }}</span>
          </div>
          <div>
            Jumlah Netto: <span class="font-bold">{{ formatNumber(item?.jumlah_netto) }}</span>
          </div>
        </div>
      </div>
      <div>
        <h4 class="font-semibold mb-2">Pilih Rekening Koran (RC)</h4>
        <Dropdown
          v-model="selectedRc"
          :options="rcOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Pilih RC"
          class="w-full"
          :loading="rcOptions.length === 0 && modelValue"
        />
      </div>
    </div>
    <template #footer>
      <Button label="Batal" class="p-button-secondary" @click="closeModal" />
      <Button
        label="Validasi"
        class="p-button-success"
        :disabled="!selectedRc"
        @click="doValidasi"
        :loading="loading"
      />
    </template>
  </Dialog>
</template>
<script setup>
import { ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import api from '@/services/http.js'

const props = defineProps({
  modelValue: Boolean,
  item: Object,
})
const emit = defineEmits(['update:modelValue', 'validated'])
const toast = useToast()
const selectedRc = ref(null)
const loading = ref(false)
const rcOptions = ref([])

watch(
  () => props.modelValue,
  async (val) => {
    if (val && props.item?.id) {
      await fetchRcOptions()
    }
  }
)

async function fetchRcOptions() {
  rcOptions.value = []
  selectedRc.value = null
  try {
    const res = await api.get(`/rekening_koran?penerimaan_id=${props.item.id}`)
    if (res.data && Array.isArray(res.data.items)) {
      rcOptions.value = res.data.items.map((rc) => ({
        label: `${rc.no_rc} - ${rc.tgl_rc} - Rp ${formatNumber(rc.kredit)}`,
        value: rc.id,
        raw: rc,
      }))
    } else {
      toast.add({
        severity: 'warn',
        summary: 'Data RC kosong',
        detail: 'Tidak ada data rekening koran ditemukan',
        life: 3000,
      })
    }
  } catch (e) {
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: 'Gagal memuat data rekening koran',
      life: 3000,
    })
  }
}

function closeModal() {
  emit('update:modelValue', false)
}

function formatNumber(val) {
  return new Intl.NumberFormat('id-ID').format(val || 0)
}

async function doValidasi() {
  loading.value = true
  try {
    await api.post(`/penerimaan_lain/validasi`, {
      id: props.item.id,
      rc_id: selectedRc.value,
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
