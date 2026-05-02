export const NAMED_COLORS: Readonly<Record<string, number>> = Object.freeze({
  blurple: 0x5865f2,
  green: 0x57f287,
  yellow: 0xfee75c,
  red: 0xed4245,
  orange: 0xe67e22,
  pink: 0xeb459e,
  purple: 0x9b59b6,
  blue: 0x3498db,
  cyan: 0x1abc9c,
  white: 0xffffff,
  black: 0x000000,
  gray: 0x99aab5,
  grey: 0x99aab5,
  success: 0x57f287,
  warning: 0xfee75c,
  error: 0xed4245,
  info: 0x3498db,
});

export function parseColor(input: string): number | undefined {
  const trimmed = input.trim().toLowerCase();
  if (trimmed in NAMED_COLORS) return NAMED_COLORS[trimmed];

  const hex = trimmed.startsWith("#") ? trimmed.slice(1) : trimmed.replace(/^0x/, "");
  if (/^[0-9a-f]{6}$/.test(hex)) return Number.parseInt(hex, 16);

  if (/^\d+$/.test(trimmed)) {
    const num = Number.parseInt(trimmed, 10);
    if (num >= 0 && num <= 0xffffff) return num;
  }

  return undefined;
}
