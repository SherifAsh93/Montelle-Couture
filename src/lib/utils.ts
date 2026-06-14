export const SHIPPING_COST = 60
export const FREE_SHIPPING_THRESHOLD = 800
export const CURRENCY = 'EGP'
export const SITE_NAME = 'Montelle Couture'

export function formatPrice(price: number) {
  return `${price.toFixed(0)} ${CURRENCY}`
}

export function calcShipping(subtotal: number) {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
}

export function generateOrderNumber() {
  const ts = Date.now().toString(36).toUpperCase()
  const rand = Math.random().toString(36).substring(2, 5).toUpperCase()
  return `MT-${ts}-${rand}`
}

export function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(' ')
}
