export async function openPaystackPopup({ email, amountKobo, reference, metadata }) {
  const key = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
  if (!key) throw new Error('NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY is not set')

  // Dynamically import to ensure Window object exists (Client-side only)
  const PaystackModule = await import('@paystack/inline-js')
  const PaystackPop = PaystackModule.default || PaystackModule

  return new Promise((resolve, reject) => {
    try {
      const paystack = new PaystackPop()
      paystack.newTransaction({
        key,
        email,
        amount: Math.round(amountKobo), // ensure exact integer
        reference,
        currency: 'NGN',
        metadata: metadata || {},
        onSuccess(response) {
          resolve(response)
        },
        onCancel() {
          resolve(null)
        },
        onError(error) {
          reject(error instanceof Error ? error : new Error('Paystack error'))
        }
      })
    } catch (err) {
      reject(err)
    }
  })
}
