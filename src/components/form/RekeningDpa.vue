<template>
  <IconField @click="visible = true">
    <InputText v-bind="attrs" :value="inputValue" readonly />
    <InputIcon class="pi pi-chevron-down" />
  </IconField>
  <div v-if="attrs.errorMessage" class="text-red-500 text-sm mt-1">{{ attrs.errorMessage }}</div>

  <Teleport to="body">
    <Dialog v-model:visible="visible" :style="{ width: '60rem' }" header="Pilih Rekening" :modal="true">

      <DataTable stripedRows rowHover lazy :value="items" v-model:selection="selectedItem"
        :loading="loading"
        v-model:filters="filters" :globalFilterFields="['no_rc', 'nominal', 'uraian']" filterDisplay="menu"
        @sort="onSort($event)"
        @row-select="onRowSelect($event)"
        @filter="onFilter($event)"
        selectionMode="single" dataKey="rc_id" size="small" tableClass="w-full">

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
        <Column field="no_rc" sortable header="No. Rekening" filterField="no_rc" dataType="string">
          <template #filter="{ filterCallback, filterModel }">
            <div>{{ filterModel.value }}</div>
            <InputText v-model="filters['no_rc'].value" placeholder="Search by No. Rekening" class="p-inputtext-sm" />
          </template>
        </Column>
        <Column field="tgl_rc" header="Tgl. Rekening"></Column>
        <Column field="bank" header="Bank"></Column>
        <Column field="nominal" header="Nominal" sortable filterField="nominal" dataType="numeric" :show-filter-match-modes="false" filter-menu-style="width: 14rem">
          <template #body="{ data }">{{ formatCurrency(data.nominal) }}</template>
          <template #filter="{ filterCallback }">
            <div class="flex flex-col gap-2">
              <InputNumber
                v-model="filters['nominal'].min"
                @change="filterCallback()"
                placeholder="Min"
                mode="currency"
                currency="IDR"
                locale="id-ID"
                style="width: 100%"
              />
              <InputNumber
                v-model="filters['nominal'].max"
                @change="filterCallback()"
                placeholder="Max"
                mode="currency"
                currency="IDR"
                locale="id-ID"
                style="width: 100%"
              />
            </div>
          </template>
        </Column>
        <Column field="uraian" header="Uraian"></Column>
      </DataTable>
      <Paginator v-model:first="params.from" :rows="params.per_page" :totalRecords="params.total"
        :rowsPerPageOptions="[5, 10, 20, 50, 100, 1000]" @page="onPageChange($event)"></Paginator>
    </Dialog>
  </Teleport>

</template>

<script setup>
import { useAttrs, ref, computed, onMounted } from 'vue';
import { formatCurrency } from '@/utils/utils.js';
import api from '@/api/client.js';
import { get, template } from 'lodash';

const emits = defineEmits(['update:modelValue', 'row-select'])
const attrs = useAttrs();
const selection = defineModel('selection', {'default': {foo: 'FOO'}, 'required': false})
const visible = ref(false)
const items = ref([])
const selectedItem = ref(null)
const loading = ref(false)
const params = ref({})
const filters = ref({})

onMounted(() => {
  initFilters()
  initParams()
  if (!items.value.length) {
    loadData().then(() => {
      if(attrs.modelValue) {
        getSelection(attrs.modelValue)
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

function initFilters() {
  filters.value = {
    global: { value: null, matchMode: 'contains' },
    no_rc: { value: null, matchMode: 'equals' },
    nominal: { min: null, max: null, matchMode: 'between' },
  }
}

function initParams() {
  params.value = {
    page: 1,
    per_page: 20,
    from: 1,
    total: 0,
    search: '',
    filter: {},
    sortField: '',
    sortOrder: 'asc'
  }
}

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

function getSelection(rc_id) {
  api.get(`/rekening_koran/${rc_id}`, {params: {simple: true}})
    .then((response) => {
      selectedItem.value = response.data.data
      if(selectedItem.value.nominal) {
        selectedItem.value.nominal = formatCurrency(selectedItem.value.nominal)
      }
      emits('row-select', selectedItem.value)
    })
    .catch((error) => {
      console.error('error', error)
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
