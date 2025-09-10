<template>
  <IconField @click="visible = true">
    <InputText v-bind="attrs" :value="inputValue" readonly />
    <InputIcon class="pi pi-chevron-down" />
  </IconField>
  <Message v-if="attrs.errorMessage" severity="error" size="small" variant="simple">{{ attrs?.errorMessage }}</Message>

  <Teleport to="body">
    <Dialog v-model:visible="visible" :style="{ width: '40rem' }" header="Pilih Jenis Penerimaan" :modal="true">

      <DataTable stripedRows rowHover lazy :value="items" v-model:selection="selectedItem"
        :loading="loading"
        v-model:filters="filters" :globalFilterFields="['akun_id', 'akun_nama']" filterDisplay="menu"
        @sort="onSort($event)"
        @row-select="onRowSelect($event)"
        @filter="onFilter($event)"
        selectionMode="single" 
        dataKey="akun_id" 
        size="small" 
        tableClass="w-full">

        <template #header>
          <div class="flex justify-between">
            <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined @click="clearFilter()" />
            <IconField>
              <InputText v-model="filters['global'].value" @input="onSearchDebounced($event)" placeholder="Keyword Search" />
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
            </IconField>
          </div>
        </template>

        <template #empty>
          <div class="flex items-center text-gray-500 min-h-24">
            <i class="pi pi-info-circle mr-2" style="font-size: 1.5rem"></i>
            <p>Data Kosong</p>
          </div>
        </template>

        <Column field="no" header="No.">
          <template #body="{ index }">{{ params.from + index }}</template>
        </Column>
        <Column field="akun_id" sortable header="Kode" filterField="akun_id" dataType="string">
          <template #filter="{ filterCallback, filterModel }">
            <div>{{ filterModel.value }}</div>
            <InputText v-model="filters['akun_id'].value" placeholder="Search by Kode" class="p-inputtext-sm" />
          </template>
        </Column>
        <Column field="akun_nama" sortable header="Nama" filterField="akun_nama" dataType="string">
          <template #filter="{ filterCallback, filterModel }">
            <div>{{ filterModel.value }}</div>
            <InputText v-model="filters['akun_nama'].value" placeholder="Search by Nama" class="p-inputtext-sm" />
          </template>
        </Column>
      </DataTable>
      <Paginator v-model:first="params.from" :rows="params.per_page" :totalRecords="params.total"
        :rowsPerPageOptions="[5, 10, 20, 50, 100, 1000]" @page="onPageChange($event)"></Paginator>
    </Dialog>
  </Teleport>

</template>

<script setup>
import { useAttrs, ref, computed, onMounted, watch, toRef } from 'vue';
import { formatCurrency } from '@/utils/utils.js';
import api from '@/api/client.js';

const emits = defineEmits(['update:modelValue', 'row-select'])
const attrs = useAttrs();
const visible = ref(false)
const items = ref([])
const selectedItem = ref(null)
const loading = ref(false)
const params = ref({})
const filters = ref({})
const model = defineModel()

onMounted(() => {
  initFilters()
  initParams()
  if (model.value) {
    getSelection(model.value)
  }
})

watch(() => visible.value, (newValue) => {
  if (newValue) {
    initFilters()
    initParams()
    loadData()
  }
})

const inputValue = computed(() => {
  if (selectedItem.value) {
    return `${selectedItem.value.akun_id} - ${selectedItem.value.akun_nama}`
  }
  return ''
})

function initFilters() {
  filters.value = {
    global: { value: null, matchMode: 'contains' },
    akun_id: { value: null, matchMode: 'equals' },
    akun_nama: { value: null, matchMode: 'contains' },
  }
}

function initParams() {
  params.value = {
    type: 'jenis-penerimaan',
    page: 1,
    per_page: 20,
    from: 1,
    total: 0,
    search: '',
    filter: {},
    sortField: '',
    sortOrder: 'asc',
    pagination: true
  }
}

function loadData() {
  loading.value = true
  return new Promise((resolve, reject) => {
    api.get('/akun/list', { params: params.value })
      .then((response) => {
        const data = response.data.data
       
        items.value = data.data
        params.value.total = data.total
        params.value.from = data.from
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

function getSelection(id) {
  params.value.page = 1
  params.value.per_page = 1
  params.value.filters = {
    akun_id: {
      value: id,
      matchMode: 'equals'
    }
  }
  loadData().then(({ data }) => {
    if( data.status == 200) {
      params.value.total = 1
      selectedItem.value = items.value.find(item => item.akun_id == id)
      emits('row-select', selectedItem.value)
    }
  })
}

function onPageChange(event) {
  params.value.page = event.page + 1
  params.value.per_page = event.rows
  loadData()
}
function onRowSelect(event) {
  if(event.data?.nominal) {
    event.data.nominal = formatCurrency(event.data.nominal)
  }
  emits('update:modelValue', event.data[attrs.dataKey??'id'])
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

function onFilter(event) {
  params.value.page = 1
  params.value.per_page = 20
  params.value.filters = event.filters
  filters.value = event.filters
  loadData()
}

function onSort(event) {
  params.value.sortField = event.sortField
  params.value.sortOrder = event.sortOrder > 0 ? 'asc' : 'desc'
  params.value.page = 1
  params.value.per_page = 20
  loadData()
}

function clearFilter() {
  initFilters()
  initParams()
  loadData()
}
</script>
