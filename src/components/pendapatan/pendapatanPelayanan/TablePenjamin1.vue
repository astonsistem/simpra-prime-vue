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
                        ...(inModal ? [] : [ { label: 'Sinkron', icon: 'pi pi-sync', command: () => handleSinkron(slotProps.data) } ]),
                        { label: 'Hapus', icon: 'pi pi-trash', command: () => handleDelete(slotProps.data) },
                    ]"
                />
            </template>
        </Column>
        <Column 
            field="tgl_pendaftaran" 
            header="Tgl Pendaftaran" 
            :sortable="!inModal"
            style="min-width: 8rem"
        >
            <template #body="{ data }">
                {{ formatDateID(data.tgl_pendaftaran) }}
            </template>
        </Column>
        <Column 
            field="no_pendaftaran"
            header="No Pendaftaran" 
            :showFilterMatchModes="false"
            style="width: 15%"
        >
            <template #body="{ data }">
                {{ data.no_pendaftaran }}
            </template>
            <template #filter="{ filterModel }" v-if="!inModal">
                <InputText v-model="filterModel.value" type="text" placeholder="Search No Pendaftaran" />
            </template>
        </Column>
        <Column
            field="no_rekam_medik"
            header="No RM"
            :showFilterMatchModes="false"
            style="min-width: 8rem"
        >
            <template #body="{ data }">
                {{ data.no_rekam_medik }}
            </template>
            <template #filter="{ filterModel }" v-if="!inModal">
                <InputText v-model="filterModel.value" type="text" placeholder="Search No RM" />
            </template>
        </Column>
        <Column
            field="pasien_nama"
            header="Nama"
            :showFilterMatchModes="false"
            style="min-width: 12rem"
        >
            <template #body="{ data }">
                {{ data.pasien_nama }}
            </template>
            <template #filter="{ filterModel }" v-if="!inModal">
                <InputText v-model="filterModel.value" type="text" placeholder="Search Nama" />
            </template>
        </Column>
        <Column field="tgl_pelayanan" header="Tgl Selesai" style="min-width: 8rem">
            <template #body="{ data }">
                {{ formatDateID(data.tgl_pelayanan) }}
            </template>
        </Column>
        <Column field="jenis_tagihan" header="Jenis Pelayanan" style="min-width: 8rem">
            <template #body="{ data }">
                {{ data.jenis_tagihan }}
            </template>
        </Column>
        <Column
            field="carabayar_nama"
            header="Cara Bayar"
            :showFilterMatchModes="false"
            style="min-width: 8rem"
        >
            <template #body="{ data }">
                {{ data.carabayar_nama }}
            </template>
            <template #filter="{ filterModel }">
                <Dropdown
                    v-model="filterModel.value"
                    :options="options.carabayar"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select Cara Bayar"
                    class="p-column-filter"
                    showClear
                />
            </template>
        </Column>
        <Column
            field="penjamin_nama"
            header="Penjamin"
            :showFilterMatchModes="false"
            style="min-width: 12rem"
        >
            <template #body="{ data }">
                {{ data.penjamin_nama }}
            </template>
            <template #filter="{ filterModel }">
                <Dropdown
                    v-model="filterModel.value"
                    :options="options.penjamin"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select Penjamin"
                    class="p-column-filter"
                    showClear
                    filter
                    filterPlaceholder="Search Penjamin"
                />
            </template>
        </Column>
        <Column field="total_dijamin" header="Nilai" style="text-align: right">
            <template #body="{ data }">
                {{ new Intl.NumberFormat('id-ID').format(data.total_dijamin || 0) }}
            </template>
        </Column>
        <Column
            field="status"
            header="Status"
            :showFilterMatchModes="false"
            style="min-width: 8rem"
        >
            <template #body="{ data }">
                {{ data.status }}
            </template>
            <template #filter="{ filterModel }">
                <Dropdown
                    v-model="filterModel.value"
                    :options="statusOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select Status"
                    class="p-column-filter"
                    showClear
                />
            </template>
        </Column>
    </DataTable>
    <ModalEditPenjamin1 
        v-model="showModalEdit" 
        :item="selectedItem" 
        :options="props.options"
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
import api from '@/services/http.js'
import { FilterMatchMode } from '@primevue/core/api'
import ModalEditPenjamin1 from '@/components/pendapatan/pendapatanPelayanan/ModalEditPenjamin1.vue'

const props = defineProps({
    pelayananId: { 
        type: Number, 
        default: null 
    },
    tableFilters: {
        type: Object,
        default: () => ({}),
    },
    inModal: {
        type: Boolean,
        default: false
    },
    options: Object
})
const toast = useToast()
const data = ref([])
const loading = ref(false)
const filters = ref()
const totalRecords = ref(0)
const rows = ref(10)
const first = ref(0)
const sortField = ref(null)
const sortOrder = ref(null)
const showModalEdit = ref(false)
const selectedItem = ref(null)
const statusOptions = [
    { label: 'Data Awal', value: 'Data Awal' },
    { label: 'Piutang', value: 'Piutang' },
    { label: 'Klaim', value: 'Klaim' },
    { label: 'Bayar', value: 'Bayar' },
]

