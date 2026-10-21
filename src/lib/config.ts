// Zentrale Schalter. Werte kommen aus .env (NEXT_PUBLIC_* wird zur Build-Zeit eingesetzt).
export const DEMO = process.env.NEXT_PUBLIC_DEMO !== 'false';
export const HONEYCOMB = process.env.NEXT_PUBLIC_HONEYCOMB === 'true';
export const SITE_URL = 'https://honigseele.de';
