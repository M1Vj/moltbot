import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import SelectInput from "ink-select-input";
import { LOBSTER_PALETTE } from "../../terminal/palette.js";

type Item = {
  label: string;
  value: string;
};

type SelectorProps = {
  title: string;
  items: Item[];
  onSelect: (item: Item) => void;
  onCancel: () => void;
};

export const Selector: React.FC<SelectorProps> = ({ title, items, onSelect, onCancel }) => {
  const [query, setQuery] = useState("");

  const filteredItems = items.filter(
    (item) =>
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      item.value.toLowerCase().includes(query.toLowerCase()),
  );

  useInput((input, key) => {
    if (key.escape) {
      onCancel();
    }
    if (!key.ctrl && !key.meta && input.length === 1 && !key.return) {
      setQuery((q) => q + input);
    }
    if (key.backspace || key.delete) {
      setQuery((q) => q.slice(0, -1));
    }
  });

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={LOBSTER_PALETTE.accent}
      paddingX={1}
      minWidth={40}
    >
      <Text bold color={LOBSTER_PALETTE.accent}>
        {title.toUpperCase()}
      </Text>
      <Box marginY={1}>
        <Text>Search: </Text>
        <Text color={LOBSTER_PALETTE.info}>{query}</Text>
        <Text color={LOBSTER_PALETTE.muted}>_</Text>
      </Box>
      <Box height={10} flexDirection="column">
        {filteredItems.length === 0 ? (
          <Text color={LOBSTER_PALETTE.muted}>No matches found.</Text>
        ) : (
          <SelectInput
            items={filteredItems.slice(0, 10)}
            onSelect={onSelect}
            indicatorComponent={({ isSelected }) => (
              <Text color={isSelected ? LOBSTER_PALETTE.accent : undefined}>
                {isSelected ? " › " : "   "}
              </Text>
            )}
            itemComponent={({ label, isSelected }) => (
              <Text color={isSelected ? LOBSTER_PALETTE.accentBright : undefined}>{label}</Text>
            )}
          />
        )}
      </Box>
      <Box marginTop={1} borderStyle="single" borderColor="gray" paddingX={1}>
        <Text dimColor>↑↓ select | Enter confirm | Esc cancel</Text>
      </Box>
    </Box>
  );
};
