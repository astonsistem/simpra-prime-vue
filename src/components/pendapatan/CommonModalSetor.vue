<template>
	<Dialog :visible="model" @update:visible="closeModal" modal :style="{ width: '95%' }"
		:breakpoints="{ '1199px': '75vw', '575px': '95%' }">
		<template #header>
			<div class="flex items-center justify-between w-full">
				<div>
					<h2 class="text-lg font-semibold">Bukti Setor pada ID RC: {{ rekeningKoran?.rc_id }}</h2>
				</div>
			</div>
		</template>

		<div class="mb-4 text-sm">
			<div class="grid grid-cols-1 md:grid-cols-3 gap-2">
				<Fieldset legend="Rekening Koran" class="md:col-span-2">
					<div class="grid grid-cols-4 gap-2">
						<div>Tgl. RC</div>
						<div class="col-span-3">: <span class="font-bold">{{ rekeningKoran?.tgl_rc || '-' }}</span></div>
						<div>No. RC</div>
						<div class="col-span-3">: <span class="font-bold">{{ rekeningKoran?.no_rc || '-' }}</span></div>
						<div>Nominal</div>
						<div class="col-span-3">: <span class="font-bold">{{ formatCurrency(rekeningKoran?.nominal) || '-' }}</span>
						</div>
						<div>Bank</div>
						<div class="col-span-3">: <span class="font-bold">{{ rekeningKoran?.bank || '-' }}</span></div>
					</div>
				</Fieldset>
			</div>
		</div>

		<Tabs value="0">
			<TabList class="mb-4">
				<Tab v-slot="slotProps" value="0" asChild>
					<div :class="['flex flex-col', slotProps.class]" @click="slotProps.onClick" v-bind="slotProps.a11yAttrs">
						<Button variant="outlined" :severity="slotProps.active ? 'primary' : 'secondary'" class="mb-1">Billing
							Kasir</Button>
						<div class="text-xs text-gray-400"><i class="pi pi-chart-line text-amber-300" style="font-size: 0.7rem"></i>
							{{
								hitungTotalBruto(billingKasirItems) }}</div>
						<div class="text-xs text-gray-400"><i class="pi pi-chart-line text-green-300" style="font-size: 0.7rem"></i>
							{{
								hitungTotalNetto(billingKasirItems) }}</div>
					</div>
				</Tab>
				<Tab v-slot="slotProps" value="1" asChild>
					<div :class="['flex flex-col', slotProps.class]" @click="slotProps.onClick" v-bind="slotProps.a11yAttrs">
						<Button variant="outlined" :severity="slotProps.active ? 'primary' : 'secondary'" class="mb-1">Penerimaan
							Selisih</Button>
						<div class="text-xs text-gray-400"><i class="pi pi-chart-line text-amber-300" style="font-size: 0.7rem"></i>
							{{
								hitungTotal('jumlah', penerimaanSelisih) }}</div>
						<div class="text-xs text-gray-400"><i class="pi pi-chart-line text-green-300" style="font-size: 0.7rem"></i>
							{{
								hitungTotalNetto(penerimaanSelisih) }}</div>
					</div>
				</Tab>
				<Tab v-slot="slotProps" value="2" asChild>
					<div :class="['flex flex-col', slotProps.class]" @click="slotProps.onClick" v-bind="slotProps.a11yAttrs">
						<Button variant="outlined" :severity="slotProps.active ? 'primary' : 'secondary'" class="mb-1">Penerimaan
							Lain</Button>
						<div class="text-xs text-gray-400"><i class="pi pi-chart-line text-amber-300" style="font-size: 0.7rem"></i>
							{{
								hitungTotalBruto(penerimaanLain) }}</div>
						<div class="text-xs text-gray-400"><i class="pi pi-chart-line text-green-300" style="font-size: 0.7rem"></i>
							{{
								hitungTotalNetto(penerimaanLain) }}</div>
					</div>
				</Tab>
			</TabList>
			<TabPanels>
				<TabPanel value="0">
					<div class="pb-8">
						<h3 class="text-sm text-gray-500 font-semibold mb-2">Kwitansi Billing Kasir</h3>
						<DataTable :value="billingKasirItems" striped-rows show-gridlines class="p-datatable-sm text-xs"
							responsiveLayout="scroll">
							<Column field="no" header="No" style="width: 5%;">
								<template #body="{ index }">{{ 1 + index }}</template>
							</Column>
							<template #empty>
								<div class="flex items-center text-gray-500 min-h-12">
									<i class="pi pi-info-circle mr-2" style="font-size: 1.5rem"></i>
									<p>Data Kosong</p>
								</div>
							</template>
							<Column header="No. Kwitansi" field="no_buktibayar"></Column>
							<Column header="Tgl. Kwitansi" field="tgl_buktibayar"></Column>
							<Column header="No Closing" field="no_closingkasir"></Column>
							<Column header="Nama Pasien" field="pasien_nama" style="width: 120px"></Column>
							<Column header="No. Pendaftaran" field="no_pendaftaran"></Column>
							<Column header="Tgl. Pelayanan" field="tgl_pelayanan"></Column>
							<Column header="Jenis Tagihan" field="jenis_tagihan"></Column>
							<Column header="Metode Bayar" field="carabayar_nama"></Column>
							<Column header="Cara Pembayaran" field="cara_pembayaran"></Column>
							<Column header="Bank" field="bank_tujuan"></Column>
							<Column header="Jumlah Bruto" field="total" class="text-end">
								<template #body="{ data }">{{ formatCurrency(data.total) }}</template>
							</Column>
							<Column header="Jumlah Netto" field="jumlah_netto" class="text-end">
								<template #body="{ data }">{{ formatCurrency(data.jumlah_netto > 0 ? data.jumlah_netto :
									data.total_jumlah_netto) }}</template>
							</Column>
							<template #footer>
								<div class="flex justify-end">
									<div class="w-1/4 grid grid-cols-2 gap-2">
										<div>Total Bruto:</div>
										<div class="text-end font-medium">{{ hitungTotalBruto(billingKasirItems) }}</div>
										<div>Total Netto:</div>
										<div class="text-end font-medium text-blue-700">{{ hitungTotalNetto(billingKasirItems) }}</div>
									</div>
								</div>
							</template>
						</DataTable>
					</div>
				</TabPanel>
				<TabPanel value="1">
					<div class="pb-8">
						<h3 class="text-sm text-gray-500 font-semibold mb-2">Kompensasi Atas Selisih Setor Sebelumnya</h3>
						<DataTable :value="penerimaanSelisih" class="p-datatable-sm text-xs" responsiveLayout="scroll"
							show-gridlines>
							<Column field="no" header="No" style="width: 5%;">
								<template #body="{ index }">{{ 1 + index }}</template>
							</Column>
							<template #empty>
								<div class="flex items-center text-gray-500 min-h-12">
									<i class="pi pi-info-circle mr-2" style="font-size: 1.5rem"></i>
									<p>Data Kosong</p>
								</div>
							</template>
							<Column field="tgl_setor" header="Tgl. Setor"></Column>
							<Column field="no_buktibayar" header="No. Bukti"></Column>
							<Column field="tgl_buktibayar" header="Tgl. Bukti"></Column>
							<Column field="penyetor" header="Penyetor"></Column>
							<Column field="jenis" header="Jenis"></Column>
							<Column field="bank_tujuan" header="Bank"></Column>
							<Column field="sumber_transaksi" header="Sumber Transaksi"></Column>
							<Column field="rekening_dpa" header="Rekening DPA">
								<template #body="{ data }">
									{{ data.rekening_dpa?.rek_nama ?? '' }}
								</template>
							</Column>
							<Column header="Jumlah Setor" field="jumlah" class="text-end">
								<template #body="{ data }">{{ formatCurrency(data.jumlah) }}</template>
							</Column>
							<Column header="Jumlah Netto" field="jumlah_netto" class="text-end">
								<template #body="{ data }">{{ formatCurrency(data.jumlah_netto > 0 ? data.jumlah_netto :
									data.total_jumlah_netto) }}</template>
							</Column>
							<template #footer>
								<div class="flex justify-end">
									<div class="w-1/4 grid grid-cols-2 gap-2">
										<div>Total Bruto:</div>
										<div class="text-end font-medium">{{ hitungTotal('jumlah', penerimaanSelisih) }}</div>
										<div>Total Netto:</div>
										<div class="text-end font-medium text-blue-700">{{ hitungTotalNetto(penerimaanSelisih) }}</div>
									</div>
								</div>
							</template>
						</DataTable>
					</div>
				</TabPanel>
				<TabPanel value="2">
					<div class="pb-8">
						<h3 class="text-sm text-gray-500 font-semibold mb-2">Kwitansi dari Penerimaan Lain</h3>
						<DataTable :value="penerimaanLain" class="p-datatable-sm text-xs" responsiveLayout="scroll" show-gridlines>
							<Column field="no" header="No" style="width: 5%;">
								<template #body="{ index }">{{ 1 + index }}</template>
							</Column>
							<template #empty>
								<div class="flex items-center text-gray-500 min-h-12">
									<i class="pi pi-info-circle mr-2" style="font-size: 1.5rem"></i>
									<p>Data Kosong</p>
								</div>
							</template>
							<Column header="No. Bayar" field="no_bayar"></Column>
							<Column header="Tgl. Bayar" field="tgl_bayar"></Column>
							<Column header="Penyetor" field="pihak3" style="width: 120px"></Column>
							<Column header="Uraian" field="uraian"></Column>
							<Column header="No. Dokumen" field="no_dokumen"></Column>
							<Column header="Tgl. Dokumen" field="tgl_dokumen"></Column>
							<Column header="Sumber Transaksi" field="sumber.sumber_nama"></Column>
							<Column header="Cara Pembayaran" field="cara_pembayaran"></Column>
							<Column header="Bank" field="bank_tujuan"></Column>
							<Column header="Jumlah Bruto" field="total" class="text-end">
								<template #body="{ data }">{{ formatCurrency(data.total) }}</template>
							</Column>
							<Column header="Jumlah Netto" field="jumlah_netto" class="text-end">
								<template #body="{ data }">{{ formatCurrency(data.total_jumlah_netto) }}</template>
							</Column>
							<template #footer>
								<div class="flex justify-end">
									<div class="w-1/4 grid grid-cols-2 gap-2">
										<div>Total Bruto:</div>
										<div class="text-end font-medium">{{ hitungTotalBruto(penerimaanLain) }}</div>
										<div>Total Netto:</div>
										<div class="text-end font-medium text-blue-700">{{ hitungTotalNetto(penerimaanLain) }}</div>
									</div>
								</div>
							</template>
						</DataTable>
					</div>
				</TabPanel>
			</TabPanels>
		</Tabs>

		<template #footer>
			<Button label="Tutup" icon="pi pi-times" @click="closeModal" severity="secondary" />
			<!-- <Button label="Simpan" icon="pi pi-check" @click="saveData" class="p-button-success" /> -->
		</template>
	</Dialog>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import api from '@/api/client'
