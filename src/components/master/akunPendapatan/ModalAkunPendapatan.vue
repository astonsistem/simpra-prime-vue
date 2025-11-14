<template>
  <Dialog
    v-model:visible="visible"
    modal
    style="width: 20vw"
    :header="isEdit ? 'Edit Data Akun Pendapatan' : 'Tambah Data Akun Pendapatan'"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
  >
    <div class="p-4">
      <div>
        <div>
          <label class="block mt-2 text-sm font-medium text-gray-700">ID</label>
          <InputText 
            v-model="formData.akun_id" 
            placeholder="Akun ID" 
            class="w-full" 
            type="text"
            inputmode="numeric"
            @keydown="onAkunIdInput"
          />
        </div>
        <div>
          <label class="block mt-2 text-sm font-medium text-gray-700">Kode</label>
          <InputText v-model="formData.akun_kode" placeholder="Akun Kode" class="w-full" />
        </div>
        <div>
          <label class="block mt-2 text-sm font-medium text-gray-700">Nama</label>
          <InputText v-model="formData.akun_nama" placeholder="Akun Nama" class="w-full" />
        </div>
        <div>
          <label class="block mt-2 text-sm font-medium text-gray-700">Rekening</label>
          <InputText v-model="formData.rek_id" placeholder="Akun Rekening" class="w-full" />
        </div>
        <div>
          <label class="block mt-2 text-sm font-medium text-gray-700">Nama Rekening</label>
          <Dropdown
            v-model="formData.rek_nama"
            :options="options.rekPendapatan"
            optionLabel="label"
            optionValue="value"
            placeholder="Pilih Nama Rekening"
            class="w-full"
          />
        </div>
        <div>
          <label class="block mt-2 text-sm font-medium text-gray-700">Kelompok</label>
          <Dropdown
            v-model="formData.akun_kelompok"
            :options="options.kelompok"
            optionLabel="label"
            optionValue="value"
            placeholder="Pilih Kelompok"
            class="w-full"
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
import { ref, reactive, watch } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import api from '@/api/client.js'

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
const isEdit = ref(false)
const defaultForm = {
  id: '',
  akun_id: '',
  akun_kode: '',
  akun_nama: '',
  rek_id: '',
  rek_nama: '',
  akun_kelompok: ''
}
const formData = reactive({ ...defaultForm })
const resetForm = () => {
    Object.assign(formData, defaultForm)
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
      isEdit.value = false
      return
    }
    isEdit.value = true

    Object.keys(formData).forEach((key) => {
        formData[key] = newItem[key]
    })
  },
  { immediate: true }
)
// Watch the model reactively — clean it on every change (typing, paste, autofill)
watch(
  () => formData.akun_id,
  (newVal) => {
    if (newVal && /[^0-9]/.test(newVal)) {
      // Remove any non-digit chars immediately
      formData.akun_id = newVal.replace(/[^0-9]/g, '')
    }
  }
)

const onAkunIdInput = (e) => {
  const allowedKeys = [
    'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'
  ]
  // Allow numbers, control keys, and copy/paste shortcuts
  if (
    allowedKeys.includes(e.key) ||
    (e.ctrlKey && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase()))
  ) {
    return
  }
  // Block if not number
  if (!/^[0-9]$/.test(e.key)) {
    e.preventDefault()
  }
}

const saveData = async () => {
  loading.value = true
  try {
    const payload = formData

    // Clean payload from null or undefined value
    const cleanedPayload = Object.entries(payload).reduce((acc, [key, value]) => {
      if (value !== null && value !== undefined) {
        acc[key] = value
      }
      return acc
    }, {})

    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    }

    if (isEdit.value) {
      await api.put(`/akun/${formData.id}`, cleanedPayload, config)
    } else {
      await api.post('/akun', cleanedPayload, config)
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
