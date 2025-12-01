<template>
  <Dialog
    :visible="modelValue"
    @update:visible="$emit('update:modelValue', $event)"
    modal
    :header="`Aksi PB Rekening Koran - ID Transaksi #${item?.rc_id || ''}`"
    :style="{ width: '95vw', maxWidth: '1300px' }"
    :closable="true"
  >
    <div v-if="loading" class="flex justify-center items-center py-8">
      <ProgressSpinner />
    </div>

    <div v-else>
      <TabView v-model:activeIndex="activeTab">
        <!-- Tab 1: Edit Form -->
        <TabPanel header="Ubah ID Transaksi">
          <div class="w-full sm:w-3/4 md:w-2/3 lg:w-1/2">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
              <label class="block font-semibold">No. RC</label>
              <div class="sm:col-span-2">
                <InputText v-model="formData.no_rc" disabled class="w-full" />
              </div>
              <label class="block font-semibold">Tgl. RC</label>
              <div class="sm:col-span-2">
                <InputText v-model="formData.tgl_rc" disabled class="w-full" />
              </div>
              <label class="block font-semibold">Uraian</label>
              <div class="sm:col-span-2">
                <Textarea v-model="formData.uraian" disabled class="w-full" rows="3" />
              </div>
              <label class="block font-semibold">Bank</label>
              <div class="sm:col-span-2">
                <InputText v-model="formData.bank" disabled class="w-full" />
              </div>
              <label class="block font-semibold">Kredit</label>
              <div class="sm:col-span-2">
                <InputNumber
                  v-model="formData.kredit"
                  disabled
                  class="w-full"
                  mode="currency"
                  currency="IDR"
                  locale="id-ID"
                />
              </div>
              <label class="block font-semibold">Mutasi</label>
              <div class="col-span-2">
                <Checkbox v-model="formData.mutasi" :binary="true" />
              </div>
              <label class="block font-semibold">PB dari Bank</label>
              <div class="col-span-2">
                <Select
                  v-model="formData.pb_dari"
                  :options="filteredBankOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Pilih Bank"
                  class="w-full"
                  showClear
                />
              </div>
            </div>
          </div>
        </TabPanel>

        <!-- Tab 2: Linked Records -->
        <TabPanel header="Mutasi bank yang dimasukkan">
          <div class="min-h-[458px] w-full">

            <DataTable
              :value="linkedRecords"
              :loading="loading"
              paginator
              :rows="10"
              :rowsPerPageOptions="[5, 10, 20]"
              responsiveLayout="scroll"
              class="p-datatable-sm text-sm"
            >
              <template #empty>
                <div class="flex items-center justify-center text-gray-500 py-4">
                  <i class="pi pi-info-circle mr-2"></i>
                  <p>Tidak ada mutasi yang ditautkan</p>
                </div>
              </template>
  
              <Column field="no_rc" header="No. RC" />
              <Column field="tgl_rc" header="Tgl. RC" />
              <Column field="uraian" header="Uraian">
                <template #body="{ data }">
                  <div :title="data.uraian">
                    {{ data.uraian.length > 30 ? data.uraian.slice(0, 30) + '...' : data.uraian }}
                  </div>
                </template>
              </Column>
              <Column field="kredit" header="Kredit" style="text-align: right">
                <template #body="{ data }">
                  {{ formatCurrency(data.kredit) }}
                </template>
              </Column>
              <Column field="bank" header="Bank" />
              <Column field="mutasi" header="Mutasi">
                <template #body="{ data }">
                  <Checkbox v-model="data.mutasi" :binary="true" disabled />
                </template>
              </Column>
              <Column field="pb_dari" header="PB dari Bank" />
              <Column header="Action" style="width: 120px">
                <template #body="{ data }">
                  <Button
                    label="Batalkan"
                    icon="pi pi-times"
                    severity="danger"
                    size="small"
                    @click="handleCancelLink(data)"
                  />
                </template>
              </Column>
            </DataTable>
          </div>
        </TabPanel>

        <!-- Tab 3: Unlinked Records -->
        <TabPanel header="Mutasi bank yang belum dimasukkan">
          <DataTable
            :value="unlinkedRecords"
            :loading="loadingUnlinked"
            paginator
            lazy
            :first="unlinkedFirst"
            :rows="unlinkedPerPage"
            :totalRecords="unlinkedTotal"
            @page="onUnlinkedPageChange"
            :rowsPerPageOptions="[5, 10, 20]"
            responsiveLayout="scroll"
            class="p-datatable-sm text-sm"
          >
            <template #empty>
              <div class="flex items-center justify-center text-gray-500 py-4">
                <i class="pi pi-info-circle mr-2"></i>
                <p>Tidak ada mutasi yang tersedia</p>
              </div>
            </template>

            <Column field="no_rc" header="No. RC" />
            <Column field="tgl_rc" header="Tgl. RC" style="width: 8rem" />
            <!-- truncate uraian karena panjangnya terlalu panjang with add ..., when it hovered it will show the full text -->
            <Column field="uraian" header="Uraian">
              <template #body="{ data }">
                <div :title="data.uraian">
                  {{ data.uraian?.length > 30 ? data.uraian.slice(0, 30) + '...' : data.uraian ?? '-' }}
                </div>
              </template>
            </Column>
            <Column field="kredit" header="Kredit" style="text-align: right; width: 10rem">
              <template #body="{ data }">
                {{ formatCurrency(data.kredit) }}
              </template>
            </Column>
            <Column field="bank" header="Bank" />
            <Column field="mutasi" header="Mutasi">
              <template #body="{ data }">
                <Checkbox v-model="data.mutasi" :binary="true" disabled />
              </template>
            </Column>
            <Column field="pb_dari" header="PB dari Bank" />
            <Column header="Action" style="width: 120px">
              <template #body="{ data }">
                <Button
                  label="Daftarkan"
                  icon="pi pi-check"
                  severity="success"
                  size="small"
                  @click="handleLink(data)"
                />
              </template>
            </Column>
          </DataTable>
        </TabPanel>
      </TabView>
    </div>

    <template #footer>
      <div class="flex gap-2 mx-auto">
        <Button label="Batal" severity="secondary" @click="handleCancel" />
        <Button label="Simpan" severity="primary" @click="handleSave" :loading="loading" />
      </div>
    </template>
  </Dialog>

  <!-- Confirmation Dialog for Cancel Link -->
  <Dialog
    v-model:visible="showCancelConfirm"
    modal
    header="Konfirmasi Batalkan"
    :style="{ width: '400px' }"
  >
    <p>Apakah Anda yakin ingin membatalkan penandaan PB untuk mutasi ini?</p>
    <template #footer>
      <Button label="Tidak" severity="secondary" @click="showCancelConfirm = false" />
      <Button label="Ya, Batalkan" severity="danger" @click="confirmCancelLink" />
    </template>
  </Dialog>

  <!-- Confirmation Dialog for Link -->
  <Dialog
    v-model:visible="showLinkConfirm"
    modal
    header="Konfirmasi Daftarkan"
    :style="{ width: '400px' }"
  >
    <p>Apakah Anda yakin ingin menautkan mutasi ini dengan Bank Jatim?</p>
    <template #footer>
      <Button label="Tidak" severity="secondary" @click="showLinkConfirm = false" />
      <Button label="Ya, Daftarkan" severity="success" @click="confirmLink" />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { formatCurrency } from '@/utils/utils'