const buildQuery = (page = 1, pageSize = rows.value) => {
    const q = {
        page,
        size: pageSize,
    }
    if (props.tableFilters.jenisPeriode) q.periode = props.tableFilters.jenisPeriode
    if (props.tableFilters.jenisPeriode === 'BULANAN') {
        if (props.tableFilters.tahunPeriode) {
            q.tahun_periode = props.tableFilters.tahunPeriode
        }
        if (props.tableFilters.bulanAwal && props.tableFilters.bulanAkhir) {
            const year = props.tableFilters.tahunPeriode || new Date().getFullYear()
            const startDate = new Date(year, props.tableFilters.bulanAwal - 1, 1)
            const endDate = new Date(year, props.tableFilters.bulanAkhir, 0)
            q.tgl_awal = formatDateToYYYYMMDD(startDate)
            q.tgl_akhir = formatDateToYYYYMMDD(endDate)
        } else if (props.tableFilters.bulanAwal || props.tableFilters.bulanAkhir) {
            toast.add({
                severity: 'warn',
                summary: 'Peringatan',
                detail: 'Filter Bulan Awal dan Bulan Akhir harus terisi semua ketika salah satu terisi.',
                life: 3000,
            })
            return null
        }
    } else if (props.tableFilters.jenisPeriode === 'TANGGAL') {
        if (props.tableFilters.tglAwal && props.tableFilters.tglAkhir) {
            q.tgl_awal = formatDateToYYYYMMDD(props.tableFilters.tglAwal)
            q.tgl_akhir = formatDateToYYYYMMDD(props.tableFilters.tglAkhir)
        } else if (props.tableFilters.tglAwal || props.tableFilters.tglAkhir) {
            toast.add({
                severity: 'warn',
                summary: 'Peringatan',
                detail: 'Filter Tanggal Awal dan Tanggal Akhir harus terisi semua ketika salah satu terisi.',
                life: 3000,
            })
            return null
        }
    }

    if (props.tableFilters.jenisPelayanan) q.jenis_pelayanan = props.tableFilters.jenisPelayanan

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

    if (props.pelayananId) q.pelayanan_id = props.pelayananId

    return q
}
const loadData = async (page = 1, pageSize = rows.value) => {
    loading.value = true
    try {
        const query = buildQuery(page, pageSize)
        if (!query) {
            loading.value = false
            return
        }
        const response = await api.get('/pendapatan_penjamin1', { params: query })
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
        no_pendaftaran: { value: null, matchMode: FilterMatchMode.CONTAINS },
        no_rekam_medik: { value: null, matchMode: FilterMatchMode.CONTAINS },
        pasien_nama: { value: null, matchMode: FilterMatchMode.CONTAINS },
        carabayar_nama: { value: null, matchMode: FilterMatchMode.EQUALS },
        penjamin_nama: { value: null, matchMode: FilterMatchMode.EQUALS },
        status: { value: null, matchMode: FilterMatchMode.EQUALS },
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
const rowStyle = (rowData) => {
    if (rowData.status.toLowerCase() === 'terbayar') return { backgroundColor: '#d4edda', color: '#155724' }
}
const formatDateToYYYYMMDD = (date) => {
  if (!date) return null
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
function formatDateID(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID')
}

const handleEdit = async (item) => {
    if (item.status.toLowerCase() == 'terbayar') {
        toast.add({
            severity: 'warn',
            summary: 'Peringatan',
            detail: 'Data yang sudah terbayar tidak dapat diubah.',
            life: 3000,
        })
        return
    }
    try {
        loading.value = true
        const response = await api.get(`/pendapatan_penjamin1/${item.id}`)
        if (response.data) {
        selectedItem.value = { ...response.data }
        showModalEdit.value = true
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
const handleSinkron = (item) => {
    toast.add({
        severity: 'warn',
        summary: 'Konfirmasi',
        detail: 'Apakah Anda yakin ingin sinkron data ini?',
        group: 'confirm',
        data: {
            url: `/pendapatan_penjamin1/sinkron/${item.id}`,
            title: 'sinkron'
        }
    })
}
const handleDelete = (item) => {
    if (item.status.toLowerCase() != 'piutang') {
        toast.add({
            severity: 'warn',
            summary: 'Peringatan',
            detail: 'Data bukan piutang tidak dapat dihapus.',
            life: 3000,
        })
        return
    }
    toast.add({
        severity: 'warn',
        summary: 'Konfirmasi',
        detail: 'Apakah Anda yakin ingin menghapus data ini?',
        group: 'table-confirm',
        data: {
            url: `/pendapatan_penjamin1/${item.id}`,
            title: 'hapus'
        }
    })
}
const onConfirmAction = async (event) => {
    toast.removeGroup('table-confirm')
    const { url, title } = event.data
    try {
        if (title === 'hapus') {
            await api.delete(url)
        } else {
            await api.get(url)
        }
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
    showModalEdit.value = false
    loadData(1, rows.value)
}

watch(
    () => props.pelayananId,
    async (newId) => {
        if (Object.keys(props.tableFilters).length > 0 && props.tableFilters.bulanAkhir === null) {
            first.value = 0
            data.value = []
            totalRecords.value = 0 
        } else {
            await loadData(1, rows.value, newId)
        }
    },
    { immediate: true }
)
watch(
    () => props.tableFilters,
    async (newFilters) => {
        if (Object.keys(newFilters).length > 0 && newFilters.bulanAkhir === null) {
            first.value = 0
            data.value = []
            totalRecords.value = 0 
        }
    },
    { immediate: true }
)

defineExpose({
    data,
    loadData,
    clearTableFilters,
})

</script>