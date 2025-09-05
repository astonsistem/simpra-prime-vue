<template>
  <Dialog :visible="modelValue" @update:visible="closeModal" modal header="Validasi Billing Kasir"
    :style="{ width: '65rem' }">
    <div class="p-4 space-y-4">
      <div>
        <h4 class="font-semibold mb-2">Data Billing</h4>
        <div class="grid grid-cols-2 gap-2 text-sm mb-2 ml-4">
          <div>
            No Bayar: <span class="font-bold">{{ item?.noBayar || '-' }}</span>
          </div>
          <div>
            Tanggal Bayar: <span class="font-bold">{{ item?.tglBayar || '-' }}</span>
          </div>
          <div>
            Pasien: <span class="font-bold">{{ item?.pasien || '-' }}</span>
          </div>
          <div>
            Jumlah Bruto: <span class="font-bold">{{ formatNumber(item?.jumlahBruto) }}</span>
          </div>
          <div>
            Jumlah Netto: <span class="font-bold">{{ formatNumber(item?.jumlahNetto) }}</span>
          </div>
        </div>
      </div>
      <!-- Search -->
      <div class="grid grid-cols-2 gap-2 mb-4">
        <h4 class="font-semibold mb-2 self-center">Pilih Rekening Koran (RC)</h4>
        <div>
          <input id="rc-search" type="text" v-model="rc.search" @input="searchRc"
            class="w-full border border-gray-300 rounded p-2" placeholder="No Referensi" />
        </div>
      </div>

      <!-- Make result of selectedRc -->
      <div v-if="selectedRc" class="mb-8">
        <DataTable :value="[selectedRc]" size="small" showGridlines :rowClass="() => 'bg-gray-400'">
          <Column header="ID" field="rc_id" />
          <Column header="No. Referensi" field="no_rc" />
          <Column header="Tgl RC" field="tgl_rc_format" />
          <Column header="Nominal" field="nominal">
            <template #body="slotProps">{{ formatCurrency(slotProps.data.nominal) }}</template>
          </Column>
          <Column header="Uraian" field="uraian" />
        </DataTable>
      </div>
      <div
        class="flex flex-col md:flex-row md:flex-nowrap md:overflow-y-auto md:max-h-[calc(100vh-22rem)] border border-gray-300 rounded">
        <DataTable v-model:selection="selectedRc" v-model:filters="filters"
          :globalFilterFields="['no_rc', 'nominal', 'uraian']" filterDisplay="row" :value="rcOptions"
          selectionMode="single" dataKey="rc_id" class="w-full" :loading="rcOptions.length === 0 && modelValue">
          <template #header>
            <div class="flex justify-end">
              <IconField>
                  <InputIcon>
                    <i class="pi pi-search" />
                  </InputIcon>
                  <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
                </IconField>
            </div>
          </template>

          <Column header="ID" field="rc_id" :sortable="true" />
          <Column header="No. Referensi" field="no_rc" :sortable="true">
            <template #filter="{ filterModel, filterCallback }">
              <InputText v-model="filterModel.value" type="text" @input="filterCallback()" placeholder="Cari No. Referensi" />
            </template>
          </Column>
          <Column header="Tgl RC" field="tgl_rc_format" :sortable="true" />
          <Column header="Nominal" field="nominal" :sortable="true">
            <template #body="slotProps">{{ formatCurrency(slotProps.data.nominal) }}</template>
            <template #filter="{ filterModel, filterCallback }">
              <InputText v-model="filterModel.value" @input="filterCallback()" placeholder="Cari Nominal"/>
            </template>
          </Column>
          <Column header="Uraian" field="uraian" :sortable="true">
            <template #filter="{ filterModel, filterCallback }">
              <InputText v-model="filterModel.value" type="text" @input="filterCallback()" placeholder="Cari uraian" />
            </template>
          </Column>
        </DataTable>
      </div>
      <!-- result total of -->
      <div class="text-sm text-end text-gray-500">
        Total Rekening Koran: <span class="font-bold">{{ rc.total }}</span>
      </div>
      <Paginator v-if="rcOptions.length > 0" v-model:first="rc.first" :rows="rc.rows" :totalRecords="rc.total"
        @page="onPageChangeRc($event)" />
    </div>
    <template #footer>
      <Button label="Batal" class="p-button-secondary" @click="closeModal" />
      <Button label="Validasi" class="p-button-success" :disabled="!selectedRc || loading" @click="doValidasi"
        :loading="loading" />
    </template>
  </Dialog>
</template>
<script setup>
import { reactive, ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import api from '@/api/client.js'
import { formatCurrency } from '@/utils/utils'
import { FilterMatchMode } from '@primevue/core'

const props = defineProps({
  modelValue: Boolean,
  item: Object,
})
const emit = defineEmits(['update:modelValue', 'validated'])
const toast = useToast()
const selectedRc = ref(null)
const loading = ref(false)
const rcOptions = ref([])
const rc = reactive({
  total: 0,
  first: 1,
  rows: 20,
  search: '',
})
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  no_rc: { value: null, matchMode: 'contains' },
  nominal: { value: null, matchMode: 'equals' },
  uraian: { value: null, matchMode: 'contains' },
})

watch(
  () => props.modelValue,
  async (val) => {
    selectedRc.value = null
    rc.search = ''
    if (val && props.item?.id) {
      await fetchRcOptions()
    }
  }
)

// Debounce search input
let searchTimeout = null
function searchRc() {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    rc.first = 1 // Reset to first page on new search
    fetchRcOptions()
  }, 800)
}

function onPageChangeRc(event) {
  rc.first = event.first
  rc.rows = event.rows
  fetchRcOptions()
}

async function fetchRcOptions() {
  rcOptions.value = []
  try {
    const { data } = await api.get(`/rekening_koran`, {
      params: {
        billing_id: props.item.id,
        page: Math.floor(rc.first / rc.rows) + 1,
        size: rc.rows,
        search: rc.search || undefined,
      },
    })
    if (data.data && Array.isArray(data.data.items)) {
      rcOptions.value = data.data.items
      rc.total = data.data.total || data.data.items.length
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
    // Call validasi API here, using props.item.id and selectedRc.value
    // TODO: Backend needs to be updated to handle this POST request.
    // The endpoint should be `/billing_kasir/validasi` and it should accept a JSON payload
    // with `id` and `rc_id`.
    if (!selectedRc.value || !selectedRc.value.rc_id) {
      toast.add({ severity: 'error', summary: 'Gagal', detail: 'Pilih Rekening Koran terlebih dahulu', life: 3000 })
      loading.value = false
      return
    }

    await api.put(`/billing_kasir/validasi/penerimaan_layanan`, {
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
