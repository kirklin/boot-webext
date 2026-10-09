/**
 * Radix reads `document.activeElement` to keep focus inside dialogs and to move it
 * through select options. Inside a shadow root that value is always the shadow host,
 * so Tab escapes dialogs and arrow keys stop working. Content scripts run in an
 * isolated world with their own copy of `Document.prototype`, so following focus into
 * shadow roots here only changes what the extension's own code sees.
 */
export function followFocusIntoShadowRoots() {
  const descriptor = Object.getOwnPropertyDescriptor(Document.prototype, "activeElement");
  const getActiveElement = descriptor?.get;
  if (!descriptor || !getActiveElement) {
    throw new Error("Document.prototype.activeElement has no getter");
  }

  Object.defineProperty(Document.prototype, "activeElement", {
    ...descriptor,
    get(this: Document) {
      let element = getActiveElement.call(this) as Element | null;
      while (element?.shadowRoot?.activeElement) {
        element = element.shadowRoot.activeElement;
      }
      return element;
    },
  });
}
