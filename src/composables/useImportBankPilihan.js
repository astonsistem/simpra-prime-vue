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
    'BANK MANDIRI': transformMandiriExcel,
    'BCA': transformBcaExcel,
    'BANK BCA': transformBcaExcel,
    'BNI': transformBniExcel,
    'BANK BNI': transformBniExcel,
    'BRI': transformBriExcel,
    'BANK BRI': transformBriExcel,
    'DEFAULT': transformDefaultExcel
  }

  async function preview({ bank, file }) {
    try {
      // Reset items
      items.value = []
      
      // Read Excel file
      const data = await readExcelFile(file)
      console.log('data from excel: ', data)
      
      // Get bank name from bank ID
      const bankName = await getBankName(bank)
      
      // Transform data based on bank transformer
      const transformedData = transformExcelData(data, bankName)
      console.log('transformedData', transformedData)
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
        bank: 'JATIM',
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
          } else if (['no_rc', 'rek_dari', 'nama_dari'].includes(fieldName) && value) {
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
   * Format: Tgl. | Tgl. Val. | Rincian Transaksi | No. Referensi | Debit | Kredit | Saldo | Branch Code
   */
  function transformMandiriExcel(excelData, bankName) {
    const headers = excelData[0]
    const dataRows = excelData.slice(1)
    
    const mapping = {
      'Tgl.': 'tgl_rc',
      'Rincian Transaksi': 'uraian',
      'No. Referensi': 'no_rc',
      'Debit': 'debit',
      'Kredit': 'kredit',
      'Branch Code': 'rek_dari'
    }

    return dataRows.map((row, index) => {
      const transformedRow = {
        id: index + 1,
        bank: 'MANDIRI',
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
          } else if (['no_rc', 'rek_dari', 'nama_dari'].includes(fieldName) && value) {
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
   * Transformer untuk Bank BCA
   * Format: Tanggal Transaksi | Keterangan | Cabang | jumlah
   * Special: kolom 'jumlah' mengandung DB/CR yang menentukan debit/kredit
   */
  function transformBcaExcel(excelData, bankName) {
    const headers = excelData[0]
    const dataRows = excelData.slice(1)
    
    const mapping = {
      'Tanggal Transaksi': 'tgl_rc',
      'Keterangan': 'uraian'
    }

    return dataRows.map((row, index) => {
      const transformedRow = {
        id: index + 1,
        bank: 'BCA',
        tgl: new Date().toISOString().split('T')[0],
        no_rc: `BCA-${Date.now()}-${index + 1}`, // Generate unique reference
        debit: 0,
        kredit: 0
      }

      headers.forEach((header, colIndex) => {
        const fieldName = mapping[header]
        let value = row[colIndex]
        
        if (fieldName && value !== undefined && value !== null) {
          if (fieldName === 'tgl_rc' && value) {
            transformedRow[fieldName] = parseExcelDate(value)
          } else if (['no_rc', 'rek_dari', 'nama_dari'].includes(fieldName) && value) {
            transformedRow[fieldName] = value.toString()
          } else {
            transformedRow[fieldName] = value
          }
        }
        
        // Handle special 'jumlah' column with DB/CR logic
        if (header.toLowerCase() === 'jumlah' && value !== undefined && value !== null) {
          const valueStr = value.toString().toUpperCase()
          
          // Extract numeric value - handle Indonesian format (99.000,00) and English format (99,000.00)
          let cleanValue = valueStr
          
          // Remove DB/CR indicators first
          cleanValue = cleanValue.replace(/\s*(DB|CR)\s*/g, '')
          
          // Check if it's Indonesian format (dot as thousand separator, comma as decimal)
          if (cleanValue.includes('.') && cleanValue.includes(',')) {
            // Indonesian format: 99.000,00 -> remove dots, replace comma with dot
            cleanValue = cleanValue.replace(/\./g, '').replace(',', '.')
          } else if (cleanValue.includes(',') && !cleanValue.includes('.')) {
            // Could be Indonesian format without decimal: 99.000 or English with comma: 99,000
            // Check if comma is followed by 2 digits (decimal) or 3 digits (thousand separator)
            const commaIndex = cleanValue.lastIndexOf(',')
            const afterComma = cleanValue.substring(commaIndex + 1)
            if (afterComma.length === 2) {
              // Indonesian decimal: 99.000,00
              cleanValue = cleanValue.replace(/\./g, '').replace(',', '.')
            } else {
              // English thousand separator: 99,000
              cleanValue = cleanValue.replace(/,/g, '')
            }
          } else if (cleanValue.includes('.')) {
            // Could be Indonesian thousand separator (99.000) or English decimal (99.00)
            const dotIndex = cleanValue.lastIndexOf('.')
            const afterDot = cleanValue.substring(dotIndex + 1)
            if (afterDot.length === 3) {
              // Indonesian thousand separator: 99.000
              cleanValue = cleanValue.replace(/\./g, '')
            }
            // Otherwise keep as is (English decimal)
          }
          
          // Remove any remaining non-numeric characters except dot and minus
          cleanValue = cleanValue.replace(/[^\d.-]/g, '')
          const amount = parseFloat(cleanValue) || 0
          
          // Check if value contains DB or CR indicator
          if (valueStr.includes('DB')) {
            transformedRow.debit = Math.abs(amount)
            transformedRow.kredit = 0
          } else if (valueStr.includes('CR')) {
            transformedRow.kredit = Math.abs(amount)
            transformedRow.debit = 0
          } else {
            // If no DB/CR indicator, check if it's a negative number
            if (amount < 0) {
              transformedRow.debit = Math.abs(amount)
              transformedRow.kredit = 0
            } else {
              transformedRow.kredit = amount
              transformedRow.debit = 0
            }
          }
        }
      })

      return transformedRow
    })
  }

  /**
   * Transformer untuk Bank BNI
   * Format: No. | Tanggal Kirim | Cabang | Journal No. | Deskripsi | Amount | Db/Cr
   * Special: kolom 'Db/Cr' menentukan apakah Amount masuk ke debit (D) atau kredit (C)
   */
  function transformBniExcel(excelData, bankName) {
    const headers = excelData[0]
    const dataRows = excelData.slice(1)
    
    const mapping = {
      'Tanggal Kirim': 'tgl_rc',
      'Cabang': 'nama_dari',
      'Journal No.': 'no_rc',
      'Deskripsi': 'uraian'
    }

    return dataRows.map((row, index) => {
      const transformedRow = {
        id: index + 1,
        bank: 'BNI',
        tgl: new Date().toISOString().split('T')[0],
        debit: 0,
        kredit: 0
      }

      let amountValue = null
      let dbCrIndicator = null

      headers.forEach((header, colIndex) => {
        const fieldName = mapping[header]
        let value = row[colIndex]
        
        if (fieldName && value !== undefined && value !== null) {
          if (fieldName === 'tgl_rc' && value) {
            transformedRow[fieldName] = parseExcelDate(value)
          } else if (['no_rc', 'rek_dari', 'nama_dari'].includes(fieldName) && value) {
            transformedRow[fieldName] = value.toString()
          } else {
            transformedRow[fieldName] = value
          }
        }

        // Capture Amount value
        if (header === 'Amount' && value !== undefined && value !== null) {
          amountValue = parseFloat(value) || 0
        }

        // Capture Db/Cr indicator (handle both 'Db/ Cr' and 'Db/Cr' formats)
        if ((header === 'Db/ Cr' || header === 'Db/Cr') && value !== undefined && value !== null) {
          dbCrIndicator = value.toString().toUpperCase()
        }
      })

      // Set debit or kredit based on Db/Cr indicator
      if (amountValue !== null && dbCrIndicator) {
        if (dbCrIndicator === 'D' || dbCrIndicator === 'DB') {
          transformedRow.debit = Math.abs(amountValue)
          transformedRow.kredit = 0
        } else if (dbCrIndicator === 'C' || dbCrIndicator === 'CR') {
          transformedRow.kredit = Math.abs(amountValue)
          transformedRow.debit = 0
        }
      }

      return transformedRow
    })
  }

  /**
   * Transformer untuk Bank BRI
   * Format: ID | NOREK | TGL_TRAN | TGL_EFEKTIF | JAM_TRAN | SEQ | DESK_TRAN | SALDO_AWAL_MUTASI | MUTASI_DEBET | MUTASI_KREDIT
   */
  function transformBriExcel(excelData, bankName) {
    const headers = excelData[0]
    const dataRows = excelData.slice(1)
    
    const mapping = {
      'TGL_TRAN': 'tgl_rc',
      'JAM_TRAN': 'no_rc',
      'DESK_TRAN': 'uraian',
      'MUTASI_DEBET': 'debit',
      'MUTASI_KREDIT': 'kredit'
    }

    return dataRows.map((row, index) => {
      const transformedRow = {
        id: index + 1,
        bank: 'BRI',
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
          } else if (['no_rc', 'rek_dari', 'nama_dari'].includes(fieldName) && value) {
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