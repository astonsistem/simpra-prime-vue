import { ref } from 'vue'
import { formatDateToYYYYMMDD } from '@/utils/dateUtils'

export default function usePeriodeFilter()
{
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

  const form = ref({})

  const tahunPeriodeOptions = Array.from(
    { length: 10 },
    (_, i) => `${new Date().getFullYear() - 5 + i}`
  )

  function initForm() {
    form.value = {
      jenis_periode: 'BULANAN',
      jenisPeriode: 'BULANAN',
      tahunPeriode: null,
      bulanAwal: null,
      bulanAkhir: null,
      tglAwal: null,
      tglAkhir: null,
    }
  }

  function buildQuery() {
    const q = {}
    if (form.value.jenisPeriode) {
      q.jenis_periode = form.value.jenisPeriode
    }

    if (form.value.jenisPeriode === 'BULANAN' || form.value.jenis_periode === 'BULANAN') {
      if (form.value.tahunPeriode) q.year = form.value.tahunPeriode
      if (form.value.bulanAwal) q.month_start = form.value.bulanAwal
      if (form.value.bulanAkhir) q.month_end = form.value.bulanAkhir
    } else if (form.value.jenisPeriode === 'TANGGAL') {
      if (form.value.tglAwal) q.tgl_awal = formatDateToYYYYMMDD(form.value.tglAwal)
      if (form.value.tglAkhir) q.tgl_akhir = formatDateToYYYYMMDD(form.value.tglAkhir)
    }

    return q
  }

  return {
    bulanOptions,
    tahunPeriodeOptions,
    jenisPeriodeOptions,
    formFilters: form,
    initForm,
    buildQuery,
  }
}
