export const formatDate = (value) => {
  if (value) {
    return new Date(value).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }
  return ''
}

export const formatDateToYYYYMMDD = (date) => {
  if (!date) return null
 
  if (date.toString().includes('/')) {
    return formatFromDDMMYYYYtoYYYYMMDD(date)
  }

  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatFromDDMMYYYYtoYYYYMMDD(dateString) {
  const [day, month, year] = dateString.split('/')
  return `${year}-${month}-${day}`
}

/**
 * Parse various Excel date formats to YYYY-MM-DD format
 * Supports:
 * - Excel serial numbers (44927 -> 2023-01-16)
 * - DD/MM/YYYY format (16/01/2023 -> 2023-01-16)
 * - DD/MM/YYYY HH:mm format (16/01/2023 16:30 -> 2023-01-16)
 * - DD-MM-YYYY format (16-01-2023 -> 2023-01-16)
 * - DD-MM-YYYY HH:mm format (16-01-2023 16:30 -> 2023-01-16)
 * - Standard date formats
 */
export function parseExcelDate(value) {
  if (typeof value === 'number') {
    // Excel date serial number
    const excelDate = new Date((value - 25569) * 86400 * 1000)
    return excelDate.toISOString().split('T')[0]
  } else if (typeof value === 'string') {
    // Handle format DD/MM/YYYY HH:mm atau DD/MM/YYYY
    const ddmmyyyyPattern = /^(\d{1,2})\/(\d{1,2})\/(\d{4})(\s+\d{1,2}:\d{2})?$/
    const ddmmyyyyMatch = value.match(ddmmyyyyPattern)
    
    if (ddmmyyyyMatch) {
      const day = ddmmyyyyMatch[1].padStart(2, '0')
      const month = ddmmyyyyMatch[2].padStart(2, '0')
      const year = ddmmyyyyMatch[3]
      return `${year}-${month}-${day}`
    }
    
    // Handle format DD-MM-YYYY atau DD-MM-YYYY HH:mm
    const ddmmyyyyDashPattern = /^(\d{1,2})-(\d{1,2})-(\d{4})(\s+\d{1,2}:\d{2})?$/
    const ddmmyyyyDashMatch = value.match(ddmmyyyyDashPattern)
    
    if (ddmmyyyyDashMatch) {
      const day = ddmmyyyyDashMatch[1].padStart(2, '0')
      const month = ddmmyyyyDashMatch[2].padStart(2, '0')
      const year = ddmmyyyyDashMatch[3]
      return `${year}-${month}-${day}`
    }
    
    // Try to parse standard date formats
    const parsedDate = new Date(value)
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate.toISOString().split('T')[0]
    } else {
      return value
    }
  }
  return value
}
