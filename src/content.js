// Function to bold the first half of every word in text nodes
const boldFirstHalfOfWords = () => {
  const textElements = document.body.querySelectorAll(
    "p, h1, h2, h3, h4, h5, h6, span, a, li"
  );

  textElements.forEach((element) => {
    element.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const words = node.textContent?.split(" ").map((word) => {
          // Capture leading symbols
          const leadingSymbolsMatch = word.match(/^([^\w]+)/);
          const leadingSymbols = leadingSymbolsMatch
            ? leadingSymbolsMatch[0]
            : "";

          // Capture trailing symbols
          const trailingSymbolsMatch = word.match(/([^\w]+)$/);
          const trailingSymbols = trailingSymbolsMatch
            ? trailingSymbolsMatch[0]
            : "";

          // Clean the word by stripping leading and trailing symbols
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

// Function to reset the text to normal
const resetText = () => {
  const textElements = document.body.querySelectorAll(
    "p, h1, h2, h3, h4, h5, h6, span, a, li"
  );

  // Reset the text to normal
  textElements.forEach((element) => {
    const el = element; // Type assertion
    el.innerHTML = el.innerHTML.replace(/<\/?span[^>]*>/g, ""); // Remove spans
  });
};

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "toggleBold") {
    if (request.isBolded) {
      boldFirstHalfOfWords(); // Call to bold the first half of words
    } else {
      resetText(); // Reset to normal text
    }
  }
});
