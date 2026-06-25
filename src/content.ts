import { boldifyText, BOLD_WEIGHT_DEFAULT, DIM_LEVEL_DEFAULT } from "./boldText";

let isBolded = false;
let currentBoldWeight: number = BOLD_WEIGHT_DEFAULT;
let currentDimLevel: number = DIM_LEVEL_DEFAULT;
let isFullPageBold = false; // Track scope so weight/dim updates re-apply correctly

// Bold the first half of every word in text nodes across the page
const boldFirstHalfOfWords = (
  weight = BOLD_WEIGHT_DEFAULT,
  dimLevel = DIM_LEVEL_DEFAULT,
): void => {
  const textElements = document.body.querySelectorAll(
    "p, h1, h2, h3, h4, h5, h6, span, a, li, pre, b, i, strike, blockquote, strong, em, code, small, sub, sup",
  );

  textElements.forEach((element) => {
    element.childNodes.forEach((node) => {
      if (
        node.nodeType === Node.TEXT_NODE &&
        node.textContent &&
        node.textContent.trim() !== ""
      ) {
        const spanWrapper = document.createElement("span");
        spanWrapper.setAttribute("data-hwb", "");
        spanWrapper.innerHTML = boldifyText(node.textContent, weight, dimLevel);
        node.replaceWith(spanWrapper);
      }
    });
  });
};

// Bold only the currently selected text
const boldFirstHalfOfSelectedText = (
  weight = BOLD_WEIGHT_DEFAULT,
  dimLevel = DIM_LEVEL_DEFAULT,
): boolean => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return false;

  const range = selection.getRangeAt(0);
  const selectedText = range.toString().trim();
  if (!selectedText) return false;

  const span = document.createElement("span");
  span.setAttribute("data-hwb", "");
  span.innerHTML = boldifyText(selectedText, weight, dimLevel);

  range.deleteContents();
  range.insertNode(span);
  return true;
};

// Undo every change by unwrapping elements we marked with data-hwb
const resetText = (): void => {
  document.body.querySelectorAll("[data-hwb]").forEach((element) => {
    const parent = element.parentNode;
    if (parent) {
      while (element.firstChild) {
        parent.insertBefore(element.firstChild, element);
      }
      parent.removeChild(element);
    }
  });

  // Merge adjacent text nodes left behind by unwrapping
  document.body.normalize();
};

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === "toggleBold") {
    currentBoldWeight = request.boldWeight ?? BOLD_WEIGHT_DEFAULT;
    currentDimLevel = request.dimLevel ?? DIM_LEVEL_DEFAULT;

    if (request.isBolded) {
      const selectionApplied = boldFirstHalfOfSelectedText(
        currentBoldWeight,
        currentDimLevel,
      );
      isBolded = true;
      isFullPageBold = !selectionApplied;

      if (!selectionApplied) {
        boldFirstHalfOfWords(currentBoldWeight, currentDimLevel);
      }
      sendResponse({ success: true, state: "bolded" });
    } else {
      resetText();
      isBolded = false;
      isFullPageBold = false;
      sendResponse({ success: true, state: "reset" });
    }
  } else if (request.action === "updateBoldWeight") {
    if (request.boldWeight != null) currentBoldWeight = request.boldWeight;
    if (request.dimLevel != null) currentDimLevel = request.dimLevel;
    if (isBolded) {
      if (isFullPageBold) {
        resetText();
        boldFirstHalfOfWords(currentBoldWeight, currentDimLevel);
      } else {
        // Selection mode: update existing spans in-place by role
        document
          .querySelectorAll<HTMLElement>('[data-hwb="bold"]')
          .forEach((span) => {
            span.style.fontWeight = String(currentBoldWeight);
          });
        document
          .querySelectorAll<HTMLElement>('[data-hwb="light"]')
          .forEach((span) => {
            span.style.opacity = String(currentDimLevel);
          });
      }
      sendResponse({ success: true, state: "updated" });
    }
  }
  return true;
});
