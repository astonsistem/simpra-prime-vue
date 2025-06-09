<script setup>
import { ref, onMounted } from 'vue'
import akunPendapatanData from '../../../api/dummyData/akunPendapatan.json'

const data = ref([])
const loading = ref(false)

const fetchData = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(akunPendapatanData.data)
    }, 500)
  })
}

const loadData = async () => {
  try {
    loading.value = true
    data.value = await fetchData()
  } catch (error) {
    console.error('Error loading data:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})

const handleEdit = (item) => {
  console.log('Edit item:', item)
}

const handleDelete = (item) => {
  console.log('Delete item:', item)
}
</script>

<template>
  <div class="card">
    <DataTable
      :value="data"
      :loading="loading"
      responsiveLayout="scroll"
      class="p-datatable-sm"
      paginator
      :rows="10"
      :rowsPerPageOptions="[5, 10, 20]"
    >
      <Column field="no" header="No" style="width: 5%" />
      <Column header="Action" style="width: 15%">
        <template #body="slotProps">
          <div class="flex gap-2">
            <Button
              icon="pi pi-pencil"
              rounded
              text
              severity="info"
              aria-label="Edit"
              @click="handleEdit(slotProps.data)"
            />
            <Button
              icon="pi pi-trash"
              rounded
              text
              severity="danger"
              aria-label="Delete"
              @click="handleDelete(slotProps.data)"
            />
          </div>
        </template>
      </Column>
      <Column field="id" header="ID" style="width: 10%" />
      <Column field="kode" header="Kode" style="width: 10%" />
      <Column field="nama" header="Nama" style="width: 15%" />
      <Column field="rekening" header="Rekening" style="width: 10%" />
      <Column field="namaRekening" header="Nama Rekening" style="width: 20%" />
      <Column field="kelompok" header="Kelompok" style="width: 15%" />
    </DataTable>
  </div>
</template>

<style scoped>
::v-deep(.p-datatable thead th) {
  background-color: #f8fafc;
  color: #000000;
}
</style>
