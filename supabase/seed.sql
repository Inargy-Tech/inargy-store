-- Seed data for staging / local development
-- Do NOT run this against production

insert into products (name, slug, category, description, price_kobo, stock) values
  (
    '400W Monocrystalline Solar Panel',
    '400w-mono-solar-panel',
    'solar-panels',
    'High-efficiency monocrystalline silicon panel. 400W peak output. IP67 rated. 25-year power output warranty.',
    15000000,
    50
  ),
  (
    '5kVA Hybrid Inverter',
    '5kva-hybrid-inverter',
    'inverters',
    'Pure sine wave hybrid inverter with built-in MPPT solar charge controller. Supports lithium and AGM batteries.',
    42000000,
    20
  ),
  (
    '200Ah LiFePO4 Battery',
    '200ah-lifepo4-battery',
    'batteries',
    'Lithium Iron Phosphate deep cycle battery. 6000+ cycle life. Built-in BMS. 5-year warranty.',
    38000000,
    30
  ),
  (
    '60A MPPT Solar Charge Controller',
    '60a-mppt-controller',
    'controllers',
    'Maximum Power Point Tracking controller. 12/24/48V auto-detect. LCD display. Bluetooth monitoring.',
    8500000,
    40
  )
on conflict (slug) do nothing;
