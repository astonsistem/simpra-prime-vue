import { entries, snakeCase } from 'lodash'
import * as XLSX from 'xlsx'

export const explodeParams = (params) => {
  if (!params) return ''
  let text = ''
  text = entries(params)
    .map((item) => item.join('='))
    .join('&')
  return text
}

export const formatCurrency = (value, type = 'id-ID', currency = 'IDR') => {
  if (value === null || value === undefined) return '0'
  return new Intl.NumberFormat(type, {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(value)
}

export function isCaptchaEnabled() {
  const val = import.meta.env.VITE_ENABLED_CAPTCHA;
  if (typeof val === 'undefined') return true;
  return val !== 'false';
}

export function exportExcel(modul, data = [], headers = []) {
  return new Promise((resolve, reject) => {
    try {
      const excelData = data
      const workbook = XLSX.utils.book_new()
      const worksheet = XLSX.utils.aoa_to_sheet([headers, ...excelData])
      worksheet['!cols'] = Array(headers.length).fill({ wch: 15 })
      XLSX.utils.book_append_sheet(workbook, worksheet, modul)
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute(
        'download',
        `${snakeCase(modul)}_${new Date().toISOString().split('T')[0]}.xlsx`
      )
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      resolve(url)
      
    } catch (error) {
      console.error(`[${modul}] - Gagal mengekspor data ke Excel:`, error)
      reject(error)
    }
  })
}