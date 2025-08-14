<script setup>
import Dialog from "primevue/dialog"
import Button from "primevue/button"
import InputText from "primevue/inputtext"
import Textarea from "primevue/textarea"
import { ref } from "vue"
import Dropdown from "primevue/dropdown"


const props = defineProps({
    visible: Boolean
})
const emit = defineEmits(["update:visible", "save"])

const namaPotensi = ref("")
const keterangan = ref("")
function closeModal() {
    emit("update:visible", false)
}

function handleSave() {
    emit("save", {
        nama: namaPotensi.value,
        ket: keterangan.value
    })
    closeModal()
}

const metodeOptions = ref([
    { label: "Tunai", value: "tunai" },
    { label: "Kredit", value: "kredit" },
    { label: "Transfer", value: "transfer" },
])

const bayarOptions = ref([
    { label: "Dengan Gaya", value: "gaya" },
    { label: "Dengan Kakean Gaya", value: "gayanan" },
])

const penjaminOptions = ref([
    { label: "BPJS", value: "bpjs" }
])

const instalasiOptions = ref([
    { label: "Instalasi Otak A", value: "ngotak" }
])
</script>

<template>
    <Dialog :visible="props.visible" @update:visible="(val) => emit('update:visible', val)" modal
        header="Tambah Data Potensi Pelayanan" :closable="false" :style="{ width: '50rem' }">
        <div class="flex items-center mb-4">
            <label for="nama" class="w-40 font-semibold">Cara Bayar</label>
            <Dropdown id="metode" v-model="selectedMetode" :options="bayarOptions" optionLabel="label"
                optionValue="value" placeholder="Pilih Cara Bayar" class="flex-1" />
        </div>
        <div class="flex items-center mb-4">
            <label for="nama" class="w-40 font-semibold">Penjamin</label>
            <Dropdown id="metode" v-model="selectedMetode" :options="penjaminOptions" optionLabel="label"
                optionValue="value" placeholder="Pilih Penjamin" class="flex-1" />
        </div>
        <div class="flex items-center mb-4">
    <label for="tglDokumen" class="w-40 font-semibold">Tgl. Dokumen</label>
    <Calendar 
        id="tglDokumen" 
        v-model="tglDokumen" 
        class="flex-1"
        dateFormat="dd-mm-yy" 
        showIcon
    />
</div>
        <div class="flex items-center mb-4">
            <label for="nama" class="w-40 font-semibold">No. Dokumen</label>
            <InputText id="nama" v-model="noDokumen" class="flex-1" />
        </div>
        <div class="flex items-center mb-4">
            <label for="nama" class="w-40 font-semibold">Pasien</label>
            <InputText id="nama" v-model="pasien" class="flex-1" />
        </div>
        <div class="flex items-center mb-4">
            <label for="nama" class="w-40 font-semibold">Uraian</label>
            <InputText id="nama" v-model="uraian" class="flex-1" />
        </div>
        <div class="flex items-center mb-4">
            <label for="nama" class="w-40 font-semibold">Instalasi</label>
            <Dropdown id="metode" v-model="selectedMetode" :options="instalasiOptions" optionLabel="label"
                optionValue="value" placeholder="Pilih Instalasi" class="flex-1" />
        </div>
        <div class="flex items-center mb-4">
            <label for="nama" class="w-40 font-semibold">Metode Bayar</label>
            <Dropdown id="metode" v-model="selectedMetode" :options="metodeOptions" optionLabel="label"
                optionValue="value" placeholder="Pilih Metode Bayar" class="flex-1" />
        </div>
        <div class="flex items-center mb-4">
            <label for="nama" class="w-40 font-semibold">Jumlah Bruto</label>
            <InputText id="nama" v-model="jumlahBruto" class="flex-1" />
        </div>
        <div class="flex items-center mb-4">
            <label for="nama" class="w-40 font-semibold">Biaya Admin</label>
            <InputText id="nama" v-model="biayaAdmin" class="flex-1" placeholder="0" />
        </div>
        <div class="flex justify-start gap-2">
            <Button label="Simpan" icon="pi pi-check" @click="handleSave" />
            <Button label="Tutup" icon="pi pi-times" severity="secondary" @click="closeModal" />

        </div>
    </Dialog>
</template>