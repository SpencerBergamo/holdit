/**
 * Formats optional snapshot price fields for list/detail UI.
 */
export function formatPrice(
  priceCents: number | null | undefined,
  currency: string | null | undefined,
): string | null {
  if (priceCents == null || !Number.isFinite(priceCents)) {
    return null;
  }

  const code = currency?.trim() || 'USD';

  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: code,
    }).format(priceCents / 100);
  } catch {
    return `$${(priceCents / 100).toFixed(2)}`;
  }
}
