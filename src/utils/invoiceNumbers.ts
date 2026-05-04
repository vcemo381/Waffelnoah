export function nextInvoiceNumber(seed = 1): string {
  return `INV-${String(seed).padStart(6, "0")}`;
}
