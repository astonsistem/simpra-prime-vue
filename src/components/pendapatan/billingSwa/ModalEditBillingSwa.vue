<template>
  <Dialog
    :visible="visible"
    @update:visible="visible = $event"
    modal
    :header="isEdit ? 'Edit Data' : 'Tambah Data'"
    :style="{ width: '60rem' }"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
  >
    <div class="p-4">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">No Bayar</label>
          <InputText v-model="formData.no_bayar" placeholder="No Bayar" class="w-full" />
        </div>
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">Tanggal Bayar</label>
          <DatePicker
            v-model="formData.tgl_bayar"
            placeholder="Tanggal Bayar"
            showIcon
            class="w-full"
          />
        </div>
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">Pasien</label>
          <InputText v-model="formData.pasien" placeholder="Pasien" class="w-full" />
        </div>
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">No Dokumen</label>
          <InputText v-model="formData.no_dokumen" placeholder="No Dokumen" class="w-full" />
        </div>
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">Tanggal Dokumen</label>
          <DatePicker
            v-model="formData.tgl_dokumen"
            placeholder="Tanggal Dokumen"
            showIcon
            class="w-full"
          />
        </div>
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">Cara Bayar</label>
          <Dropdown
            v-model="formData.cara_bayar_id"
            :options="caraBayarOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Pilih Cara Bayar"
            class="w-full"
          />
        </div>
        <div class="col-span-2">
          <label class="block mb-2 text-sm font-medium text-gray-700">Uraian</label>
          <Textarea v-model="formData.uraian" placeholder="Uraian" rows="3" class="w-full" />
        </div>
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">Jumlah Bruto</label>
          <InputNumber
            v-model="formData.jumlah_bruto"
            placeholder="Jumlah Bruto"
            class="w-full"
            mode="currency"
            currency="IDR"
            locale="id-ID"
          />
        </div>
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">Biaya Admin EDC</label>
          <InputNumber
            v-model="formData.biaya_admin_edc"
            placeholder="Biaya Admin EDC"
            class="w-full"
            mode="currency"
            currency="IDR"
            locale="id-ID"
          />
        </div>
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">Biaya Admin QRIS</label>
          <InputNumber
            v-model="formData.biaya_admin_qris"
            placeholder="Biaya Admin QRIS"
            class="w-full"
            mode="currency"
            currency="IDR"
            locale="id-ID"
          />
        </div>
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">Jumlah Netto</label>
          <InputNumber
            v-model="formData.jumlah_netto"
            placeholder="Jumlah Netto"
            class="w-full"
            mode="currency"
            currency="IDR"
            locale="id-ID"
            disabled
          />
        </div>
      </div>
    </div>
    <template #footer>
      <Button label="Batal" icon="pi pi-times" @click="closeModal" class="p-button-text" />
      <Button
        label="Simpan"
        icon="pi pi-check"
        @click="saveData"
        :loading="loading"
        class="p-button-success"
      />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import DatePicker from 'primevue/datepicker'
import Dropdown from 'primevue/dropdown'
import Textarea from 'primevue/textarea'
import InputNumber from 'primevue/inputnumber'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import api from '@/services/http.js'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  item: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const toast = useToast()
const loading = ref(false)
const isEdit = ref(false)

const formData = ref({
  no_bayar: '',
  tgl_bayar: null,
  pasien: '',
  no_dokumen: '',
  tgl_dokumen: null,
  uraian: '',
  cara_bayar_id: null,
  jumlah_bruto: 0,
  biaya_admin_edc: 0,
  biaya_admin_qris: 0,
})

const caraBayarOptions = ref([])

const visible = ref(props.modelValue)

watch(
  () => props.modelValue,
  (newValue) => {
    visible.value = newValue
    if (newValue) {
      fetchCaraBayar()
    }
  }
)

watch(visible, (newValue) => {
  emit('update:modelValue', newValue)
})

const resetForm = () => {
  formData.value = {
    no_bayar: '',
    tgl_bayar: null,
    pasien: '',
    no_dokumen: '',
    tgl_dokumen: null,
    uraian: '',
    cara_bayar_id: null,
    jumlah_bruto: 0,
    biaya_admin_edc: 0,
    biaya_admin_qris: 0,
  }
}

watch(
  () => props.item,
  (newItem) => {
    isEdit.value = !!(newItem && newItem.id)
    if (isEdit.value) {
      formData.value = {
        id: newItem.id,
        no_bayar: newItem.noBayar,
        tgl_bayar: new Date(newItem.tglBayar),
        pasien: newItem.pasien,
        no_dokumen: newItem.noDokumen,
        tgl_dokumen: new Date(newItem.tglDokumen),
        uraian: newItem.uraian,
        cara_bayar_id: newItem.caraBayarId,
        jumlah_bruto: newItem.jumlahBruto,
        biaya_admin_edc: newItem.biayaAdminEdc,
        biaya_admin_qris: newItem.biayaAdminQris,
      }
    } else {
      resetForm()
    }
  },
  { immediate: true }
)

const jumlahNetto = computed(() => {
  return (
    (formData.value.jumlah_bruto || 0) -
    (formData.value.biaya_admin_edc || 0) -
    (formData.value.biaya_admin_qris || 0)
  )
})

watch(jumlahNetto, (newVal) => {
  formData.value.jumlah_netto = newVal
})

const fetchCaraBayar = async () => {
  try {
    const response = await api.get('/carabayar')
    if (response.data.items) {
      caraBayarOptions.value = response.data.items.map((item) => ({
        label: item.caraBayar,
        value: item.id,
      }))
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Gagal memuat data cara bayar',
      life: 3000,
    })
  }
}

const saveData = async () => {
  loading.value = true
  try {
    const payload = { ...formData.value }
    if (isEdit.value) {
      await api.put(`/billing_swa/${formData.value.id}`, payload)
    } else {
      await api.post('/billing_swa', payload)
    }

    toast.add({
      severity: 'success',
      summary: 'Berhasil',
      detail: `Data berhasil ${isEdit.value ? 'diperbarui' : 'ditambahkan'}`,
      life: 3000,
    })

    emit('saved')
    closeModal()
  } catch (error) {
    console.error('Gagal menyimpan data:', error)
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: 'Gagal menyimpan data. Silakan coba lagi.',
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}

const closeModal = () => {
  visible.value = false
  resetForm()
}
</script>
