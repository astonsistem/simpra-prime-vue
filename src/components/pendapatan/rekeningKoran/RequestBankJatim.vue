<template>
  <Dialog :visible="visible" @update:visible="visible = $event" modal :style="{ width: dialogWidth }"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
    <template #header>
      <div class="flex items-center justify-between w-full">
        <div>
          <h2 class="text-lg font-semibold">Request Data Dari Bank JATIM</h2>
          <p class="text-sm text-gray-500">Isi Tanggal Awal dan Tanggal Akhir di bawah ini untuk mendapatkan data rekening koran.</p>
        </div>
      </div>
    </template>

    <Fieldset legend="Filter" class="w-full">
      <div>
        <div class="flex gap-2 items-center mb-5">
          <div class="w-32 mr-2 font-semibold">Tanggal:</div>
          <div class="flex gap-2 items-center">
            <DatePicker v-model="form.tglawal" show-icon fluid iconDisplay="input" dateFormat="yy-mm-dd"></DatePicker>
            <div>s.d</div>
            <DatePicker v-model="form.tglakhir" show-icon fluid iconDisplay="input" dateFormat="yy-mm-dd" :min-date="form.tglawal"></DatePicker>
            <Button 
              label="Request" 
              severity="success" 
              :icon="loadingRequest ? 'pi pi-spin pi-spinner' : 'pi pi-lightbulb'" 
              @click="handleRequest" 
              class="ml-2"
              :disabled="loadingRequest || !form.tglawal || !form.tglakhir"/>
          </div>
        </div>
        <div class="flex gap-2">
          <div class="w-32 mr-2 font-semibold">&nbsp;</div>
          <div class="flex flex-grow gap-2">
            <Button label="Reset" class="p-button-secondary mr-14" icon="pi pi-refresh" @click="reset"></Button>
            
          </div>
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
import useRequestBankJatim from '@/composables/useRequestBankJatim';
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
  request: requestBankJatim,
  sync: syncBankJatim,
  items,
} = useRequestBankJatim()

onMounted(() => {
  initForm()
  dialogWidth.value = '75vw'
})

function initForm() {
  form.value = {
    tglawal: null,
    tglakhir: null,
  }
}

async function handleRequest () {
  try {
    loadingRequest.value = true
    await requestBankJatim(form.value)
  } catch (error) {
    console.log(error)
  } finally {
    hasRequest.value = true
    dialogWidth.value = '75vw'
    loadingRequest.value = false
  }
}

async function sync () {
  try {
    loadingSync.value = true
    await syncBankJatim(form.value)
  } catch (error) {
    console.log(error)
  }finally {
    hasSync.value = true
    loadingSync.value = false
  }
}

function reset () {
  initForm()
}
</script>