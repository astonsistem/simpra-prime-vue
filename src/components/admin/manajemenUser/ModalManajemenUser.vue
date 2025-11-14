<template>
  <Dialog
    v-model:visible="visible"
    modal
    style="width: 42vw"
    :header="isEdit ? 'Edit Data User' : 'Tambah Data User'"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
  >
    <div class="p-4">
      <div class="grid grid-cols-2 gap-6">
        <div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Nama</label>
            <InputText v-model="formData.nama" placeholder="Nama User" class="w-full" />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">NIP</label>
            <InputText v-model="formData.nip" placeholder="NIP User" class="w-full" />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">Username</label>
            <InputText 
              v-model="formData.username" 
              placeholder="Username User" 
              class="w-full"
              @input="formData.username = formData.username.replace(/\s+/g, '')"
            />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">Email</label>
            <InputText v-model="formData.email" placeholder="Email User" class="w-full" />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">No Telp</label>
            <InputText v-model="formData.no_telp" placeholder="No Telp User" class="w-full" />
          </div>
        </div>
        <div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Jabatan</label>
            <InputText v-model="formData.jabatan" placeholder="Jabatan User" class="w-full" />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">Role</label>
            <Dropdown
              v-model="formData.role"
              :options="options.role"
              optionLabel="label"
              optionValue="value"
              placeholder="Pilih Role"
              class="w-full"
            />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">{{ isEdit ? 'Password Baru (opsional)' : 'Password' }}</label>
            <InputText
              v-model="formData.password"
              type="password"
              placeholder="Masukkan Password"
              class="w-full"
            />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">{{ isEdit ? 'Konfirmasi Password Baru' : 'Password' }}</label>
            <InputText
              v-model="formData.confirmPassword"
              type="password"
              placeholder="Konfirmasi Password"
              class="w-full"
              @input="checkPasswordMatch"
            />
            <small v-if="passwordError" class="text-red-500">{{ passwordError }}</small>
          </div>
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
  email: '',
  username: '',
  role: '',
  nama: '',
  nip: '',
  no_telp: '',
  jabatan: ''
}
const passwordError = ref('')
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

const checkPasswordMatch = () => {
  if (formData.confirmPassword && formData.confirmPassword !== formData.password) {
    passwordError.value = 'Konfirmasi password salah'
  } else {
    passwordError.value = ''
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
      await api.put(`/auth/user/${formData.id}`, cleanedPayload, config)
    } else {
      await api.post('/auth/user', cleanedPayload, config)
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
