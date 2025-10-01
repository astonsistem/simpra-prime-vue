import { ref } from "vue";


export default function useImportBankPilihan () {
  const items = ref([])

  async function preview ({bank, file}) {

  }

  return {
    items,
    preview
  }
}