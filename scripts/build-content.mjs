// Erzeugt die JSON-Dateien in content/ aus kompakten Definitionen.
// Quelle der Preise: honigseele.de, abgerufen 21.10.2026.
// Danach ist content/*.json die eine Quelle; dieses Skript nur für die Erst-Migration nutzen.
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'content');
mkdirSync(out, { recursive: true });
const write = (name, data) =>
  writeFileSync(join(out, name), JSON.stringify(data, null, 2) + '\n', 'utf8');
const c = (eur) => Math.round(eur * 100);
const slug = (s) =>
  s
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/½/g, 'halb')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

// ---------- Team ----------
const team = [
  ['anna', 'Anna', 'Inhaberin · Depiladora', 'Die Seele des Honigs', ['Waxing'], 'honey', ['DE', 'EN']],
  ['asita', 'Asita', 'Kosmetik · Massagen · Coaching', 'Honigseelengeflüster', ['Gesicht', 'Massagen', 'Coaching'], 'amber', ['DE', 'EN']],
  ['juli', 'Juli', 'Depiladora · Japanische Gesichtsmassage', undefined, ['Waxing', 'Massagen'], 'sand', ['DE', 'EN']],
  ['jamilah', 'Jamilah', 'Laser · Depiladora · Wimpernstylistin', undefined, ['Laser', 'Waxing', 'Wimpern & Brauen'], 'cream', ['DE', 'EN']],
  ['sandra', 'Sandra', 'Laser · Depiladora · Körper · Kosmetik · Pediküre', undefined, ['Laser', 'Waxing', 'Körper', 'Gesicht', 'Mani & Pedi'], 'honey', ['DE']],
  ['lisz', 'Lisz', 'Depiladora · Kosmetik', undefined, ['Waxing', 'Gesicht'], 'amber', ['DE', 'EN']],
  ['selena', 'Selena', 'Depiladora', undefined, ['Waxing'], 'sand', ['DE', 'ES', 'EN']],
  ['yvonne', 'Yvonne', 'Depiladora', undefined, ['Waxing'], 'cream', ['DE']],
  ['justyna', 'Justyna', 'Kosmetikerin · Podologin', undefined, ['Gesicht', 'Mani & Pedi'], 'honey', ['DE', 'EN']],
  ['nadine', 'Nadine', 'Kosmetik · Pediküre · Sugaring · Depiladora · Wimpern & Brow Lifting', undefined, ['Waxing', 'Gesicht', 'Mani & Pedi', 'Wimpern & Brauen'], 'amber', ['DE']],
  ['isabell', 'Isabell', 'Kosmetik · Make-up-Artist', undefined, ['Gesicht'], 'sand', ['DE', 'IT', 'EN']],
  ['larissa', 'Larissa Enni Inni', 'Ernährungsberatung', undefined, ['Coaching'], 'cream', ['DE', 'EN']],
  ['elsa', 'Elsa', 'Massagen', 'Die Kuschel Seele', ['Massagen'], 'honey', ['DE']],
  ['kati', 'Kati', 'Yoga', undefined, ['Yoga'], 'amber', ['DE', 'EN']],
  ['maria', 'Maria', 'Yoga', undefined, ['Yoga'], 'sand', ['DE', 'IT']],
];
const bios = {
  anna: 'Vor sieben Jahren hat Anna die Honigseele gegründet – aus dem Wunsch nach einem Ort, an dem sich alle willkommen fühlen. Sie wachst mit Honigwachs, mit ruhiger Hand und viel Herz.',
  asita: 'Asita verbindet Kosmetik, Massage und Coaching zu Behandlungen, die tiefer gehen als die Haut.',
  elsa: 'Elsa ist unsere Kuschel Seele: Ihre Massagen sind warm, langsam und ganz bei Dir.',
};
const staff = team.map(([id, name, role, title, skills, avatarTone, languages]) => ({
  id,
  name,
  role,
  ...(title ? { title } : {}),
  bio:
    bios[id] ??
    `${name} ist Teil der Honigseelen. Kurzporträt folgt – hier stellt sich ${name} bald selbst vor.`,
  bioPlaceholder: !bios[id],
  skills,
  avatarTone,
  bookable: !['kati', 'maria'].includes(id),
  visible: true,
  languages,
}));
write('staff.json', staff);

