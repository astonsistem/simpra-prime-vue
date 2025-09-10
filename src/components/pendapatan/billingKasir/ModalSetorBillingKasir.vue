<template>
  <Dialog :visible="model" @update:visible="closeModal" modal
    :style="{ width: '90vw' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
    <template #header>
      <div class="flex items-center justify-between w-full">
        <div>
          <h2 class="text-lg font-semibold">Bukti Setor pada ID RC: {{ rekeningKoran?.rc_id }}</h2>
          <p class="text-sm text-gray-500">{{  }}</p>
        </div>
      </div>
    </template>

    <div class="mb-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
        <Fieldset legend="Rekening Koran" class="md:col-span-2">
          <div class="grid grid-cols-4 gap-2">
            <div>Tgl. RC</div>
            <div class="col-span-3">: <span class="font-bold">{{ rekeningKoran?.tgl_rc || '-' }}</span></div>
            <div>No. RC</div>
            <div class="col-span-3">: <span class="font-bold">{{ rekeningKoran?.no_rc || '-' }}</span></div>
            <div>Nominal</div>
            <div class="col-span-3">: <span class="font-bold">{{ formatCurrency(rekeningKoran?.nominal) || '-' }}</span></div>
            <div>Uraian</div>
            <div class="col-span-3">: <span class="font-bold">{{ rekeningKoran?.uraian || '-' }}</span></div>
            <div>Bank</div>
            <div class="col-span-3">: <span class="font-bold">{{ rekeningKoran?.bank || '-' }}</span></div>
          </div>
        </Fieldset>
      </div>
    </div>

    <div class="pb-8">
      <h3 class="text-lg font-semibold mb-2">Kwitansi Billing Kasir</h3>
      <DataTable :value="billingKasirItems" class="p-datatable-sm" responsiveLayout="scroll" show-gridlines>
        <Column field="no" header="No" style="width: 5%;">
          <template #body="{ index }">{{ 1 + index}}</template>
        </Column>
        <Column header="No. Kwitansi" field="no_buktibayar" ></Column>
        <Column header="Tgl. Kwitansi" field="tgl_buktibayar"></Column>
        <Column header="No Closing" field="no_closingkasir"></Column>
        <Column header="Nama Pasien" field="pasien_nama" style="width: 120px"></Column>
        <Column header="No. Pendaftaran" field="no_pendaftaran"></Column>
        <Column header="Tgl. Pelayanan" field="tgl_pelayanan"></Column>
        <Column header="Jenis Tagihan" field="jenis_tagihan"></Column>
        <Column header="Metode Bayar" field="carabayar_nama"></Column>
        <Column header="Cara Pembayaran" field="cara_pembayaran"></Column>
        <Column header="Bank" field="bank_tujuan"></Column>
        <Column header="Jumlah Bruto" field="total" class="text-end">
          <template #body="{ data }">{{ formatCurrency(data.total) }}</template>
        </Column>
        <Column header="Jumlah Netto" field="jumlah_netto" class="text-end">
          <template #body="{ data }">{{ formatCurrency(data.jumlah_netto) }}</template>
        </Column>
        <template #footer>
          <div class="flex justify-end">
            <div class="w-1/4 grid grid-cols-2 gap-2">
              <div>Total Bruto:</div>
              <div class="text-end font-medium">{{ formatCurrency(billingKasirItems.reduce((total, item) => total + parseInt(item.total), 0)) }}</div>
              <div>Total Netto:</div>
              <div class="text-end font-medium text-blue-700">{{ formatCurrency(billingKasirItems.reduce((total, item) => total + parseInt(item.jumlah_netto), 0)) }}</div>
            </div>
          </div>
        </template>
      </DataTable>
    </div>

    <template #footer>
      <Button label="Tutup" icon="pi pi-times" @click="closeModal" severity="secondary" />
      <!-- <Button label="Simpan" icon="pi pi-check" @click="saveData" class="p-button-success" /> -->
    </template>
  </Dialog>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import api from '@/api/client'
import { formatCurrency } from '@/utils/utils'

const model = defineModel()
const rekeningKoran = ref(null)
const billingKasirItems = ref([])
const toast = useToast()
const loading = ref(false)

const props = defineProps({
  item: {
    type: Object,
    default: null,
  },
})

watch(() => model.value, (val) => {
    if (val) {
      load()
    }
  }
)


function load() {
  loading.value = true
  api.get(`/billing_kasir/setor/${getRcId()}`)
  .then((response) => {
    if(response.data.status == 200) {
      rekeningKoran.value = response.data.rekening_koran
      billingKasirItems.value = response.data.billing_kasir
    }
  })
  .catch((error) => {
    console.log(error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Gagal memuat data',
      life: 3000
    })
  })
  .finally(() => {
    loading.value = false
  })
}

function getRcId() {
  if(props.item && props.item.rc_id) {
    return props.item.rc_id
  }

  if(props.item && props.item.rcId) {
    return props.item.rcId
  }

  return null
}

const closeModal = () => {
  model.value = false
  rekeningKoran.value = null
  billingKasirItems.value = []
}
</script>
