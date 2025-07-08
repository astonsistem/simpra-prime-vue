<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'

const props = defineProps({
  anggaran: Object,
  isEdit: Boolean,
})

const emit = defineEmits(['close', 'saved'])
const toast = useToast()

const anggaranData = ref({})

watch(
  () => props.anggaran,
  (newAnggaran) => {
    anggaranData.value = newAnggaran ? { ...newAnggaran } : {}
  },
  { immediate: true }
)

function saveAnggaran() {
  toast.add({
    severity: 'info',
    summary: 'Info',
    detail: 'Save functionality for Anggaran is not yet implemented.',
    life: 3000,
  })
  emit('saved', anggaranData.value)
  emit('close')
}
</script>

<template>
  <Dialog
    :visible="true"
    :style="{ width: '500px' }"
    :header="isEdit ? 'Edit Anggaran' : 'Add Anggaran'"
    :modal="true"
    class="p-fluid"
    @update:visible="$emit('close')"
  >
    <div class="field grid">
      <label for="tahun" class="col-12 mb-2 md:col-2 md:mb-0">Tahun</label>
      <div class="col-12 md:col-10">
        <InputNumber id="tahun" v-model="anggaranData.tahun" mode="decimal" :useGrouping="false" />
      </div>
    </div>
    <div class="field grid">
      <label for="kode_rekening" class="col-12 mb-2 md:col-2 md:mb-0">Kode Rekening</label>
      <div class="col-12 md:col-10">
        <InputText id="kode_rekening" v-model.trim="anggaranData.kode_rekening" required="true" />
      </div>
    </div>
    <div class="field grid">
      <label for="nama_rekening" class="col-12 mb-2 md:col-2 md:mb-0">Nama Rekening</label>
      <div class="col-12 md:col-10">
        <InputText id="nama_rekening" v-model.trim="anggaranData.nama_rekening" required="true" />
      </div>
    </div>
    <div class="field grid">
      <label for="jumlah" class="col-12 mb-2 md:col-2 md:mb-0">Jumlah</label>
      <div class="col-12 md:col-10">
        <InputNumber
          id="jumlah"
          v-model="anggaranData.jumlah"
          mode="currency"
          currency="IDR"
          locale="id-ID"
        />
      </div>
    </div>
    <template #footer>
      <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="$emit('close')" />
      <Button
        :label="isEdit ? 'Update' : 'Save'"
        icon="pi pi-check"
        class="p-button-text"
        @click="saveAnggaran"
      />
    </template>
  </Dialog>
</template>
