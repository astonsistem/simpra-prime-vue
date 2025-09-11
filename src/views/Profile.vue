<template>
  <div class="p-4">
    <div class="card">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-[#17316E]">Profil & Ganti Password</h2>
        <Button
          icon="pi pi-refresh"
          class="p-button-outlined"
          @click="fetchProfile"
          v-tooltip="'Refresh Profil'"
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Informasi Profil -->
        <div class="card p-6">
          <h3 class="text-xl font-semibold mb-4">Informasi Profil</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-1">Nama Pengguna</label>
              <div class="p-3 bg-gray-100 rounded">{{ currentUser?.username || '-' }}</div>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Role</label>
              <div class="p-3 bg-gray-100 rounded">{{ currentUser?.role || '-' }}</div>
            </div>
          </div>
        </div>

        <!-- Form Ganti Password -->
        <div class="card p-6">
          <h3 class="text-xl font-semibold mb-4">Ganti Password</h3>
          <div class="space-y-4">
            <div>
              <label for="currentPassword" class="block text-sm font-medium mb-1">Password Saat Ini</label>
              <Password
                id="currentPassword"
                v-model="form.currentPassword"
                :feedback="false"
                toggleMask
                class="w-full"
                :class="{ 'p-invalid': validationErrors.currentPassword }"
              />
              <small class="p-error" v-if="validationErrors.currentPassword">{{ validationErrors.currentPassword }}</small>
            </div>
            <div>
              <label for="newPassword" class="block text-sm font-medium mb-1">Password Baru</label>
              <Password
                id="newPassword"
                v-model="form.newPassword"
                :feedback="true"
                toggleMask
                class="w-full"
                :class="{ 'p-invalid': validationErrors.newPassword }"
              />
              <small class="p-error" v-if="validationErrors.newPassword">{{ validationErrors.newPassword }}</small>
            </div>
            <div>
              <label for="confirmPassword" class="block text-sm font-medium mb-1">Konfirmasi Password Baru</label>
              <Password
                id="confirmPassword"
                v-model="form.confirmPassword"
                :feedback="false"
                toggleMask
                class="w-full"
                :class="{ 'p-invalid': validationErrors.confirmPassword }"
              />
              <small class="p-error" v-if="validationErrors.confirmPassword">{{ validationErrors.confirmPassword }}</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Tombol Aksi -->
      <div class="flex justify-end gap-3 mt-6">
        <Button
          label="Cancel"
          icon="pi pi-times"
          class="p-button-outlined"
          @click="handleCancel"
        />
        <Button
          label="Simpan"
          icon="pi pi-check"
          :loading="loading"
          @click="handleChangePassword"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { authService } from '../services/authService'

const router = useRouter()
const toast = useToast()

const loading = ref(false)
const currentUser = ref(null)
const form = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validationErrors = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

onMounted(() => {
  // Mendapatkan informasi pengguna saat ini
  fetchProfile()
})

const fetchProfile = async () => {
  try {
    const profile = await authService.getProfile()
    currentUser.value = profile
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Gagal memuat informasi profil',
      life: 3000
    })
  }
}

const handleCancel = () => {
  // Kembali ke halaman dashboard
  router.push('/dashboard')
}

const handleChangePassword = async () => {
  // Reset validation errors
  validationErrors.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }

  // Validasi form
  let hasValidationErrors = false
  if (!form.value.currentPassword) {
    validationErrors.value.currentPassword = 'Password saat ini harus diisi'
    hasValidationErrors = true
  }

  if (!form.value.newPassword) {
    validationErrors.value.newPassword = 'Password baru harus diisi'
    hasValidationErrors = true
  } else if (form.value.newPassword.length < 6) {
    validationErrors.value.newPassword = 'Password baru minimal 6 karakter'
    hasValidationErrors = true
  }

  if (!form.value.confirmPassword) {
    validationErrors.value.confirmPassword = 'Konfirmasi password baru harus diisi'
    hasValidationErrors = true
  } else if (form.value.newPassword !== form.value.confirmPassword) {
    validationErrors.value.confirmPassword = 'Konfirmasi password baru tidak cocok'
    hasValidationErrors = true
  }

  if (form.value.currentPassword && form.value.newPassword && form.value.currentPassword === form.value.newPassword) {
    validationErrors.value.newPassword = 'Password baru tidak boleh sama dengan password saat ini'
    hasValidationErrors = true
  }

  // Jika ada error validasi frontend, hentikan proses
  if (hasValidationErrors) {
    return
  }

  try {
    loading.value = true
    
    // Memanggil fungsi untuk mengganti password dari authService
    await authService.changePassword(form.value.currentPassword, form.value.newPassword, form.value.confirmPassword)
    
    // Tampilkan pesan sukses
    toast.add({
      severity: 'success',
      summary: 'Sukses',
      detail: 'Password berhasil diubah',
      life: 3000
    })
    
    // Reset form
    form.value.currentPassword = ''
    form.value.newPassword = ''
    form.value.confirmPassword = ''
    
    // Logout setelah berhasil mengganti password
    setTimeout(() => {
      authService.logout()
    }, 1500)
    
  } catch (error) {
    // Menangani error validasi dari backend
    if (error.response?.status === 422 && error.response?.data?.errors) {
      const backendErrors = error.response.data.errors
      
      // Menampilkan error validasi di form
      if (backendErrors.current_password) {
        validationErrors.value.currentPassword = backendErrors.current_password[0]
      }
      if (backendErrors.new_password) {
        validationErrors.value.newPassword = backendErrors.new_password[0]
      }
      
      // Tampilkan pesan error umum di toast
      const errorMessage = error.response?.data?.message || 'Validasi gagal'
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: errorMessage,
        life: 3000
      })
    } else {
      // Menampilkan pesan error lainnya dari backend jika ada
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Gagal mengganti password'
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: errorMessage,
        life: 3000
      })
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>