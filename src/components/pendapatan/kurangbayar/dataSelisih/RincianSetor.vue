<template>
  <Dialog :visible="model" @update:visible="closeModal" modal :style="{ width: '65%' }"
    :breakpoints="{ '1199px': '75vw', '575px': '95%' }">
    <template #header>
      <div class="flex items-center justify-between w-full">
        <div>
          <h2 class="text-lg font-semibold">Rincian Setor Selisih atas Transaksi Penerimaan / Penyetoran ID: {{
            props.item?.no_buktibayar }}</h2>
        </div>
      </div>
    </template>

    <div class="mb-4 text-sm">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
        <Fieldset legend="Bukti Kwitansi / Setor" class="md:col-span-2">
          <div class="grid grid-cols-4 gap-2">
            <div>No. Bukti</div>
            <div class="col-span-3">: <span class="font-bold">{{ props.item?.no_buktibayar || '-' }}</span></div>
            <div>Tgl. Bukti</div>
            <div class="col-span-3">: <span class="font-bold">{{ props.item?.tgl_buktibayar || '-' }}</span></div>
            <div>Selisih / Kurang</div>
            <div class="col-span-3">: <span class="font-bold">{{ formatCurrency(props.item?.nilai) || '-' }}</span>
            </div>
          </div>
        </Fieldset>
      </div>
    </div>

    <Fieldset legend="Rincian Selisih">
      <DataTable :value="props.items" responsiveLayout="scroll" size="small" class="p-datatable-sm" striped-rows show-gridlines>
        <template #empty>
          <div class="flex items-center text-gray-500 min-h-24">
            <i class="pi pi-info-circle mr-2" style="font-size: 1.5rem"></i>
            <p>Data Kosong</p>
          </div>
        </template>
        <Column field="tgl_setor" header="Tgl. Setor" />
        <Column field="cara_pembayaran" header="Cara Pembayaran" />
        <Column field="bank_tujuan" header="Bank" />
        <Column field="jumlah" header="Nilai">
          <template #body="slotProps">
            {{ formatCurrency(slotProps.data.jumlah) }}
          </template>
        </Column>
        <Column field="aksi" header="Aksi">
          <template #body="slotProps">
            <Button severity="danger" size="small" @click="handleDelete(slotProps.data)">
              <span class="">Hapus</span>
            </Button>
          </template>
        </Column>
        <template #footer>
          <div class="flex justify-end pe-44 pt-4">
            <!-- use grid -->
             <div class="grid grid-cols-2 gap-3">
               <span class="font-semibold text-lg">Total</span>
               <span class="font-semibold text-lg text-red-400">: {{ formatCurrency(totalNilai) }}</span>
               <span class="font-semibold text-lg">Kekurangan</span>
               <span class="font-semibold text-lg text-red-400">: {{ formatCurrency(props.item?.nilai - totalNilai) }}</span>
             </div>
          </div>
        </template>
      </DataTable>
    </Fieldset>

    <template #footer>
      <Button label="Tutup" icon="pi pi-times" @click="closeModal" severity="secondary" />
      <!-- <Button label="Simpan" icon="pi pi-check" @click="saveData" class="p-button-success" /> -->
    </template>

    <Toast group="confirm" position="center">
      <template #message="slotProps">
        <div class="flex flex-col flex-1">
          <div class="text-center font-bold text-lg mb-2">
            {{ slotProps.message.summary }}
          </div>
          <div class="text-center text-sm mb-4">
            {{ slotProps.message.detail }}
          </div>
          <div class="flex gap-2">
            <Button label="Batal" class="p-button-text p-button-secondary w-full"
              @click="toast.removeGroup('confirm')"></Button>
            <Button label="Ya" class="p-button-danger w-full" @click="onConfirmDelete(slotProps.message)"></Button>
          </div>
        </div>
      </template>
    </Toast>
  </Dialog>

</template>

<script setup>
import { useToast } from 'primevue/usetoast'
import { formatCurrency } from '@/utils/utils'
import useDataTransaksiActions from '@/composables/selisih/useDataTransaksiActions';
import { computed } from 'vue';

const { destroy } = useDataTransaksiActions()

const model = defineModel()
const toast = useToast()
const emit = defineEmits(['deleted'])

const props = defineProps({
  item: {
    type: Object,
    default: null,
  },
  // Item Penerimaan Selisih
  items: {
    type: Array,
    default: [],
  }
})

const totalNilai = computed(() => {
  return props.items.reduce((total, item) => {
    return total + item.jumlah
  }, 0)
})

function handleDelete(item) {
  toast.add({
    severity: 'warn',
    summary: 'Konfirmasi Hapus',
    detail: 'Apakah Anda yakin ingin menghapus data ini?',
    group: 'confirm',
    data: {
      id: item.id,
    },
  })
}

function onConfirmDelete(event) {
  destroy(event.data).then((response) => {
    toast.removeGroup('confirm')
    emit('deleted', response)
  })
}

function closeModal() {
  model.value = false
  toast.removeGroup('confirm')
}
</script>
