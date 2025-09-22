<template>
  <Dialog
    :visible="visible"
    @update:visible="closeModal"
    modal
    :style="{ width: '60rem' }"
    :breakpoints="{ '1199px': '95vw', '575px': '95vw' }"
  >
    <template #header>
      <div class="flex items-center justify-between w-full">
        <div>
          <h2 class="text-lg font-semibold">
            {{ isEdit ? 'Ubah Penerimaan Lainnya' : 'Tambah Penerimaan Lainnya' }}:
            {{ props.item?.no_buktibayar }}
          </h2>
          <p class="text-sm text-gray-500">
            {{
              isEdit
                ? 'Perbarui informasi Penerimaan Lainnya di bawah ini.'
                : 'Isi informasi Penerimaan Lainnya di bawah ini.'
            }}
          </p>
        </div>
      </div>
    </template>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-8 text-sm">
      <Fieldset legend="Informasi Billing">
        <!-- Tgl. Bayar (dropdown) -->
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">Tgl. Bayar <span class="text-red-500">*</span></label>
          <DatePicker
            v-model="formData.tgl_bayar"
            showIcon
            placeholder="Tgl. Bayar"
            date-format="dd/mm/yy"
            class="w-full"
            :invalid="errors?.tgl_bayar?.length > 0"
          />
          <Message v-if="errors.tgl_bayar" severity="error" size="small" variant="simple">{{errors?.tgl_bayar[0]}}</Message>
        </div>

        <!-- No. Bayar -->
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">No. Bayar</label>
          <InputText
            v-model="formData.no_bayar"
            placeholder="Nomor Bayar"
            class="w-full"
            :invalid="errors?.no_bayar?.length > 0"
          />
          <Message v-if="errors.no_bayar" severity="error" size="small" variant="simple">{{
            errors?.no_bayar[0]
          }}</Message>
        </div>

        <!-- Cara Pembayaran (dropdown) -->
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">Cara Pembayaran <span class="text-red-500">*</span></label>
          <Dropdown
            v-model="formData.cara_pembayaran"
            :options="optionsCaraPembayaran"
            optionLabel="label"
            optionValue="value"
            placeholder="Pilih Cara Pembayaran"
            class="w-full"
            :invalid="errors?.cara_pembayaran?.length > 0"
          />
          <Message v-if="errors.cara_pembayaran" severity="error" size="small" variant="simple">{{
            errors?.cara_pembayaran[0]
          }}</Message>
        </div>

        <!-- Bank Tujuan (dropdown) -->
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">Bank Tujuan <span class="text-red-500">*</span></label>
          <Dropdown
            v-model="formData.bank_tujuan"
            :options="optionsBankTujuan"
            optionLabel="label"
            optionValue="value"
            placeholder="Pilih Bank Tujuan"
            class="w-full"
            :invalid="errors?.bank_tujuan?.length > 0"
          />
          <Message v-if="errors.bank_tujuan" severity="error" size="small" variant="simple">{{
            errors?.bank_tujuan[0]
          }}</Message>
        </div>

        <Divider/>

        <!-- Jumlah Bruto -->
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">Jumlah Bruto <span class="text-red-500">*</span></label>
          <InputNumber
            v-model="formData.total"
            placeholder="Jumlah Bruto"
            class="w-full"
            mode="currency"
            currency="IDR"
            locale="id-ID"
            show-buttons
            :step="1000"
            :min="0"
            :invalid="errors?.total?.length > 0"
          />
          <Message v-if="errors.total" severity="error" size="small" variant="simple">{{errors?.total[0]}}</Message>
        </div>

        <!-- Biaya Admin EDC -->
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">Biaya Admin EDC <span class="text-red-500">*</span></label>
          <InputNumber
            v-model="formData.admin_kredit"
            placeholder="Biaya Admin EDC"
            class="w-full"
            mode="currency"
            currency="IDR"
            locale="id-ID"
            show-buttons
            :step="1000"
            :min="0"
            :invalid="errors?.admin_kredit?.length > 0"
          />
          <Message v-if="errors.admin_kredit" severity="error" size="small" variant="simple">{{
            errors?.admin_kredit[0]
          }}</Message>
        </div>

        <!-- Biaya Admin QRIS -->
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">Biaya Admin QRIS <span class="text-red-500">*</span></label>
          <InputNumber
            v-model="formData.admin_debit"
            placeholder="Biaya Admin QRIS"
            class="w-full"
            mode="currency"
            currency="IDR"
            locale="id-ID"
            show-buttons
            :step="1000"
            :min="0"
            :invalid="errors?.admin_debit?.length > 0"
          />
          <Message v-if="errors.admin_debit" severity="error" size="small" variant="simple">{{
            errors?.admin_debit[0]
          }}</Message>
        </div>

        <!-- Selisih -->
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">Selisih <span class="text-red-500">*</span></label>
          <InputNumber
            v-model="formData.selisih"
            placeholder="Selisih"
            class="w-full"
            locale="id-ID"
            show-buttons
            :step="1000"
            :invalid="errors?.selisih?.length > 0"
          />
          <Message v-if="errors.selisih" severity="error" size="small" variant="simple">{{
            errors?.selisih[0]
          }}</Message>
        </div>

        <!-- Jumlah Netto -->
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">Jumlah Netto <span class="text-red-500">*</span></label>
          <InputNumber
            v-model="formData.jumlah_netto"
            placeholder="Jumlah Netto"
            class="w-full"
            mode="currency"
            currency="IDR"
            locale="id-ID"
            readonly
            disabled
          />
          <Message v-if="errors.jumlah_netto" severity="error" size="small" variant="simple">{{
            errors?.jumlah_netto[0]
          }}</Message>
        </div>

        <!-- Pendapatan -->
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">Pendapatan <span class="text-red-500">*</span></label>
          <InputNumber
            v-model="formData.pendapatan"
            placeholder="Pendapatan"
            class="w-full"
            mode="currency"
            currency="IDR"
            locale="id-ID"
            :invalid="errors?.pendapatan?.length > 0"
          />
          <Message v-if="errors.pendapatan" severity="error" size="small" variant="simple">{{
            errors?.pendapatan[0]
          }}</Message>
        </div>

        <!-- PDD -->
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">PDD <span class="text-red-500">*</span></label>
          <InputNumber
            v-model="formData.pdd"
            placeholder="PDD"
            class="w-full"
            mode="currency"
            currency="IDR"
            locale="id-ID"
            :invalid="errors?.pdd?.length > 0"
          />
          <Message v-if="errors.pdd" severity="error" size="small" variant="simple">{{
            errors?.pdd[0]
          }}</Message>
        </div>

        <!-- Piutang -->
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">Piutang <span class="text-red-500">*</span></label>
          <InputNumber
            v-model="formData.piutang"
            placeholder="Piutang"
            class="w-full"
            mode="currency"
            currency="IDR"
            locale="id-ID"
            :invalid="errors?.piutang?.length > 0"
          />
          <Message v-if="errors.piutang" severity="error" size="small" variant="simple">{{
            errors?.piutang[0]
          }}</Message>
        </div>
      </Fieldset>
      <Fieldset legend="Informasi Detail">
        <!-- Jenis Penerimaan (dropdown) -->
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">Jenis Penerimaan <span class="text-red-500">*</span></label>
          <FormJenisPenerimaan
            v-model="formData.akun_id"
            dataKey="akun_id"
            :invalid="errors?.akun_id?.length > 0"
            class="w-full"
          />
          <Message v-if="errors.akun_id" severity="error" size="small" variant="simple">{{
            errors?.akun_id[0]
          }}</Message>
        </div>

        <!-- Sumber Transaksi (dropdown) -->
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">Sumber Transaksi <span class="text-red-500">*</span></label>
          <Dropdown
            v-model="formData.sumber_transaksi"
            :options="optionsSumberTransaksi"
            optionLabel="label"
            optionValue="value"
            placeholder="Pilih Sumber Transaksi"
            class="w-full"
            :invalid="errors?.sumber_transaksi?.length > 0"
          />
          <div v-if="errors.sumber_transaksi" class="text-red-500 text-sm mt-1">
            {{ errors?.sumber_transaksi[0] }}
          </div>
        </div>

        <!-- No Dokumen -->
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">No Dokumen</label>
          <InputText
            v-model="formData.no_dokumen"
            placeholder="Nomor Dokumen"
            class="w-full"
            :invalid="errors?.no_dokumen?.length > 0"
          />
          <Message v-if="errors.no_dokumen" severity="error" size="small" variant="simple">{{
            errors?.no_dokumen[0]
          }}</Message>
        </div>

        <!-- Tgl Dokumen (dropdown) -->
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">Tgl Dokumen</label>
          <DatePicker
            v-model="formData.tgl_dokumen"
            showIcon
            date-format="dd/mm/yy"
            placeholder="Tgl. Dokumen"
            class="w-full"
            :invalid="errors?.tgl_dokumen?.length > 0"
          />
          <Message v-if="errors.tgl_dokumen" severity="error" size="small" variant="simple">{{
            errors?.tgl_dokumen[0]
          }}</Message>
        </div>

        <!-- pihak3 -->
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">Penyetor</label>
          <InputText
            v-model="formData.pihak3"
            placeholder="Penyetor"
            class="w-full"
            :invalid="errors?.pihak3?.length > 0"
          />
          <div v-if="errors.pihak3" class="text-red-500 text-sm mt-1">{{ errors?.pihak3[0] }}</div>
        </div>

        <!-- Uraian -->
        <div class="lg:col-span-3 mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">Uraian</label>
          <Textarea
            v-model="formData.uraian"
            placeholder="Uraian"
            rows="3"
            class="w-full"
            :invalid="errors?.uraian?.length > 0"
          />
          <div v-if="errors.uraian" class="text-red-500 text-sm mt-1">{{ errors?.uraian[0] }}</div>
        </div>
        <!-- rekening dpa -->
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">Rekening DPA</label>
          <Dropdown
            v-model="formData.rek_id"
            :options="optionsRekeningDpa"
            optionLabel="label"
            optionValue="value"
            placeholder="Pilih Rekening DPA"
            class="w-full"
            :invalid="errors?.rek_id?.length > 0"
          />
          <Message v-if="errors.rek_id" severity="error" size="small" variant="simple">{{
            errors?.rek_id[0]
          }}</Message>
        </div>
      </Fieldset>
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
import { useToast } from 'primevue/usetoast'
import apiClient from '@/api/client'
import FormJenisPenerimaan from '@/components/form/JenisPenerimaan.vue'
import useRekeningDpa from '@/composables/useRekeningDpa'
import useSumberTransaksi from '@/composables/useSumberTransaksi'
import useBankTujuan from '@/composables/useBankTujuan'
import useCaraPembayaran from '@/composables/useCaraPembayaran'
import { formatDateToYYYYMMDD } from '../../../../utils/dateUtils'

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
const errors = ref({})
const formData = ref({})
const visible = ref(props.modelValue)