// Arbeitszeiten: Platzhalter, plausible Demo-Zeiten (1 = Mo)
const hours = {
  anna: [[1, '10:00', '18:00'], [2, '10:00', '18:00'], [4, '12:00', '20:00'], [5, '10:00', '16:00']],
  asita: [[2, '10:00', '18:00'], [3, '10:00', '18:00'], [4, '10:00', '18:00'], [6, '10:00', '16:00']],
  juli: [[1, '12:00', '20:00'], [3, '12:00', '20:00'], [5, '10:00', '18:00']],
  jamilah: [[1, '10:00', '18:00'], [2, '12:00', '20:00'], [4, '10:00', '18:00'], [5, '12:00', '20:00']],
  sandra: [[2, '10:00', '18:00'], [3, '10:00', '18:00'], [5, '10:00', '18:00'], [6, '10:00', '16:00']],
  lisz: [[1, '10:00', '16:00'], [3, '14:00', '20:00'], [4, '10:00', '16:00']],
  selena: [[2, '14:00', '20:00'], [4, '14:00', '20:00'], [6, '10:00', '16:00']],
  yvonne: [[1, '14:00', '20:00'], [3, '10:00', '16:00'], [5, '14:00', '20:00']],
  justyna: [[1, '10:00', '18:00'], [3, '10:00', '18:00'], [4, '12:00', '20:00']],
  nadine: [[2, '10:00', '18:00'], [4, '10:00', '18:00'], [5, '10:00', '18:00'], [6, '10:00', '16:00']],
  isabell: [[1, '12:00', '20:00'], [4, '12:00', '20:00'], [5, '10:00', '16:00']],
  larissa: [[2, '14:00', '19:00'], [4, '14:00', '19:00']],
  elsa: [[1, '10:00', '18:00'], [3, '12:00', '20:00'], [5, '10:00', '18:00'], [6, '10:00', '16:00']],
};
write(
  'working-hours.json',
  Object.entries(hours).flatMap(([staffId, list]) =>
    list.map(([weekday, start, end]) => ({ staffId, weekday, start, end })),
  ),
);

write('rooms.json', [
  { id: 'kabine-1', name: 'Kabine Lindenblüte', type: 'kabine' },
  { id: 'kabine-2', name: 'Kabine Akazie', type: 'kabine' },
  { id: 'kabine-3', name: 'Kabine Lavendel', type: 'kabine' },
  { id: 'laser', name: 'Laserraum', type: 'laser' },
  { id: 'massage-1', name: 'Massageraum Bernstein', type: 'massage' },
  { id: 'massage-2', name: 'Massageraum Wabe', type: 'massage' },
  { id: 'fuss', name: 'Hand- & Fußraum', type: 'fuss' },
  { id: 'kursraum', name: 'Kursraum', type: 'kurs' },
  { id: 'beratung', name: 'Beratungsraum', type: 'beratung' },
]);

// ---------- Kategorien ----------
write('categories.json', [
  { id: 'waxing', name: 'Waxing', eyebrow: 'Mit warmem Honigwachs', teaser: 'Sanft, gründlich und mit Wachs aus Honig – für Damen und Herren.', intro: 'Bei uns wird mit Honigwachs gewachst: warm, hautfreundlich und so sanft wie möglich. Unsere Depiladoras arbeiten ruhig, gründlich und ohne Hektik – damit Du Dich vom ersten Moment an wohlfühlst.', image: '/images/stock/waxing.jpg', order: 1, roomType: 'kabine', inTreatments: true },
  { id: 'laser', name: 'Laser-Haarentfernung', eyebrow: 'Dauerhaft glatt', teaser: 'Diodenlaser mit drei Wellenlängen – nach persönlichem Vorgespräch.', intro: 'Unser Diodenlaser arbeitet mit drei Wellenlängen (755, 808 und 1064 nm) und ist damit für viele Haut- und Haartypen geeignet. Jede Behandlung beginnt mit einem Vorgespräch, in dem wir Deine Haut kennenlernen und gemeinsam planen. Für ein dauerhaftes Ergebnis brauchst Du meist 6–10 Sitzungen.', image: '/images/stock/laser.jpg', order: 2, roomType: 'laser', inTreatments: true },
  { id: 'gesicht-augen', name: 'Gesicht & Augen', eyebrow: 'Naturkosmetik', teaser: 'Gesichtsbehandlungen, Rituale aus dem Meer, Wimpern & Brauen.', intro: 'Unsere Gesichtsbehandlungen verbinden Handarbeit mit der eigenen Naturkosmetik aus der Crememanufaktur Berlin. Ob klassische Pflege, Anti-Age mit Kristallen oder Rituale aus dem Meer – jede Behandlung ist eine kleine Auszeit.', image: '/images/stock/face.jpg', order: 3, roomType: 'kabine', inTreatments: true },
  { id: 'koerper-massagen', name: 'Körper & Massagen', eyebrow: 'Für Körper und Seele', teaser: 'Massagen, Lymphdrainage, Algen- und Meeresbehandlungen.', intro: 'Von der klassischen Massage über Hot Stone bis zur Brasilianischen Lymphdrainage: Hier darfst Du loslassen. Unsere Massagen sind ein Angebot für Frauen.', image: '/images/stock/massage.jpg', order: 4, roomType: 'massage', inTreatments: true },
  { id: 'mani-pedikuere', name: 'Mani- & Pediküre', eyebrow: 'Hände & Füße', teaser: 'Klassisch, Spa oder medizinisch – mit Liebe zum Detail.', intro: 'Gepflegte Hände und Füße, ohne Eile. Von der klassischen Maniküre bis zur medizinischen Fußpflege durch unsere Podologin Justyna.', image: '/images/stock/hands.jpg', order: 5, roomType: 'fuss', inTreatments: true },
  { id: 'wohlfuehl-pakete', name: 'Wohlfühl-Pakete', eyebrow: 'Zeit für Dich', teaser: 'Mehrere Behandlungen, ein Gefühl: angekommen.', intro: 'Unsere Pakete sind kleine Fluchten aus dem Alltag – allein, zu zweit, mit Mama, als Braut oder für die Kleinen. Ein Willkommensgetränk wartet immer.', image: '/images/stock/package.jpg', order: 6, roomType: 'massage', inTreatments: true },
  { id: 'schroepfen', name: 'Schröpfen', eyebrow: 'Traditionelle Körperarbeit', teaser: 'Angebot und Preise folgen.', intro: 'Hier stellen wir bald unser Schröpf-Angebot vor.', image: '/images/stock/room.jpg', order: 7, roomType: 'massage', inTreatments: true, isPlaceholder: true },
  { id: 'somatic-bodywork', name: 'Somatic Bodywork', eyebrow: 'Pantarei', teaser: 'Angebot und Preise folgen.', intro: 'Hier stellen wir bald Somatic Bodywork (Pantarei) vor.', image: '/images/stock/plants.jpg', order: 8, roomType: 'massage', inTreatments: true, isPlaceholder: true },
  { id: 'coaching', name: 'Coaching & Ernährung', eyebrow: 'Honigseelengeflüster', teaser: 'Einzelcoaching, Stress-Coaching und ganzheitliche Ernährungsberatung.', intro: 'Manchmal braucht es mehr als Pflege von außen. Im Coaching nehmen wir uns Zeit für das, was Dich innen bewegt.', image: '/images/stock/coaching.jpg', order: 9, roomType: 'beratung', inTreatments: false },
]);

