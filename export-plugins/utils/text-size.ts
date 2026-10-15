/**
 * Font-size scale shared by format overrides and the dev-tools preview.
 *
 * Each stepper size is a rem value. Its line-height is the value the published
 * style uses, so both sides read the same table.
 */

const LINE_HEIGHT_BY_REM: Readonly<Record<string, string>> = {
  '0.75rem': '1rem',
  '0.875rem': '1.25rem',
  '1rem': '1.5rem',
  '1.125rem': '1.75rem',
  '1.25rem': '1.75rem',
  '1.5rem': '2rem',
  '1.875rem': '2.25rem',
  '2.25rem': '2.5rem',
  '3rem': '1',
  '3.75rem': '1',
  '4.5rem': '1',
  '6rem': '1',
  '8rem': '1',
}

/** Stepper sizes in ascending order. */
export const SIZE_SCALE: readonly string[] = Object.keys(LINE_HEIGHT_BY_REM)

/** Maps a stepper size to its rem value. Throws for sizes outside the scale. */
export function remForSizeClass(size: string): string {
  if (!SIZE_SCALE.includes(size)) {
    throw new Error(`Unknown font size: ${size}`)
  }
  return size
}

/** Line-height for a rem font size, or undefined when the scale has no entry. */
export function lineHeightForFontSize(rem: string): string | undefined {
  return LINE_HEIGHT_BY_REM[rem]
}
