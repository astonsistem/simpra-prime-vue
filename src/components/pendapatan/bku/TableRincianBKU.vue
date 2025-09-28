<template>
    <DataTable
        :filters="filters"
        :value="data"
        :loading="loading"
        responsiveLayout="scroll"
        paginator
        lazy
        :totalRecords="totalRecords"
        :rows="rows"
        :first="first"
        :rowsPerPageOptions="[5, 10, 20, 50, 100, 1000]"
        @page="onPageChange"
        @filter="onFilter"
        @sort="onSort"
        sortMode="single"
        dataKey="id"
        filterDisplay="menu"
        class="p-datatable-sm"
        :rowStyle="rowStyle"
    >
        <template #header>
        </template>
        <Column field="no" header="No" style="width: 5%" />
        <Column header="Action" style="width: 10%">
            <template #body="slotProps">
                <SplitButton
                    label="Action"
                    icon="pi pi-ellipsis-v"
                    size="small"
                    severity="secondary"
                    :model="[
                        { label: 'Ubah', icon: 'pi pi-pencil', command: () => handleEdit(slotProps.data) },
                        { label: 'Hapus', icon: 'pi pi-times', command: () => handleDelete(slotProps.data) },
                    ]"
                />
            </template>
        </Column>
        <Column field="rek_id" header="Kode Rekening" style="min-width: 8rem">
            <template #body="{ data }">
                {{ data.rek_id }}
            </template>
        </Column>
        <Column field="akun_id" header="Kode Akun" style="min-width: 8rem">
            <template #body="{ data }">
                {{ data.akun_id }}
            </template>
        </Column>
        <Column field="uraian" header="Uraian" style="min-width: 20rem">
            <template #body="{ data }">
                {{ data.uraian }}
            </template>
        </Column>
        <Column field="jumlah" header="Jumlah" style="text-align: right">
            <template #body="{ data }">
                {{ new Intl.NumberFormat('id-ID').format(data.jumlah || 0) }}
            </template>
        </Column>
        <Column field="pendapatan" header="Pendapatan" style="text-align: right">
            <template #body="{ data }">
                {{ new Intl.NumberFormat('id-ID').format(data.pendapatan || 0) }}
            </template>
        </Column>
        <Column field="piutang" header="Piutang" style="text-align: right">
            <template #body="{ data }">
                {{ new Intl.NumberFormat('id-ID').format(data.piutang || 0) }}
            </template>
        </Column>
        <Column field="pdd" header="PDD" style="text-align: right">
            <template #body="{ data }">
                {{ new Intl.NumberFormat('id-ID').format(data.pdd || 0) }}
            </template>
        </Column>
        <Column field="pad_rinci" header="Pad Rincian" style="min-width: 8rem">
            <template #body="{ data }">
                {{ data.pad_rinci }}
            </template>
        </Column>
    </DataTable>
    <ModalRincianBKU
        v-model="showModal" 
        :item="selectedItem" 
        :bkuId="bkuId"
        :options="options"
        @saved="handleSaved" 
    />
    <Toast />
    <Toast position="center" group="table-confirm">
      <template #message="slotProps">
        <div class="flex flex-col items-center" style="flex: 1">
          <div class="text-center">
            <i class="pi pi-exclamation-triangle" style="font-size: 3rem"></i>
            <h4>{{ slotProps.message.summary }}</h4>
            <p>{{ slotProps.message.detail }}</p>
          </div>
          <div class="grid grid-cols-2 gap-4 mt-4">
            <Button label="Tidak" @click="onReject()" />
            <Button label="Ya" @click="onConfirmAction(slotProps.message)" />
          </div>
        </div>
      </template>
    </Toast>
</template>

<script setup>
import { ref, watch } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import api from '@/api/client.js'
import { FilterMatchMode } from '@primevue/core/api'
import ModalRincianBKU from '@/components/pendapatan/bku/ModalRincianBKU.vue'

