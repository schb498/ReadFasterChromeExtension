// Shared word-bolding logic used by the content script and the popup preview.

export const BOLD_WEIGHT_DEFAULT = 700;
export const DIM_LEVEL_DEFAULT = 1;

// Escape characters that would otherwise be reinterpreted as markup when the
// generated string is assigned to innerHTML / dangerouslySetInnerHTML.
const escapeHtml = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Splits `text` on spaces and wraps each word so its first half is bolded
// (data-hwb="bold") and its second half is de-emphasized via opacity
// (data-hwb="light"). All page-derived text is escaped before injection.
export const boldifyText = (
  text: string,
  boldWeight: number = BOLD_WEIGHT_DEFAULT,
  dimLevel: number = DIM_LEVEL_DEFAULT,
): string =>
  text
    .split(" ")
    .map((word) => {
      const leadingSymbols = word.match(/^([^\w]+)/)?.[0] ?? "";
      const trailingSymbols = word.match(/([^\w]+)$/)?.[0] ?? "";
      const cleanedWord = word.replace(/^[^\w]+|[^\w]+$/g, "");

      // No actual word content (e.g. standalone punctuation) — pass through.
      if (!cleanedWord) return escapeHtml(word);

      const halfIndex = Math.ceil(cleanedWord.length / 2);
      const firstHalf = escapeHtml(cleanedWord.slice(0, halfIndex));
      const secondHalf = escapeHtml(cleanedWord.slice(halfIndex));

      return (
        escapeHtml(leadingSymbols) +
        `<span data-hwb="bold" style="font-weight:${boldWeight};">${firstHalf}</span>` +
        `<span data-hwb="light" style="font-weight:400;opacity:${dimLevel};">${secondHalf}</span>` +
        escapeHtml(trailingSymbols)
      );
    })
    .join(" ");
