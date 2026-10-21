// Shop-Navigation nach Ritual statt nach Produktart.
// Zuordnung nur für die Darstellung; Produktdaten bleiben in content/products.json.
// Neue Produkte aus dem Admin ohne Eintrag erscheinen unter „Alle“.

export type Ritual = 'gesicht' | 'augen-lippen' | 'koerper' | 'haende' | 'waxing';

export const rituals: { id: Ritual; label: string; line: string }[] = [
  { id: 'gesicht', label: 'Gesicht', line: 'Reinigen, nähren, über Nacht ruhen lassen.' },
  { id: 'augen-lippen', label: 'Augen & Lippen', line: 'Für die zarteste Haut, die Du hast.' },
  { id: 'koerper', label: 'Körper', line: 'Streicheleinheiten zum Mitnehmen.' },
  { id: 'haende', label: 'Hände & Nägel', line: 'Für Hände, die viel tragen.' },
  { id: 'waxing', label: 'Rund ums Waxing', line: 'Vorher sanft peelen, nachher kühlen und beruhigen.' },
];

const map: Record<string, Ritual[]> = {
  'aloe-vera-gel': ['waxing', 'koerper'],
  'augengel-mit-hyaluronsaeure': ['augen-lippen'],
  'gute-nacht-creme': ['gesicht'],
  handzahm: ['haende'],
  'jungbrunnen-serum': ['gesicht'],
  'kaolin-crememaske': ['gesicht'],
  'koerpercreme-streicheleinheit': ['koerper'],
  lippenbalsam: ['augen-lippen'],
  'milde-tagescreme': ['gesicht'],
  'mizellenwasser-lindenbluete': ['gesicht'],
  'nagel-oel': ['haende'],
  'peeling-mit-mandel-olive': ['koerper', 'waxing'],
};

export const ritualsOf = (productId: string): Ritual[] => map[productId] ?? [];
export const ritualLabel = (id: Ritual) => rituals.find((r) => r.id === id)?.label ?? '';

/** Das Lieblingsprodukt für den großen Feature-Block */
export const FAVORITE_ID = 'aloe-vera-gel';
