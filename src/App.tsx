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
import { boldifyText } from "./boldText";

const SAMPLE_TEXT =
  "Reading is easier when the first half of each word stands out.";

// Ignore errors from tabs with no content script (chrome://, Web Store, PDFs).
const sendToTab = (tabId: number, message: object) => {
  chrome.tabs.sendMessage(tabId, message, () => void chrome.runtime.lastError);
};

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

          sendToTab(tabId, {
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
        sendToTab(tabId, {
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
        sendToTab(tabId, {
          action: "updateBoldWeight",
          dimLevel: value,
        });
      }
    });
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
                  onChange={() => setIsPopupBolded((v) => !v)}
                  size="lg"
                  color="blue"
                />
              </Group>
              {isPopupBolded && (
                <Text
                  size="sm"
                  mt="sm"
                  dangerouslySetInnerHTML={{
                    __html: boldifyText(SAMPLE_TEXT, boldWeight, dimLevel),
                  }}
                />
              )}
            </Paper>
          </Stack>
        </Stack>
      </Container>
    </MantineProvider>
  );
}

export default App;
