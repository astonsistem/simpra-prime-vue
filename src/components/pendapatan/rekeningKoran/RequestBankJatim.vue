<template>
  <Dialog :visible="visible" @update:visible="visible = $event" modal :style="{ width: dialogWidth }"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
    <template #header>
      <div class="flex items-center justify-between w-full">
        <div>
          <h2 class="text-lg font-semibold">Request Data Dari Bank JATIM</h2>
          <p class="text-sm text-gray-500">Isi informasi Data Transaksi di bawah ini.</p>
        </div>
      </div>
    </template>

    <Fieldset legend="Filter">
      <div>
        <div class="flex gap-2 items-center mb-4">
          <div class="w-32 mr-2 font-semibold">Tanggal:</div>
          <div class="flex gap-2 items-center">
            <DatePicker v-model="form.tglAwal" show-icon fluid iconDisplay="input" dateFormat="yy-mm-dd"></DatePicker>
            <div>s.d</div>
            <DatePicker v-model="form.tglAkhir" show-icon fluid iconDisplay="input" dateFormat="yy-mm-dd"></DatePicker>
          </div>
        </div>
        <div class="flex gap-2 items-center">
          <div class="w-32 mr-2 font-semibold">&nbsp;</div>
          <div class="flex flex-grow gap-2 items-center">
            <Button label="Request" severity="success" icon="pi pi-lightbulb" @click="request"></Button>
            <Button label="Sinkronisasi" severity="info" icon="pi pi-sync" @click="sync" :disabled="!hasRequest"></Button>
            <Button label="Reset" class="p-button-secondary" icon="pi pi-refresh" @click="reset"></Button>
          </div>
        </div>
      </div>
    </Fieldset>

    <Fieldset legend="Hasil">

    </Fieldset>
  </Dialog>
</template>

<script setup>
import { has } from 'lodash';
import { onMounted, ref, watch } from 'vue';

const visible = defineModel();
const form = ref({})
const hasRequest = ref(false)
const loadingRequest = ref(false)
const loadingSync = ref(false)
const hasSync = ref(false)
const dialogWidth = ref('50vw')


onMounted(() => {
  initForm()
  dialogWidth.value = '50vw'
  urlEndpoint.value = 'rekening_koran/'
})

function initForm() {
  form.value = {
    tglAwal: null,
    tglAkhir: null,
    key: 'token_rekjatim',
    urlEndpoint: 'rekening_koran/',
  }
}

function request () {
  try {
    loadingRequest.value = true
  } catch (error) {
    console.log(error)
  } finally {
    hasRequest.value = true
    dialogWidth.value = '90vw'
    loadingRequest.value = false
  }
}

function sync () {
  try {
    loadingSync.value = true
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