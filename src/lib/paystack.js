const PAYSTACK_INLINE_URL = 'https://js.paystack.co/v1/inline.js'

let scriptPromise = null

function getNonce() {
  return document.querySelector('html')?.getAttribute('nonce') ?? undefined
}

function loadScript() {
  if (scriptPromise) return scriptPromise
  scriptPromise = new Promise((resolve, reject) => {
    if (window.PaystackPop) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = PAYSTACK_INLINE_URL
    script.async = true
    const nonce = getNonce()
    if (nonce) script.nonce = nonce
    script.onload = resolve
    script.onerror = () => reject(new Error('Failed to load Paystack'))
    document.head.appendChild(script)
  })
  return scriptPromise
}

export async function openPaystackPopup({ email, amountKobo, reference, metadata }) {
  await loadScript()

  const key = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
  if (!key) throw new Error('NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY is not set')

  return new Promise((resolve, reject) => {
    try {
      const handler = window.PaystackPop.setup({
        key,
        email,
        amount: amountKobo,
        ref: reference,
        currency: 'NGN',
        metadata: metadata || {},
        callback(response) {
          resolve(response)
        },
        onClose() {
          resolve(null)
        },
      })
      handler.openIframe()
    } catch (err) {
      reject(err)
    }
  })
}