const props = defineProps({
    bkuId: { 
        type: String, 
        default: null 
    },
    options: Object
})
const emit = defineEmits(['saved'])
const toast = useToast()
const data = ref([])
const loading = ref(false)
const filters = ref()
const totalRecords = ref(0)
const rows = ref(10)
const first = ref(0)
const sortField = ref(null)
const sortOrder = ref(null)
const selectedItem = ref(null)
const showModal = ref(false)

const buildQuery = (page = 1, pageSize = rows.value) => {
    const q = {
        page,
        size: pageSize,
    }

    if (filters.value) {
        Object.keys(filters.value).forEach((key) => {
            if (filters.value[key].value) {
                q[key] = filters.value[key].value
            }
        })
    }

    if (sortField.value) {
        q.sortField = sortField.value
        q.sortOrder = sortOrder.value === 1 ? 'asc' : 'desc'
    }

    if (props.bkuId) q.bku_id = props.bkuId

    return q
}
const loadData = async (page = 1, pageSize = rows.value) => {
    loading.value = true
    try {
        const query = buildQuery(page, pageSize)
        const response = await api.get('/rincian_bku', { params: query })
        if (response.data && response.data.items) {
            data.value = response.data.items.map((item, index) => ({
                ...item,
                no: (page - 1) * pageSize + index + 1,
            }))
            totalRecords.value = response.data.total ?? 0
            if (pageSize === totalRecords.value && pageSize > 100) {
                rows.value = 1000
            }
        }
    } catch (error) {
        console.error('Gagal memuat data:', error)
        toast.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal memuat data', life: 3000 })
    } finally {
        loading.value = false
    }
}

const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    }
}
initFilters()

const onPageChange = (event) => {
    first.value = event.first
    rows.value = event.rows
    if (event.rows === 1000) {
        loadData(1, totalRecords.value)
    } else {
        const page = event.page + 1
        loadData(page, event.rows)
    }
}
const onSort = (event) => {
    sortField.value = event.sortField
    sortOrder.value = event.sortOrder
    loadData(1, rows.value)
}
const onFilter = (event) => {
    filters.value = event.filters
    first.value = 0
    loadData(1, rows.value)
}

const handleEdit = async (item) => {
  try {
    loading.value = true
    const response = await api.get(`/rincian_bku/${item.rincian_id}`)
    if (response.data) {
      selectedItem.value = { ...response.data }
      showModal.value = true
    } else {
      toast.add({
        severity: 'error',
        summary: 'Gagal',
        detail: 'Gagal memuat detail data',
        life: 3000,
      })
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: 'Gagal memuat detail data',
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}
const handleDelete = (item) => {
    toast.add({
        severity: 'warn',
        summary: 'Konfirmasi',
        detail: 'Apakah Anda yakin ingin menghapus data ini?',
        group: 'table-confirm',
        data: {
            url: `/rincian_bku/${item.rincian_id}`,
            title: 'hapus'
        }
    })
}
const onConfirmAction = async (event) => {
    toast.removeGroup('table-confirm')
    const { url, title } = event.data
    try {

        await api.delete(url)

        toast.add({
            severity: 'success',
            summary: 'Berhasil',
            detail: `Aksi ${title} berhasil dijalankan`,
            life: 3000,
        })
        loadData(1, rows.value)
    } catch (error) {
        console.error(`Gagal ${title}:`, error)
        toast.add({
            severity: 'error',
            summary: 'Gagal',
            detail: `Aksi ${title} gagal. Silakan coba lagi.`,
            life: 3000,
        })
    }
}
const onReject = () => {
    toast.removeGroup('table-confirm')
}

const handleSaved = () => {
  showModal.value = false
  loadData(1, rows.value)
}

watch(
    () => props.bkuId,
    async (newBkuId) => {
        await loadData(1, rows.value)
    },
    { immediate: true }
)

defineExpose({
    loadData,
})

</script>