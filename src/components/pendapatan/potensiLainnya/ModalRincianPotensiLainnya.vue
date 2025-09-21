<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="Rincian Potensi Lainnya"
    :style="{ width: '60rem' }"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
  >
    <div class="p-4">
      <div class="grid grid-cols-2 gap-6">
        <div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">Tanggal Dokumen</label>
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
            <label class="block mt-2 text-sm font-medium text-gray-700">No Dokumen</label>
            <InputText v-model="formData.no_dokumen" placeholder="No Dokumen" class="w-full" disabled />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">Pihak ke-3</label>
            <InputText v-model="formData.pihak3" placeholder="Pihak ke-3" class="w-full" disabled />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">Total</label>
            <InputNumber
              v-model="formData.total"
              placeholder="Total"
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
            <label class="block mt-2 text-sm font-medium text-gray-700">Akun</label>
            <Dropdown
              v-model="formData.akun_id"
              :options="options.akun"
              optionLabel="label"
              optionValue="value"
              placeholder="Pilih Akun"
              class="w-full"
              filter
              filterPlaceholder="Search Akun"
              disabled
            />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">Uraian</label>
            <Textarea
              v-model="formData.uraian"
              rows="3"
              cols="30"
              autoResize
              placeholder="Uraian"
              class="w-full"
              disabled
            />
          </div>
        </div>
      </div>
      <TabView v-model:activeIndex="activeIndex" class="mt-4">
        <TabPanel header="Bukti Tagihan Yang Terdaftar">
          <TableRincianPotensiLainnya
            ref="tableRincianPotensiLainnyaDaftar"
            :isDaftar="true"
            :indukId="formData.id"
            :pihak3="formData.pihak3"
            :options="options"
            @saved="reloadTables"
          />
        </TabPanel>
        <TabPanel header="Bukti Tagihan Yang Belum Terdaftar">
          <TableRincianPotensiLainnya
            ref="tableRincianPotensiLainnyaBelum"
            :indukId="formData.id"
            :pihak3="formData.pihak3"
            :options="options"
            @saved="reloadTables"
          />
        </TabPanel>
      </TabView>
    </div>
    <template #footer>
      <Button label="Batal" icon="pi pi-times" @click="closeModal" class="p-button-text" />
    </template>
  </Dialog>
  <ModalEditRincianPotensiPelayanan 
    v-model="showModal" 
    :item="selectedItem" 
    :options="options"
    @saved="handleSaved" 
  />
</template>

<script setup>
import { ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import DatePicker from 'primevue/datepicker'
import Dropdown from 'primevue/dropdown'
import InputNumber from 'primevue/inputnumber'
import Button from 'primevue/button'
import TableRincianPotensiLainnya from '@/components/pendapatan/potensiLainnya/TableRincianPotensiLainnya.vue'

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
const activeIndex = ref(0) 
const visible = ref(props.modelValue)
const selectedItem = ref(null)
const showModal = ref(false)
const tableRincianPotensiLainnyaDaftar = ref(null)
const tableRincianPotensiLainnyaBelum = ref(null)
const defaultForm = {
  id: '',
  tgl: '',
  ket: '',
  no_dokumen: '',
  tgl_dokumen: '',
  akun_id: 0,
  pihak3: '',
  pihak3_alamat: '',
  pihak3_telp: '',
  uraian: '',
  tgl_berlaku: '',
  tgl_akhir: '',
  jatuh_tempo: 0,
  besaran_per_satuan: 0,
  total: 0,
  total_pdd: 0,
  total_piutang: 0,
  reklas_pdd: 0,
  pembayaran_piutang: 0,
  monev_id: 0,
  no_putus: '',
  tgl_putus: '',
  tgl_berlakuuptus: '',
  nilai_reklasputus: 0,
  is_buktitagihan: false,
  induk_id: ''
}
const formData = ref({ ...defaultForm })
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
    if (newItem) {
      Object.keys(formData.value).forEach((key) => {
        if (key.startsWith('tgl_')) {
          formData.value[key] = newItem[key] ? new Date(newItem[key]) : null
        } else {
          formData.value[key] = newItem[key]
        }
      })
    }
  },
  { immediate: true }
)

const reloadTables = () => {
  tableRincianPotensiLainnyaDaftar.value.loadData()
  tableRincianPotensiLainnyaBelum.value.loadData()
}
const handleSaved = () => {
  showModal.value = false
  tableRincianPotensiLainnyaDaftar.value.loadData()
  tableRincianPotensiLainnyaBelum.value.loadData()
}

const closeModal = () => {
  visible.value = false
  resetForm()
}
</script>
