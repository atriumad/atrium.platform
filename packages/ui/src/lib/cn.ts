/** Joins class names, dropping falsy entries. Later strings win by source order,
 *  not by specificity — do not rely on it to override a conflicting utility. */
export function cn(...inputs: Array<string | false | null | undefined>): string {
  return inputs.filter(Boolean).join(' ')
}
