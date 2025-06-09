// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Users from '../views/Users.vue'
import Login from '../views/Login.vue'
import { authService } from '../services/authService'
import EmptyLayout from '../layouts/EmptyLayout.vue'
import AdminLayout from '../layouts/AdminLayout.vue'

const isAuthenticated = () => {
  return authService.isAuthenticated()
}

const getUserRole = () => {
  return authService.getUserRole()
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/admin',
      component: EmptyLayout,
      children: [
        {
          path: 'login',
          name: 'admin-login',
          component: Login,
          meta: { public: true, layout: 'empty' },
        },
        {
          path: '',
          redirect: '/admin/login',
        },
      ],
    },
    {
      path: '/',
      component: AdminLayout,
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: Dashboard,
          meta: { roles: ['admin', 'accountant'] },
        },
        {
          path: '',
          redirect: '/dashboard',
        },
        // Pendapatan Routes
        {
          path: 'pendapatan/pelayanan',
          name: 'pendapatan-pelayanan',
          component: () => import('../views/pendapatan/PendapatanPelayanan.vue'),
          meta: {
            roles: ['admin', 'accountant'],
            breadcrumb: ['Pendapatan', 'Pendapatan Pelayanan'],
          },
        },
        {
          path: 'pendapatan/billing-kasir',
          name: 'pendapatan-billing-kasir',
          component: () => import('../views/pendapatan/BillingKasir.vue'),
          meta: { roles: ['admin', 'accountant'], breadcrumb: ['Pendapatan', 'Billing Kasir'] },
        },
        {
          path: 'pendapatan/billing-siwa',
          name: 'pendapatan-billing-siwa',
          // component: () => import('../views/pendapatan/BillingSiwa.vue'),
          meta: { roles: ['admin', 'accountant'] },
        },
        {
          path: 'pendapatan/penerimaan-lainnya',
          name: 'pendapatan-penerimaan-lainnya',
          // component: () => import('../views/pendapatan/PenerimaanLainnya.vue'),
          meta: { roles: ['admin', 'accountant'] },
        },
        {
          path: 'pendapatan/potensi-pelayanan',
          name: 'pendapatan-potensi-pelayanan',
          // component: () => import('../views/pendapatan/PotensiPelayanan.vue'),
          meta: { roles: ['admin', 'accountant'] },
        },
        {
          path: 'pendapatan/potensi-lainnya',
          name: 'pendapatan-potensi-lainnya',
          // component: () => import('../views/pendapatan/PotensiLainnya.vue'),
          meta: { roles: ['admin', 'accountant'] },
        },
        {
          path: 'pendapatan/bukti-setor',
          name: 'pendapatan-bukti-setor',
          // component: () => import('../views/pendapatan/BuktiSetor.vue'),
          meta: { roles: ['admin', 'accountant'] },
        },
        {
          path: 'pendapatan/rekening-koran',
          name: 'pendapatan-rekening-koran',
          // component: () => import('../views/pendapatan/RekeningKoran.vue'),
          meta: { roles: ['admin', 'accountant'] },
        },
        {
          path: 'pendapatan/bku',
          name: 'pendapatan-bku',
          // component: () => import('../views/pendapatan/BKU.vue'),
          meta: { roles: ['admin', 'accountant'] },
        },
        {
          path: 'pendapatan/pelaporan',
          name: 'pendapatan-pelaporan',
          // component: () => import('../views/pendapatan/Pelaporan.vue'),
          meta: { roles: ['admin', 'accountant'] },
        },
        // Master Routes
        {
          path: 'master/akun-pendapatan',
          name: 'master-akun-pendapatan',
          component: () => import('../views/master/AkunPendapatan.vue'),
          meta: {
            roles: ['admin'],
            breadcrumb: ['Master', 'Akun Pendapatan'],
          },
        },
        {
          path: 'master/kasir',
          name: 'master-kasir',
          component: () => import('../views/master/Kasir.vue'),
          meta: {
            roles: ['admin'],
            breadcrumb: ['Master', 'Kasir'],
          },
        },
        {
          path: 'master/loket-lokasi',
          name: 'master-loket-lokasi',
          component: () => import('../views/master/Loket.vue'),
          meta: { roles: ['admin'], breadcrumb: ['Master', 'Loket / Lokasi'] },
        },
        {
          path: 'master/instalasi',
          name: 'master-instalasi',
          component: () => import('../views/master/Instalasi.vue'),
          meta: { roles: ['admin'], breadcrumb: ['Master', 'Instalasi'] },
        },
        {
          path: 'master/cara-bayar',
          name: 'master-cara-bayar',
          component: () => import('../views/master/CaraBayar.vue'),
          meta: { roles: ['admin'], breadcrumb: ['Master', 'Cara Bayar'] },
        },
        {
          path: 'master/penjamin',
          name: 'master-penjamin',
          component: () => import('../views/master/Penjamin.vue'),
          meta: { roles: ['admin'], breadcrumb: ['Master', 'Penjamin'] },
        },
        // Laporan Routes
        {
          path: 'laporan',
          name: 'laporan',
          // component: () => import('../views/Laporan.vue'),
          meta: { roles: ['admin', 'accountant'] },
        },
        {
          path: 'laporan-rekap',
          name: 'laporan-rekap',
          // component: () => import('../views/LaporanRekap.vue'),
          meta: { roles: ['admin', 'accountant'] },
        },
      ],
    },
  ],
})

// router.beforeEach((to, from, next) => {
//   const isPublicRoute = to.meta.public
//   const routeRoles = to.meta.roles
//   const authenticated = isAuthenticated()
//   const userRole = getUserRole()

//   if (!isPublicRoute && !authenticated) {
//     next({
//       name: 'admin-login',
//       params: { nextUrl: to.fullPath },
//     })
//   } else if (routeRoles && authenticated) {
//     if (!routeRoles.includes(userRole)) {
//       next('/')
//     } else {
//       next()
//     }
//   } else {
//     next()
//   }
// })

export default router
