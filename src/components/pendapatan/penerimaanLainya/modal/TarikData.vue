<script setup>
import { ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import api from '@/services/http.js'

const props = defineProps({
  visible: Boolean,
})

const emit = defineEmits(['update:visible', 'sync'])

const options = ref([])
const selectedOption = ref(null)
const selectedDate = ref(null)

const loadingRequest = ref(false)
const loadingSync = ref(false)

const tableData = ref([])

const loadOptions = async () => {
  try {
    const response = await api.get('/syncapi/list/PENERIMAAN%20POTENSI')
    if (response.data && Array.isArray(response.data)) {
      options.value = response.data.map((item) => ({
        label: item.sinkronisasi_nama,
        value: item,
      }))
    }
  } catch (error) {
    console.error('Gagal load sync options:', error)
  }
}

const handleRequest = async () => {
  if (!selectedOption.value) {
    alert('Pilih request terlebih dahulu.')
    return
  }

  try {
    loadingRequest.value = true

    const payload = {
      param: [
        {
          field: 'tgl_bayar',
          label: 'Tanggal',
          type: 'date',
          value: selectedDate.value.toISOString().split('T')[0],
        },
      ],
    }

    const response = await api.post(
      `/sinkronisasi/request/${selectedOption.value.value.id}`,
      payload
    )

    tableData.value = response.data || []
  } catch (error) {
    console.error('Gagal request data:', error)
  } finally {
    loadingRequest.value = false
  }
}

const handleSync = async () => {
  if (!selectedOption.value || !selectedDate.value || tableData.value.length === 0) {
    alert('Pilih request, tanggal, dan pastikan ada data untuk disinkronisasi.')
    return
  }

  try {
    loadingSync.value = true
    await api.post('/sinkronisasi/save', {
      requestDate: selectedDate.value.toISOString(),
      menu: 'PENERIMAAN LAIN',
      data: tableData.value,
    })

    emit('sync')
    emit('update:visible', false)
  } catch (error) {
    console.error('Gagal sinkronisasi:', error)
  } finally {
    loadingSync.value = false
  }
}

const handleReset = () => {
  selectedOption.value = null
  selectedDate.value = null
  tableData.value = []
}

watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      loadOptions()
      handleReset()
    }
  }
)
</script>

<template>
  <Dialog
    v-model:visible="props.visible"
    modal
    header="Sinkronisasi"
    :closable="true"
    :style="{ width: '900px' }"
    @update:visible="(val) => emit('update:visible', val)"
  >
    <div class="space-y-4">
      <div>
        <label class="block mb-1 text-sm font-medium text-gray-700"
          >Request API Pendapatan Pelayanan</label
        >
        <Dropdown
          v-model="selectedOption"
          :options="options"
          optionLabel="label"
          placeholder="Pilih Request"
          class="w-full"
        />
      </div>

      <div>
        <label class="block mb-1 text-sm font-medium text-gray-700">Tanggal</label>
        <Calendar v-model="selectedDate" placeholder="Tanggal" showIcon class="w-full" />
      </div>

      <div class="flex justify-end gap-2 pt-4">
        <Button
          label="Request"
          icon="pi pi-download"
          class="p-button-primary"
          :loading="loadingRequest"
          @click="handleRequest"
        />

        <Button
          label="Sinkronisasi"
          icon="pi pi-sync"
          class="p-button-success"
          :loading="loadingSync"
          @click="handleSync"
        />

        <Button label="Reset" class="p-button-secondary" @click="handleReset" />
      </div>

      <div v-if="tableData.length > 0" class="pt-4">
        <DataTable
          :value="tableData"
          :paginator="true"
          :rows="25"
          :scrollable="true"
          scrollHeight="500px"
          dataKey="no_bayar"
        >
          <Column header="No" style="width: 50px">
            <template #body="slotProps">
              {{ slotProps.index + 1 }}
            </template>
          </Column>
          <Column field="no_bayar" header="No Bayar" />
          <Column field="tgl_bayar" header="Tgl Bayar" />
          <Column field="pihak3" header="Pihak 3" />
          <Column field="uraian" header="Uraian" />
          <Column field="no_dokumen" header="No Dokum" />
          <Column field="tgl_dokumen" header="Tgl Dokum" />
          <Column field="metode_pembayaran" header="Metode Bayar" />
          <Column field="cara_pembayaran" header="Cara Pembayaran" />
          <Column field="bank_tujuan" header="Bank" />
          <Column field="total" header="Total" />
          <Column field="admin_debit" header="Biaya Admi Debit" />
          <Column field="admin_kredit" header="Biaya Admi Kredit" />
          <Column field="piutang" header="Piutang" />
        </DataTable>
      </div>
    </div>
  </Dialog>
</template>

<style scoped>
/* styling tambahan kalau perlu */
</style>
