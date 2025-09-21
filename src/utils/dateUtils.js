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
