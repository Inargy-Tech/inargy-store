export const SITE = {
  name: 'Inargy Store',
  company: 'Inargy Technologies',
  url: 'https://store.inargy.tech',
  marketingSite: 'https://inargy.tech',
}

export const CONTACT = {
  email: 'hello@inargy.tech',
  phone: '+234 (0) 813 596 4676',
  phoneTel: 'tel:+2348135964676',
  whatsapp: 'https://wa.me/2348135964676',
}

export function formatNaira(kobo) {
  if (kobo == null || (typeof kobo !== 'number') || !isFinite(kobo)) return '—'
  const naira = kobo / 100
  return '₦' + naira.toLocaleString('en-NG')
}

/**
 * Compact number formatter: rounds to 1 decimal place with k/M/B/T suffix.
 * e.g. 75000 → "75k", 1150000 → "1.2M", 2300000000 → "2.3B"
 */
export function formatCompact(value) {
  if (value == null || !isFinite(value)) return '—'
  const abs = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  const tiers = [
    { threshold: 1e12, suffix: 'T' },
    { threshold: 1e9,  suffix: 'B' },
    { threshold: 1e6,  suffix: 'M' },
    { threshold: 1e3,  suffix: 'k' },
  ]
  for (const { threshold, suffix } of tiers) {
    if (abs >= threshold) {
      const rounded = Math.ceil((abs / threshold) * 100) / 100
      const formatted = rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(2)
      return `${sign}${formatted}${suffix}`
    }
  }
  return `${sign}${abs}`
}

/**
 * Compact Naira formatter: converts kobo → Naira then applies compact notation.
 * e.g. 115000000 kobo (₦1,150,000) → "₦1.2M"
 */
export function formatNairaCompact(kobo) {
  if (kobo == null || !isFinite(kobo)) return '—'
  return '₦' + formatCompact(kobo / 100)
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
