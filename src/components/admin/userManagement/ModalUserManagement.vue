<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'
import Password from 'primevue/password'
import { useToast } from 'primevue/usetoast'
import api from '@/services/http.js'

const props = defineProps({
  user: Object,
  isEdit: Boolean,
})

const emit = defineEmits(['close', 'saved'])
const toast = useToast()

const userData = ref({})

const roles = ref([
  { text: 'ADMIN', value: 'ADMIN' },
  { text: 'BENDAHARA', value: 'BENDAHARA' },
  { text: 'BIASA', value: 'BIASA' },
])

watch(
  () => props.user,
  (newUser) => {
    userData.value = newUser ? { ...newUser } : {}
  },
  { immediate: true }
)

async function saveUser() {
  if (!props.isEdit && userData.value.password !== userData.value.confirmPassword) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Passwords do not match', life: 3000 })
    return
  }

  try {
    if (props.isEdit) {
      await api.put(`/users/${userData.value.id}`, userData.value)
      toast.add({ severity: 'success', summary: 'Success', detail: 'User updated', life: 3000 })
    } else {
      await api.post('/users', userData.value)
      toast.add({ severity: 'success', summary: 'Success', detail: 'User created', life: 3000 })
    }
    emit('saved')
    emit('close')
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Could not save user', life: 3000 })
  }
}
</script>

<template>
  <Dialog
    :visible="true"
    :style="{ width: '500px' }"
    :header="isEdit ? 'Edit User' : 'Add User'"
    :modal="true"
    class="p-fluid"
    @update:visible="$emit('close')"
  >
    <div class="field grid">
      <label for="nama" class="col-12 mb-2 md:col-2 md:mb-0">Nama</label>
      <div class="col-12 md:col-10">
        <InputText id="nama" v-model.trim="userData.nama" required="true" autofocus />
      </div>
    </div>
    <div class="field grid">
      <label for="nip" class="col-12 mb-2 md:col-2 md:mb-0">NIP</label>
      <div class="col-12 md:col-10">
        <InputText id="nip" v-model.trim="userData.nip" required="true" />
      </div>
    </div>
    <div class="field grid">
      <label for="username" class="col-12 mb-2 md:col-2 md:mb-0">Username</label>
      <div class="col-12 md:col-10">
        <InputText id="username" v-model.trim="userData.username" required="true" />
      </div>
    </div>
    <div class="field grid">
      <label for="email" class="col-12 mb-2 md:col-2 md:mb-0">Email</label>
      <div class="col-12 md:col-10">
        <InputText id="email" v-model.trim="userData.email" required="true" />
      </div>
    </div>
    <div class="field grid">
      <label for="telp" class="col-12 mb-2 md:col-2 md:mb-0">No Telp</label>
      <div class="col-12 md:col-10">
        <InputText id="telp" v-model.trim="userData.telp" />
      </div>
    </div>
    <div class="field grid">
      <label for="jabatan" class="col-12 mb-2 md:col-2 md:mb-0">Jabatan</label>
      <div class="col-12 md:col-10">
        <InputText id="jabatan" v-model.trim="userData.jabatan" />
      </div>
    </div>
    <div class="field grid">
      <label for="role" class="col-12 mb-2 md:col-2 md:mb-0">Role</label>
      <div class="col-12 md:col-10">
        <Dropdown
          id="role"
          v-model="userData.role"
          :options="roles"
          optionLabel="text"
          optionValue="value"
          placeholder="Select a Role"
        />
      </div>
    </div>
    <div class="field grid" v-if="!isEdit">
      <label for="password" class="col-12 mb-2 md:col-2 md:mb-0">Password</label>
      <div class="col-12 md:col-10">
        <Password id="password" v-model="userData.password" :feedback="false" />
      </div>
    </div>
    <div class="field grid" v-if="!isEdit">
      <label for="confirmPassword" class="col-12 mb-2 md:col-2 md:mb-0">Confirm Password</label>
      <div class="col-12 md:col-10">
        <Password id="confirmPassword" v-model="userData.confirmPassword" :feedback="false" />
      </div>
    </div>
    <template #footer>
      <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="$emit('close')" />
      <Button
        :label="isEdit ? 'Update' : 'Save'"
        icon="pi pi-check"
        class="p-button-text"
        @click="saveUser"
      />
    </template>
  </Dialog>
</template>
