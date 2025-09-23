<template>
  <div class="flex gap-0 -mb-[1px] z-0">
      <router-link to="/kas/kurang-bayar/data-transaksi" v-slot="{ navigate, isActive }">
        <Button
          label="Data Transaksi"
          @click="navigate"
          class="!rounded-b-none"
          :severity="isActive ? 'info' : 'secondary'"
          :variant="isActive ? '' : 'outlined'"
        />
      </router-link>
      <router-link to="/kas/kurang-bayar/data-selisih" v-slot="{ navigate, isActive }">
        <Button
          label="Data Selisih Kurang Bayar/Setor"
          @click="navigate"
          class="!rounded-b-none"
          :severity="isActive ? 'info' : 'secondary'"
          :variant="isActive ? '' : 'outlined'"
        />
      </router-link>
    </div>

    <Panel class="!rounded-t-none z-1">
      <template #header></template>
      <RouterView></RouterView>
    </Panel>


  <!-- <DataKurangBayar /> -->
</template>

<script setup>
// Perbaiki path import agar menunjuk ke lokasi yang benar
import DataKurangBayar from '@/components/pendapatan/kurangbayar/DataKurangBayar.vue';
</script>