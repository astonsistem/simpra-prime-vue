<template>
  <div
    class="bg-surface-0 dark:bg-surface-900 rounded-2xl mb-6 px-6 py-4 md:px-6 md:py-3 border-b md:border border-surface-200 dark:border-surface-700 w-full sticky top-0 z-30">
    <h3 class="text-xl font-semibold text-[#17316E] mb-4">Filter Data</h3>
    <div class="grid gap-4"
      :class="{ 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5': form.jenisPeriode === 'BULANAN', 'grid-cols-2 md:grid-cols-4': form.jenisPeriode === 'TANGGAL' }">
      <div>
        <label class="block mb-1 text-sm font-medium text-gray-700">Jenis Periode</label>
        <Select v-model="form.jenisPeriode" :options="jenisPeriodeOptions" optionLabel="label" optionValue="value"
          placeholder="Jenis Periode" class="w-full" />
      </div>

      <template v-if="form.jenisPeriode === 'BULANAN'">
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Tahun Periode</label>
          <Select v-model="form.tahunPeriode" :options="tahunPeriodeOptions" placeholder="Tahun Periode"
            class="w-full" />
        </div>
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Bulan Awal</label>
          <Select v-model="form.bulanAwal" :options="bulanOptions" optionLabel="label" optionValue="value"
            placeholder="Bulan Awal" class="w-full" />
        </div>
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Bulan Akhir</label>
          <Select v-model="form.bulanAkhir" :options="bulanOptions" optionLabel="label" optionValue="value"
            placeholder="Bulan Akhir" class="w-full" />
        </div>
        <div class="self-end">
          <label class="block mb-1 text-sm font-medium text-gray-700"></label>
          <Button label="Cari" icon="pi pi-search" class="p-button-info" @click="searchData" />
        </div>
      </template>
      <template v-if="form.jenisPeriode === 'TANGGAL'">
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Tanggal Awal</label>
          <DatePicker v-model="form.tglAwal" placeholder="Tanggal Awal" showIcon class="w-full" dateFormat="dd/mm/yy"
            :showTime="false" :showSeconds="false" :showMilliseconds="false" />
        </div>
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Tanggal Akhir</label>
          <DatePicker v-model="form.tglAkhir" placeholder="Tanggal Akhir" showIcon class="w-full" dateFormat="dd/mm/yy"
            :showTime="false" :showSeconds="false" :showMilliseconds="false" />
        </div>
        <div class="self-end">
          <label class="block mb-1 text-sm font-medium text-gray-700"></label>
          <Button label="Cari" icon="pi pi-search" class="p-button-info" @click="searchData" />
        </div>
      </template>
    </div>
    <div class="mt-4 flex gap-2">
      <Button label="Reset Filter" icon="pi pi-refresh" class="p-button-secondary" @click="resetFilter" />
      <Button label="Tarik Data Kurang Bayar" icon="pi pi-refresh" class="p-button-warning"
        style="background-color: #ffa500; border: none; color: #fff" @click="emit('openSyncDialog')" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { formatDateToYYYYMMDD } from '@/utils/dateUtils'


const emit = defineEmits(['search', 'openSyncDialog'])

onMounted(() => {
  initForm()
})

const bulanOptions = ref([
  { label: 'Januari', value: 1 },
  { label: 'Februari', value: 2 },
  { label: 'Maret', value: 3 },
  { label: 'April', value: 4 },
  { label: 'Mei', value: 5 },
  { label: 'Juni', value: 6 },
  { label: 'Juli', value: 7 },
  { label: 'Agustus', value: 8 },
  { label: 'September', value: 9 },
  { label: 'Oktober', value: 10 },
  { label: 'November', value: 11 },
  { label: 'Desember', value: 12 },
])

const jenisPeriodeOptions = ref([
  { label: 'Bulanan', value: 'BULANAN' },
  { label: 'Tanggal', value: 'TANGGAL' },
])

const form = ref({})

const tahunPeriodeOptions = Array.from(
  { length: 10 },
  (_, i) => `${new Date().getFullYear() - 5 + i}`
)

function initForm() {
  form.value = {
    jenisPeriode: 'BULANAN',
    tahunPeriode: null,
    bulanAwal: null,
    bulanAkhir: null,
    tglAwal: null,
    tglAkhir: null,
  }
}

function buildQuery() {
  const q = {}
  if (form.value.jenisPeriode) {
    q.jenis_periode = form.value.jenisPeriode
  }

  if (form.value.jenisPeriode === 'BULANAN') {
    if (form.value.tahunPeriode) q.year = form.value.tahunPeriode
    if (form.value.bulanAwal) q.month_start = form.value.bulanAwal
    if (form.value.bulanAkhir) q.month_end = form.value.bulanAkhir
  } else if (form.value.jenisPeriode === 'TANGGAL') {
    if (form.value.tglAwal) q.tgl_awal = formatDateToYYYYMMDD(form.value.tglAwal)
    if (form.value.tglAkhir) q.tgl_akhir = formatDateToYYYYMMDD(form.value.tglAkhir)
  }

  return q
}

function resetFilter() {
  initForm()
  emit('search', buildQuery())
}

function searchData() {
  const q = buildQuery()
  emit('search', q)
}


</script>