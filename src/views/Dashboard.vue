<script setup>
import { ref, onMounted } from 'vue'
import { Chart } from 'chart.js/auto'

const realizationChart = ref(null)
const targetCompositionChart = ref(null)
const monthlyComparisonChart = ref(null)

onMounted(() => {
  // Realisasi Pendapatan Chart
  const realizationCtx = realizationChart.value.getContext('2d')
  new Chart(realizationCtx, {
    type: 'doughnut',
    data: {
      datasets: [
        {
          data: [75, 25],
          backgroundColor: ['#3B82F6', '#E5E7EB'],
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      plugins: {
        legend: {
          display: false,
        },
      },
    },
  })

  // Komposisi Target Pendapatan Chart
  const targetCompositionCtx = targetCompositionChart.value.getContext('2d')
  new Chart(targetCompositionCtx, {
    type: 'doughnut',
    data: {
      datasets: [
        {
          data: [60, 40],
          backgroundColor: ['#3B82F6', '#E5E7EB'],
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      plugins: {
        legend: {
          display: false,
        },
      },
    },
  })

  // Pendapatan Selain Restribusi Layanan Chart
  const monthlyComparisonCtx = monthlyComparisonChart.value.getContext('2d')
  new Chart(monthlyComparisonCtx, {
    type: 'bar',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
      datasets: [
        {
          label: 'Monthly Comparison',
          data: [65, 59, 80, 81, 56],
          backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'],
          borderRadius: 5,
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            display: false,
          },
          ticks: {
            display: false,
          },
        },
        x: {
          grid: {
            display: false,
          },
          ticks: {
            display: false,
          },
        },
      },
    },
  })
})
</script>

<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-sm text-gray-500">Saldo Kas Per Hari Ini</h3>
        <div class="flex justify-between items-center">
          <p class="text-2xl font-bold">Rp 2.450.000</p>
          <i class="pi pi-wallet text-xl text-blue-500"></i>
        </div>
        <p class="text-xs text-gray-400">Updated 5 min ago</p>
      </div>
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-sm text-gray-500">Penerimaan Hari Ini</h3>
        <div class="flex justify-between items-center">
          <p class="text-2xl font-bold">Rp 1.850.000</p>
          <i class="pi pi-arrow-up text-xl text-green-500 bg-green-100 rounded-full p-1"></i>
        </div>
        <p class="text-xs text-green-500">+12% Dari Kemarin</p>
      </div>
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-sm text-gray-500">Potensi Penerimaan Hari Ini</h3>
        <div class="flex justify-between items-center">
          <p class="text-2xl font-bold">Rp 3.850.000</p>
          <i class="pi pi-chart-line text-xl text-yellow-500 bg-yellow-100 rounded-full p-1"></i>
        </div>
        <p class="text-xs text-gray-400">Proyeksi Untuk Hari Ini</p>
      </div>
      <div class="bg-white p-4 rounded-lg shadow flex flex-col items-center justify-center">
        <h3 class="text-sm text-gray-500 mb-2">Realisasi Pendapatan</h3>
        <div class="relative w-24 h-24">
          <canvas ref="realizationChart"></canvas>
          <div class="absolute inset-0 flex items-center justify-center text-xl font-bold">75%</div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white p-4 rounded-lg shadow">
          <h3 class="font-bold mb-4">Jumlah Data Yang harus diMonev</h3>
          <div class="space-y-4">
            <div>
              <div class="flex justify-between items-center mb-1">
                <span class="text-sm"
                  ><i class="pi pi-circle-fill text-yellow-400 mr-2"></i>Penerimaan Lainnya</span
                >
                <span class="text-sm font-semibold">45%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2.5">
                <div class="bg-yellow-400 h-2.5 rounded-full" style="width: 45%"></div>
              </div>
            </div>
            <div>
              <div class="flex justify-between items-center mb-1">
                <span class="text-sm"
                  ><i class="pi pi-circle-fill text-green-400 mr-2"></i>Penerimaan Layanan</span
                >
                <span class="text-sm font-semibold">45%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2.5">
                <div class="bg-green-400 h-2.5 rounded-full" style="width: 45%"></div>
              </div>
            </div>
            <div>
              <div class="flex justify-between items-center mb-1">
                <span class="text-sm"
                  ><i class="pi pi-circle-fill text-purple-400 mr-2"></i>Rekening Koran</span
                >
                <span class="text-sm font-semibold">45%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2.5">
                <div class="bg-purple-400 h-2.5 rounded-full" style="width: 45%"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-white p-4 rounded-lg shadow flex flex-col items-center justify-center">
          <h3 class="font-bold mb-2">Komposisi Target Pendapatan</h3>
          <div class="relative w-32 h-32 mb-4">
            <canvas ref="targetCompositionChart"></canvas>
            <div class="absolute inset-0 flex items-center justify-center text-2xl font-bold">
              75%
            </div>
          </div>
          <div class="text-sm text-center">
            <p><i class="pi pi-circle-fill text-blue-500 mr-2"></i>Service Retribution (60%)</p>
            <p><i class="pi pi-circle-fill text-gray-300 mr-2"></i>Other than Service (40%)</p>
          </div>
        </div>
        <div class="bg-white p-4 rounded-lg shadow md:col-span-2">
          <h3 class="font-bold mb-4">Pendapatan Selain Restribusi Layanan</h3>
          <div class="h-48">
            <canvas ref="monthlyComparisonChart"></canvas>
          </div>
          <p class="text-center text-sm text-gray-500 mt-2">Monthly comparison</p>
        </div>
      </div>

      <div class="space-y-6">
        <div class="bg-white p-4 rounded-lg shadow flex justify-between items-center">
          <div>
            <h4 class="text-sm text-gray-500">Jumlah personil Penerimaan</h4>
            <p class="text-2xl font-bold">8</p>
          </div>
          <i class="pi pi-users text-xl text-blue-500"></i>
        </div>
        <div class="bg-white p-4 rounded-lg shadow flex justify-between items-center">
          <div>
            <h4 class="text-sm text-gray-500">Jumlah Penjamin Pasien</h4>
            <p class="text-2xl font-bold">156</p>
          </div>
          <i class="pi pi-shield text-xl text-yellow-500"></i>
        </div>
        <div class="bg-white p-4 rounded-lg shadow flex justify-between items-center">
          <div>
            <h4 class="text-sm text-gray-500">Jumlah Loket Kasir</h4>
            <p class="text-2xl font-bold">8</p>
          </div>
          <i class="pi pi-desktop text-xl text-green-500"></i>
        </div>
        <div class="bg-white p-4 rounded-lg shadow flex justify-between items-center">
          <div>
            <h4 class="text-sm text-gray-500">Jumlah Instalansi</h4>
            <p class="text-2xl font-bold">12</p>
          </div>
          <i class="pi pi-cog text-xl text-gray-500"></i>
        </div>
      </div>
    </div>

    <div class="mt-6">
      <h2 class="text-lg font-semibold text-gray-800">
        Pendapatan,Dokumen Klaim dan Penerimaan Pelayanan
      </h2>
      <!-- Bottom table/component will go here -->
    </div>
  </div>
</template>

<style scoped>
/* Add any additional styles if needed */
</style>
