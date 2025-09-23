<template>
  <Dialog :visible="visible" @update:visible="visible = $event" modal :header="isEdit ? 'Edit Data' : 'Tambah Data'"
    :style="{ width: '60rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
    <template #header>
      <div class="flex items-center justify-between w-full">
        <div>
          <h2 class="text-lg font-semibold">
            {{ isEdit ? 'Ubah Data Transaksi' : 'Tambah Data Transaksi' }} ID: {{ form?.no_buktibayar }}
          </h2>
          <p class="text-sm text-gray-500">
            {{ isEdit ? 'Perbarui informasi Data Transaksi di bawah ini.' : 'Isi informasi Data Transaksi di bawah ini.'
            }}
          </p>
        </div>
      </div>
    </template>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-8 text-sm">
      <Fieldset legend="Informasi Billing">
    
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">Tgl. Setor <span class="text-red-500">*</span></label>
          <DatePicker
            v-model="form.tgl_setor"
            showIcon
            date-format="yy-mm-dd"
            class="w-full"
            :invalid="errors?.tgl_setor?.length"
          />
          <Message v-if="errors.tgl_setor" severity="error" size="small" variant="simple">{{
            errors?.tgl_setor[0]
          }}</Message>  
        </div>

        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">Jenis <span class="text-red-500">*</span></label>
          <Dropdown
            v-model="form.jenis"
            :options="optionsJenis"
            optionLabel="label"
            optionValue="value"
            class="w-full"
            :invalid="errors?.jenis?.length"
          />
          <Message v-if="errors.jenis" severity="error" size="small" variant="simple">{{
            errors?.jenis[0]
          }}</Message>
        </div>

        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">Cara Pembayaran <span class="text-red-500">*</span></label>
          <Dropdown
            v-model="form.cara_pembayaran"
            :options="optionsCaraPembayaran"
            optionLabel="label"
            optionValue="value"
            class="w-full"
            :invalid="errors?.cara_pembayaran?.length"
          />
          <Message v-if="errors.cara_pembayaran" severity="error" size="small" variant="simple">{{
            errors?.cara_pembayaran[0]
          }}</Message>
        </div>

        <!-- Bank Tujuan (dropdown) -->
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">Rekening Bank <span class="text-red-500">*</span></label>
          <Dropdown
            v-model="form.bank_tujuan"
            :options="optionsBankTujuan"
            optionLabel="label"
            optionValue="value"
            class="w-full"
            :invalid="errors?.bank_tujuan?.length"
          />
          <Message v-if="errors.bank_tujuan" severity="error" size="small" variant="simple">{{
            errors?.bank_tujuan[0]
          }}</Message>
        </div>

        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">Jumlah Setor <span class="text-red-500">*</span></label>
          <InputNumber
            v-model="form.jumlah"
            class="w-full"
            mode="currency"
            currency="IDR"
            locale="id-ID"
            show-buttons
            :step="1000"
            :min="0"
            :invalid="errors?.jumlah?.length"
          />
          <div v-if="errors.jumlah" class="text-red-500 text-sm mt-1">{{ errors?.jumlah[0] }}</div>
        </div>

        <!-- Biaya Admin EDC -->
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">Admin EDC <span class="text-red-500">*</span></label>
          <InputNumber
            v-model="form.admin_kredit"
            class="w-full"
            mode="currency"
            currency="IDR"
            locale="id-ID"
            show-buttons
            :step="1000"
            :min="0"
            :invalid="errors?.admin_kredit?.length"
          />
        </div>
        <Message v-if="errors.admin_kredit" severity="error" size="small" variant="simple">{{
          errors?.admin_kredit[0]
        }}</Message>

        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">Admin QRIS <span class="text-red-500">*</span></label>
          <InputNumber
            v-model="form.admin_debit"
            class="w-full"
            mode="currency"
            currency="IDR"
            locale="id-ID"
            show-buttons
            :step="1000"
            :min="0"
            :invalid="errors?.admin_debit?.length"
          />
          <Message v-if="errors.admin_debit" severity="error" size="small" variant="simple">{{
            errors?.admin_debit[0]
          }}</Message>
        </div>

        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">Jumlah Netto</label>
          <InputNumber
            v-model="form.jumlah_netto"
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

      </Fieldset>
      <Fieldset legend="Informasi Detail">
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">Tgl. Bukti</label>
          <DatePicker
            v-model="form.tgl_buktibayar"
            showIcon
            date-format="yy-mm-dd"
            class="w-full"
            :invalid="errors?.tgl_buktibayar?.length"
          />
          <Message v-if="errors.tgl_buktibayar" severity="error" size="small" variant="simple">{{
            errors?.tgl_buktibayar[0]
          }}</Message>  
        </div>
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">No. Bukti</label>
          <InputText
            v-model="form.no_buktibayar"
            class="w-full"
            :invalid="errors?.no_buktibayar?.length"
          />
          <Message v-if="errors.no_buktibayar" severity="error" size="small" variant="simple">{{
            errors?.no_buktibayar[0]
          }}</Message>
        </div>
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">Penyetor</label>
          <InputText
            v-model="form.penyetor"
            class="w-full"
            :invalid="errors?.penyetor?.length"
          />
          <Message v-if="errors.penyetor" severity="error" size="small" variant="simple">{{
            errors?.penyetor[0]
          }}</Message>
        </div>

        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">Rekening DPA</label>
          <Dropdown
            v-model="form.rek_id"
            :options="optionsRekeningDpa"
            optionLabel="label"
            optionValue="value"
            placeholder="Pilih Rekening DPA"
            class="w-full"
            :invalid="errors?.rek_id?.length"
          />
          <Message v-if="errors.rek_id" severity="error" size="small" variant="simple">{{
            errors?.rek_id[0]
          }}</Message>
        </div>

        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">Sumber Transaksi</label>
          <Dropdown
            v-model="form.sumber_transaksi"
            :options="optionsSumberTransaksi"
            optionLabel="label"
            optionValue="value"
            placeholder="Pilih Sumber Transaksi"
            class="w-full"
            :invalid="errors?.sumber_transaksi?.length"
          />
          <div v-if="errors.sumber_transaksi" class="text-red-500 text-sm mt-1">
            {{ errors?.sumber_transaksi[0] }}
          </div>
        </div>

        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">Klasifikasi</label>
          <Dropdown v-model="form.klasifikasi" :options="[
            { label: 'Pendapatan', value: 'Pendapatan' },
            { label: 'Piutang', value: 'Piutang' },
            { label: 'PDD', value: 'PDD' },
          ]" optionLabel="label" optionValue="value" placeholder="Klasifikasi" class="w-full" :invalid="errors?.klasifikasi?.length" />
          <Message v-if="errors.klasifikasi" severity="error" size="small" variant="simple">{{
            errors?.klasifikasi[0]
          }}</Message>
        </div>

      </Fieldset>
    </div>

    <template #footer>
      <Button label="Batal" icon="pi pi-times" @click="closeModal" class="p-button-text" />
      <Button
        label="Simpan"
        icon="pi pi-check"
        @click="submit"
        :loading="loading"
        class="p-button-success"
      />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import useDataTransaksiActions from '@/composables/selisih/useDataTransaksiActions';
