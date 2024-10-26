import "@mantine/core/styles.css";
import { Container, MantineProvider, Switch, Text, Stack } from "@mantine/core";
import { useState } from "react"; // Import useState

function App() {
  // State to track if the text is bolded
  const [isBolded, setIsBolded] = useState(false);

  // Function to make the first half of every word bold or reset it
  const toggleBoldFirstHalfOfWords = () => {
    // Select all text nodes within the body
    const textElements = document.body.querySelectorAll(
      "p, h1, h2, h3, h4, h5, h6, span, a, li"
    );

    if (!isBolded) {
      // Bold the first half of every word
      textElements.forEach((element) => {
        const words = (element as HTMLElement).innerText
          .split(" ")
          .map((word) => {
            const halfIndex = Math.ceil(word.length / 2);
            return `<span style="font-weight: bold;">${word.slice(
              0,
              halfIndex
            )}</span>${word.slice(halfIndex)}`;
          });

        (element as HTMLElement).innerHTML = words.join(" ");
      });
    } else {
      // Reset the text to normal
      textElements.forEach((element) => {
        const text = (element as HTMLElement).innerHTML.replace(
          /<\/?span[^>]*>/g,
          ""
        ); // Remove all <span> tags
        (element as HTMLElement).innerHTML = text; // Set the cleaned text back to the element
      });
    }

    // Toggle the isBolded state
    setIsBolded(!isBolded);
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
          width: "400px", // Set a max width for the extension popup
          height: "100%", // Fill the height
        }}
      >
        <Stack align="center" justify="center" gap="md">
          <Switch
            checked={isBolded}
            onChange={toggleBoldFirstHalfOfWords}
            onLabel="ON"
            offLabel="OFF"
            size="lg"
            color="teal"
          />
          <Text ta="center" size="sm">
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
