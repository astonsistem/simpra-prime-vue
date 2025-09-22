import { ref } from 'vue'

export default function usePeriodeFilter() {
    const bulanOptions = ref([
        { label: 'Januari', value: 1 },
        { label: 'Februari', value: 2 },
        { label: 'Maret', value: 3 },
        { label: 'April', value: 4 },
        { label: 'Mei', value: 5 },
        { label: 'Juni', value: 6 },
        { label: 'Juli', value: 7 },
        { label: 'Agustus', value: 8 },
        { label: 'September', value: 9 },
        { label: 'Oktober', value: 10 },
        { label: 'November', value: 11 },
        { label: 'Desember', value: 12 },
    ])

    const jenisPeriodeOptions = ref([
        { label: 'Bulanan', value: 'BULANAN' },
        { label: 'Tanggal', value: 'TANGGAL' },
    ])

    const formFilters = ref({
        jenis_periode: 'BULANAN',
        tahunPeriode: '',
        bulanAwal: null,
        bulanAkhir: null,
        tglAwal: null,
        tglAkhir: null,
    })

    const tahunPeriodeOptions = Array.from(
        { length: 10 },
        (_, i) => `${new Date().getFullYear() - 5 + i}`
    )

    return {
        bulanOptions,
        tahunPeriodeOptions,
        jenisPeriodeOptions,
        formFilters
    }
}