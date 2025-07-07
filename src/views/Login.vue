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

const toast = useToast()
const router = useRouter()

const loginData = ref({
  username: '',
  password: '',
})

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

  if (captchaInput.value.trim().toUpperCase() !== captchaCode.value) {
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
    const user = await authService.getCurrentUser(accessToken)

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
      </div>

      <div>
        <label for="username" class="text-surface-900 dark:text-surface-0 font-medium mb-2 block"
          >Username</label
        >
        <InputText
          id="username"
          type="text"
          v-model="loginData.username"
          placeholder="Username"
          class="w-full mb-4"
        />

        <label for="password" class="text-surface-900 dark:text-surface-0 font-medium mb-2 block"
          >Password</label
        >
        <InputText
          id="password"
          type="password"
          v-model="loginData.password"
          placeholder="Password"
          class="w-full mb-4"
        />

        <div class="mb-6">
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

        <div class="text-xs text-gray-400 mb-4" v-if="browserId">Browser ID: {{ browserId }}</div>

        <Button
          label="Sign In"
          icon="pi pi-user !text-xl !leading-none"
          class="w-full"
          @click="login"
          :loading="loading"
        />
      </div>
    </div>

    <Toast />
  </div>
</template>
