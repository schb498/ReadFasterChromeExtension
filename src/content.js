// Function to bold the first half of every word in text nodes
const boldFirstHalfOfWords = () => {
  const textElements = document.body.querySelectorAll(
    "p, h1, h2, h3, h4, h5, h6, span, a, li"
  );

  textElements.forEach((element) => {
    const words = element.innerText.split(" ").map((word) => {
      const halfIndex = Math.ceil(word.length / 2);
      return `<span style="font-weight: bold;">${word.slice(
        0,
        halfIndex
      )}</span>${word.slice(halfIndex)}`;
    });

    element.innerHTML = words.join(" ");
  });
};

// Function to reset the text to normal
const resetText = () => {
  const textElements = document.body.querySelectorAll(
    "p, h1, h2, h3, h4, h5, h6, span, a, li"
  );

  textElements.forEach((element) => {
    const text = element.innerHTML.replace(/<\/?span[^>]*>/g, ""); // Remove all <span> tags
    element.innerHTML = text; // Set the cleaned text back to the element
  });
};

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "toggleBold") {
    if (request.isBolded) {
      boldFirstHalfOfWords();
    } else {
      resetText();
    }
  }
});