import useRekeningKoranPb from '@/composables/useRekeningKoranPb'
import useBankTujuan from '@/composables/useBankTujuan'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  item: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'saved'])

const activeTab = ref(0)
const formData = ref({
  no_rc: '',
  tgl_rc: '',
  uraian: '',
  bank: '',
  kredit: 0,
  mutasi: false,
  pb_dari: ''
})

const showCancelConfirm = ref(false)
const showLinkConfirm = ref(false)
const selectedRecord = ref(null)

const {
  loading,
  loadingUnlinked,
  pbData,
  linkedRecords,
  unlinkedRecords,
  unlinkedTotal,
  unlinkedPage,
  unlinkedFirst,
  unlinkedPerPage,
  getPbData,
  getUnlinkedRecords,
  updatePb,
  linkPb,
  cancelPb
} = useRekeningKoranPb()

const { options: bankOptions, fetchList: fetchBankList } = useBankTujuan()

// Filter out JATIM from bank options
const filteredBankOptions = computed(() => {
  return bankOptions.value.filter(bank => bank.value.toUpperCase() !== 'JATIM')
})

watch(
  () => props.modelValue,
  async (newVal) => {
    if (newVal && props.item) {
      await loadData()
    }
  }
)

// Watch for pb_dari changes to refresh unlinked records
watch(
  () => formData.value.pb_dari,
  async (newPbDari) => {
    if (props.modelValue && props.item) {
      // Refresh unlinked records when pb_dari changes
      unlinkedFirst.value = 0
      unlinkedPerPage.value = 10
      await getUnlinkedRecords(props.item.tgl_rc, newPbDari, 1, 10)
    }
  }
)

