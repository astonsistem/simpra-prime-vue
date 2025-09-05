<template>
  <IconField @click="visible = true">
    <InputText v-bind="attrs" :value="inputValue" readonly />
    <InputIcon class="pi pi-chevron-down" />
  </IconField>
  <div v-if="attrs.errorMessage" class="text-red-500 text-sm mt-1">{{ attrs.errorMessage }}</div>

  <Teleport to="body">
    <Dialog v-model:visible="visible" :style="{ width: '50rem' }" header="Pilih Rekening" :modal="true">
      <template #header>
        <h2 class="text-lg font-semibold">Pilih Rekening</h2>
        <IconField>
          <InputText v-model="filters['global'].value" @input="onSearchDebounced($event)" placeholder="Keyword Search" />
          <InputIcon>
            <i class="pi pi-search" />
          </InputIcon>
        </IconField>
      </template>
      <DataTable stripedRows rowHover lazy :value="items" v-model:selection="selectedItem" v-model:filters="filters"
        :globalFilterFields="['no_rc', 'nominal', 'uraian']" :loading="loading" @row-select="onRowSelect($event)"
        selectionMode="single" dataKey="rc_id" size="small" tableClass="w-full">

        <Column field="no" header="No.">
          <template #body="{ index }">{{ params.from + index }}</template>
        </Column>
        <Column field="no_rc" header="No. Rekening"></Column>
        <Column field="tgl_rc" header="Tgl. Rekening"></Column>
        <Column field="uraian" header="Uraian"></Column>
      </DataTable>
      <Paginator v-model:first="params.from" :rows="params.per_page" :totalRecords="params.total"
        :rowsPerPageOptions="[5, 10, 20, 50, 100, 1000]" @page="onPageChange($event)"></Paginator>
    </Dialog>
  </Teleport>

</template>

<script setup>
import { useAttrs, ref, watch, computed, onMounted } from 'vue';
import api from '@/api/client.js';

const emits = defineEmits(['update:modelValue', 'row-select'])
const attrs = useAttrs();
const visible = ref(false)
const items = ref([])
const selectedItem = ref(null)
const loading = ref(false)
const params = ref({
  page: 1,
  per_page: 20,
  from: 1,
  total: 0,
  search: '',
  for: 'rekening_dpa'
})
const filters = ref({
  global: { value: null, matchMode: 'contains' },
  no_rc: { value: null, matchMode: 'contains' },
  nominal: { value: null, matchMode: 'equals' },
  uraian: { value: null, matchMode: 'contains' },
})

onMounted(() => {
  if (!items.value.length) {
    loadData().then(() => {
      if(attrs.modelValue) {
        selectedItem.value = items.value.find(item => item.rc_id == attrs.modelValue)
        inputValue.value = `${selectedItem.value.no_rc} - ${selectedItem.value.uraian}`
        emits('row-select', selectedItem.value)
      }
    })
  }
})

const inputValue = computed(() => {
  if (selectedItem.value) {
    return `${selectedItem.value.no_rc} - ${selectedItem.value.uraian}` || selectedItem.value.no_rc
  }
  return ''
})

function loadData() {
  loading.value = true
  return new Promise((resolve, reject) => {
    api.get('/rekening_koran/list', { params: params.value })
      .then((response) => {
        const data = response.data
        items.value = data.data
        params.value.total = data.meta.total
        params.value.from = data.meta.from
        resolve(response)
      })
      .catch((error) => {
        console.error('error', error)
        reject(error)
      })
      .finally(() => {
        loading.value = false
      })
  })
}

function onPageChange(event) {
  params.value.page = event.page + 1
  params.value.per_page = event.rows
  loadData()
}
function onRowSelect(event) {
  emits('update:modelValue', event.data.rc_id)
  emits('row-select', event.data)
  visible.value = false
}

let searchTimeout = null
function onSearchDebounced(event) {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    onSearch(event)
  }, 800)
}

function onSearch(event) {
  params.value.search = event.target.value
  params.value.page = 1
  params.value.per_page = 20
  loadData()
}
</script>
