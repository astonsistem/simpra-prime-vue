<script setup>
import { ref, onMounted } from 'vue'
import { FilterMatchMode } from '@primevue/core/api'
import AkunPendapatanModal from './modal/AddAkunPendapatan.vue'
import api from '@/services/http.js'

import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import SplitButton from 'primevue/splitbutton'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'

const data = ref([])
const loading = ref(false)
const modalRef = ref(null)
const selectedItem = ref(null)
const isEdit = ref(false)
const filters = ref()

const fetchData = async () => {
  const response = await api.get('/akun')
  return response.data.items.map((item, index) => ({
    no: index + 1,
    id: item.id,
    akun_id: item.akun_id,
    kode: item.akun_kode,
    nama: item.akun_nama,
    rekening: item.rek_id,
    namaRekening: item.rek_nama,
    kelompok: item.akun_kelompok,
  }))
}

const loadData = async () => {
  loading.value = true
  try {
    data.value = await fetchData()
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
  initFilters()
})

const handleAdd = () => {
  selectedItem.value = null
  isEdit.value = false
  modalRef.value.open()
}

const handleEdit = (item) => {
  selectedItem.value = { ...item }
  isEdit.value = true
  modalRef.value.open()
}

const handleDelete = async (item) => {
  try {
    await api.delete(`/akun/${item.id}`)
    await loadData()
  } catch (e) {
    console.error('Delete failed:', e)
  }
}

const handleSubmit = async (payload) => {
  try {
    if (isEdit.value) {
      await api.put(`/akun/${payload.id}`, payload)
    } else {
      await api.post(`/akun`, payload)
    }
    await loadData()
    modalRef.value.close()
  } catch (e) {
    console.error('Submit failed:', e)
  }
}

const initFilters = () => {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    akun_id: { value: null, matchMode: FilterMatchMode.CONTAINS },
    kode: { value: null, matchMode: FilterMatchMode.CONTAINS },
    nama: { value: null, matchMode: FilterMatchMode.CONTAINS },
    rekening: { value: null, matchMode: FilterMatchMode.CONTAINS },
    namaRekening: { value: null, matchMode: FilterMatchMode.CONTAINS },
    kelompok: { value: null, matchMode: FilterMatchMode.CONTAINS },
  }
}

const clearFilter = () => {
  initFilters()
}
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-3">
      <Button label="Baru" icon="pi pi-plus" @click="handleAdd" />
      <div class="flex gap-2">
        <Button
          type="button"
          icon="pi pi-filter-slash"
          label="Clear"
          outlined
          @click="clearFilter()"
        />
        <IconField>
          <InputIcon>
            <i class="pi pi-search" />
          </InputIcon>
          <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
        </IconField>
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
      :filters="filters"
      filterDisplay="menu"
      :globalFilterFields="['akun_id', 'kode', 'nama', 'rekening', 'namaRekening', 'kelompok']"
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
                label: 'Hapus',
                icon: 'pi pi-trash',
                command: () => handleDelete(slotProps.data),
              },
            ]"
          />
        </template>
      </Column>
      <Column field="akun_id" header="ID" :showFilterMatchModes="false">
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" placeholder="Search by ID" />
        </template>
      </Column>
      <Column field="kode" header="Kode" :showFilterMatchModes="false">
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" placeholder="Search by Kode" />
        </template>
      </Column>
      <Column field="nama" header="Nama" :showFilterMatchModes="false">
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" placeholder="Search by Nama" />
        </template>
      </Column>
      <Column field="rekening" header="Rekening" :showFilterMatchModes="false">
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" placeholder="Search by Rekening" />
        </template>
      </Column>
      <Column field="namaRekening" header="Nama Rekening" :showFilterMatchModes="false">
        <template #filter="{ filterModel }">
          <InputText
            v-model="filterModel.value"
            type="text"
            placeholder="Search by Nama Rekening"
          />
        </template>
      </Column>
      <Column field="kelompok" header="Kelompok" :showFilterMatchModes="false">
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" placeholder="Search by Kelompok" />
        </template>
      </Column>
    </DataTable>

    <AkunPendapatanModal
      ref="modalRef"
      :item="selectedItem"
      :isEdit="isEdit"
      @submit="handleSubmit"
    />
  </div>
</template>