import { formatCurrency } from '@/utils/utils'

const model = defineModel()
const rekeningKoran = ref(null)
const billingKasirItems = ref([])
const penerimaanSelisih = ref([])
const penerimaanLain = ref([])
const toast = useToast()
const loading = ref(false)

const props = defineProps({
	item: {
		type: Object,
		default: null,
	},
})

watch(() => model.value, (val) => {
	if (val) {
		load()
	}
}
)

function hitungTotalBruto(items) {
	return formatCurrency(
		items.reduce((total, item) => total + parseInt(item.total || 0), 0)
	)
}

function hitungTotalNetto(items) {
	return formatCurrency(
		items.reduce((total, item) => total + parseInt(item.total_jumlah_netto || 0), 0)
	)
}

function hitungTotal(key,items) {
	return formatCurrency(
		items.reduce((total, item) => total + parseInt(item[key] || 0), 0)
	)
}

function load() {
	loading.value = true
	api.get(`/billing_kasir/setor/${getRcId()}`)
		.then((response) => {
			if (response.data.status == 200) {
				rekeningKoran.value = response.data.data.rekening_koran
				billingKasirItems.value = response.data.data.billing_kasir
				penerimaanSelisih.value = response.data.data.penerimaan_selisih
				penerimaanLain.value = response.data.data.penerimaan_lain
			}
		})
		.catch((error) => {
			console.error(error)
			toast.add({
				severity: 'error',
				summary: 'Error',
				detail: 'Gagal memuat data',
				life: 3000
			})
		})
		.finally(() => {
			loading.value = false
		})
}

function getRcId() {
	if (props.item && props.item.rc_id) {
		return props.item.rc_id
	}

	if (props.item && props.item.rcId) {
		return props.item.rcId
	}

	return null
}

const closeModal = () => {
	model.value = false
	rekeningKoran.value = null
	billingKasirItems.value = []
}
</script>
