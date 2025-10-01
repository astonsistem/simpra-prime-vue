<template>
  <Dialog :visible="visible" @update:visible="visible = $event" modal :style="{ width: dialogWidth }"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
    <template #header>
      <div class="flex items-center justify-between w-full">
        <div>
          <h2 class="text-lg font-semibold">Import Data Bank</h2>
          <p class="text-sm text-gray-500">Pilih nama bank dan unggah file excel untuk meng-import data rekening koran.</p>
        </div>
      </div>
    </template>

    <Fieldset class="w-full">
      <div class="flex gap-2">
        <div class="w-1/4">
          <label class="block mb-1 text-sm font-medium text-gray-700">Bank</label>
          <Select
            v-model="form.bank"
            :options="bankTujuanOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Bank"
            class="w-full"
          />
        </div>
        <div class="w-1/4">
          <label class="block mb-1 text-sm font-medium text-gray-700">Pilih File</label>
          <FileUpload  mode="basic" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"></FileUpload>
        </div>
        <div class="w-1/4">
          <label class="block mb-1 text-sm font-medium text-gray-700">&nbsp;</label>
         <Button 
              label="Preview" 
              severity="info" 
              :icon="loadingRequest ? 'pi pi-spin pi-spinner' : 'pi pi-eye'" 
              @click="preview" 
              class="ml-2"
              :disabled="loadingRequest || !form.bank || !form.file"/>
        </div>
      </div>
    </Fieldset>

    <Fieldset legend="Hasil">
      <template v-if="hasRequest">
        <!-- total -->
        <div class="flex justify-between items-center mb-2">
          <div class="flex items-center gap-2">
            <div class="font-semibold">Total:</div>
            <div class="font-semibold text-red-400">{{ items.length }}</div>
          </div>
          <div class="flex gap-2">
            <Button 
              label="Sinkronisasi" 
              severity="info" 
              :icon="loadingSync ? 'pi pi-spin pi-spinner' : 'pi pi-sync'" 
              @click="sync" 
              :disabled="!hasRequest || loadingSync" />
          </div>
        </div>
        <DataTable :value="items" :loading="loadingSync" striped-rows dataKey="id" class="p-datatable-sm text-xs">
          <Column field="reffno" header="No Reff"></Column>
          <Column field="dateTime" header="Tgl">
            <template #body="{ data }">
              {{ formatDateToYYYYMMDD(data.dateTime) }}
            </template>
          </Column>
          <Column field="transactionCode" header="Kode Transaksi"></Column>
          <Column field="ccy" header="Currency"></Column>
          <Column field="amount" header="Nominal">
            <template #body="{ data }">
              {{ formatCurrency(data.amount) }}
            </template>
          </Column>
          <Column field="flag" header="Flag"></Column>
          <Column field="description" header="Deskripsi"></Column>
        </DataTable>
      </template>
      <template v-else>
        <p class="text-sm text-gray-500">Silahkan request data terlebih dahulu</p>
      </template>
    </Fieldset>
  </Dialog>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import useImportBankPilihan from '@/composables/useImportBankPilihan';
import useBankTujuan from '@/composables/useBankTujuan';
import { formatCurrency } from '@/utils/utils';
import { formatDateToYYYYMMDD } from '@/utils/dateUtils';

const visible = defineModel();
const form = ref({})
const hasRequest = ref(false)
const loadingRequest = ref(false)
const loadingSync = ref(false)
const hasSync = ref(false)
const dialogWidth = ref('75vw')

const {
  items,
  bankOptions,
  preview,
} = useImportBankPilihan()

const {
  fetchList: fetchBankTujuan,
  items: bankTujuanOptions
} = useBankTujuan()

onMounted(() => {
  initForm()
  dialogWidth.value = '75vw'
})

watch(
  () => visible.value,
  (newValue) => {
    if (newValue) {
      fetchBankTujuan()
    }
  }
)

function initForm() {
  form.value = {
    bank: null,
    file: null,
  }
}


function reset () {
  initForm()
}
</script>