// ---------- Leistungen ----------
const services = [];
const staffServices = [];
const depiladoras = ['anna', 'juli', 'jamilah', 'sandra', 'lisz', 'selena', 'yvonne', 'nadine'];
const add = (s, staffIds) => {
  services.push({ bookable: true, active: true, audience: 'alle', ...s });
  for (const staffId of staffIds) staffServices.push({ staffId, serviceId: s.id });
};

// Waxing Damen: [Name, Preis, ermäßigt, Dauer]
const waxD = [
  ['Achseln', 15, 13, 10], ['Arme komplett', 29, 26, 20], ['Arme ½', 18, 16, 10],
  ['Beine komplett', 44, 39, 30], ['Oberschenkel', 28, 24, 20], ['Unterschenkel', 25, 22, 20],
  ['Bauch', 17, 15, 10], ['Brust', 17, 15, 15], ['Rücken/Lende', 12, 11, 10],
  ['Kinn', 12, null, 10], ['Nase', 11, null, 10], ['Oberlippe', 12, null, 10], ['Wangen', 14, null, 10],
  ['Augenbrauen', 15, null, 15], ['Pofalte', 14, 12, 10], ['Bikini ohne Pofalte', 17, 14, 15],
  ['Bikini inkl. Pofalte', 22, 19, 20], ['Bikini Tanga inkl. Pofalte', 28, 24, 20],
  ['Intim komplett inkl. Pofalte', 38, 34, 30], ['Intim Dreieck inkl. Pofalte', 38, 34, 30],
  ['Intim Landing Strip inkl. Pofalte', 38, 34, 30], ['Pobacken komplett', 17, 15, 15],
];
for (const [name, p, r, d] of waxD)
  add(
    { id: `waxing-d-${slug(name)}`, categoryId: 'waxing', group: 'Damen', name, durationMin: d, priceCents: c(p), ...(r ? { reducedPriceCents: c(r) } : {}), audience: 'damen' },
    depiladoras,
  );
const waxH = [
  ['Achseln', 17, 10], ['Arme komplett', 30, 20], ['Beine komplett', 48, 40], ['Bauch', 22, 10],
  ['Brust', 22, 15], ['Rücken komplett', 45, 30], ['Rücken ½', 26, 15], ['Nacken', 15, 10],
  ['Schultergürtel mit Nacken', 24, 15], ['Lendenbereich', 15, 15], ['Nase', 14, 10],
  ['Augenbrauen', 15, 10], ['Augenbrauen-Modellage', 22, 20], ['Ohren', 10, 10],
];
for (const [name, p, d] of waxH)
  add(
    { id: `waxing-h-${slug(name)}`, categoryId: 'waxing', group: 'Herren', name, durationMin: d, priceCents: c(p), audience: 'herren' },
    depiladoras,
  );

