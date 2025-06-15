<script setup>
import { ref, watch, defineExpose } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'

const props = defineProps({
  item: Object,
  isEdit: Boolean,
})
const emit = defineEmits(['submit'])

const visible = ref(false)
const form = ref({
  id: '',
  akun_id: '',
  akun_kode: '',
  akun_nama: '',
  rek_id: '',
  rek_nama: '',
  akun_kelompok: '',
})

const dataRekPendapatan = ref([
  { text: 'Hasil Pemanfaatan Aset', value: 'Hasil Pemanfaatan Aset' },
  { text: 'Jasa Layanan', value: 'Jasa Layanan' },
  { text: 'Denda Keterlambatan', value: 'Denda Keterlambatan' },
  { text: 'Langsung', value: 'Langsung' },
  { text: 'Jasa Giro', value: 'Jasa Giro' },
  { text: 'Pengembalian Belanja BLUD', value: 'Pengembalian Belanja BLUD' },
  { text: 'Hasil Kerja Sama Dengan Pihak Lain', value: 'Hasil Kerja Sama Dengan Pihak Lain' },
  { text: 'Belanja', value: 'Belanja' },
  { text: 'Komisi dan Bentuk Lain', value: 'Komisi dan Bentuk Lain' },
  { text: 'Mutasi Kas', value: 'Mutasi Kas' },
  { text: 'Bunga Deposito', value: 'Bunga Deposito' },
  { text: 'Pendidikan dan Pelatihan', value: 'Pendidikan dan Pelatihan' },
])

const dataKelompok = ref([
  { text: 'LAIN-LAIN', value: 'LAIN-LAIN' },
  { text: 'PENERIMAAN', value: 'PENERIMAAN' },
  { text: 'NON PENDAPATAN', value: 'NON PENDAPATAN' },
  { text: 'PENJAMINAN', value: 'PENJAMINAN' },
  { text: 'PIUTANG', value: 'PIUTANG' },
  { text: 'DROPING', value: 'DROPING' },
])

watch(
  () => props.item,
  (val) => {
    if (val) {
      form.value = {
        id: val.id || '',
        akun_id: val.akun_id || '',
        akun_kode: val.kode || '',
        akun_nama: val.nama || '',
        rek_id: val.rekening || '',
        rek_nama: val.namaRekening || '',
        akun_kelompok: val.kelompok || '',
      }
    } else {
      form.value = {
        id: '',
        akun_id: '',
        akun_kode: '',
        akun_nama: '',
        rek_id: '',
        rek_nama: '',
        akun_kelompok: '',
      }
    }
  },
  { immediate: true }
)

const open = () => {
  visible.value = true
}
const close = () => {
  visible.value = false
}
const handleSubmit = () => {
  emit('submit', { ...form.value })
  close()
}

defineExpose({ open, close })
</script>

<template>
  <Dialog
    v-model:visible="visible"
    :modal="true"
    :header="isEdit ? 'Ubah Data Akun' : 'Tambah Data Akun'"
    style="width: 500px"
  >
    <div class="flex flex-col gap-3">
      <div>
        <label class="block mb-1">ID</label>
        <InputText v-model="form.akun_id" class="w-full" />
      </div>
      <div>
        <label class="block mb-1">Kode Akun</label>
        <InputText v-model="form.akun_kode" class="w-full" />
      </div>
      <div>
        <label class="block mb-1">Nama Akun</label>
        <InputText v-model="form.akun_nama" class="w-full" />
      </div>
      <div>
        <label class="block mb-1">Rekening Pendapatan</label>
        <Dropdown
          v-model="form.rek_nama"
          :options="dataRekPendapatan"
          optionLabel="text"
          optionValue="value"
          placeholder="Pilih Rekening"
          class="w-full"
        />
      </div>
      <div>
        <label class="block mb-1">Kelompok</label>
        <Dropdown
          v-model="form.akun_kelompok"
          :options="dataKelompok"
          optionLabel="text"
          optionValue="value"
          placeholder="Pilih Kelompok"
          class="w-full"
        />
      </div>
    </div>
    <template #footer>
      <Button label="Batal" severity="secondary" @click="close" />
      <Button :label="isEdit ? 'Ubah' : 'Simpan'" severity="primary" @click="handleSubmit" />
    </template>
  </Dialog>
</template>
