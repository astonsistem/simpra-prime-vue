<script setup>
import { ref, onMounted } from 'vue'
import DatePicker from 'primevue/datepicker'
import Select from 'primevue/select'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import SplitButton from 'primevue/splitbutton'
import Menu from 'primevue/menu'
import { useToast } from 'primevue/usetoast'
import api from '@/services/http.js'
import ModalSyncPenerimaan from './modal/TarikDataPenerimaanLainya.vue'
import ModalEditPenerimaan from './modal/EditPenerimaan.vue'
import Toast from 'primevue/toast'

const toast = useToast()

const jenisPenerimaOptions = ref([])
const caraBayarOptions = ref([])
const penjaminOptions = ref([])
const data = ref([])
const loading = ref(false)
const showModalSync = ref(false)
const showModalEdit = ref(false)
const selectedItem = ref(null)

const filters = ref({
  tglAwal: null,
  tglAkhir: null,
  tahunPeriode: null,
  jenisPeriode: null,
  jenisPenerima: null,
  uraian: null,
})

const currentYear = new Date().getFullYear()
const tahunPeriodeOptions = Array.from({ length: 10 }, (_, i) => `${currentYear - 5 + i}`)
const jenisPeriodeOptions = ['-- Pilih Jenis Periode --', 'Tahunan', 'Bulanan']
const uraianOptions = ['Semua', 'Selesai', 'Proses', 'Batal']

const resetFilter = () => {
  filters.value = {
    tglAwal: null,
    tglAkhir: null,
    tahunPeriode: null,
    jenisPeriode: null,
    jenisPenerima: null,
    uraian: null,
  }
  loadData()
}

const loadData = async () => {
  loading.value = true
  try {
    const response = await api.get('/penerimaan_lain', {
      params: filters.value,
    })
    if (response.data) {
      data.value = response.data.items.map((item, index) => ({
        ...item,
        no: index + 1,
        akun_nama: item.akun_data?.akun_nama || '',
      }))
    }
  } catch (error) {
    console.error('Gagal memuat data:', error)
  } finally {
    loading.value = false
  }
}

const searchData = () => {
  loadData()
}

const handleAdd = () => {
  selectedItem.value = null
  showModalEdit.value = true
}

const handleEdit = (item) => {
  selectedItem.value = { ...item }
  showModalEdit.value = true
}

const handleSetor = (item) => {
  console.log('Setor item:', item)
}

const handleValidasi = (item) => {
  console.log('Validasi item:', item)
  // TODO: Implement validasi functionality
}

const handleBuktiBayar = (item) => {
  console.log('Bukti Bayar item:', item)
  // TODO: Implement bukti bayar functionality
}

const handleDelete = async (item) => {
  if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) return
  try {
    await api.delete(`/penerimaan_lain/${item.id}`)
    toast.add({
      severity: 'success',
      summary: 'Berhasil',
      detail: 'Data berhasil dihapus',
      life: 3000,
    })
    loadData()
  } catch (error) {
    console.error('Gagal menghapus data:', error)
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: 'Gagal menghapus data. Silakan coba lagi.',
      life: 3000,
    })
  }
}

const handleSaved = () => {
  showModalEdit.value = false
  toast.add({
    severity: 'success',
    summary: 'Berhasil',
    detail: 'Data berhasil disimpan',
    life: 3000,
  })
  loadData()
}

const fetchCaraBayar = async () => {
  try {
    const response = await api.get('/carabayar')
    if (response.data && response.data.items) {
      caraBayarOptions.value = response.data.items.map((item) => ({
        label: item.carabayar_nama,
        value: item.carabayar_id,
      }))
    }
  } catch (error) {
    console.error('Gagal memuat data cara bayar:', error)
  }
}

const fetchPenjamin = async () => {
  try {
    const response = await api.get('/penjamin')
    if (response.data && response.data.items) {
      penjaminOptions.value = response.data.items.map((item) => ({
        label: item.penjamin_nama,
        value: item.penjamin_id,
      }))
    }
  } catch (error) {
    console.error('Gagal memuat data penjamin:', error)
  }
}

onMounted(async () => {
  try {
    const response = await api.get('/akun/list')
    if (response.data.status == 200) {
      jenisPenerimaOptions.value = response.data.data.map((item) => ({
        label: item.akun_nama,
        value: item.akun_id,
      }))
    }
    await fetchCaraBayar()
    await fetchPenjamin()
    loadData()
  } catch (error) {
    console.error('Gagal memuat data akun:', error)
  }
})
</script>

