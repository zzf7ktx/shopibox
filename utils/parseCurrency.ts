export const parseCurrency = (stringValue: string): number =>
  parseFloat(stringValue.replace(/[^0-9.]/g, ""));
