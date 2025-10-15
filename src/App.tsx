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

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (!tabId) return;

      chrome.storage.local.get(
        [tabId.toString(), `${tabId}_weight`],
        (result) => {
          setIsBolded(result[tabId.toString()] || false);
          setBoldWeight(result[`${tabId}_weight`] || 700);
        }
      );
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
        boldWeight: boldWeight,
      });

      chrome.storage.local.set({ [tabId.toString()]: newValue });

      chrome.action.setBadgeText({
        text: newValue ? "ON" : "",
        tabId: tabId,
      });
      chrome.action.setBadgeBackgroundColor({
        color: newValue ? "#667eea" : "#00000000",
        tabId: tabId,
      });
    });

    setIsBolded(newValue);
  };

  const handleBoldWeightChange = (value: number) => {
    setBoldWeight(value);

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (!tabId) return;

      chrome.storage.local.set({ [`${tabId}_weight`]: value });

      if (isBolded) {
        chrome.tabs.sendMessage(tabId, {
          action: "updateBoldWeight",
          boldWeight: value,
        });
      }
    });
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

              return `${leadingSymbols}<span style="font-weight: ${boldWeight};">${cleanedWord.slice(
                0,
                halfIndex
              )}</span><span style="font-weight: 400;">${cleanedWord.slice(
                halfIndex
              )}</span>${trailingSymbols}`;
            });

            const spanWrapper = document.createElement("span");
            spanWrapper.innerHTML = words?.join(" ") || "";
            node.replaceWith(spanWrapper);
          }
        });
      });
    } else {
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
                <Text size="xs" c="dimmed" mb="xs">
                  Adjust the weight of the bolded text
                </Text>
                <Group grow>
                  <Button
                    variant={boldWeight === 300 ? "filled" : "light"}
                    color="violet"
                    size="xs"
                    onClick={() => handleBoldWeightChange(300)}
                  >
                    Light
                  </Button>
                  <Button
                    variant={boldWeight === 400 ? "filled" : "light"}
                    color="violet"
                    size="xs"
                    onClick={() => handleBoldWeightChange(400)}
                  >
                    Normal
                  </Button>
                  <Button
                    variant={boldWeight === 600 ? "filled" : "light"}
                    color="violet"
                    size="xs"
                    onClick={() => handleBoldWeightChange(600)}
                  >
                    Semi
                  </Button>
                  <Button
                    variant={boldWeight === 700 ? "filled" : "light"}
                    color="violet"
                    size="xs"
                    onClick={() => handleBoldWeightChange(700)}
                  >
                    Bold
                  </Button>
                  <Button
                    variant={boldWeight === 900 ? "filled" : "light"}
                    color="violet"
                    size="xs"
                    onClick={() => handleBoldWeightChange(900)}
                  >
                    Black
                  </Button>
                </Group>
              </Stack>
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