// Laser
const laserStaff = ['jamilah', 'sandra'];
add(
  { id: 'laser-vorgespraech', categoryId: 'laser', group: 'Vorgespräch', name: 'Vorgespräch & Probeschuss', description: 'Pflicht vor der ersten Laser-Behandlung: Hauttyp, Haartyp, Medikamente, Behandlungsplan. Dauer und Preis: Platzhalter.', durationMin: 30, priceCents: 0, isConsultation: true, isPlaceholder: true },
  laserStaff,
);
const laserD = [
  ['Achseln', 49, 15], ['Arme komplett', 79, 30], ['Arme ½', 59, 20], ['Beine komplett', 199, 60],
  ['Oberschenkel', 119, 35], ['Unterschenkel', 119, 30], ['Bauch', 49, 15], ['Bauchnabel-Linie', 35, 10],
  ['Brust', 49, 15], ['Pofalte', 29, 10], ['Rücken komplett', 119, 30], ['Kinn & Hals', 45, 15],
  ['Oberlippe', 35, 10], ['Wangen', 35, 10], ['Hals', 19, 10], ['Gesicht komplett', 79, 20],
  ['Bikini ohne Pofalte', 59, 15], ['Bikini Tanga mit Pofalte', 69, 20], ['Intim komplett', 99, 25],
  ['Intim Dreieck', 99, 25], ['Intim Landing Strip', 99, 25], ['Pobacken', 69, 20],
];
for (const [name, p, d] of laserD)
  add(
    { id: `laser-d-${slug(name)}`, categoryId: 'laser', group: 'Damen', name, durationMin: d, priceCents: c(p), audience: 'damen', requiresConsultation: true, laserZone: true },
    laserStaff,
  );
add(
  { id: 'laser-d-ganzkoerper', categoryId: 'laser', group: 'Damen', name: 'Ganzkörper', description: 'Festpreis, kein zusätzlicher Zonen-Rabatt.', durationMin: 150, priceCents: c(499), audience: 'damen', requiresConsultation: true },
  laserStaff,
);
const laserH = [
  ['Achseln', 59, 15], ['Arme komplett', 89, 30], ['Arme ½', 69, 20], ['Beine komplett', 209, 60],
  ['Beine ½', 129, 35], ['Bauch', 69, 15], ['Brust', 69, 20], ['Rücken komplett', 129, 35],
];
for (const [name, p, d] of laserH)
  add(
    { id: `laser-h-${slug(name)}`, categoryId: 'laser', group: 'Herren', name, durationMin: d, priceCents: c(p), audience: 'herren', requiresConsultation: true, laserZone: true },
    laserStaff,
  );

// Gesicht & Augen (Dauer: Platzhalter, plausibel)
const faceA = [
  ['Zeit für Dich', 75, 75, 'Klassische Gesichtsbehandlung mit Reinigung, Peeling, Massage und Maske.'],
  ['Reine Männersache', 95, 75, 'Gesichtsbehandlung, abgestimmt auf Männerhaut.'],
  ['Dein Augenblick', 78, 60, 'Fokus auf die Augenpartie: Pflege, Massage, Augenmaske.'],
  ['Fühl Dich wohl (Collagen Boost)', 80, 75, 'Feuchtigkeit und Spannkraft mit Collagen.'],
  ['Du bist schön (Pure Intense)', 78, 75, 'Intensive Klärung für unreine Haut.'],
  ['Die Kraft der Kristalle (Anti Age)', 95, 90, 'Anti-Age-Behandlung mit Kristallen.'],
  ['Anti-Stress-Massage mit Shiatsu + klassische Behandlung', 105, 105, 'Klassische Behandlung mit Shiatsu-Massage zum Abschalten.'],
  ['Deine Wohlfühlzeit (ermäßigt, mit Nachweis)', 68, 60, 'Für Schüler*innen und Studierende mit Nachweis.'],
  ['Gesicht- und Kopfmassage inkl. Lymphdrainage', 45, 30, ''],
  ['Jade-Roller- und Gua-Sha-Massage', 55, 40, ''],
  ['Mandelkern-Peeling-Massage', 55, 40, ''],
  ['Ohrenkerzen', 45, 30, ''],
  ['Wellness (Gesichtsmassage + Ohrenkerzen)', 65, 50, ''],
  ['Sommer-Detox-Ritual', 85, 75, ''],
  ['Belebendes Vital-Ritual', 80, 75, ''],
  ['Beruhigendes Balance-Ritual', 80, 75, ''],
];
for (const [name, p, d, desc] of faceA)
  add(
    { id: `gesicht-${slug(name)}`, categoryId: 'gesicht-augen', group: 'Gesichtsbehandlungen', name, ...(desc ? { description: desc } : {}), durationMin: d, priceCents: c(p) },
    ['asita', 'isabell'],
  );
