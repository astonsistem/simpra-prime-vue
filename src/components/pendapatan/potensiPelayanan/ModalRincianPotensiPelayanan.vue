<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="Rincian Potensi Pelayanan"
    :style="{ width: '60rem' }"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
  >
    <div class="p-4">
      <div class="grid grid-cols-2 gap-6">
        <div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Cara Bayar</label>
            <Dropdown
              v-model="formData.carabayar_id"
              :options="options.carabayar"
              optionLabel="label"
              optionValue="id"
              placeholder="Pilih Cara Bayar"
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
            <label class="block mt-2 text-sm font-medium text-gray-700">Total Pengajuan</label>
            <InputNumber
              v-model="formData.total_pengajuan"
              placeholder="Total Pengajuan"
              class="w-full"
              mode="currency"
              currency="IDR"
              locale="id-ID"
              disabled
            />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">No Pengajuan</label>
            <InputText v-model="formData.no_pengajuan" placeholder="No Pengajuan" class="w-full" disabled />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">Tanggal Pengajuan</label>
            <DatePicker
              v-model="formData.tgl_pengajuan"
              date-format="dd/mm/yy"
              placeholder="Tanggal Pengajuan"
              showIcon
              class="w-full"
              disabled
            />
          </div>
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
      <div class="flex gap-2">
        <Button
          label="Tambah Rincian"
          icon="pi pi-plus"
          @click="createRincian"
          :loading="loading"
          class="p-button-success mt-4"
        />
        <Button
          label="Update"
          icon="pi pi-sync"
          @click="updateData"
          :loading="loading"
          class="p-button-success mt-4"
        />
      </div>
      <TabView v-model:activeIndex="activeIndex" class="mt-4">
        <TabPanel header="Rincian Didaftarkan">
          <TableRincianPotensiPelayanan
            ref="tableRincianPotensiPelayananDaftar"
            :piutangId="formData.id"
            :penjaminId="formData.penjamin_id"
            :carabayarId="formData.carabayar_id"
            :isDaftar="true"
            :options="options"
            @saved="reloadTables"
          />
        </TabPanel>
        <TabPanel header="Rincian Belum Didaftarkan Hasil Tarikan">
          <TableRincianPotensiPelayanan
            ref="tableRincianPotensiPelayananBelum"
            :piutangId="formData.id"
            :penjaminId="formData.penjamin_id"
            :carabayarId="formData.carabayar_id"
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
  <Toast position="center" group="modal-confirm">
    <template #message="slotProps">
      <div class="flex flex-col items-center" style="flex: 1">
        <div class="text-center">
          <i class="pi pi-exclamation-triangle" style="font-size: 3rem"></i>
          <h4>{{ slotProps.message.summary }}</h4>
          <p>{{ slotProps.message.detail }}</p>
        </div>
        <div class="grid grid-cols-2 gap-4 mt-4">
          <Button label="Tidak" @click="onReject()" />
          <Button label="Ya" @click="onConfirmAction(slotProps.message)" />
        </div>
      </div>
    </template>
  </Toast>
</template>

<script setup>
import { ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import api from '@/api/client.js'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import InputText from 'primevue/inputtext'
import DatePicker from 'primevue/datepicker'
import Dropdown from 'primevue/dropdown'
import InputNumber from 'primevue/inputnumber'
import Button from 'primevue/button'
import TableRincianPotensiPelayanan from '@/components/pendapatan/potensiPelayanan/TableRincianPotensiPelayanan.vue'
import ModalEditRincianPotensiPelayanan from '@/components/pendapatan/potensiPelayanan/ModalEditRincianPotensiPelayanan.vue'

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
const activeIndex = ref(0) 
const loading = ref(false)
const visible = ref(props.modelValue)
const selectedItem = ref(null)
const showModal = ref(false)
const tableRincianPotensiPelayananDaftar = ref(null)
const tableRincianPotensiPelayananBelum = ref(null)
const defaultForm = {
  id: '',
  pendaftaran_id: 0,
  no_pendaftaran: '',
  tgl_pendaftaran: '',
  no_rekam_medik: '',
  pasien_nama: '',
  pasien_alamat: '',
  jenis_tagihan: '',
  tgl_pelayanan: '',
  instalasi_id: 0,
  carabayar_id: 0,
  no_pengajuan: '',
  tgl_pengajuan: '',
  no_dokumen: '',
  tgl_dokumen: '',
  uraian: '',
  total_pengajuan: 0,
  total: 0,
  akun_id: 0,
  penjamin_id: 0,
  pelayanan_id: 0
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
    if (newItem) {
      Object.keys(formData.value).forEach((key) => {
        if (key === 'jenis_tagihan') {
          formData.value[key] = normalizeStr(newItem[key])
        } else if (key.startsWith('tgl_')) {
          formData.value[key] = newItem[key] ? new Date(newItem[key]) : null
        } else {
          formData.value[key] = newItem[key]
        }
      })
    }
  },
  { immediate: true }
)

const createRincian = async () => {
  selectedItem.value = {}
  selectedItem.value.no_dokumen = formData.value.no_dokumen
  selectedItem.value.piutang_id = formData.value.id
  selectedItem.value.penjamin_id = formData.value.penjamin_id
  showModal.value = true
}

const updateData = () => {
  toast.add({
      severity: 'warn',
      summary: 'Konfirmasi',
      detail: 'Apakah Anda yakin ingin mengupdate Total Pengajuan dari Data Potensi Pelayanan ini?',
      group: 'modal-confirm',
      data: {
          url: `/potensi_pelayanan/update_tp/${formData.value.id}`,
          title: 'update total pengajuan'
      }
  })
}
const onConfirmAction = async (event) => {
    toast.removeGroup('modal-confirm')
    const { url, title } = event.data
    try {
        const res = await api.get(url)
        toast.add({
            severity: 'success',
            summary: 'Berhasil',
            detail: `Aksi ${title} berhasil dijalankan`,
            life: 3000,
        })
        if (title == 'update total pengajuan') {
          console.log(res)
          formData.value.total_pengajuan = res.data.data.total_pengajuan
        }
    } catch (error) {
        console.error(`Gagal ${title}:`, error)
        toast.add({
            severity: 'error',
            summary: 'Gagal',
            detail: `Aksi ${title} gagal. Silakan coba lagi.`,
            life: 3000,
        })
    }
}
const onReject = () => {
    toast.removeGroup('modal-confirm')
}

const reloadTables = () => {
  tableRincianPotensiPelayananDaftar.value.loadData()
  tableRincianPotensiPelayananBelum.value.loadData()
}
const handleSaved = () => {
  showModal.value = false
  tableRincianPotensiPelayananDaftar.value.loadData()
  tableRincianPotensiPelayananBelum.value.loadData()
}

const closeModal = () => {
  visible.value = false
  resetForm()
}
</script>
