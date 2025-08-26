import _ from 'lodash'

export const explodeParams = (params) => {
  if (!params) return ''
  let text = ''
  text = _.entries(params)
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
