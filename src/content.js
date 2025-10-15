let isBolded = false;
let currentBoldWeight = 700;

// Bold the first half of every word in text nodes
const boldFirstHalfOfWords = (weight = 700) => {
  const textElements = document.body.querySelectorAll(
    "p, h1, h2, h3, h4, h5, h6, span, a, li, pre, b, i, strike, blockquote, strong, em, code, small, sub, sup"
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
            `<span data-hwb style="font-weight:${weight};">${cleanedWord.slice(
              0,
              halfIndex
            )}</span>` +
            `<span data-hwb style="font-weight:400;">${cleanedWord.slice(
              halfIndex
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
const boldFirstHalfOfSelectedWords = (text, weight = 700) => {
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
        `<span data-hwb style="font-weight:${weight};">${cleanedWord.slice(
          0,
          halfIndex
        )}</span>` +
        `<span data-hwb style="font-weight:400;">${cleanedWord.slice(
          halfIndex
        )}</span>` +
        trailingSymbols
      );
    })
    .join(" ");
};

const boldFirstHalfOfSelectedText = (weight = 700) => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return false;

  const range = selection.getRangeAt(0);
  const selectedText = range.toString().trim();

  if (!selectedText) return false;

  // Create a span element to hold the new formatted text
  const span = document.createElement("span");
  span.setAttribute("data-hwb", "");
  span.innerHTML = boldFirstHalfOfSelectedWords(selectedText, weight);

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

    if (request.isBolded && !isBolded) {
      const isSelectionBolded = boldFirstHalfOfSelectedText(currentBoldWeight);
      if (!isSelectionBolded) {
        boldFirstHalfOfWords(currentBoldWeight);
      }
      isBolded = true;
      sendResponse({ success: true, state: "bolded" });
    } else if (!request.isBolded && isBolded) {
      resetText();
      isBolded = false;
      sendResponse({ success: true, state: "reset" });
    }
  } else if (request.action === "updateBoldWeight") {
    currentBoldWeight = request.boldWeight;

    // Reapply bolding with new weight if currently active
    if (isBolded) {
      resetText();
      boldFirstHalfOfWords(currentBoldWeight);
      sendResponse({ success: true, state: "updated" });
    }
  }
});

// Get cursor selected text
document.addEventListener("mouseup", () => {
  const selectedText = window.getSelection().toString().trim();
  if (selectedText) {
    console.log("Selected Text:", selectedText);
    chrome.runtime.sendMessage({ text: selectedText });
  }
});
