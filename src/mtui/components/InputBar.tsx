import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import TextInput from "ink-text-input";
import { LOBSTER_PALETTE } from "../../terminal/palette.js";

type InputBarProps = {
  onSubmit: (value: string) => void;
  status: string;
  model?: string;
};

export const InputBar: React.FC<InputBarProps> = ({ onSubmit, status, model }) => {
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const handleSubmit = (val: string) => {
    if (!val.trim()) return;
    setHistory((prev) => [val, ...prev].slice(0, 100));
    setHistoryIndex(-1);
    onSubmit(val);
    setValue("");
  };

  useInput((input, key) => {
    if (key.upArrow) {
      if (historyIndex < history.length - 1) {
        const nextIndex = historyIndex + 1;
        setHistoryIndex(nextIndex);
        setValue(history[nextIndex]);
      }
    }
    if (key.downArrow) {
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        setValue(history[nextIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setValue("");
      }
    }
  });

  const borderColor =
    status === "running" || status === "streaming" ? LOBSTER_PALETTE.warn : LOBSTER_PALETTE.accent;

  const modelLabel = model ? `(${model.split("/").pop()}) ` : "";

  return (
    <Box flexDirection="column">
      <Box paddingX={1} borderStyle="single" borderColor={borderColor}>
        <Text bold color={LOBSTER_PALETTE.accent}>
          moltbot {modelLabel} {">"}{" "}
        </Text>
        <TextInput
          value={value}
          onChange={setValue}
          onSubmit={handleSubmit}
          placeholder="Type a message, /command, or !bash..."
        />
      </Box>
    </Box>
  );
};
