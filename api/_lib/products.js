// Products that count for the Scan & Win campaign.
// To add a product to the campaign, add an entry here — the AI prompt is built from this list.
export const CAMPAIGN_PRODUCTS = [
  {
    id: 'mozzarella-cheese-sticks-250g',
    name: 'Mozzarella Cheese Sticks 250g',
    nameAr: 'اصابع جبنة الموزاريلا',
    image: '/products/mozzarella-sticks.png',
    packaging: [
      'Rectangular frozen-food carton, mostly white with a bright yellow top banner patterned with faint white rolling-pin outlines.',
      'Al Kabeer logo: red chef-hat shape with "الكبير" and "Al Kabeer" in red, above a large black handlebar mustache.',
      'Title in bold black: "Mozzarella Cheese Sticks" and Arabic "اصابع جبنة الموزاريلا".',
      'Front photo: golden breaded cheese sticks (one pulled apart showing stretchy white cheese) on a white plate, with a small bowl of red dipping sauce and basil leaves.',
      'Bottom badges: "250g NET WEIGHT", "9-11 PIECES", "255" calories, "0" trans fat, "no preservatives" (Arabic), and a round HALAL logo; the word "FROZEN".',
      'Side panel: Nutrition Facts table, ingredients list titled "Mozzarella Cheese Sticks", barcode 5 033712 451803 with a mustache drawn under it, "Plant Rg. No. 3229".',
      'A round gold "100% Vegetarian" stamp near the logo.',
    ],
  },
];

// Prizes handed out on a verified scan. `weight` controls how often each appears.
export const PRIZES = [
  { id: 'free-pack', title: 'A free pack of Mozzarella Cheese Sticks', short: 'Free pack', weight: 30 },
  { id: 'off-20', title: '20% off your next Al Kabeer shop', short: '20% off', weight: 40 },
  { id: 'family-box', title: 'An Al Kabeer family freezer box', short: 'Family box', weight: 10 },
  { id: 'off-10', title: '10% off any Al Kabeer frozen range', short: '10% off', weight: 20 },
];
