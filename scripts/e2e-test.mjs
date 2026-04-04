import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '..', 'e2e-output')
const BASE = 'http://localhost:3000'
const EMAIL = 'abayomi.ogunleye@gmail.com'
const PASSWORD = 'Admin$1234'

const results = []
function log(id, pass, detail) {
  results.push({ id, pass, detail })
  console.log(`${pass ? '✓' : '✗'} ${id}: ${detail}`)
}

async function shot(page, name) {
  fs.mkdirSync(OUT, { recursive: true })
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: true })
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } })
  const page = await ctx.newPage()

  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))

  try {
    // 1. Homepage
    console.log('\n--- 1. Homepage ---')
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 })
    await page.waitForTimeout(2000)
    await shot(page, '01-homepage')
    const productLinks = await page.locator('a[href^="/product/"]').count()
    log('1a. Products visible', productLinks > 0, `${productLinks} product links`)
    log('1b. Navbar visible', await page.locator('header').isVisible(), '')
    log('1c. Sign In link', await page.locator('[data-testid="navbar-signin"]').isVisible().catch(() => false), '')

    // 2. Catalog
    console.log('\n--- 2. Catalog ---')
    await page.goto(`${BASE}/catalog`, { waitUntil: 'networkidle', timeout: 60000 })
    await page.waitForTimeout(2000)
    await shot(page, '02-catalog')
    const catalogProducts = await page.locator('a[href^="/product/"]').count()
    log('2a. Catalog products', catalogProducts > 0, `${catalogProducts} products`)

    // 3. Product Detail
    console.log('\n--- 3. Product Detail ---')
    await page.locator('a[href^="/product/"]').first().click()
    await page.waitForURL(/\/product\//, { timeout: 30000 })
    await page.waitForTimeout(2000)
    await shot(page, '03-product-detail')
    log('3a. Product heading', await page.locator('h1').isVisible(), await page.locator('h1').textContent().catch(() => 'n/a'))
    const hasImg = await page.locator('img[alt]').first().isVisible().catch(() => false)
    const hasPlaceholder = await page.locator('[role="img"]').first().isVisible().catch(() => false)
    log('3b. Product image/placeholder', hasImg || hasPlaceholder, hasImg ? 'real image' : 'placeholder')

    // Add to cart
    const addBtn = page.getByRole('button', { name: /add to cart/i }).first()
    if (await addBtn.isVisible().catch(() => false)) {
      await addBtn.click()
      await page.waitForTimeout(1000)
      await shot(page, '03b-added-to-cart')
      log('3c. Add to cart', true, 'clicked')
    } else {
      log('3c. Add to cart', false, 'button not found')
    }

    // 4. Login
    console.log('\n--- 4. Login ---')
    await page.goto(`${BASE}/auth/login`, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(1000)
    await shot(page, '04-login-page')
    log('4a. Login form', await page.locator('#login-email').isVisible(), '')

    await page.fill('#login-email', EMAIL)
    await page.fill('#login-password', PASSWORD)
    await page.getByRole('button', { name: /^sign in$/i }).click()
    await page.waitForTimeout(6000)
    await shot(page, '04b-after-login')
    log('4b. Login redirect', !page.url().includes('/auth/login'), page.url())

    // Check user menu
    await page.goto(BASE, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(3000)
    await shot(page, '04c-user-menu')
    const userMenu = await page.getByRole('button', { name: /user menu/i }).isVisible().catch(() => false)
    log('4c. User menu visible', userMenu, '')

    // 5. Dashboard
    console.log('\n--- 5. Dashboard ---')
    await page.goto(`${BASE}/dashboard/orders`, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForTimeout(4000)
    await shot(page, '05-orders')
    log('5a. Orders page', await page.getByRole('heading', { name: /orders/i }).isVisible().catch(() => false), '')

    await page.goto(`${BASE}/dashboard/profile`, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForTimeout(4000)
    await shot(page, '05b-profile')
    log('5b. Profile page', await page.locator('#profile-fullName').isVisible().catch(() => false), '')

    // 6. Checkout
    console.log('\n--- 6. Checkout ---')
    await page.goto(BASE, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)
    await page.locator('a[href^="/product/"]').first().click()
    await page.waitForURL(/\/product\//, { timeout: 20000 })
    await page.waitForTimeout(1000)
    const addBtn2 = page.getByRole('button', { name: /add to cart/i }).first()
    if (await addBtn2.isVisible().catch(() => false)) {
      await addBtn2.click()
      await page.waitForTimeout(1000)
    }
    // Try to go to checkout directly
    await page.goto(`${BASE}/checkout`, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForTimeout(4000)
    await shot(page, '06-checkout')
    const checkoutForm = await page.locator('#checkout-fullName').isVisible().catch(() => false)
    log('6a. Checkout form', checkoutForm, '')
    const paymentRadios = await page.locator('input[name="paymentMethod"]').count()
    log('6b. Payment methods', paymentRadios >= 2, `${paymentRadios} methods`)

    // 7. Admin
    console.log('\n--- 7. Admin ---')
    await page.goto(`${BASE}/admin`, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForTimeout(5000)
    await shot(page, '07-admin')
    const adminUrl = page.url()
    log('7a. Admin accessible', adminUrl.includes('/admin'), adminUrl)

    // 8. Sign Out
    console.log('\n--- 8. Sign Out ---')
    await page.goto(BASE, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)
    const menuBtn = page.getByRole('button', { name: /user menu/i })
    if (await menuBtn.isVisible().catch(() => false)) {
      await menuBtn.click()
      await page.waitForTimeout(500)
      const signOutBtn = page.getByRole('button', { name: /sign out/i })
      if (await signOutBtn.isVisible().catch(() => false)) {
        await signOutBtn.click()
        await page.waitForTimeout(3000)
      }
    }
    await shot(page, '08-signed-out')
    const signInBack = await page.locator('[data-testid="navbar-signin"]').isVisible().catch(() => false)
    log('8a. Sign out', signInBack, signInBack ? 'Sign In returned' : 'Sign In not found')

    // 9. Console errors
    console.log('\n--- 9. Errors ---')
    const criticalErrors = errors.filter(e => !e.includes('Warning') && !e.includes('localstorage'))
    log('9a. Page errors', criticalErrors.length === 0, criticalErrors.length > 0 ? criticalErrors.slice(0, 3).join(' | ') : 'none')

    // Summary
    console.log('\n\n=== SUMMARY ===')
    const passed = results.filter(r => r.pass).length
    const failed = results.filter(r => !r.pass).length
    console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`)
    if (failed > 0) {
      console.log('\nFailed tests:')
      results.filter(r => !r.pass).forEach(r => console.log(`  ✗ ${r.id}: ${r.detail}`))
    }

    fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify({ results, errors }, null, 2))
  } catch (err) {
    console.error('Test crashed:', err.message)
    await shot(page, 'crash')
  } finally {
    await browser.close()
  }
}

main()