const { fetchList: fetchRekeningDpa, options: optionsRekeningDpa } = useRekeningDpa()
const { fetchList: fetchSumberTransaksi, options: optionsSumberTransaksi } = useSumberTransaksi()
const { fetchList: fetchBankTujuan, options: optionsBankTujuan } = useBankTujuan()
const { fetchList: fetchCaraPembayaran, options: optionsCaraPembayaran } = useCaraPembayaran()

watch(
  () => props.modelValue,
  (newValue) => {
    visible.value = newValue
    isEdit.value = !!props.item && !!props.item.id
    if (newValue) {
      fetchRekeningDpa()
      fetchBankTujuan()
      fetchSumberTransaksi({ sumber_jenis: 'Lainnya' })
      fetchCaraPembayaran()
      setFormData()
    }
  },
  { immediate: true }
)

watch(visible, (newValue) => {
  emit('update:modelValue', newValue)
})

watch(() => formData.value, (newValue) => {
  // Default bank tujuan jika kosong dan cara pembayaran tunai, maka diisi bank JATIM
  if (formData.value.cara_pembayaran && formData.value.cara_pembayaran.toUpperCase() === 'TUNAI' && (!formData.value.bank_tujuan || formData.value.bank_tujuan === '')) {
    formData.value.bank_tujuan = 'JATIM'
  }
}, { deep: true })