<template>
  <div class="p-4">
    <div
      class="bg-surface-0 dark:bg-surface-900 rounded-2xl mb-6 px-6 py-4 md:px-6 md:py-3 border-b md:border border-surface-200 dark:border-surface-700 w-full sticky top-0 z-30"
    >
      <h3 class="text-xl font-semibold text-[#17316E] mb-4">Filter Data</h3>
      <div class="grid grid-cols-3 gap-4">
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Tahun Periode</label>
          <Select
            v-model="filters.tahunPeriode"
            :options="tahunPeriodeOptions"
            placeholder="Tahun Periode"
            class="w-full"
          />
        </div>

        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Tgl Awal</label>
          <DatePicker v-model="filters.tglAwal" placeholder="Tgl Awal" showIcon class="w-full" />
        </div>

        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Tgl Akhir</label>
          <DatePicker v-model="filters.tglAkhir" placeholder="Tgl Akhir" showIcon class="w-full" />
        </div>

        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Jenis Periode</label>
          <Select
            v-model="filters.jenisPeriode"
            :options="jenisPeriodeOptions"
            placeholder="Jenis Periode"
            class="w-full"
          />
        </div>

        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Jenis Penerima</label>
          <Select
            v-model="filters.jenisPenerima"
            :options="jenisPenerimaOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Jenis Penerima"
            class="w-full"
          />
        </div>

        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Uraian</label>
          <InputText v-model="filters.uraian" placeholder="Uraian" class="w-full" />
        </div>
      </div>

      <div class="mt-4 flex gap-2">
        <Button label="Cari" icon="pi pi-search" class="p-button-info" @click="searchData" />
        <Button
          label="Reset Filter"
          icon="pi pi-refresh"
          class="p-button-secondary"
          @click="resetFilter"
        />
      </div>
    </div>

    <div
      class="bg-surface-0 dark:bg-surface-900 rounded-2xl my-6 px-6 py-4 md:px-6 md:py-3 border-b md:border border-surface-200 dark:border-surface-700 w-full sticky top-0 z-30"
    >
      <div class="flex justify-between items-center mb-2">
        <h3 class="text-xl font-semibold text-[#17316E]">Data Penerimaan Lainnya</h3>
        <div class="flex gap-2">
          <Button
            label="Tambah Data"
            icon="pi pi-plus"
            class="p-button-primary"
            @click="handleAdd"
          />
          <Button
            label="Tarik Data"
            icon="pi pi-refresh"
            class="p-button-success"
            @click="showModalSync = true"
          />
          <Button label="Export Excel" icon="pi pi-file-excel" class="p-button-success" />
        </div>
      </div>

      <DataTable
        :value="data"
        :loading="loading"
        responsiveLayout="scroll"
        paginator
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20]"
        class="p-datatable-sm"
      >
        <Column field="no" header="No" style="width: 5%" />
        <Column header="Action" style="width: 15%">
          <template #body="slotProps">
            <SplitButton
              label="Aksi"
              icon="pi pi-ellipsis-v"
              size="small"
              severity="secondary"
              :model="[
                {
                  label: 'Ubah',
                  icon: 'pi pi-pencil',
                  command: () => handleEdit(slotProps.data),
                },
                {
                  label: 'Bukti Bayar',
                  icon: 'pi pi-file',
                  command: () => handleBuktiBayar(slotProps.data),
                },
                {
                  label: 'Validasi',
                  icon: 'pi pi-check',
                  command: () => handleValidasi(slotProps.data),
                },
                {
                  label: 'Hapus',
                  icon: 'pi pi-trash',
                  command: () => handleDelete(slotProps.data),
                },
              ]"
            />
          </template>
        </Column>
        <Column field="no_bayar" header="No Bayar" />
        <Column field="tgl_bayar" header="Tgl Bayar" />
        <Column field="pihak3" header="Pihak 3" />
        <Column field="uraian" header="Uraian" />
        <Column field="no_dokumen" header="No Dokumen" />
        <Column field="tgl_dokumen" header="Tgl Dokumen" />
        <Column field="akun_nama" header="Jenis Penerimaan" />
        <Column field="metode_pembayaran" header="Metode Bayar" />
        <Column field="cara_pembayaran" header="Cara Pembayaran" />
        <Column field="bank_tujuan" header="Bank" />
        <Column field="total" header="Jumlah Bruto" style="text-align: right">
          <template #body="slotProps">
            {{ new Intl.NumberFormat('id-ID').format(slotProps.data.total) }}
          </template>
        </Column>
        <Column field="admin_kredit" header="Biaya Admin EDC" style="text-align: right">
          <template #body="slotProps">
            {{ new Intl.NumberFormat('id-ID').format(slotProps.data.admin_kredit || 0) }}
          </template>
        </Column>
        <Column field="admin_debit" header="Biaya Admin QRIS" style="text-align: right">
          <template #body="slotProps">
            {{ new Intl.NumberFormat('id-ID').format(slotProps.data.admin_debit || 0) }}
          </template>
        </Column>
        <Column field="selisih" header="Selisih" style="text-align: right">
          <template #body="slotProps">
            {{ new Intl.NumberFormat('id-ID').format(slotProps.data.selisih || 0) }}
          </template>
        </Column>
        <Column field="jumlah_netto" header="Jumlah Netto" style="text-align: right">
          <template #body="slotProps">
            {{ new Intl.NumberFormat('id-ID').format(slotProps.data.jumlah_netto) }}
          </template>
        </Column>
      </DataTable>
    </div>
    <ModalSyncPenerimaan v-model="showModalSync" @sync="loadData" />
    <ModalEditPenerimaan
      :visible="showModalEdit"
      :item="selectedItem"
      @update:visible="showModalEdit = $event"
      @saved="handleSaved"
    />
    <Toast />
  </div>
</template>

<style scoped>
.p-datatable .p-datatable-thead > tr > th {
  white-space: nowrap;
  text-align: center;
  padding: 0.5rem 0.75rem;
}

.p-datatable .p-datatable-tbody > tr > td {
  white-space: nowrap;
  padding: 0.5rem 0.75rem;
  vertical-align: middle;
}
</style>
