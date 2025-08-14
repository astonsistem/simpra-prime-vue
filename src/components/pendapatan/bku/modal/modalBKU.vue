<template>
  <div v-if="visible" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <h3 class="modal-title">Tambah Data Potensi Pelayanan</h3>

      <div class="form-grid">
        <!-- Cara Bayar -->
        <label>Cara Bayar</label>
        <Dropdown v-model="form.caraBayar" :options="caraBayarOptions" placeholder="Pilih Cara Bayar" class="w-full" />

        <!-- Penjamin -->
        <label>Penjamin</label>
        <Dropdown v-model="form.penjamin" :options="penjaminOptions" placeholder="Pilih Penjamin" class="w-full" />

        <!-- Tgl Dokumen -->
        <label>Tgl. Dokumen</label>
        <Calendar v-model="form.tglDokumen" dateFormat="yy-mm-dd" class="w-full" />

        <!-- No Dokumen -->
        <label>No. Dokumen</label>
        <InputText v-model="form.noDokumen" class="w-full" />

        <!-- Pasien -->
        <label>Pasien</label>
        <InputText v-model="form.pasien" class="w-full" />

        <!-- Uraian -->
        <label>Uraian</label>
        <Textarea v-model="form.uraian" rows="2" autoResize class="w-full" />

        <!-- Instalasi -->
        <label>Instalasi</label>
        <Dropdown v-model="form.instalasi" :options="instalasiOptions" placeholder="Pilih Instalasi" class="w-full" />

        <!-- Metode Bayar -->
        <label>Metode Bayar</label>
        <Dropdown v-model="form.metodeBayar" :options="metodeBayarOptions" placeholder="Pilih Metode Bayar" class="w-full" />

        <!-- Jumlah Bruto -->
        <label>Jumlah Bruto</label>
        <InputNumber v-model="form.jumlahBruto" mode="currency" currency="IDR" locale="id-ID" class="w-full" />

        <!-- Biaya Admin -->
        <label>Biaya Admin</label>
        <InputNumber v-model="form.biayaAdmin" mode="decimal" minFractionDigits="0" class="w-full" />
      </div>

      <div class="modal-footer">
        <Button label="Simpan" icon="pi pi-check" class="p-button-success" @click="submit" />
        <Button label="Tutup" icon="pi pi-times" class="p-button-secondary" @click="close" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Calendar from 'primevue/calendar'
import Dropdown from 'primevue/dropdown'
import InputNumber from 'primevue/inputnumber'

const props = defineProps({
  visible: Boolean
})
const emit = defineEmits(['close', 'submit'])

const form = ref({
  caraBayar: null,
  penjamin: null,
  tglDokumen: null,
  noDokumen: '',
  pasien: '',
  uraian: '',
  instalasi: null,
  metodeBayar: null,
  jumlahBruto: null,
  biayaAdmin: 0
})

// Contoh opsi dropdown
const caraBayarOptions = ['Tunai', 'Transfer', 'Kartu Kredit']
const penjaminOptions = ['BPJS', 'Asuransi', 'Mandiri']
const instalasiOptions = ['Rawat Inap', 'Rawat Jalan']
const metodeBayarOptions = ['Cash', 'Debit', 'E-Wallet']

const close = () => emit('close')
const submit = () => emit('submit', form.value)
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}
.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  min-width: 500px;
  max-width: 650px;
}
.modal-title {
  margin-bottom: 20px;
  font-weight: bold;
  color: #1e3a8a;
}
.form-grid {
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 10px 15px;
  align-items: center;
}
.modal-footer {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}
</style>