import useCaraPembayaran from '@/composables/useCaraPembayaran'
import useBankTujuan from '@/composables/useBankTujuan'
import useRekeningDpa from '@/composables/useRekeningDpa'
import useSumberTransaksi from '@/composables/useSumberTransaksi'

const visible = defineModel()
const form = ref({})
const emit = defineEmits(['update:modelValue', 'saved'])  
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  item: {
    type: Object,
    default: null
  }
})

const { store, update, loading, errors } = useDataTransaksiActions()
const { fetchList: fetchCaraPembayaran, options: optionsCaraPembayaran } = useCaraPembayaran()
const { fetchList: fetchBankTujuan, options: optionsBankTujuan } = useBankTujuan()
const { fetchList: fetchRekeningDpa, options: optionsRekeningDpa } = useRekeningDpa()
const { fetchList: fetchSumberTransaksi, options: optionsSumberTransaksi } = useSumberTransaksi()

const optionsJenis = ref([
  { label: 'Kurang Bayar', value: 'Kurang Bayar' },
  { label: 'Kurang Setor', value: 'Kurang Setor' },
  { label: 'Lebih Bayar', value: 'Lebih Bayar' },
  { label: 'Lebih Setor', value: 'Lebih Setor' },
])

watch(() => props.item, (value) => {
  if(value) {
    form.value = value
  }
}, {immediate: true})

watch(() => visible.value, (value) => {
  if(value) {
    errors.value = {}
    fetchCaraPembayaran()
    fetchBankTujuan()
    fetchRekeningDpa()
    fetchSumberTransaksi()
  }
})
const isEdit = computed(() => !!form.value.id)
const jumlahNetto = computed(() => {
  return (
    (form.value.jumlah || 0) - 
    (form.value.admin_kredit || 0) -
    (form.value.admin_debit || 0)
  )
})

watch(() => jumlahNetto.value, (value) => {
  form.value.jumlah_netto = value
})

async function submit () {
  if (isEdit.value) {
    const response = await update(form.value)
    if (response.status === 200) {
      emit('saved', response)
      closeModal()
    }
    return
  }
  
  const response = await store(form.value)

  if (response.status === 200) {
    emit('saved', response)
    closeModal()
  }
}

function closeModal () {
  form.value = {}
  visible.value = false
  errors.value = {}
}

</script>