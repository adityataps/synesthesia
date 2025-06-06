// color picker frontend, developed with help of JetBrains Junie :)

import { useEffect, useState } from "react";
import "./App.css";
import {
  ActionIcon,
  Box,
  Button,
  ColorPicker,
  Flex,
  Group,
  Loader,
  Paper,
  Popover,
  Stack,
  Text,
  Title,
  Center,
  useMantineColorScheme,
} from "@mantine/core";

const API_URL = import.meta.env.VITE_API_URL ?? "";
console.log(API_URL);

// Define the color interface to match the backend
interface IColor {
  R: number;
  G: number;
  B: number;
  A: number;
}

// Define props interface for App component
interface AppProps {
  toggleColorScheme: () => void;
  colorScheme: "light" | "dark";
}

function App({ toggleColorScheme, colorScheme }: AppProps) {
  const [phrase, setPhrase] = useState("");
  const [tokens, setTokens] = useState<string[]>([]);
  const [colors, setColors] = useState<(IColor | null)[]>([]);
  const [selectedTokenIndex, setSelectedTokenIndex] = useState<number | null>(
    null,
  );
  const [hoveredTokenIndex, setHoveredTokenIndex] = useState<number | null>(
    null,
  );
  const [currentColor, setCurrentColor] =
    useState<string>("rgba(0, 0, 0, 0.1)");
  const [loading, setLoading] = useState(false);

  // // Predefined color swatches
  // const colorSwatches = [
  //   // Basic colors
  //   "rgba(255, 0, 0, 1)", // Red
  //   "rgba(0, 255, 0, 1)", // Green
  //   "rgba(0, 0, 255, 1)", // Blue
  //   "rgba(255, 255, 0, 1)", // Yellow
  //   "rgba(255, 0, 255, 1)", // Magenta
  //   "rgba(0, 255, 255, 1)", // Cyan
  //   "rgba(255, 165, 0, 1)", // Orange
  //   "rgba(128, 0, 128, 1)", // Purple
  //   "rgba(165, 42, 42, 1)", // Brown
  //   "rgba(0, 128, 0, 1)", // Dark Green
  //   "rgba(0, 0, 128, 1)", // Navy Blue
  //
  //   // Light shades
  //   "rgba(255, 182, 193, 1)", // Light Pink
  //   "rgba(173, 216, 230, 1)", // Light Blue
  //   "rgba(144, 238, 144, 1)", // Light Green
  //   "rgba(255, 255, 224, 1)", // Light Yellow
  //
  //   // Dark shades
  //   "rgba(139, 0, 0, 1)", // Dark Red
  //   "rgba(0, 100, 0, 1)", // Dark Green
  //   "rgba(0, 0, 139, 1)", // Dark Blue
  //   "rgba(128, 0, 0, 1)", // Maroon
  //
  //   // Semi-transparent colors
  //   "rgba(255, 0, 0, 0.5)", // Semi-transparent red
  //   "rgba(0, 255, 0, 0.5)", // Semi-transparent green
  //   "rgba(0, 0, 255, 0.5)", // Semi-transparent blue
  //   "rgba(255, 165, 0, 0.5)", // Semi-transparent orange
  //   "rgba(128, 0, 128, 0.5)", // Semi-transparent purple
  //
  //   // Different transparency levels
  //   "rgba(0, 0, 0, 0.25)", // 25% black
  //   "rgba(0, 0, 0, 0.5)", // 50% black
  //   "rgba(0, 0, 0, 0.75)", // 75% black
  //
  //   // Grayscale
  //   "rgba(255, 255, 255, 1)", // White
  //   "rgba(211, 211, 211, 1)", // Light Gray
  //   "rgba(128, 128, 128, 1)", // Gray
  //   "rgba(64, 64, 64, 1)", // Dark Gray
  //   "rgba(0, 0, 0, 1)", // Black
  // ];

  // Function to fetch a new phrase
  const fetchNewPhrase = () => {
    setLoading(true);
    fetch(`${API_URL}/tokenized_phrase`)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setPhrase(data.phrase);
        setTokens(data.tokens);
        // Initialize colors array with transparent values (rgba(0, 0, 0, 0)) for each token
        setColors(
          new Array(data.tokens.length).fill({ R: 0, G: 0, B: 0, A: 0.01 }),
        );
        // Reset selected and hovered tokens
        setSelectedTokenIndex(null);
        setHoveredTokenIndex(null);
      })
      .catch((error) => {
        console.error("Error fetching phrase:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Fetch initial phrase on component mount
  useEffect(() => {
    fetchNewPhrase();
  }, []);

  // Handle token click
  const handleTokenClick = (index: number) => {
    console.log(`Token clicked: ${index}`);

    // If clicking the same token, close the color picker
    if (selectedTokenIndex === index) {
      setSelectedTokenIndex(null);
      return;
    }

    setSelectedTokenIndex(index);

    // If this token already has a non-transparent color, set it as the current color
    if (colors[index] && colors[index]!.A > 0) {
      const { R, G, B, A } = colors[index]!;
      setCurrentColor(`rgba(${R}, ${G}, ${B}, ${A})`);
    } else {
      setCurrentColor("rgba(255, 255, 255, 0.01)");
    }
  };

  // Handle color selection
  const handleColorSelect = (color: string) => {
    setCurrentColor(color);

    // Update the token color in real-time if a token is selected
    if (selectedTokenIndex !== null) {
      // Parse the RGBA values from the color string
      const rgbaMatch = color.match(
        /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([0-9.]+))?\)/,
      );
      let R = 255,
        G = 255,
        B = 255,
        A = 0.01; // Default alpha to 0.01 (fully transparent)

      if (rgbaMatch) {
        R = parseInt(rgbaMatch[1]);
        G = parseInt(rgbaMatch[2]);
        B = parseInt(rgbaMatch[3]);
        A = rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 0.01;
      } else {
        // Handle hex color
        const hex = color.replace("#", "");
        R = parseInt(hex.substring(0, 2), 16);
        G = parseInt(hex.substring(2, 4), 16);
        B = parseInt(hex.substring(4, 6), 16);
        // For hex colors, we don't have alpha information, so default to 1
        A = 0.01;
      }

      // Update the colors array with the new color
      const newColors = [...colors];
      newColors[selectedTokenIndex] = { R, G, B, A };
      setColors(newColors);
    }
  };

  // Handle color confirmation
  const handleColorConfirm = () => {
    // The color is already updated in real-time by handleColorSelect
    // Just close the color picker
    if (selectedTokenIndex !== null) {
      setSelectedTokenIndex(null);
    }
  };

  // Handle copying color from previous token
  const handleCopyFromPrevious = () => {
    if (selectedTokenIndex !== null && selectedTokenIndex > 0) {
      const previousColor = colors[selectedTokenIndex - 1];
      if (previousColor) {
        const { R, G, B, A } = previousColor;
        // Update the text representation of the color
        setCurrentColor(`rgba(${R}, ${G}, ${B}, ${A})`);

        // Update the colors array for the selected token
        const newColors = [...colors];
        newColors[selectedTokenIndex] = { R, G, B, A };
        setColors(newColors);
      }
    }
  };

  // Handle copying color from next token
  const handleCopyFromNext = () => {
    if (selectedTokenIndex !== null && selectedTokenIndex < tokens.length - 1) {
      const nextColor = colors[selectedTokenIndex + 1];
      if (nextColor) {
        const { R, G, B, A } = nextColor;
        // Update the text representation of the color
        setCurrentColor(`rgba(${R}, ${G}, ${B}, ${A})`);

        // Update the colors array for the selected token
        const newColors = [...colors];
        newColors[selectedTokenIndex] = { R, G, B, A };
        setColors(newColors);
      }
    }
  };

  // Handle submit
  const handleSubmit = () => {
    // Prepare data for submission
    const data = {
      phrase,
      tokens,
      colors,
    };

    // Send data to API
    fetch(`${API_URL}/save_sample`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (response.ok) {
          alert("Colors submitted successfully!");
          // Fetch a new phrase after a successful submission
          fetchNewPhrase();
        } else {
          alert("Failed to submit colors. Please try again.");
        }
      })
      .catch((error) => {
        console.error("Error submitting colors:", error);
        alert("An error occurred while submitting colors.");
      });
  };

  // Create icon components for light and dark mode
  const LightModeIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
  );

  const DarkModeIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  );

  return (
    <Box p="md">
      <Stack spacing="lg">
        <Group position="apart" align="center">
          <Title order={2}>Synesthesia Color Picker</Title>
          <ActionIcon
            variant="outline"
            color={colorScheme === "dark" ? "yellow" : "blue"}
            onClick={toggleColorScheme}
            title={
              colorScheme === "dark"
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
            size="lg"
          >
            {colorScheme === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
          </ActionIcon>
        </Group>

        <Paper p="md" withBorder>
          <Title order={3} mb="md">
            Phrase
          </Title>
          {loading ? (
            <Center my="md">
              <Loader size="md" />
            </Center>
          ) : (
            <Text size="lg">"{phrase}"</Text>
          )}
        </Paper>

        <Paper p="md" withBorder>
          <Title order={3} mb="md">
            Tokens
          </Title>
          <Flex
            wrap="wrap"
            gap="sm"
            style={{
              background:
                colorScheme === "dark"
                  ? "repeating-conic-gradient(#555555 0% 25%, #333333 0% 50%) 50% / 20px 20px"
                  : "repeating-conic-gradient(#AAAAAA 0% 25%, #FFFFFF 0% 50%) 50% / 20px 20px",
              padding: "10px",
              borderRadius: "4px",
            }}
          >
            {tokens.map((token, index) => (
              <Popover
                key={index}
                position="bottom"
                shadow="md"
                opened={
                  selectedTokenIndex === index || hoveredTokenIndex === index
                }
                withArrow
                closeOnClickOutside
                trapFocus
                width={800}
                onClose={() => {
                  if (selectedTokenIndex === index) {
                    // Close the color picker
                    setSelectedTokenIndex(null);
                  }
                  if (hoveredTokenIndex === index) {
                    setHoveredTokenIndex(null);
                  }
                }}
              >
                <Popover.Target>
                  <Paper
                    p="md"
                    withBorder
                    style={{
                      cursor: "pointer",
                      backgroundColor:
                        colors[index] && colors[index]?.A > 0
                          ? `rgba(${colors[index]?.R}, ${colors[index]?.G}, ${colors[index]?.B}, ${colors[index]?.A})`
                          : undefined,
                      color: "black",
                    }}
                    onClick={(e) => {
                      console.log(`Paper onClick triggered for token ${index}`);
                      e.stopPropagation(); // Prevent event bubbling
                      handleTokenClick(index);
                    }}
                  >
                    <Text
                      size="xl"
                      fw="bold"
                      style={{
                        textShadow:
                          "0 0 2px white, 0 0 2px white, 0 0 2px white, 0 0 2px white",
                      }}
                    >
                      {token}
                    </Text>
                  </Paper>
                </Popover.Target>
                <Popover.Dropdown>
                  <Stack>
                    <ColorPicker
                      format="rgba"
                      value={currentColor}
                      onChange={handleColorSelect}
                      size="xs"
                      fullWidth
                      // withAlpha
                    />
                    <Text>{currentColor}</Text>
                    {/* Neighboring token color copy buttons */}
                    {selectedTokenIndex !== null && (
                      <Group position="center" spacing="xs">
                        <Text size="xs" fw="bold">
                          Copy from:
                        </Text>
                        <Button
                          size="xs"
                          variant="light"
                          color="blue"
                          disabled={
                            selectedTokenIndex <= 0 ||
                            !colors[selectedTokenIndex - 1] ||
                            colors[selectedTokenIndex - 1]?.A === 0
                          }
                          onClick={handleCopyFromPrevious}
                          title="Copy color from previous token"
                        >
                          ← Prev
                        </Button>
                        <Button
                          size="xs"
                          variant="light"
                          color="blue"
                          disabled={
                            selectedTokenIndex >= tokens.length - 1 ||
                            !colors[selectedTokenIndex + 1] ||
                            colors[selectedTokenIndex + 1]?.A === 0
                          }
                          onClick={handleCopyFromNext}
                          title="Copy color from next token"
                        >
                          Next →
                        </Button>
                      </Group>
                    )}
                    <Group position="right" mt="xs">
                      <Button
                        size="xs"
                        variant="outline"
                        color="red"
                        onClick={() => {
                          // Reset color for this token
                          if (selectedTokenIndex !== null) {
                            const newColors = [...colors];
                            newColors[selectedTokenIndex] = {
                              R: 0,
                              G: 0,
                              B: 0,
                              A: 0.01,
                            };
                            setColors(newColors);
                            setSelectedTokenIndex(null);
                          }
                        }}
                      >
                        Reset
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => setSelectedTokenIndex(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="xs"
                        variant="light"
                        color="blue"
                        onClick={handleColorConfirm}
                      >
                        Done
                      </Button>
                    </Group>
                  </Stack>
                </Popover.Dropdown>
              </Popover>
            ))}
          </Flex>
        </Paper>

        <Group position="apart" justify="center" mt="md">
          <Group>
            <Button color="blue" onClick={fetchNewPhrase} loading={loading}>
              Skip to Next Phrase
            </Button>
            <Button
              color="red"
              variant="outline"
              onClick={() =>
                setColors(
                  new Array(tokens.length).fill({ R: 0, G: 0, B: 0, A: 0 }),
                )
              }
              disabled={loading}
            >
              Reset All Colors
            </Button>
          </Group>
          <Button color="green" onClick={handleSubmit} disabled={loading}>
            Submit Colors
          </Button>
        </Group>
      </Stack>
    </Box>
  );
}

export default App;