const loadData = async () => {
  if (!props.item?.rc_id) return

  try {
    // Fetch bank list
    await fetchBankList()

    // Fetch PB data and linked records
    await getPbData(props.item.rc_id)

    // Populate form data
    formData.value = {
      no_rc: pbData.value?.no_rc || props.item.no_rc,
      tgl_rc: pbData.value?.tgl_rc || props.item.tgl_rc,
      uraian: pbData.value?.uraian || props.item.uraian,
      bank: pbData.value?.bank || props.item.bank,
      kredit: pbData.value?.kredit || props.item.kredit,
      mutasi: pbData.value?.mutasi || false,
      pb_dari: pbData.value?.pb_dari || props.item.pb_dari || ''
    }

    // Fetch unlinked records with pb_dari filter
    unlinkedFirst.value = 0
    unlinkedPerPage.value = 10
    await getUnlinkedRecords(props.item.tgl_rc, formData.value.pb_dari, 1, 10)
  } catch (error) {
    console.error('Error loading PB data:', error)
  }
}

const onUnlinkedPageChange = async (event) => {
  unlinkedFirst.value = event.first
  const page = event.page + 1
  const perPage = event.rows

  await getUnlinkedRecords(
    props.item.tgl_rc,
    formData.value.pb_dari,
    page,
    perPage
  )
}

const handleCancelLink = (record) => {
  selectedRecord.value = record
  showCancelConfirm.value = true
}

const confirmCancelLink = async () => {
  try {
    await cancelPb(selectedRecord.value.rc_id)
    showCancelConfirm.value = false
    selectedRecord.value = null
    // Reload data
    await loadData()
  } catch (error) {
    console.error('Error canceling link:', error)
  }
}

const handleLink = (record) => {
  selectedRecord.value = record
  showLinkConfirm.value = true
}

const confirmLink = async () => {
  try {
    await linkPb(selectedRecord.value.rc_id, props.item.rc_id)
    showLinkConfirm.value = false
    selectedRecord.value = null
    // Reload data
    await loadData()
  } catch (error) {
    console.error('Error linking:', error)
  }
}

const handleSave = async () => {
  try {
    await updatePb(props.item.rc_id, {
      mutasi: formData.value.mutasi,
      pb_dari: formData.value.pb_dari
    })
    emit('saved')
    // emit('update:modelValue', false)
  } catch (error) {
    console.error('Error saving PB:', error)
  }
}

const handleCancel = () => {
  emit('update:modelValue', false)
}
</script>

<style scoped>
.field {
  margin-bottom: 1rem;
}

.field label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}
</style>
