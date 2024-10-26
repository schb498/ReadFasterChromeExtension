import "@mantine/core/styles.css";
import { Container, MantineProvider, Switch, Text, Stack } from "@mantine/core";
import { useState } from "react";

function App() {
  const [isBolded, setIsBolded] = useState(false);
  const [isPopupBolded, setIsPopupBolded] = useState(false);

  const toggleWebpageBold = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "toggleBold",
          isBolded: !isBolded,
        });
      }
    });
    setIsBolded(!isBolded);
  };

  const togglePopupBold = () => {
    const textElements = document.body.querySelectorAll(
      "p, h1, h2, h3, h4, h5, h6, span, a, li"
    );

    if (!isPopupBolded) {
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
    } else {
      // Reset the text to normal
      textElements.forEach((element) => {
        const el = element as HTMLElement; // Type assertion
        el.innerHTML = el.innerHTML.replace(/<\/?span[^>]*>/g, "");
      });
    }

    setIsPopupBolded(!isPopupBolded);
  };

  return (
    <MantineProvider>
      <Container
        fluid
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          width: "400px",
          height: "100%",
        }}
      >
        <Stack align="center" justify="center" gap="md">
          <Switch
            checked={isBolded}
            onChange={toggleWebpageBold}
            onLabel="ON"
            offLabel="OFF"
            size="lg"
            color="teal"
          />
          <Text ta="center" size="md">
            Toggle webpage bolding
          </Text>

          <Switch
            checked={isPopupBolded}
            onChange={togglePopupBold}
            onLabel="ON"
            offLabel="OFF"
            size="lg"
            color="blue"
          />
          <Text ta="center" size="md">
            This is a Chrome extension that bolds the first half of each word on
            the page so that you can read the text faster. Currently in
            progress.
          </Text>
        </Stack>
      </Container>
    </MantineProvider>
  );
}

export default App;
