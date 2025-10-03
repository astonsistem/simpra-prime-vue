<script setup>
import { ref, onMounted } from 'vue'
import { Chart } from 'chart.js/auto'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import api from '@/api/client.js'
import { useToast } from 'primevue/usetoast'
import Toast from 'primevue/toast'

Chart.register(ChartDataLabels)

const toast = useToast()
const saldoKas = ref(0)
const penerimaan = ref(0)
const potensiPenerimaan = ref(0)
const realisasiPercent = ref(0)
const realisasiChart = ref(null)
const monevPenerimaanLainnyaPercent = ref(0)
const monevPenerimaanLayananPercent = ref(0)
const monevRekeningKoranPercent = ref(0)
const komposisiTargetPendapatanLayananPercent = ref(0)
const komposisiTargetChart = ref(null)
const monthlyComparisonChart = ref(null)
const lineChart = ref(null)

const formatID = (number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(number || 0) 
}

onMounted(async () => {
  try {
    // Get all data for dashbarod
    const response = await api.get('statistik/dashboard')
    const res = response.data

    // Saldo Kas Per Hari ini
    saldoKas.value = res.saldoKas

    // Penerimaan Hari Ini
    penerimaan.value = res.penerimaan

    // Potensi Penerimaan Hari Ini
    potensiPenerimaan.value = res.potensiPenerimaan

    // Realisasi Pendapatan Chart
    if (res.realisasiPendapatanJumlah > 0) {
      realisasiPercent.value = (res.realisasiPendapatanNetto / res.realisasiPendapatanJumlah) * 100
      realisasiPercent.value = Number(realisasiPercent.value.toFixed(2))
    }
    const realisasiCtx = realisasiChart.value.getContext('2d')
    new Chart(realisasiCtx, {
      type: 'doughnut',
      data: {
        datasets: [
          {
            data: [realisasiPercent.value, (100 - realisasiPercent.value)],
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
          datalabels: {
            color: 'black', // text color (white so it's visible on blue/grey)
            font: {
              weight: 'bold',
              size: 14,
            },
            formatter: (value, context) => {
              return '';
            },
          },
        },
      },
    })

    // Data Yang Harus Dimonev
    if (res.monevPenerimaanLainnyaAll > 0) {
      monevPenerimaanLainnyaPercent.value = (res.monevPenerimaanLainnya / res.monevPenerimaanLainnyaAll) * 100
      monevPenerimaanLainnyaPercent.value = Number(monevPenerimaanLainnyaPercent.value.toFixed(2))
    }
    if (res.monevPenerimaanLayananAll > 0) {
      monevPenerimaanLayananPercent.value = (res.monevPenerimaanLayanan / res.monevPenerimaanLayananAll) * 100
      monevPenerimaanLayananPercent.value = Number(monevPenerimaanLayananPercent.value.toFixed(2))
    }
    if (res.monevRekeningKoranAll > 0) {
      monevRekeningKoranPercent.value = (res.monevRekeningKoran / res.monevRekeningKoranAll) * 100
      monevRekeningKoranPercent.value = Number(monevRekeningKoranPercent.value.toFixed(2))
    }

    // Komposisi Target Pendapatan Chart
    if (res.komposisiTargetPendapatanAll > 0) {
      komposisiTargetPendapatanLayananPercent.value = (res.komposisiTargetPendapatanLayanan / res.komposisiTargetPendapatanAll) * 100
      komposisiTargetPendapatanLayananPercent.value = Number(komposisiTargetPendapatanLayananPercent.value.toFixed(2))
    }
    let chartData = [komposisiTargetPendapatanLayananPercent.value, (100 - komposisiTargetPendapatanLayananPercent.value)]
    if (res.komposisiTargetPendapatanLayanan == 0 && res.komposisiTargetPendapatanNotLayanan == 0) {
      chartData = []
    }
    const centerTextPlugin = {
      id: 'centerTextPlugin',
      afterDraw(chart) {
        const data = chart.data.datasets[0].data
        const total = data.reduce((a, b) => a + b, 0)

        const { ctx, chartArea: { width, height } } = chart
        ctx.save()
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        if (total === 0) {
          // Show only "Empty Data"
          ctx.font = 'bold 14px sans-serif'
          ctx.fillStyle = '#999'
          ctx.fillText('Data Kosong', width / 2, height / 2)
        }
        ctx.restore()
      }
    }
    const komposisiTargetCtx = komposisiTargetChart.value.getContext('2d')
    new Chart(komposisiTargetCtx, {
      type: 'pie',
      data: {
        labels: ['Restribusi Layanan', 'Selain Layanan'],
        datasets: [
          {
            data: chartData,
            backgroundColor: ['#3B82F6', '#E5E7EB'],
            borderWidth: 0,
            borderColor: 'transparent',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '0%', // make it donut; remove or set '0%' for pie
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: false, // disable hover tooltips
          },
          datalabels: {
            color: 'black', // text color (white so it's visible on blue/grey)
            font: {
              weight: 'bold',
              size: 14,
            },
            formatter: (value, ctx) => {
              const total = ctx.chart.data.datasets[0].data
                .reduce((a, b) => a + b, 0)
              const percent = (value / total * 100).toFixed(1) + '%'
              return percent
            },
          },
        },
      },
      plugins: [centerTextPlugin]
    })

    // Pendapatan Selain Restribusi Layanan Chart
    const monthlyComparisonCtx = monthlyComparisonChart.value.getContext('2d')
    new Chart(monthlyComparisonCtx, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'Pendapatan Bulanan',
            backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#1F2937', '#9CA3AF', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'],
            data: [65, 59, 80, 81, 56, 55, 40, 60, 70, 75, 80, 90],
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
              display: true,
            },
          },
        },
      },
    })

    // Grafik Garis untuk Pendapatan, Dokumen Klaim, dan Penerimaan Pelayanan
    const lineCtx = lineChart.value.getContext('2d')
    new Chart(lineCtx, {
      type: 'line',
      data: {
        labels: ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4'],
        datasets: [
          {
            label: 'Pendapatan', // Perbaikan: Revenue -> Pendapatan
            data: [50, 60, 55, 70],
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            fill: true,
            tension: 0.4
          },
          {
            label: 'Dokumen Klaim', // Perbaikan: Claim Documents -> Dokumen Klaim
            data: [40, 45, 50, 42],
            borderColor: '#F59E0B',
            backgroundColor: 'rgba(245, 158, 11, 0.2)',
            fill: true,
            tension: 0.4
          },
          {
            label: 'Penerimaan Pelayanan', // Perbaikan: Service Income -> Penerimaan Pelayanan
            data: [35, 55, 60, 65],
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            fill: true,
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: '#E5E7EB',
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    })
  } catch (error) {
    console.error('Gagal memuat data:', error)
    toast.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal memuat data', life: 3000 })
  }
})
</script>

