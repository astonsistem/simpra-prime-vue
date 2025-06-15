<script setup>
import { ref, onMounted } from 'vue'
import AkunPendapatanModal from './modal/AddAkunPendapatan.vue'
import api from '@/services/http.js'

import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import SplitButton from 'primevue/splitbutton'

const data = ref([])
const loading = ref(false)
const modalRef = ref(null)
const selectedItem = ref(null)
const isEdit = ref(false)

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

onMounted(loadData)

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
</script>

<template>
  <div>
    <Button label="Baru" icon="pi pi-plus" class="mb-3" @click="handleAdd" />

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
                label: 'Hapus',
                icon: 'pi pi-trash',
                command: () => handleDelete(slotProps.data),
              },
            ]"
          />
        </template>
      </Column>
      <Column field="akun_id" header="ID" />
      <Column field="kode" header="Kode" />
      <Column field="nama" header="Nama" />
      <Column field="rekening" header="Rekening" />
      <Column field="namaRekening" header="Nama Rekening" />
      <Column field="kelompok" header="Kelompok" />
    </DataTable>

    <AkunPendapatanModal
      ref="modalRef"
      :item="selectedItem"
      :isEdit="isEdit"
      @submit="handleSubmit"
    />
  </div>
</template>
