// Function to bold the first half of every word in text nodes
const boldFirstHalfOfWords = () => {
  const textElements = document.body.querySelectorAll(
    "p, h1, h2, h3, h4, h5, h6, span, a, li, pre, b, i, strike, blockquote, strong, em, code, small, sub, sup"
  );

  textElements.forEach((element) => {
    element.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const words = node.textContent?.split(" ").map((word) => {
          // Clean leading/trailing symbols
          const leadingSymbolsMatch = word.match(/^([^\w]+)/);
          const leadingSymbols = leadingSymbolsMatch
            ? leadingSymbolsMatch[0]
            : "";
          const trailingSymbolsMatch = word.match(/([^\w]+)$/);
          const trailingSymbols = trailingSymbolsMatch
            ? trailingSymbolsMatch[0]
            : "";
          const cleanedWord = word.replace(/^[^\w]+|[^\w]+$/g, "");
          const halfIndex = Math.ceil(cleanedWord.length / 2);

          // Construct the word with inline styles for font weights
          return `${leadingSymbols}<span style="font-weight: 700;">${cleanedWord.slice(
            0,
            halfIndex
          )}</span><span style="font-weight: 400;">${cleanedWord.slice(
            halfIndex
          )}</span>${trailingSymbols}`;
        });

        // Create a span wrapper and set the HTML
        const spanWrapper = document.createElement("span");
        spanWrapper.innerHTML = words?.join(" ") || ""; // Handle undefined safely

        // Replace the original text node with the new span
        node.replaceWith(spanWrapper);
      }
    });
  });
};

const boldFirstHalfOfSelectedWords = (text) => {
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
      const halfIndex = Math.ceil(cleanedWord.length / 2);

      // Construct the bolded version of the word
      return `${leadingSymbols}<span style="font-weight: 700;">${cleanedWord.slice(
        0,
        halfIndex
      )}</span><span style="font-weight: 400;">${cleanedWord.slice(
        halfIndex
      )}</span>${trailingSymbols}`;
    })
    .join(" ");
};

const boldFirstHalfOfSelectedText = () => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return false;

  const range = selection.getRangeAt(0);
  const selectedText = range.toString().trim();

  if (!selectedText) return false;

  // Create a span element to hold the new formatted text
  const span = document.createElement("span");

  span.innerHTML = boldFirstHalfOfSelectedWords(selectedText);

  // Replace the selected text with the new span
  range.deleteContents();
  range.insertNode(span);

  return true; // Indicate that text was selected and bolded
};

// Function to reset the text to normal by refreshing the page
const resetText = () => {
  location.reload(); // Refresh the page
};

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "toggleBold") {
    if (request.isBolded) {
      const isSelectionBolded = boldFirstHalfOfSelectedText();
      if (!isSelectionBolded) {
        boldFirstHalfOfWords(); // Call to bold the first half of words for entire page
      }
    } else {
      resetText(); // Refresh the page
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
