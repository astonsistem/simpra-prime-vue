<script setup>
import { ref, onMounted } from 'vue'
import kasir from '../../../api/dummyData/kasir.json'

const data = ref([])
const loading = ref(false)

const fetchData = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(kasir.data)
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
      <Column field="no" header="No" style="width: 10%" />
      <Column field="id" header="ID" style="width: 40%" />
      <Column field="nama" header="Nama" style="width: 50%" />
    </DataTable>
  </div>
</template>

<style scoped>
::v-deep(.p-datatable thead th) {
  background-color: #f8fafc;
  color: #000000;
}
</style>
