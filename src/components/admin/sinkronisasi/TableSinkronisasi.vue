<script setup>
import { ref, onMounted } from 'vue'
import { FilterMatchMode } from '@primevue/core/api'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import api from '@/services/http.js'

const confirm = useConfirm()
const toast = useToast()

const syncs = ref([])
const loading = ref(true)
const totalRecords = ref(0)
const filters = ref()
const lazyParams = ref({
  page: 1,
  size: 10,
})

const loadSyncs = async () => {
  loading.value = true
  try {
    const response = await api.get('/sinkronisasi', {
      params: {
        page: lazyParams.value.page,
        size: lazyParams.value.size,
      },
    })
    syncs.value = response.data.items
    totalRecords.value = response.data.total
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load sync data',
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadSyncs()
  initFilters()
})

const onPage = (event) => {
  lazyParams.value.page = event.page + 1
  loadSyncs()
}

const confirmDelete = (sync) => {
  confirm.require({
    message: 'Are you sure you want to delete this item?',
    header: 'Delete Confirmation',
    icon: 'pi pi-info-circle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await api.delete(`/sinkronisasi/${sync.id}`)
        toast.add({
          severity: 'success',
          summary: 'Confirmed',
          detail: 'Sync data deleted',
          life: 3000,
        })
        loadSyncs()
      } catch (error) {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete sync data',
          life: 3000,
        })
      }
    },
  })
}

const initFilters = () => {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    sinkronisasi_nama: { value: null, matchMode: FilterMatchMode.CONTAINS },
    sinkronisasi_menu: { value: null, matchMode: FilterMatchMode.CONTAINS },
    sinkronisasi_api: { value: null, matchMode: FilterMatchMode.CONTAINS },
    sinkronisasi_groupuser: { value: null, matchMode: FilterMatchMode.CONTAINS },
  }
}

const clearFilter = () => {
  initFilters()
}
</script>

<template>
  <div class="card">
    <DataTable
      :value="syncs"
      :paginator="true"
      :rows="10"
      dataKey="id"
      :loading="loading"
      @page="onPage($event)"
      :totalRecords="totalRecords"
      lazy
      :filters="filters"
      filterDisplay="menu"
      :globalFilterFields="[
        'sinkronisasi_nama',
        'sinkronisasi_menu',
        'sinkronisasi_api',
        'sinkronisasi_groupuser',
      ]"
    >
      <template #header>
        <div class="flex justify-between items-center">
          <h5 class="m-0">Sinkronisasi</h5>
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
            <Button
              label="Add Sync"
              icon="pi pi-plus"
              class="p-button-success"
              @click="$emit('add')"
            />
          </div>
        </div>
      </template>
      <Column
        field="sinkronisasi_nama"
        header="Nama"
        :sortable="true"
        :showFilterMatchModes="false"
      >
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" placeholder="Search by Nama" />
        </template>
      </Column>
      <Column
        field="sinkronisasi_menu"
        header="Menu"
        :sortable="true"
        :showFilterMatchModes="false"
      >
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" placeholder="Search by Menu" />
        </template>
      </Column>
      <Column field="sinkronisasi_api" header="Api Url" :showFilterMatchModes="false">
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" placeholder="Search by Api Url" />
        </template>
      </Column>
      <Column
        field="sinkronisasi_groupuser"
        header="Group User"
        :sortable="true"
        :showFilterMatchModes="false"
      >
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" placeholder="Search by Group User" />
        </template>
      </Column>
      <Column header="Actions">
        <template #body="slotProps">
          <Button
            icon="pi pi-pencil"
            class="p-button-rounded p-button-success mr-2"
            @click="$emit('edit', slotProps.data)"
          />
          <Button
            icon="pi pi-trash"
            class="p-button-rounded p-button-warning"
            @click="confirmDelete(slotProps.data)"
          />
        </template>
      </Column>
    </DataTable>
  </div>
</template>
