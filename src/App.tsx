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
  Button,
} from "@mantine/core";
import { useEffect, useState } from "react";

function App() {
  const [isBolded, setIsBolded] = useState(false);
  const [isPopupBolded, setIsPopupBolded] = useState(false);
  const [boldWeight, setBoldWeight] = useState(700);
  const [dimLevel, setDimLevel] = useState(1);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (!tabId) return;

      // Use tab-specific key to check if THIS tab is enabled
      chrome.storage.local.get(
        [`tab_${tabId}_enabled`, "boldWeight", "dimLevel"],
        (result) => {
          setIsBolded(result[`tab_${tabId}_enabled`] || false);
          setBoldWeight(result.boldWeight || 700);
          setDimLevel(result.dimLevel ?? 1);
        },
      );
    });
  }, []);

  const toggleWebpageBold = () => {
    const newValue = !isBolded;
    setIsBolded(newValue);

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (!tabId) return;

      chrome.scripting.executeScript(
        {
          target: { tabId },
          func: () => (window.getSelection()?.toString()?.trim().length ?? 0) > 0,
        },
        (results) => {
          const hasSelection = results[0]?.result;
          const mode = hasSelection ? "selection" : "global";

          // SAVE TAB-SPECIFIC STATE
          chrome.storage.local.set(
            {
              [`tab_${tabId}_enabled`]: newValue,
              [`tab_${tabId}_mode`]: mode,
            },
            () => {
              chrome.runtime.sendMessage({ action: "syncBadge" });
            },
          );

          chrome.tabs.sendMessage(tabId, {
            action: "toggleBold",
            isBolded: newValue,
            boldWeight: boldWeight,
            dimLevel: dimLevel,
          });
        },
      );
    });
  };

  const handleBoldWeightChange = (value: number) => {
    setBoldWeight(value);
    // Weight stays global as a preference
    chrome.storage.local.set({ boldWeight: value });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (tabId && isBolded) {
        chrome.tabs.sendMessage(tabId, {
          action: "updateBoldWeight",
          boldWeight: value,
        });
      }
    });
  };

  const handleDimChange = (value: number) => {
    setDimLevel(value);
    // Dim level stays global as a preference
    chrome.storage.local.set({ dimLevel: value });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (tabId && isBolded) {
        chrome.tabs.sendMessage(tabId, {
          action: "updateBoldWeight",
          dimLevel: value,
        });
      }
    });
  };

  const togglePopupBold = () => {
    const textElements = document.body.querySelectorAll(
      "p, h1, h2, h3, h4, h5, h6, span, a, li",
    );

    if (!isPopupBolded) {
      textElements.forEach((element) => {
        element.childNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            const words = node.textContent?.split(" ").map((word) => {
              const leadingSymbolsMatch = word.match(/^([^\w]+)/);
              const leadingSymbols = leadingSymbolsMatch
                ? leadingSymbolsMatch[0]
                : "";
              const trailingSymbolsMatch = word.match(/([^\w]+)$/);
              const trailingSymbols = trailingSymbolsMatch
                ? trailingSymbolsMatch[0]
                : "";
              const cleanedWord = word.replace(/^[^\w]+|[^\w]+$/g, "");
              if (!cleanedWord) return word;
              const halfIndex = Math.ceil(cleanedWord.length / 2);

              return `${leadingSymbols}<span style="font-weight: ${boldWeight};">${cleanedWord.slice(0, halfIndex)}</span><span style="font-weight: 400; opacity: ${dimLevel};">${cleanedWord.slice(halfIndex)}</span>${trailingSymbols}`;
            });

            const spanWrapper = document.createElement("span");
            spanWrapper.innerHTML = words?.join(" ") || "";
            node.replaceWith(spanWrapper);
          }
        });
      });
    } else {
      window.location.reload();
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
                </div>
                <Switch
                  checked={isBolded}
                  onChange={toggleWebpageBold}
                  size="lg"
                  color="teal"
                />
              </Group>
            </Paper>

            <Paper p="md" radius="md" className={styles.card}>
              <Stack gap="sm">
                <Group justify="space-between">
                  <Text size="md" fw={600}>
                    Boldness
                  </Text>
                  <Badge variant="light" color="gray">
                    {boldWeight}
                  </Badge>
                </Group>
                <Group grow>
                  {[300, 400, 600, 700, 900].map((w) => (
                    <Button
                      key={w}
                      variant={boldWeight === w ? "filled" : "light"}
                      color="violet"
                      size="xs"
                      px={4}
                      onClick={() => handleBoldWeightChange(w)}
                    >
                      {w}
                    </Button>
                  ))}
                </Group>
              </Stack>
            </Paper>

            <Paper p="md" radius="md" className={styles.card}>
              <Stack gap="sm">
                <Group justify="space-between">
                  <Text size="md" fw={600}>
                    Dimness
                  </Text>
                  <Badge variant="light" color="gray">
                    {Math.round(dimLevel * 100)}%
                  </Badge>
                </Group>
                <Group grow>
                  {[1, 0.7, 0.5, 0.3].map((w) => (
                    <Button
                      key={w}
                      variant={dimLevel === w ? "filled" : "light"}
                      color="cyan"
                      size="xs"
                      px={4}
                      onClick={() => handleDimChange(w)}
                    >
                      {Math.round(w * 100)}%
                    </Button>
                  ))}
                </Group>
              </Stack>
            </Paper>

            <Divider labelPosition="center" />

            <Paper
              p="md"
              radius="md"
              className={`${styles.card} ${isPopupBolded ? styles.cardActiveDemo : ""}`}
            >
              <Group justify="space-between" align="center">
                <div className={styles.cardText}>
                  <Text size="md" fw={600}>
                    Try Example
                  </Text>
                </div>
                <Switch
                  checked={isPopupBolded}
                  onChange={togglePopupBold}
                  size="lg"
                  color="blue"
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
