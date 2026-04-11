export const ROLES = {
  admin: 'admin',
  operations: 'operations',
  support: 'support',
}

// Which roles can access each admin area section
export const ROLE_ACCESS = {
  products: ['admin', 'operations'],     // list + add
  productsEdit: ['admin'],               // edit existing only
  orders: ['admin', 'operations', 'support'],
  customers: ['admin', 'operations', 'support'],
  installments: ['admin', 'operations', 'support'],
  messages: ['admin', 'support'],
  settings: ['admin'],
  dashboard: ['admin', 'operations', 'support'],
}

export function can(role, action) {
  return ROLE_ACCESS[action]?.includes(role) ?? false
}