add(
  { id: 'gesicht-microdermabrasion', categoryId: 'gesicht-augen', group: 'Gesichtsbehandlungen', name: 'Microdermabrasion', description: 'Sanfter Hautschliff für einen ebenmäßigen Teint. Mit Zusatz 95 oder 105 €.', durationMin: 60, priceCents: c(85), priceFrom: true },
  ['asita', 'isabell'],
);
const faceMeer = [
  ['Meer Zeit für Dich', 72, 75], ['Reine Männersache (Meer)', 95, 75], ['Die Kraft der Algen', 85, 75],
  ['Meeres Hydro', 85, 75], ['Entspannendes Aroma-Ritual', 105, 90], ['Die Kraft der Kristalle (Meer)', 95, 90],
];
for (const [name, p, d] of faceMeer)
  add(
    { id: `meer-${slug(name)}`, categoryId: 'gesicht-augen', group: 'Aus dem Meer', name, durationMin: d, priceCents: c(p) },
    ['lisz', 'sandra', 'justyna'],
  );
const faceExtras = [['Ampulle', 10, 5], ['Enzympeeling', 10, 10], ['Augenmaske', 8, 10]];
for (const [name, p, d] of faceExtras)
  add(
    { id: `gesicht-extra-${slug(name)}`, categoryId: 'gesicht-augen', group: 'Extras', name, durationMin: d, priceCents: c(p) },
    ['asita', 'isabell', 'lisz', 'sandra', 'justyna'],
  );
add(
  { id: 'gesicht-extra-milien', categoryId: 'gesicht-augen', group: 'Extras', name: 'Milien entfernen', durationMin: 15, priceCents: c(15), priceFrom: true },
  ['asita', 'isabell', 'lisz', 'sandra', 'justyna'],
);
const eyes = [
  ['Lash Lifting + Färben & Pflege', 60, 60], ['Brauen färben', 14, 15], ['Brauen zupfen', 15, 15],
  ['Wimpern färben', 17, 20], ['Brauen & Wimpern färben', 28, 30], ['Brauen färben & formen', 25, 30],
];
for (const [name, p, d] of eyes)
  add(
    { id: `augen-${slug(name)}`, categoryId: 'gesicht-augen', group: 'Augen & Brauen', name, durationMin: d, priceCents: c(p) },
    ['jamilah', 'nadine'],
  );

// Körper
const body = [
  ['Meereszauber', 60, 115, 'Körperpackung mit Meeresmineralien.'],
  ['Algen-Wunder', 60, 115, 'Algenpackung, entschlackend und straffend.'],
  ['Anti-Cellulite Bandage', 90, 120, 'Straffende Bandage-Behandlung.'],
  ['Brasilianische Lymphdrainage', 60, 130, 'Auch als 5er-Paket (520 €) und 10er-Paket (1.040 €).'],
  ['Streicheleinheit (Körperpeeling)', 70, 125, 'Körperpeeling mit unserer Pflegeserie.'],
];
for (const [name, d, p, desc] of body)
  add(
    { id: `koerper-${slug(name)}`, categoryId: 'koerper-massagen', group: 'Körperbehandlungen', name, description: desc, durationMin: d, priceCents: c(p), audience: 'damen' },
    ['sandra', 'asita'],
  );

// Massagen (für Frauen): [Name, [[Min, €], …], staff]
const massages = [
  ['Klassische Massage', [[30, 45], [60, 80], [90, 110]], ['asita', 'elsa']],
  ['Aromaöl-Massage', [[30, 50], [60, 85], [90, 115]], ['asita', 'elsa']],
  ['Energetische Edelsteinmassage', [[30, 50], [60, 85], [90, 115]], ['asita', 'elsa']],
  ['Kinder-Wohlfühlmassage', [[30, 30], [60, 60]], ['elsa']],
  ['Honig für die Seele', [[60, 90], [90, 125]], ['asita', 'elsa']],
  ['Fußreflexzonen-Massage', [[30, 55], [60, 85]], ['asita', 'elsa']],
  ['Hot Stone Massage', [[60, 85], [90, 120]], ['asita', 'elsa']],
  ['Buccal Sculpture Lifting', [[60, 95], [90, 105]], ['asita']],
  ['Buccal Jaw Release', [[60, 95], [90, 105]], ['asita']],
];
for (const [name, variants, st] of massages) {
  const base = `massage-${slug(name)}`;
  for (const [d, p] of variants)
    add(
      { id: `${base}-${d}`, categoryId: 'koerper-massagen', group: 'Massagen', name: `${name} · ${d} Min.`, durationMin: d, priceCents: c(p), audience: 'damen', variantOf: base },
      st,
    );
}
add(
  { id: 'massage-japanische-gesichtsmassage', categoryId: 'koerper-massagen', group: 'Massagen', name: 'Japanische Gesichtsmassage', description: 'Mit Juli.', durationMin: 70, priceCents: c(115), audience: 'damen' },
  ['juli'],
);
add(
  { id: 'reset-tmj', categoryId: 'koerper-massagen', group: 'RESET TMJ', name: 'RESET TMJ – Kieferbalance', description: 'Ausdrücklich keine Massage: sanfte Technik zur Entspannung des Kiefergelenks.', durationMin: 45, priceCents: c(75) },
  ['asita'],
);
add(
  { id: 'reset-tmj-basis', categoryId: 'koerper-massagen', group: 'RESET TMJ', name: 'RESET TMJ – Basis-Balance (2 × 45 Min.)', description: 'Zwei Termine; der zweite wird nach der ersten Sitzung vereinbart.', durationMin: 45, priceCents: c(145) },
  ['asita'],
);

