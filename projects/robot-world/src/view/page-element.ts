/** Resolve required presentation elements here, keeping DOM queries out of main. */
export function pageElement<T extends HTMLElement>(selector: string): T {
  const result = document.querySelector<T>(selector);
  if (!result) throw new Error(`Required page element is missing: ${selector}`);
  return result;
}
