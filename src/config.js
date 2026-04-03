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

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