// Mani & Pedi – Preis je Anbieterin wird hier demonstriert
const maniStaff = ['sandra', 'justyna', 'nadine'];
const mani = [
  ['Klassische Maniküre', 48, 45], ['Klassische Maniküre mit Lack', 55, 55],
  ['Spa-Maniküre', 58, 60], ['Spa-Maniküre mit Lack', 65, 70],
  ['Klassische Pediküre', 45, 45], ['Klassische Pediküre mit Lack', 52, 55],
  ['Medizinische Fußpflege', 50, 45], ['Medizinische Fußpflege mit Lack', 57, 55],
  ['Spa-Pediküre', 57, 60], ['Spa-Pediküre mit Lack', 64, 70],
];
for (const [name, p, d] of mani) {
  const id = `mp-${slug(name)}`;
  const st = name.startsWith('Medizinische') ? ['justyna'] : maniStaff;
  add({ id, categoryId: 'mani-pedikuere', group: name.includes('Maniküre') ? 'Maniküre' : 'Pediküre', name, durationMin: d, priceCents: c(p) }, st);
}
// Justyna & Sandra: Spa-Pediküre 58 / mit Lack 65
for (const staffId of ['justyna', 'sandra']) {
  for (const [serviceId, p] of [['mp-spa-pedikuere', 58], ['mp-spa-pedikuere-mit-lack', 65]]) {
    const row = staffServices.find((r) => r.staffId === staffId && r.serviceId === serviceId);
    row.priceCents = c(p);
  }
}
add(
  { id: 'mp-spa-pedikuere-shellac', categoryId: 'mani-pedikuere', group: 'Pediküre', name: 'Spa-Pediküre mit Shellac', durationMin: 75, priceCents: c(68) },
  ['justyna', 'sandra'],
);
add(
  { id: 'mp-verlaengerung-fussmassage', categoryId: 'mani-pedikuere', group: 'Extras', name: 'Verlängerung Fußmassage · 30 Min.', durationMin: 30, priceCents: c(45) },
  maniStaff,
);
for (const [name, p, d] of [['Peeling', 5, 5], ['Maske', 5, 10], ['Algen-Fußpackung', 15, 15], ['Lack', 10, 10]])
  add({ id: `mp-extra-${slug(name)}`, categoryId: 'mani-pedikuere', group: 'Extras', name, durationMin: d, priceCents: c(p) }, maniStaff);

