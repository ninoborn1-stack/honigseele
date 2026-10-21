// Gutscheine: prüfen, einlösen (Restwert bleibt), erzeugen.
import type { Cents, Voucher } from './types';

export type VoucherCheck =
  | { ok: true; voucher: Voucher; applicableCents: Cents }
  | { ok: false; reason: 'unbekannt' | 'abgelaufen' | 'aufgebraucht' | 'entwertet' };

export const normalizeCode = (code: string) => code.trim().toUpperCase().replace(/\s+/g, '');

export function checkVoucher(
  vouchers: Voucher[],
  code: string,
  amountCents: Cents,
  today: string,
): VoucherCheck {
  const voucher = vouchers.find((v) => v.code === normalizeCode(code));
  if (!voucher) return { ok: false, reason: 'unbekannt' };
  if (voucher.status === 'entwertet') return { ok: false, reason: 'entwertet' };
  if (voucher.validUntil < today) return { ok: false, reason: 'abgelaufen' };
  if (voucher.remainingCents <= 0) return { ok: false, reason: 'aufgebraucht' };
  return { ok: true, voucher, applicableCents: Math.min(voucher.remainingCents, amountCents) };
}

export function redeem(voucher: Voucher, amountCents: Cents): { voucher: Voucher; usedCents: Cents } {
  const usedCents = Math.min(voucher.remainingCents, amountCents);
  const remainingCents = voucher.remainingCents - usedCents;
  return {
    usedCents,
    voucher: { ...voucher, remainingCents, status: remainingCents === 0 ? 'eingeloest' : 'aktiv' },
  };
}

export const voucherMessages: Record<Exclude<VoucherCheck, { ok: true }>['reason'], string> = {
  unbekannt: 'Diesen Code kennen wir leider nicht.',
  abgelaufen: 'Dieser Gutschein ist leider abgelaufen.',
  aufgebraucht: 'Dieser Gutschein ist bereits vollständig eingelöst.',
  entwertet: 'Dieser Gutschein wurde entwertet.',
};

/** Lesbarer Code ohne verwechselbare Zeichen, z. B. HS-7K4Q-M2PX */
export function generateVoucherCode(random: () => number = Math.random): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const part = () =>
    Array.from({ length: 4 }, () => alphabet[Math.floor(random() * alphabet.length)]).join('');
  return `HS-${part()}-${part()}`;
}