const jumlahNetto = computed(() => {
  return (
    (parseInt(formData.value.total || 0) -
    parseInt(formData.value.admin_kredit || 0) -
    parseInt(formData.value.admin_debit || 0)) +
    parseInt(formData.value.selisih || 0)
  )
})

watch(jumlahNetto, (newVal) => {
  formData.value.jumlah_netto = newVal

  setTimeout(() => {
    getPiutang()
    getPendapatan()
  }, 500)
})

function setFormData() {
  formData.value = props.item
  formData.value.tgl_bayar = new Date(props.item.tgl_bayar || new Date())
  formData.value.tgl_dokumen = new Date(props.item.tgl_dokumen || new Date())
}


function resetForm() {
  Object.keys(formData.value).forEach((key) => {
    if (typeof formData.value[key] === 'string') {
      formData.value[key] = ''
    } else if (typeof formData.value[key] === 'number') {
      formData.value[key] = 0
    } else {
      formData.value[key] = null
    }

    formData.value.total = null
  })
}

function getPiutang() {
  if(props.item?.piutang_id) {
    formData.value.piutang = formData.value.jumlah_netto
  }
  else{
    formData.value.piutang = 0
  }
}

function getPendapatan() {
  if(!props.item?.piutang_id || typeof props.item?.piutang_id == 'null') {
    formData.value.pendapatan = formData.value.jumlah_netto
  }
  else{
    formData.value.pendapatan = 0
  }
}

const saveData = async () => {
  loading.value = true
  errors.value = {}
  try {
    const payload = formData.value

    // format tgl_bayar
    payload.tgl_bayar = formatDateToYYYYMMDD(payload.tgl_bayar)
    payload.tgl_dokumen = formatDateToYYYYMMDD(payload.tgl_dokumen)

    if (isEdit.value) {
      await apiClient.put(`/penerimaan_lain/${formData.value.id}`, payload)
    } else {
      await apiClient.post('/penerimaan_lain', payload)
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
      detail: error.message || 'Gagal menyimpan data. Silakan coba lagi.',
      life: 3000,
    })

    if (error.errors) {
      errors.value = error.errors // Simpan pesan error validasi
    }
  } finally {
    loading.value = false
  }
}

const closeModal = () => {
  visible.value = false
  errors.value = {}
  resetForm()
}
</script>
