let isBolded = false;
let currentBoldWeight = 700;
let currentDimLevel = 1;
let isFullPageBold = false; // Added to track scope without changing existing logic

// Bold the first half of every word in text nodes
const boldFirstHalfOfWords = (weight = 700, dimLevel = 1) => {
  const textElements = document.body.querySelectorAll(
    "p, h1, h2, h3, h4, h5, h6, span, a, li, pre, b, i, strike, blockquote, strong, em, code, small, sub, sup",
  );

  textElements.forEach((element) => {
    element.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== "") {
        const words = node.textContent.split(" ").map((word) => {
          // Trim leading and trailing symbols
          const leadingSymbolsMatch = word.match(/^([^\w]+)/);
          const leadingSymbols = leadingSymbolsMatch
            ? leadingSymbolsMatch[0]
            : "";
          const trailingSymbolsMatch = word.match(/([^\w]+)$/);
          const trailingSymbols = trailingSymbolsMatch
            ? trailingSymbolsMatch[0]
            : "";
          const cleanedWord = word.replace(/^[^\w]+|[^\w]+$/g, "");

          // Skip if no actual word content
          if (!cleanedWord) {
            return word;
          }

          const halfIndex = Math.ceil(cleanedWord.length / 2);

          // Construct the word with inline styles and data attribute
          return (
            leadingSymbols +
            `<span data-hwb="bold" style="font-weight:${weight};">${cleanedWord.slice(
              0,
              halfIndex,
            )}</span>` +
            `<span data-hwb="light" style="font-weight:400;opacity:${dimLevel};">${cleanedWord.slice(
              halfIndex,
            )}</span>` +
            trailingSymbols
          );
        });

        const spanWrapper = document.createElement("span");
        spanWrapper.setAttribute("data-hwb", "");
        spanWrapper.innerHTML = words.join(" ");
        node.replaceWith(spanWrapper);
      }
    });
  });
};

// Bold only the selected text
const boldFirstHalfOfSelectedWords = (text, weight = 700, dimLevel = 1) => {
  return text
    .split(" ")
    .map((word) => {
      // Capture leading symbols
      const leadingSymbolsMatch = word.match(/^([^\w]+)/);
      const leadingSymbols = leadingSymbolsMatch ? leadingSymbolsMatch[0] : "";
      // Capture trailing symbols
      const trailingSymbolsMatch = word.match(/([^\w]+)$/);
      const trailingSymbols = trailingSymbolsMatch
        ? trailingSymbolsMatch[0]
        : "";
      // Clean the word by stripping leading and trailing symbols
      const cleanedWord = word.replace(/^[^\w]+|[^\w]+$/g, "");

      // Skip if no actual word content
      if (!cleanedWord) {
        return word;
      }

      const halfIndex = Math.ceil(cleanedWord.length / 2);

      return (
        leadingSymbols +
        `<span data-hwb="bold" style="font-weight:${weight};">${cleanedWord.slice(
          0,
          halfIndex,
        )}</span>` +
        `<span data-hwb="light" style="font-weight:400;opacity:${dimLevel};">${cleanedWord.slice(
          halfIndex,
        )}</span>` +
        trailingSymbols
      );
    })
    .join(" ");
};

const boldFirstHalfOfSelectedText = (weight = 700, dimLevel = 1) => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return false;

  const range = selection.getRangeAt(0);
  const selectedText = range.toString().trim();

  if (!selectedText) return false;

  // Create a span element to hold the new formatted text
  const span = document.createElement("span");
  span.setAttribute("data-hwb", "");
  span.innerHTML = boldFirstHalfOfSelectedWords(selectedText, weight, dimLevel);

  // Replace the selected text with the new span
  range.deleteContents();
  range.insertNode(span);

  return true;
};

// Function to reset the text to normal
const resetText = () => {
  // Only remove altered elements
  const allHwbElements = document.body.querySelectorAll("[data-hwb]");

  allHwbElements.forEach((element) => {
    const parent = element.parentNode;
    if (parent) {
      while (element.firstChild) {
        parent.insertBefore(element.firstChild, element);
      }
      parent.removeChild(element);
    }
  });

  // Normalize text nodes to merge adjacent text nodes
  document.body.normalize();
};

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggleBold") {
    currentBoldWeight = request.boldWeight || 700;
    currentDimLevel = request.dimLevel ?? 1;

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
        document.querySelectorAll('[data-hwb="bold"]').forEach((span) => {
          span.style.fontWeight = currentBoldWeight;
        });
        document.querySelectorAll('[data-hwb="light"]').forEach((span) => {
          span.style.opacity = currentDimLevel;
        });
      }
      sendResponse({ success: true, state: "updated" });
    }
  }
  return true;
});

