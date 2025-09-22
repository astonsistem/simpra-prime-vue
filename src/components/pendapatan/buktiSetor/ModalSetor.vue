<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="Rincian Bukti Setor"
    :style="{ width: '60rem' }"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
  >
    <div class="p-4">
      <div class="grid grid-cols-2 gap-6">
        <div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Tanggal RC</label>
            <DatePicker
              v-model="formData.tgl_rc"
              date-format="dd/mm/yy"
              placeholder="Tanggal RC"
              showIcon
              class="w-full"
              disabled
            />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">No RC</label>
            <InputText v-model="formData.no_rc" placeholder="No RC" class="w-full" disabled />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">Nominal</label>
            <InputNumber
              v-model="formData.kredit"
              placeholder="Nominal"
              class="w-full"
              mode="currency"
              currency="IDR"
              locale="id-ID"
              disabled
            />
          </div>
        </div>
        <div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Uraian</label>
            <Textarea
              v-model="formData.uraian"
              rows="3"
              cols="30"
              autoResize
              placeholder="Uraian"
              class="w-full"
              disabled
            />
          </div>
          <div>
            <label class="block mt-2 text-sm font-medium text-gray-700">Bank</label>
            <Dropdown
              v-model="formData.bank"
              :options="options.bank"
              optionLabel="label"
              optionValue="value"
              placeholder="Pilih Bank"
              class="w-full"
              disabled
            />
          </div>
        </div>
      </div>
      <TabView v-model:activeIndex="activeIndex" class="mt-4">
        <TabPanel header="Billing Kasir">
          <TableRincianPotensiLainnya
            ref="tableRincianPotensiLainnyaDaftar"
            :isDaftar="true"
            :indukId="formData.id"
            :pihak3="formData.pihak3"
            :options="options"
            @saved="reloadTables"
          />
        </TabPanel>
        <TabPanel header="Penerimaan Selisih">
          <TableRincianPotensiLainnya
            ref="tableRincianPotensiLainnyaBelum"
            :indukId="formData.id"
            :pihak3="formData.pihak3"
            :options="options"
            @saved="reloadTables"
          />
        </TabPanel>
        <TabPanel header="Penerimaan Lain">
          <TableRincianPotensiLainnya
            ref="tableRincianPotensiLainnyaBelum"
            :indukId="formData.id"
            :pihak3="formData.pihak3"
            :options="options"
            @saved="reloadTables"
          />
        </TabPanel>
      </TabView>
    </div>
    <template #footer>
      <Button label="Batal" icon="pi pi-times" @click="closeModal" class="p-button-text" />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import DatePicker from 'primevue/datepicker'
import Dropdown from 'primevue/dropdown'
import InputNumber from 'primevue/inputnumber'
import Button from 'primevue/button'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import TableRincianPotensiLainnya from '@/components/pendapatan/potensiLainnya/TableRincianPotensiLainnya.vue'
import api from '@/services/http.js'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  item: {
    type: Object,
    default: null,
  },
  options: Object
})
const emit = defineEmits(['update:modelValue', 'saved'])
const activeIndex = ref(0) 
const visible = ref(props.modelValue)
const selectedItem = ref(null)
const showModal = ref(false)
const tableRincianPotensiLainnyaDaftar = ref(null)
const tableRincianPotensiLainnyaBelum = ref(null)
const defaultForm = {
  rc_id: 0,
  tgl_rc: '',
  no_rc: '',
  kredit: 0,
  uraian: '',
  bank: ''
}
const formData = ref({ ...defaultForm })
const resetForm = () => {
  formData.value = { ...defaultForm }
}

watch(
  () => props.modelValue,
  (newValue) => {
    visible.value = newValue
  }
)
watch(visible, (newValue) => {
  emit('update:modelValue', newValue)
})
watch(
  () => props.item,
  (newItem) => {
    if (newItem) {
      Object.keys(formData.value).forEach((key) => {
        if (key.startsWith('tgl_')) {
          formData.value[key] = newItem[key] ? new Date(newItem[key]) : null
        } else {
          formData.value[key] = newItem[key]
        }
      })
    }
  },
  { immediate: true }
)

const reloadTables = () => {
  tableRincianPotensiLainnyaDaftar.value.loadData()
  tableRincianPotensiLainnyaBelum.value.loadData()
}

const closeModal = () => {
  visible.value = false
  resetForm()
}

async function exportPDF() {
  const [res1, res2] = await Promise.all([
    api.get("/bukti_setor", { params: { page: 1, size: 999999 } }),
    api.get("/potensi_lainnya", { params: { page: 1, size: 999999 } }),
  ]);

  const doc = new jsPDF();

  // === Add logo centered at top ===
  const img = new Image();
  img.src = "https://marketplace.canva.com/EAGKpyNoGGs/1/0/1600w/canva-merah-krem-lingkaran-siomay-logo-FlhX34Fz8tk.jpg"; // URL or base64
  await new Promise((resolve) => { img.onload = resolve; });

  const imgWidth = 40; // width in mm
  const imgHeight = 40; // height in mm
  const pageWidth = doc.internal.pageSize.getWidth();
  const x = (pageWidth - imgWidth) / 2; // center horizontally
  const y = 10; // top margin
  doc.addImage(img, "PNG", x, y, imgWidth, imgHeight);

  // === Title below image ===
  doc.setFontSize(16);
  doc.text("Bukti Setor", pageWidth / 2, y + imgHeight + 10, { align: "center" });

  // === Form Data ===
  const fieldLabels = {
    tgl_rc: "Tanggal RC",
    no_rc: "No RC",
    kredit: "Nominal",
    uraian: "Uraian",
    bank: "Bank",
  };

  const formRows = Object.entries(formData.value)
    .filter(([key]) => key in fieldLabels)
    .map(([key, value]) => {
      let displayValue = value ?? "";
      if (key === "kredit" && typeof displayValue === "number") {
        displayValue = displayValue.toLocaleString("id-ID");
      }
      if (key === "tgl_rc") {
        displayValue = new Date(displayValue).toLocaleDateString("id-ID");
      }
      return [fieldLabels[key], displayValue];
    });

  autoTable(doc, {
    startY: y + imgHeight + 20,
    head: [["Field", "Value"]],
    body: formRows,
  });

  let tableY = doc.lastAutoTable.finalY + 10;

  // === Billing Kasir table ===
  const headers1 = ["No", "Tgl Setor", "Bank", "Nilai RC"];
  const body1 = (res1.data.items || []).map((v, i) => [
    i + 1,
    new Date(v.tgl_rc).toLocaleDateString("id-ID"),
    v.bank,
    (v.kredit ?? 0).toLocaleString("id-ID"),
  ]);
  doc.text("Billing Kasir", pageWidth / 2, tableY, { align: "center" });
  autoTable(doc, { startY: tableY + 5, head: [headers1], body: body1 });
  tableY = doc.lastAutoTable.finalY + 10;

  // === Penerimaan Selisih table ===
  const headers2 = ["No", "Tgl Dokumen", "Jumlah"];
  const body2 = (res2.data.items || []).map((v, i) => [
    i + 1,
    new Date(v.tgl_dokumen).toLocaleDateString("id-ID"),
    (v.total ?? 0).toLocaleString("id-ID"),
  ]);
  doc.text("Penerimaan Selisih", pageWidth / 2, tableY, { align: "center" });
  autoTable(doc, { startY: tableY + 5, head: [headers2], body: body2 });

  // === Export PDF ===
  doc.save("export_all.pdf");
}

defineExpose({ exportPDF })
</script>
