<script setup>
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import InputText from 'primevue/inputtext'
import Toast from 'primevue/toast'
import { ref, onMounted, nextTick, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useRouter } from 'vue-router'
import { authService } from '../services/authService'
import FingerprintJS from '@fingerprintjs/fingerprintjs'
import Logo from '/logo.png'
import { isCaptchaEnabled } from '../utils/utils'

const toast = useToast()
const router = useRouter()

const loginData = ref({
  username: '',
  password: '',
})

const showPassword = ref(false) // untuk toggle
const browserId = ref('')
const rememberMe = ref(false)
const loading = ref(false)

const captchaInput = ref('')
const captchaCode = ref('')
const captchaCanvas = ref(null)

const generateCaptcha = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  captchaCode.value = Array.from({ length: 5 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join('')
}

const drawCaptcha = () => {
  const canvas = captchaCanvas.value
  const ctx = canvas.getContext('2d')

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#f3f4f6'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Tulis karakter satu per satu dengan rotasi acak
  const chars = captchaCode.value.split('')
  chars.forEach((char, i) => {
    const angle = (Math.random() - 0.5) * 0.5 // derajat rotasi acak
    ctx.save()
    ctx.font = 'bold 20px Arial'
    ctx.translate(15 + i * 18, 25)
    ctx.rotate(angle)
    ctx.fillStyle = '#' + Math.floor(Math.random() * 16777215).toString(16)
    ctx.fillText(char, 0, 0)
    ctx.restore()
  })

  for (let i = 0; i < 3; i++) {
    ctx.beginPath()
    ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height)
    ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height)
    ctx.strokeStyle = 'rgba(0,0,0,0.1)'
    ctx.stroke()
  }
}

const refreshCaptcha = async () => {
  generateCaptcha()
  await nextTick()
  drawCaptcha()
}

watch(captchaCode, () => {
  nextTick(() => {
    drawCaptcha()
  })
})

onMounted(async () => {
  generateCaptcha()
  await nextTick()
  drawCaptcha()

  try {
    const fp = await FingerprintJS.load()
    const result = await fp.get()
    browserId.value = result.visitorId
  } catch (e) {
    console.error('Failed to load fingerprint:', e)
  }
})

const login = async () => {
  loading.value = true

  if (isCaptchaEnabled() && captchaInput.value.trim().toUpperCase() !== captchaCode.value) {
    toast.add({
      severity: 'error',
      summary: 'Captcha Salah',
      detail: 'Kode captcha tidak sesuai.',
      life: 3000,
    })
    refreshCaptcha()
    loading.value = false
    return
  }

  try {
    const response = await authService.login(loginData.value)
    const accessToken = response.token
    const refreshToken = response.refresh_token
    const user = await authService.getCurrentUser()

    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('browserId', browserId.value)

    toast.add({
      severity: 'success',
      summary: 'Login Successful',
      detail: `Welcome, ${user.nama || user.username || 'User'}!`,
      life: 3000,
    })

    await router.push('/dashboard')
  } catch (error) {
    console.error('Login failed:', error)
    toast.add({
      severity: 'error',
      summary: 'Login Failed',
      detail: error.response?.data?.message || 'Invalid credentials',
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}

</script>
<template>
  <div class="flex items-center justify-center min-h-screen bg-surface-50 dark:bg-surface-950 px-6">
    <div class="bg-surface-0 dark:bg-surface-900 p-6 shadow rounded-border w-full max-w-lg">
      <div class="text-center mb-8">
        <img class="logo mx-auto" width="120" height="120" :src="Logo" alt="SIMPRA" />
        <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mt-4">SIMPRA</div>
           <p class="system-description">Sistem Manajemen Pendapatan</p> 
           <p class="hospital-name">RSUD dr. Soetomo Surabaya</p><br></br>
            <h4 class="font-bold">Silahkan login untuk mengakses dashboard SIMPRA</h4>
      </div>
      <div>
       <label for="username" class="text-surface-900 dark:text-surface-0 font-medium mb-2 block">Email</label>
<div class="input-with-icon-wrapper">
    <InputText
      id="username"
      type="text"
      v-model="loginData.username"
      placeholder="Alamat Email"
      class="w-full"
    />
    <span class="input-icon">@</span>
</div>
        <label for="password" class="text-surface-900 dark:text-surface-0 font-medium mb-2 block">Password</label>
<div class="input-with-icon-wrapper">
    <div class="input-with-icon-wrapper">
  <InputText
    id="password"
    ref="passwordInput"
    :type="showPassword ? 'text' : 'password'"
    v-model="loginData.password"
    placeholder="Kata Sandi"
    class="w-full"
  />
  <span
    class="input-icon password-icon"
    @click="showPassword = !showPassword"
    style="cursor:pointer"
  >
    <i :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
  </span>
</div>
</div>
          <div class="mb-7"></div>
        <div v-if="isCaptchaEnabled()" class="mb-6">
          <label class="text-surface-900 dark:text-surface-0 font-medium mb-2 block">Captcha</label>
          <div class="flex items-center gap-2">
            <InputText placeholder="Masukkan kode captcha" v-model="captchaInput" class="flex-1" />
            <div class="flex items-center gap-2">
              <canvas
                ref="captchaCanvas"
                width="100"
                height="40"
                class="rounded border border-gray-300 bg-white"
              ></canvas>
              <button @click="refreshCaptcha" class="text-gray-500 hover:text-black">
                <i class="pi pi-refresh"></i>
              </button>
            </div>
          </div>
        </div>
      <div class="mb-15">
        
</div>
        <!-- <div class="text-xs text-gray-400 mb-" v-if="browserId">Browser ID: {{ browserId }}</div> -->
        <Button
          label="Masuk"
          icon=" !text-xl !leading-none"
          class="w-full !bg-blue-600 !py-4 !text-xl "
          @click="login"
          :loading="loading"
        />
        <div class="footer py-4 text-center text-sm text-gray-500 mt-auto border-t border-gray-200">
      &copy; 2024 RSUD dr. Soetomo Surabaya. All rights reserved.
    </div>
      </div>
    </div>
    <Toast />
  </div>
</template>
<style scoped>
.input-with-icon-wrapper {
  position: relative;
  margin-bottom: 1rem;
}

.input-with-icon-wrapper .input-icon {
  position: absolute;
  right: 45px;
  top: 50%;
  transform: translateY(-50%);
  color: #333;
  font-weight: bold;
  display: inline-block;
  line-height: 1;
}

.input-with-icon-wrapper .email-icon {
  cursor: default;
}

.input-with-icon-wrapper .password-icon {
  cursor: pointer;
}

.input-with-icon-wrapper input {
  padding-right: 40px;
}
.footer {
  margin-top: 20px;
  padding: 10px; 
  border-top: 1px solid #bbb6b6;
  border-right: 1px solid #bbb6b6;
  border-bottom: 1px solid #bbb6b6;
  border-left: 1px solid #bbb6b6;
  font-size: 12px;
  color: #0a0a0a;
  text-align: center;
}

</style>