// Pakete
const packages = [
  ['Deine kleine Auszeit', 150, 185, 'alle', 'Zeit nur für Dich.', ['Willkommensgetränk', 'Gesichtsbehandlung „Zeit für Dich“', 'Rückenmassage 30 Min.']],
  ['Dein Wohlfühltag in der Honigseele', 240, 350, 'alle', 'Ein ganzer Tag, um anzukommen.', ['Willkommensgetränk & Snack', 'Körperpeeling', 'Aromaöl-Massage 60 Min.', 'Gesichtsbehandlung', 'Spa-Pediküre']],
  ['Dein Tag am Meer', 210, 265, 'alle', 'Algen, Salz und Meeresluft – mitten in Kreuzberg.', ['Willkommensgetränk', 'Meereszauber Körperpackung', 'Gesichtsbehandlung „Die Kraft der Algen“']],
  ['Mama, Für Dich', 150, 210, 'mamas', 'Für alle Mamas, die mal wieder durchatmen dürfen.', ['Willkommensgetränk', 'Massage 60 Min.', 'Gesichtsmassage', 'Hand-Pflege']],
  ['Die Braut die sich traut', 240, 250, 'braut', 'Strahlend in den großen Tag.', ['Willkommensgetränk', 'Waxing nach Wahl', 'Gesichtsbehandlung', 'Maniküre mit Lack', 'Brauen formen']],
  ['Balsam für die Seele', 150, 225, 'alle', 'Wenn alles zu viel ist.', ['Willkommensgetränk', 'Honig für die Seele 60 Min.', 'Gesicht- und Kopfmassage']],
  ['Teenysprechstunde', 150, 190, 'teens', 'Hautpflege lernen, sich wohlfühlen.', ['Hautanalyse', 'Gesichtsbehandlung für junge Haut', 'Pflegeberatung', 'Brauen in Form']],
  ['Zauberwichtel (Kinder)', 90, 95, 'kinder', 'Für kleine Honigseelen.', ['Kinder-Wohlfühlmassage', 'Mini-Maniküre', 'Kakao']],
  ['Schöne Füße & schöne Hände', 60, 100, 'alle', 'Hände und Füße in einem Termin.', ['Klassische Maniküre', 'Klassische Pediküre']],
  ['Miteinander strahlen', 60, 180, 'paare', 'Zu zweit, nebeneinander.', ['Willkommensgetränk', 'Zwei parallele Behandlungen nach Wahl']],
  ['Von Kopf bis Fuß auf Liebe eingestellt (Paare)', 120, 280, 'paare', 'Paarzeit in der Honigseele.', ['Willkommensgetränk', 'Paarmassage 60 Min.', 'Fußbad & Fußmassage']],
];
const pkgStaff = ['asita', 'sandra', 'elsa', 'nadine', 'justyna'];
const pkgOut = [];
for (const [name, d, p, audience, tagline, includes] of packages) {
  const id = `paket-${slug(name)}`;
  pkgOut.push({ id, name, tagline, durationMin: d, priceCents: c(p), audience, includes, steps: [{ label: name, durationMin: d, roomType: 'massage' }] });
  add({ id, categoryId: 'wohlfuehl-pakete', group: 'Pakete', name, description: tagline, durationMin: d, priceCents: c(p) }, pkgStaff);
}
write('packages.json', pkgOut);

// Coaching (buchbar wie Behandlungen)
add({ id: 'coaching-seelengefluester', categoryId: 'coaching', group: 'Coaching', name: 'Seelengeflüster', description: 'Coaching-Session mit Asita. Preis und Dauer: Platzhalter.', durationMin: 60, priceCents: c(90), isPlaceholder: true }, ['asita']);
add({ id: 'coaching-einzel', categoryId: 'coaching', group: 'Coaching', name: 'Einzelcoaching', description: 'Preis und Dauer: Platzhalter.', durationMin: 60, priceCents: c(90), isPlaceholder: true }, ['asita']);
add({ id: 'coaching-stress', categoryId: 'coaching', group: 'Coaching', name: 'Stress-Coaching', description: 'Preis und Dauer: Platzhalter.', durationMin: 60, priceCents: c(90), isPlaceholder: true }, ['asita']);
add({ id: 'coaching-ernaehrung', categoryId: 'coaching', group: 'Ernährung', name: 'Ganzheitliche Ernährungsberatung', description: 'Mit Larissa. Preis und Dauer: Platzhalter.', durationMin: 60, priceCents: c(80), isPlaceholder: true }, ['larissa']);

write('services.json', services);
write('staff-services.json', staffServices);

// ---------- Kurse (Termine, Preise, Kapazitäten: Platzhalter) ----------
const course = (id, name, kind, leaderName, eur, durationMin, capacity, schedule, description, extra = {}) => ({
  id, name, kind, description, leaderName, priceCents: c(eur), durationMin, capacity, punchCardEligible: kind === 'yoga', schedule, isPlaceholder: true, ...extra,
});
write('courses.json', [
  course('yoga-kati', 'Yoga mit Kati', 'yoga', 'Kati', 18, 75, 12, [{ weekday: 1, time: '18:30' }, { weekday: 3, time: '18:30' }], 'Fließendes Hatha-Yoga für alle Level.', { leaderId: 'kati' }),
  course('yoga-maria', 'Yoga mit Maria', 'yoga', 'Maria', 18, 75, 12, [{ weekday: 2, time: '09:30' }, { weekday: 4, time: '09:30' }], 'Sanftes Yoga am Morgen.', { leaderId: 'maria' }),
  course('yoga-praenatal', 'Pränatal Yoga', 'yoga', 'Kati', 20, 75, 8, [{ weekday: 6, time: '10:00' }], 'Yoga in der Schwangerschaft.', { leaderId: 'kati' }),
  course('yoga-postnatal', 'Postnatal Yoga', 'yoga', 'Maria', 20, 75, 8, [{ weekday: 5, time: '10:30' }], 'Rückbildung und Ankommen – Babys sind willkommen.', { leaderId: 'maria' }),
  course('bienenstock', 'Bienenstock Frauen-Netzwerk', 'workshop', 'Anna', 25, 120, 20, [{ weekday: 4, time: '19:00' }], 'Unser Netzwerk-Abend für Frauen: austauschen, stärken, verbinden.', { leaderId: 'anna', monthly: true }),
  course('breathwork', 'Breathwork', 'workshop', 'Asita', 35, 90, 12, [{ weekday: 5, time: '19:00' }], 'Bewusstes Atmen für Klarheit und Ruhe.', { leaderId: 'asita' }),
  course('lets-just-move', 'Let’s Just Move', 'workshop', 'Team', 15, 60, 15, [{ weekday: 7, time: '11:00' }], 'Freie Bewegung zu Musik, ohne Choreo.'),
  course('lets-just-walk', 'Let’s Just Walk', 'workshop', 'Team', 10, 90, 15, [{ weekday: 6, time: '09:00' }], 'Gemeinsamer Spaziergang durch den Kiez.'),
  course('kakaozeremonie', 'Kakaozeremonie', 'workshop', 'Asita', 35, 120, 14, [{ weekday: 7, time: '17:00' }], 'Zeremonieller Kakao, Stille und Austausch.', { leaderId: 'asita', biweekly: true }),
  course('mbsr', 'MBSR – Achtsamkeit', 'workshop', 'Asita', 390, 150, 12, [{ weekday: 2, time: '19:00' }], '8-Wochen-Kurs Stressbewältigung durch Achtsamkeit (Preis für den ganzen Kurs).', { leaderId: 'asita' }),
  course('waxing-schulung', 'Waxing-Schulung', 'schulung', 'Anna', 390, 360, 4, [{ weekday: 7, time: '10:00' }], 'Lerne Waxing mit Honigwachs von Anna. Inhalte und Termine folgen.', { leaderId: 'anna', monthly: true }),
]);

