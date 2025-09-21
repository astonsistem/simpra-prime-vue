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
                        isDaftar 
                        ? { label: 'Keluarkan', icon: 'pi pi-file-minus', command: () => handleKeluarkan(slotProps.data) } 
                        : { label: 'Daftarkan', icon: 'pi pi-file-plus', command: () => handleDaftarkan(slotProps.data) }
                    ]"
                />
            </template>
        </Column>
        <Column field="pendaftaran_id" header="Pendaftaran ID" style="min-width: 8rem" v-if="carabayarId != caraBayarProgsusId">
            <template #body="{ data }">
                {{ data.pendaftaran_id }}
            </template>
        </Column>
        <Column field="norm" header="No Rekam Medik" style="min-width: 12rem" v-if="carabayarId != caraBayarProgsusId">
            <template #body="{ data }">
                {{ data.norm }}
            </template>
        </Column>
        <Column field="nama" header="Nama Pasien" style="min-width: 12rem" v-if="carabayarId != caraBayarProgsusId">
            <template #body="{ data }">
                {{ data.nama }}
            </template>
        </Column>
        <Column field="tahun" header="Tahun" style="min-width: 4rem" v-if="carabayarId == caraBayarProgsusId">
            <template #body="{ data }">
                {{ data.tahun }}
            </template>
        </Column>
        <Column field="sumber" header="Sumber Pembiayaan" style="min-width: 8rem" v-if="carabayarId == caraBayarProgsusId">
            <template #body="{ data }">
                {{ data.sumber }}
            </template>
        </Column>
        <Column field="bulan" header="Bulan" style="min-width: 2rem" v-if="carabayarId == caraBayarProgsusId">
            <template #body="{ data }">
                {{ data.bulan }}
            </template>
        </Column>
        <Column field="total_tagihan" header="Jumlah" style="text-align: right">
            <template #body="{ data }">
                {{ new Intl.NumberFormat('id-ID').format(data.total_tagihan || 0) }}
            </template>
        </Column>
        <Column field="tgl_mrs" header="Tgl MRS" style="min-width: 8rem" v-if="carabayarId != caraBayarProgsusId">
            <template #body="{ data }">
                {{ formatDateID(data.tgl_mrs) }}
            </template>
        </Column>
        <Column field="sep" header="No SEP" style="min-width: 12rem" v-if="carabayarId != caraBayarProgsusId">
            <template #body="{ data }">
                {{ data.sep }}
            </template>
        </Column>
    </DataTable>
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
import api from '@/services/http.js'
import { FilterMatchMode } from '@primevue/core/api'

const props = defineProps({
    isDaftar: {
        type: Boolean,
        default: false,
    },
    piutangId: { 
        type: String, 
        default: null 
    },
    penjaminId: { 
        type: Number, 
        default: null 
    },
    carabayarId: { 
        type: Number, 
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
const caraBayarProgsusId = ref(null)

function formatDateID(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID')
}

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

    if (props.isDaftar) q.is_daftar = 1
    if (props.piutangId) q.piutang_id = props.piutangId
    if (props.penjaminId) q.penjamin_id = props.penjaminId

    return q
}
const loadData = async (page = 1, pageSize = rows.value) => {
    loading.value = true
    try {
        const query = buildQuery(page, pageSize)
        const response = await api.get('/rincian_potensi_pelayanan', { params: query })
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
const clearTableFilters = () => {
    initFilters()
    first.value = 0
    loadData(1, rows.value)
}

const handleKeluarkan = (item) => {
    toast.add({
        severity: 'warn',
        summary: 'Konfirmasi',
        detail: 'Apakah Anda yakin ingin mengeluarkan data ini?',
        group: 'table-confirm',
        data: {
            url: `/rincian_potensi_pelayanan/keluarkan/${item.rincian_id}`,
            title: 'keluarkan'
        }
    })
}
const handleDaftarkan = (item) => {
    toast.add({
        severity: 'warn',
        summary: 'Konfirmasi',
        detail: 'Apakah Anda yakin ingin mendaftarkan data ini?',
        group: 'table-confirm',
        data: {
            url: `/rincian_potensi_pelayanan/daftarkan/${item.rincian_id}`,
            title: 'daftarkan'
        }
    })
}
const onConfirmAction = async (event) => {
    toast.removeGroup('table-confirm')
    const { url, title } = event.data
    try {

        const payload = {
            piutang_id: props.piutangId,
            penjamin_id: props.penjaminId,
        }

        const config = {
            headers: {
                'Content-Type': 'application/json',
            },
        }

        await api.put(url, payload, config)

        toast.add({
            severity: 'success',
            summary: 'Berhasil',
            detail: `Aksi ${title} berhasil dijalankan`,
            life: 3000,
        })
        emit('saved')
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

watch(
    () => [props.isDaftar, props.piutangId, props.penjaminId, props.carabayarId, props.options],
    async ([newIsDaftar, newPiutangId, newPenjaminId, newCarabayarId, newOptions]) => {
        await loadData(1, rows.value)
        caraBayarProgsusId.value = newOptions.carabayar.find(opt =>
            opt.label.toLowerCase().replace(/\s+/g, '').includes("programkhusus")
        )?.id || null
    },
    { immediate: true }
)

defineExpose({
    data,
    loadData,
    clearTableFilters,
})

</script>