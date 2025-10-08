import "@mantine/core/styles.css";
import styles from "./App.module.css";
import {
  Container,
  MantineProvider,
  Switch,
  Text,
  Stack,
  Image,
  Group,
  Paper,
  Divider,
  Badge,
} from "@mantine/core";
import { useEffect, useState } from "react";

function App() {
  const [isBolded, setIsBolded] = useState(false);
  const [isPopupBolded, setIsPopupBolded] = useState(false);

  // Get the bold state for the current tab
  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (!tabId) return;

      chrome.storage.local.get([tabId.toString()], (result) => {
        setIsBolded(result[tabId.toString()] || false);
      });
    });
  }, []);

  const toggleWebpageBold = () => {
    const newValue = !isBolded;

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (!tabId) return;

      chrome.tabs.sendMessage(tabId, {
        action: "toggleBold",
        isBolded: newValue,
      });

      // Save bold state for this tab
      chrome.storage.local.set({ [tabId.toString()]: newValue });

      chrome.action.setBadgeText({
        text: newValue ? "ON" : "",
        tabId: tabId,
      });
      chrome.action.setBadgeBackgroundColor({
        color: "#14b8a6",
        tabId: tabId,
      });
    });

    setIsBolded(newValue);
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
            spanWrapper.innerHTML = words?.join(" ") || "";
            node.replaceWith(spanWrapper);
          }
        });
      });
    } else {
      // Reset the text to normal
      textElements.forEach((element) => {
        const el = element as HTMLElement;
        el.innerHTML = el.innerHTML.replace(/<\/?span[^>]*>/g, "");
      });
    }

    setIsPopupBolded(!isPopupBolded);
  };

  return (
    <MantineProvider>
      <Container fluid className={styles.container}>
        <Stack gap={0}>
          <Paper className={styles.header}>
            <Group justify="center" gap="sm">
              <Image src="icon128.png" alt="Logo" className={styles.logo} />
              <Text size="xl" fw={700} className={styles.title}>
                Half Word Bolder
              </Text>
            </Group>
            <Text ta="center" size="xs" c="dimmed" mt="xs">
              Improve reading experience by bolding the first half of each word
            </Text>
          </Paper>

          <Stack gap="lg" className={styles.content}>
            <Paper
              p="md"
              radius="md"
              className={`${styles.card} ${isBolded ? styles.cardActive : ""}`}
            >
              <Group justify="space-between" align="center">
                <div className={styles.cardText}>
                  <Group gap="xs" mb={4}>
                    <Text size="md" fw={600}>
                      Current Page
                    </Text>
                    {isBolded && (
                      <Badge size="sm" color="teal" variant="filled">
                        Active
                      </Badge>
                    )}
                  </Group>
                  <Text size="xs" c="dimmed">
                    Toggle bolding for this webpage
                  </Text>
                </div>
                <Switch
                  checked={isBolded}
                  onChange={toggleWebpageBold}
                  size="lg"
                  color="teal"
                  onLabel="ON"
                  offLabel="OFF"
                />
              </Group>
            </Paper>

            <Divider labelPosition="center" />

            <Paper
              p="md"
              radius="md"
              className={`${styles.card} ${
                isPopupBolded ? styles.cardActiveDemo : ""
              }`}
            >
              <Group justify="space-between" align="center">
                <div className={styles.cardText}>
                  <Group gap="xs" mb={4}>
                    <Text size="md" fw={600}>
                      Try Example
                    </Text>
                    {isPopupBolded && (
                      <Badge size="sm" color="blue" variant="filled">
                        Active
                      </Badge>
                    )}
                  </Group>
                  <Text size="xs" c="dimmed">
                    See the effect on this popup
                  </Text>
                </div>
                <Switch
                  checked={isPopupBolded}
                  onChange={togglePopupBold}
                  size="lg"
                  color="blue"
                  onLabel="ON"
                  offLabel="OFF"
                />
              </Group>
            </Paper>
          </Stack>
        </Stack>
      </Container>
    </MantineProvider>
  );
}

export default App;
