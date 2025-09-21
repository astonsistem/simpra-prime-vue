<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="Rincian Penjamin Tagihan Pasien Penjaminan lebih dari 1 Penjamin"
    :style="{ width: '60rem' }"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
  >
    <div class="p-4">
      <div class="grid grid-cols-3 gap-6">
        <div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Jenis Tagihan</label>
            <Dropdown
              v-model="formData.jenis_tagihan"
              :options="options.jenisPelayanan"
              optionLabel="label"
              optionValue="value"
              placeholder="Pilih Jenis Tagihan"
              class="w-full"
              disabled
            />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">Pasien</label>
            <InputText v-model="formData.pasien_nama" placeholder="Pasien" class="w-full" disabled />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">No RM</label>
            <InputText v-model="formData.no_rekam_medik" placeholder="No RM" class="w-full" disabled />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">No Pendaftaran</label>
            <InputText v-model="formData.no_pendaftaran" placeholder="No Pendaftaran" class="w-full" disabled />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">Tanggal Pendaftaran</label>
            <DatePicker
              v-model="formData.tgl_pendaftaran"
              date-format="dd/mm/yy"
              placeholder="Tanggal Pendaftaran"
              showIcon
              class="w-full"
              disabled
            />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">Tanggal KRS</label>
            <DatePicker
              v-model="formData.tgl_krs"
              date-format="dd/mm/yy"
              placeholder="Tanggal KRS"
              showIcon
              class="w-full"
              disabled
            />
          </div>
        </div>
        <div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Cara Bayar</label>
            <Dropdown
              v-model="formData.carabayar_id"
              :options="options.carabayar"
              optionLabel="label"
              optionValue="id"
              placeholder="Cara Bayar"
              class="w-full"
              disabled
            />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">Penjamin</label>
            <Dropdown
              v-model="formData.penjamin_id"
              :options="options.penjamin"
              optionLabel="label"
              optionValue="id"
              placeholder="Penjamin"
              class="w-full"
              filter
              filterPlaceholder="Search Penjamin"
              disabled
            />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">Tanggal Pelayanan</label>
            <DatePicker
              v-model="formData.tgl_pelayanan"
              date-format="dd/mm/yy"
              placeholder="Tanggal Pelayanan"
              showIcon
              class="w-full"
              disabled
            />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">Total Dijamin</label>
            <InputNumber
              v-model="formData.total_dijamin"
              placeholder="Total Dijamin"
              class="w-full"
              mode="currency"
              currency="IDR"
              locale="id-ID"
              disabled
            />
          </div>
        </div>
        <div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Instalasi</label>
            <Dropdown
              v-model="formData.instalasi_id"
              :options="options.instalasi"
              optionLabel="label"
              optionValue="value"
              placeholder="Instalasi"
              class="w-full"
              filter
              filterPlaceholder="Search Instalasi"
              disabled
            />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">Loket Kasir</label>
            <Dropdown
              v-model="formData.loket_id"
              :options="options.loket"
              optionLabel="label"
              optionValue="value"
              placeholder="Loket Kasir"
              class="w-full"
              filter
              filterPlaceholder="Search Loket Kasir"
              disabled
            />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">Nama Kasir</label>
            <Dropdown
              v-model="formData.kasir_id"
              :options="options.kasir"
              optionLabel="label"
              optionValue="value"
              placeholder="Nama Kasir"
              class="w-full"
              filter
              filterPlaceholder="Search Nama Kasir"
              disabled
            />
          </div>
        </div>
      </div>
      <Button
        label="Tambah"
        icon="pi pi-plus"
        @click="createData"
        :loading="loading"
        class="p-button-success mt-4"
      />
      <TablePenjamin1
        ref="tablePenjamin1"
        :pelayananId="formData.id"
        :inModal="true"
        :options="props.options"
      />
    </div>
    <template #footer>
      <Button label="Batal" icon="pi pi-times" @click="closeModal" class="p-button-text" />
    </template>
  </Dialog>
  <ModalEditPenjamin1 
    v-model="showModalEdit" 
    :item="selectedItem" 
    :options="props.options"
    @saved="handleSaved" 
  />
</template>

<script setup>
import { ref, watch, computed, watchEffect } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import DatePicker from 'primevue/datepicker'
import Dropdown from 'primevue/dropdown'
import InputNumber from 'primevue/inputnumber'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import TablePenjamin1 from '@/components/pendapatan/pendapatanPelayanan/TablePenjamin1.vue'
import ModalEditPenjamin1 from '@/components/pendapatan/pendapatanPelayanan/ModalEditPenjamin1.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  item: {
    type: Object,
    default: null,
  },
  options: Object
})
const emit = defineEmits(['update:modelValue', 'saved'])
const toast = useToast()
const loading = ref(false)
const visible = ref(props.modelValue)
const selectedItem = ref(null)
const showModalEdit = ref(false)
const tablePenjamin1 = ref(null)
const defaultForm = {
  id: '',
  pelayanan_id: '',
  pendaftaran_id: null,
  no_pendaftaran: '',
  tgl_pendaftaran: '',
  pasien_id: null,
  jenis_tagihan: '',
  tgl_krs: '',
  tgl_pelayanan: '',
  no_rekam_medik: '',
  pasien_nama: '',
  carabayar_id: null,
  penjamin_id: null,
  no_penjamin: '',
  tgl_jaminan: '',
  instalasi_id: null,
  kasir_id: null,
  loket_id: null,
  total_dijamin: 0,
  bulan_mrs: '',
  bulan_krs: '',
  bulan_pelayanan: '',
  biaya_admin: 0,
  status: '',
  pasien_alamat: '',
}
const formData = ref({ ...defaultForm })
const normalizeStr = (val) => {
  return val
    ? val.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
    : null
}
const resetForm = () => {
  formData.value = { ...defaultForm }
}

watch(
  () => props.modelValue,
  (newValue) => {
    visible.value = newValue
  }
)
watch(visible, (newValue) => {
  emit('update:modelValue', newValue)
})
watch(
  () => props.item,
  (newItem) => {
    if (!newItem) {
      resetForm()
      return
    }

    Object.keys(formData.value).forEach((key) => {
      if (key === 'jenis_tagihan') {
        formData.value[key] = normalizeStr(newItem[key])
      } else if (key.startsWith('tgl_')) {
        formData.value[key] = newItem[key] ? new Date(newItem[key]) : null
      } else {
        formData.value[key] = newItem[key]
      }
    })
  },
  { immediate: true }
)

const createData = async () => {
  selectedItem.value = { ...formData.value }
  selectedItem.value.pelayanan_id = formData.value.id
  showModalEdit.value = true
  console.log(selectedItem.value)
}
const closeModal = () => {
  visible.value = false
  resetForm()
}
const handleSaved = () => {
  showModalEdit.value = false
  tablePenjamin1.value.loadData()
}
</script>