// ---------- Produkte ----------
const prod = (name, size, eur, tone, image = '/images/stock/products.jpg') => ({
  id: slug(name), name, ...(size ? { size } : {}), priceCents: c(eur),
  description: 'Handgemacht in der Crememanufaktur Berlin. Ausführliche Beschreibung, Anwendung und Inhaltsstoffe folgen.',
  image, tone, kind: 'pflege', stock: 20, active: true, isPlaceholder: true,
});
write('products.json', [
  { ...prod('Aloe Vera Gel', '100 ml', 12.9, 'sage'), description: 'Kühlt und beruhigt die Haut – unser Begleiter nach jedem Waxing.' },
  prod('Augengel mit Hyaluronsäure', '15 ml', 20.9, 'cream'),
  prod('Gute Nacht Creme', '50 ml', 26.9, 'amber'),
  prod('Handzahm', '30 g', 8.9, 'honey'),
  prod('Jungbrunnen Serum', '30 ml', 24.9, 'amber'),
  prod('Kaolin Crememaske', '100 g', 26.9, 'sand'),
  prod('Körpercreme Streicheleinheit', undefined, 23.9, 'honey'),
  prod('Lippenbalsam', undefined, 9.9, 'honey'),
  prod('Milde Tagescreme', '50 ml', 23.9, 'cream'),
  prod('Mizellenwasser Lindenblüte', '60 ml', 16.9, 'sage'),
  prod('Nagel Öl', '20 ml', 9.9, 'amber'),
  prod('Peeling mit Mandel & Olive', '50 g', 16.9, 'sand'),
  { id: 'gutschein', name: 'Gutschein', priceCents: c(50), description: 'Frei wählbar von 20 bis 500 €. Einlösbar für alle Behandlungen, Kurse und Produkte.', image: '/images/stock/voucher.jpg', tone: 'honey', kind: 'gutschein', stock: 9999, active: true },
  { id: 'gutschein-kosmetik', name: 'Gutschein Kosmetik', priceCents: c(80), description: 'Für eine Gesichtsbehandlung nach Wahl. 20 bis 500 €.', image: '/images/stock/voucher.jpg', tone: 'cream', kind: 'gutschein', stock: 9999, active: true },
  { id: 'gutschein-pedikuere', name: 'Gutschein Pediküre', priceCents: c(60), description: 'Für schöne Füße. 20 bis 500 €.', image: '/images/stock/voucher.jpg', tone: 'sand', kind: 'gutschein', stock: 9999, active: true },
  { id: 'yoga-5er-karte', name: 'Yoga 5er-Karte', priceCents: c(80), description: 'Fünf Yoga-Stunden nach Wahl, 4 Monate gültig. Preis: Platzhalter.', image: '/images/stock/yoga.jpg', tone: 'amber', kind: 'karte', stock: 9999, active: true, isPlaceholder: true },
  { id: 'yoga-10er-karte', name: 'Yoga 10er-Karte', priceCents: c(150), description: 'Zehn Yoga-Stunden nach Wahl, 6 Monate gültig. Preis: Platzhalter.', image: '/images/stock/yoga.jpg', tone: 'honey', kind: 'karte', stock: 9999, active: true, isPlaceholder: true },
]);

console.log(`content/: ${services.length} Leistungen, ${staff.length} Personen, ${pkgOut.length} Pakete`);
