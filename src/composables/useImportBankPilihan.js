import { ref } from "vue";
import * as XLSX from 'xlsx';
import api from '@/api/client.js';
import { useToast } from 'primevue/usetoast';
import { formatDateToYYYYMMDD, parseExcelDate } from '@/utils/dateUtils';

export default function useImportBankPilihan() {
  const items = ref([])
  const toast = useToast()
  const previewData = ref([])

  // Bank transformers - setiap bank memiliki transformer sendiri
  const bankTransformers = {
    'JATIM': transformJatimExcel,
    'BANK JATIM': transformJatimExcel,
    'MANDIRI': transformMandiriExcel,
    'BCA': transformBcaExcel,
    'BNI': transformBniExcel,
    'BRI': transformBriExcel,
    'DEFAULT': transformDefaultExcel
  }

  async function preview({ bank, file }) {
    try {
      // Reset items
      items.value = []
      
      // Read Excel file
      const data = await readExcelFile(file)
      
      // Get bank name from bank ID
      const bankName = await getBankName(bank)
      
      // Transform data based on bank transformer
      const transformedData = transformExcelData(data, bankName)
      
      // Filter only rows with valid date
      const filteredData = transformedData.filter(row => row.tgl_rc && row.tgl_rc !== '')
      
      items.value = filteredData
      previewData.value = filteredData
      
      toast.add({
        severity: 'success',
        summary: 'Preview Berhasil',
        detail: `Berhasil memuat ${filteredData.length} data dari file Excel`,
        life: 3000
      })
      
    } catch (error) {
      console.error('Error during preview:', error)
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Gagal memproses file Excel. Pastikan format file sesuai.',
        life: 3000
      })
      throw error
    }
  }

  async function sync() {
    try {
      if (previewData.value.length === 0) {
        throw new Error('Tidak ada data untuk disinkronisasi')
      }

      // Format tgl_rc sebelum dikirim ke backend
      const formattedData = previewData.value

      // Send data to backend for import
      const response = await api.post('/rekening_koran/import', {
        data: formattedData
      })

      toast.add({
        severity: 'success',
        summary: 'Sinkronisasi Berhasil',
        detail: `Berhasil menyimpan ${previewData.value.length} data ke database`,
        life: 3000
      })

      // Reset data after successful sync
      resetData()
      
      return response
    } catch (error) {
      console.error('Error during sync:', error)
      toast.add({
        severity: 'error',
        summary: 'Error Sinkronisasi',
        detail: error.response?.data?.message || 'Gagal menyimpan data ke database',
        life: 3000
      })
      throw error
    }
  }

  function readExcelFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result)
          const workbook = XLSX.read(data, { type: 'array' })
          
          // Get first worksheet
          const firstSheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[firstSheetName]
          
          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
          
          resolve(jsonData)
        } catch (error) {
          reject(error)
        }
      }
      
      reader.onerror = () => reject(new Error('Gagal membaca file'))
      reader.readAsArrayBuffer(file)
    })
  }

  async function getBankName(bankId) {
    try {
      // Get bank data from API
      const response = await api.get('/bank/list')
      if (response.data && response.data.data) {
        const bank = response.data.data.find(b => b.bank_id == bankId)
        if (bank) {
          return bank.bank_nama.toUpperCase()
        }
      }
      
      // Fallback mapping jika API gagal
      const bankNames = {
        '1': 'JATIM',
        '2': 'MANDIRI', 
        '3': 'BCA',
        '4': 'BNI',
        '5': 'BRI'
      }
      return bankNames[bankId] || 'JATIM' // Default ke JATIM untuk testing
    } catch (error) {
      console.error('Error getting bank name:', error)
      // Default ke JATIM jika ada error
      return 'JATIM'
    }
  }

  function transformExcelData(excelData, bankName) {
    if (!excelData || excelData.length === 0) {
      return []
    }

    // Get transformer for this bank
    let transformer = bankTransformers[bankName]
    if (!transformer) {
      console.warn(`Transformer untuk bank ${bankName} tidak ditemukan, menggunakan transformer DEFAULT`)
      transformer = bankTransformers['DEFAULT']
    }

    return transformer(excelData, bankName)
  }

  // ===========================================
  // BANK TRANSFORMERS
  // ===========================================

  /**
   * Transformer untuk Bank JATIM
   * Format: Post Date | Effective Date | Account | Name | Description | Currency | Debit | Credit | Balance | Reference No
   */
  function transformJatimExcel(excelData, bankName) {
    const headers = excelData[0]
    const dataRows = excelData.slice(1)
    
    const mapping = {
      'Post Date': 'tgl_rc',
      'Account': 'rek_dari', 
      'Name': 'nama_dari',
      'Description': 'uraian',
      'Debit': 'debit',
      'Credit': 'kredit',
      'Reference No': 'no_rc'
    }

    return dataRows.map((row, index) => {
      const transformedRow = {
        id: index + 1,
        bank: bankName,
        tgl: new Date().toISOString().split('T')[0]
      }

      headers.forEach((header, colIndex) => {
        const fieldName = mapping[header]
        if (fieldName && row[colIndex] !== undefined && row[colIndex] !== null) {
          let value = row[colIndex]
          
          if (fieldName === 'tgl_rc' && value) {
            transformedRow[fieldName] = parseExcelDate(value)
          } else if (fieldName === 'debit' || fieldName === 'kredit') {
            transformedRow[fieldName] = parseFloat(value) || 0
          } else if (fieldName === 'no_rc' && value) {
            transformedRow[fieldName] = value.toString()
          } else {
            transformedRow[fieldName] = value
          }
        }
      })

      return transformedRow
    })
  }

  /**
   * Transformer untuk Bank Mandiri
   * TODO: Sesuaikan dengan format Excel Bank Mandiri
   */
  function transformMandiriExcel(excelData, bankName) {
    const headers = excelData[0]
    const dataRows = excelData.slice(1)
    
    // TODO: Mapping sesuai format Bank Mandiri
    const mapping = {
      'Tanggal': 'tgl_rc',
      'Keterangan': 'uraian',
      'Debet': 'debit',
      'Kredit': 'kredit',
      'No Referensi': 'no_rc'
    }

    return dataRows.map((row, index) => {
      const transformedRow = {
        id: index + 1,
        bank: bankName,
        tgl: new Date().toISOString().split('T')[0]
      }

      headers.forEach((header, colIndex) => {
        const fieldName = mapping[header]
        if (fieldName && row[colIndex] !== undefined && row[colIndex] !== null) {
          let value = row[colIndex]
          
          if (fieldName === 'tgl_rc' && value) {
            transformedRow[fieldName] = parseExcelDate(value)
          } else if (fieldName === 'debit' || fieldName === 'kredit') {
            transformedRow[fieldName] = parseFloat(value) || 0
          } else {
            transformedRow[fieldName] = value
          }
        }
      })

      return transformedRow
    })
  }

  /**
   * Transformer untuk Bank BCA
   * TODO: Sesuaikan dengan format Excel Bank BCA
   */
  function transformBcaExcel(excelData, bankName) {
    const headers = excelData[0]
    const dataRows = excelData.slice(1)
    
    // TODO: Mapping sesuai format Bank BCA
    const mapping = {
      'Date': 'tgl_rc',
      'Description': 'uraian',
      'Debit': 'debit',
      'Credit': 'kredit',
      'Reference': 'no_rc'
    }

    return dataRows.map((row, index) => {
      const transformedRow = {
        id: index + 1,
        bank: bankName,
        tgl: new Date().toISOString().split('T')[0]
      }

      headers.forEach((header, colIndex) => {
        const fieldName = mapping[header]
        if (fieldName && row[colIndex] !== undefined && row[colIndex] !== null) {
          let value = row[colIndex]
          
          if (fieldName === 'tgl_rc' && value) {
            transformedRow[fieldName] = parseExcelDate(value)
          } else if (fieldName === 'debit' || fieldName === 'kredit') {
            transformedRow[fieldName] = parseFloat(value) || 0
          } else {
            transformedRow[fieldName] = value
          }
        }
      })

      return transformedRow
    })
  }

  /**
   * Transformer untuk Bank BNI
   * TODO: Sesuaikan dengan format Excel Bank BNI
   */
  function transformBniExcel(excelData, bankName) {
    const headers = excelData[0]
    const dataRows = excelData.slice(1)
    
    // TODO: Mapping sesuai format Bank BNI
    const mapping = {
      'Tanggal': 'tgl_rc',
      'Keterangan': 'uraian',
      'Debit': 'debit',
      'Kredit': 'kredit',
      'No Ref': 'no_rc'
    }

    return dataRows.map((row, index) => {
      const transformedRow = {
        id: index + 1,
        bank: bankName,
        tgl: new Date().toISOString().split('T')[0]
      }

      headers.forEach((header, colIndex) => {
        const fieldName = mapping[header]
        if (fieldName && row[colIndex] !== undefined && row[colIndex] !== null) {
          let value = row[colIndex]
          
          if (fieldName === 'tgl_rc' && value) {
            transformedRow[fieldName] = parseExcelDate(value)
          } else if (fieldName === 'debit' || fieldName === 'kredit') {
            transformedRow[fieldName] = parseFloat(value) || 0
          } else {
            transformedRow[fieldName] = value
          }
        }
      })

      return transformedRow
    })
  }

  /**
   * Transformer untuk Bank BRI
   * TODO: Sesuaikan dengan format Excel Bank BRI
   */
  function transformBriExcel(excelData, bankName) {
    const headers = excelData[0]
    const dataRows = excelData.slice(1)
    
    // TODO: Mapping sesuai format Bank BRI
    const mapping = {
      'Tanggal': 'tgl_rc',
      'Keterangan': 'uraian',
      'Debit': 'debit',
      'Kredit': 'kredit',
      'No Referensi': 'no_rc'
    }

    return dataRows.map((row, index) => {
      const transformedRow = {
        id: index + 1,
        bank: bankName,
        tgl: new Date().toISOString().split('T')[0]
      }

      headers.forEach((header, colIndex) => {
        const fieldName = mapping[header]
        if (fieldName && row[colIndex] !== undefined && row[colIndex] !== null) {
          let value = row[colIndex]
          
          if (fieldName === 'tgl_rc' && value) {
            transformedRow[fieldName] = parseExcelDate(value)
          } else if (fieldName === 'debit' || fieldName === 'kredit') {
            transformedRow[fieldName] = parseFloat(value) || 0
          } else {
            transformedRow[fieldName] = value
          }
        }
      })

      return transformedRow
    })
  }

  /**
   * Default transformer untuk bank yang belum memiliki transformer khusus
   * Menggunakan format yang sama dengan Bank JATIM
   */
  function transformDefaultExcel(excelData, bankName) {
    return transformJatimExcel(excelData, bankName)
  }


  function resetData() {
    items.value = []
    previewData.value = []
  }

  return {
    items,
    preview,
    sync,
    resetData
  }
}