<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-sm text-gray-500">Saldo Kas Per Hari Ini</h3>
        <div class="flex justify-between items-center mt-10">
          <p class="text-2xl font-bold">{{ formatID(saldoKas) }}</p>
          <i class="pi pi-wallet text-xl text-blue-500"></i>
        </div>
      </div>

      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-sm text-gray-500">Penerimaan Hari Ini</h3>
        <div class="flex justify-between items-center mt-10">
          <p class="text-2xl font-bold">{{ formatID(penerimaan) }}</p>
          <i class="pi pi-arrow-up text-xl text-green-500 bg-green-100 rounded-full p-1"></i>
        </div>
      </div>

      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-sm text-gray-500">Potensi Penerimaan Hari Ini</h3>
        <div class="flex justify-between items-center mt-10">
          <p class="text-2xl font-bold">{{ formatID(potensiPenerimaan) }}</p>
          <i class="pi pi-chart-line text-xl text-yellow-500 bg-yellow-100 rounded-full p-1"></i>
        </div>
      </div>

      <div class="bg-white p-4 rounded-lg shadow flex flex-col items-center justify-center">
        <h3 class="text-sm text-gray-500 mb-2">Realisasi Pendapatan</h3>
        <div class="relative w-28 h-28">
          <canvas ref="realisasiChart"></canvas>
          <div class="absolute inset-0 flex items-center justify-center text-xl font-bold">{{ realisasiPercent }}%</div>
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
                <span class="text-sm font-semibold">{{ monevPenerimaanLainnyaPercent }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2.5">
                <div class="bg-yellow-400 h-2.5 rounded-full" :style="{ width: monevPenerimaanLainnyaPercent + '%' }"></div>
              </div>
            </div>
            <div>
              <div class="flex justify-between items-center mb-1">
                <span class="text-sm"
                  ><i class="pi pi-circle-fill text-green-400 mr-2"></i>Penerimaan Layanan</span
                >
                <span class="text-sm font-semibold">{{ monevPenerimaanLayananPercent }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2.5">
                <div class="bg-green-400 h-2.5 rounded-full" :style="{ width: monevPenerimaanLayananPercent + '%' }"></div>
              </div>
            </div>
            <div>
              <div class="flex justify-between items-center mb-1">
                <span class="text-sm"
                  ><i class="pi pi-circle-fill text-purple-400 mr-2"></i>Rekening Koran</span
                >
                <span class="text-sm font-semibold">{{ monevRekeningKoranPercent }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2.5">
                <div class="bg-purple-400 h-2.5 rounded-full" :style="{ width: monevRekeningKoranPercent + '%' }"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white p-4 rounded-lg shadow flex flex-col items-center justify-center">
          <h3 class="font-bold mb-2">Komposisi Target Pendapatan</h3>
          <div class="relative w-36 h-36 mb-4">
            <canvas ref="komposisiTargetChart"></canvas>
          </div>
          <div class="text-sm text-center">
            <p><i class="pi pi-circle-fill text-blue-500 mr-2"></i>Restribusi Layanan</p>
            <p><i class="pi pi-circle-fill text-gray-300 mr-2"></i>Selain Layanan</p>
          </div>
        </div>

        <div class="bg-white p-4 rounded-lg shadow md:col-span-2">
          <h3 class="font-bold mb-4">Pendapatan Selain Restribusi Layanan</h3>
          <div class="h-48">
            <canvas ref="monthlyComparisonChart"></canvas>
          </div>
          <p class="text-center text-sm text-gray-500 mt-2">Perbandingan Bulanan</p>
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

    <div class="mt-6 p-4 bg-white rounded-lg shadow">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">
        Pendapatan,Dokumen Klaim dan Penerimaan Pelayanan
      </h2>
      <div class="h-96">
        <canvas ref="lineChart"></canvas>
      </div>
      <div class="mt-4 flex gap-4 text-sm">
        <p><i class="pi pi-circle-fill text-blue-500 mr-2"></i>Pendapatan</p>
        <p><i class="pi pi-circle-fill text-orange-500 mr-2"></i>Dokumen Klaim</p>
        <p><i class="pi pi-circle-fill text-green-500 mr-2"></i>Penerimaan Pelayanan</p>
      </div>
    </div>

    <Toast />
  </div>
</template>

<style scoped>
/* Anda bisa menambahkan gaya CSS tambahan di sini jika diperlukan */
</style>