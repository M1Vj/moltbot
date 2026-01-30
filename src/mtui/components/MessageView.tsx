import React from "react";
import { Box, Text } from "ink";
import { highlight } from "cli-highlight";
import type { Message } from "../hooks/useChat.js";
import { useSettings } from "../context/SettingsContext.js";
import { LOBSTER_PALETTE } from "../../terminal/palette.js";

type MessageViewProps = {
  message: Message;
};

export const MessageView: React.FC<MessageViewProps> = ({ message }) => {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";
  const { showThinking } = useSettings();

  const roleColor = isUser
    ? LOBSTER_PALETTE.info
    : isSystem
      ? LOBSTER_PALETTE.warn
      : LOBSTER_PALETTE.success;
  const roleName = isUser ? "YOU" : isSystem ? "SYSTEM" : "ASSISTANT";

  return (
    <Box flexDirection="column" marginBottom={1}>
      <Box marginBottom={0}>
        <Text bold color={roleColor}>
          {roleName}
        </Text>
      </Box>
      <Box paddingLeft={2} flexDirection="column">
        {message.thinking && (
          <Box flexDirection="column" marginY={0}>
            <Box>
              <Text color={LOBSTER_PALETTE.muted} italic>
                {showThinking ? "▼ Thinking" : "▶ Thinking (hidden)"}
              </Text>
            </Box>
            {showThinking && (
              <Box
                paddingLeft={1}
                borderStyle="single"
                borderColor={LOBSTER_PALETTE.muted}
                marginBottom={1}
              >
                <Text italic color={LOBSTER_PALETTE.muted}>
                  {message.thinking}
                </Text>
              </Box>
            )}
          </Box>
        )}

        {renderContent(message.content)}

        {message.tools && message.tools.length > 0 && (
          <Box flexDirection="column" marginTop={1}>
            {message.tools.map((tool) => (
              <Box
                key={tool.id}
                flexDirection="column"
                borderStyle="round"
                borderColor={LOBSTER_PALETTE.muted}
                paddingX={1}
                marginBottom={1}
              >
                <Box>
                  <Text bold color={LOBSTER_PALETTE.info}>
                    TOOL: {tool.name}
                  </Text>
                  {tool.isStreaming && (
                    <Box marginLeft={1}>
                      <Text color={LOBSTER_PALETTE.warn}>running...</Text>
                    </Box>
                  )}
                </Box>
                {tool.args && (
                  <Box marginTop={0}>
                    <Text dimColor>args: {JSON.stringify(tool.args)}</Text>
                  </Box>
                )}
                {tool.result && (
                  <Box marginTop={1} paddingLeft={1} borderStyle="single" borderColor="gray">
                    <Text color={tool.isError ? LOBSTER_PALETTE.error : LOBSTER_PALETTE.muted}>
                      {typeof tool.result === "string" ? tool.result : JSON.stringify(tool.result)}
                    </Text>
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

function renderContent(content: string) {
  if (!content) return null;
  const parts = content.split(/(```[\s\S]*?```)/g);
  return parts.map((part, i) => {
    if (part.startsWith("```")) {
      const match = part.match(/```(\w*)\n([\s\S]*?)```/);
      if (match) {
        const lang = match[1] || "text";
        const code = match[2];
        try {
          return (
            <Box
              key={i}
              marginY={1}
              paddingX={1}
              borderStyle="single"
              borderColor={LOBSTER_PALETTE.muted}
            >
              <Text>{highlight(code, { language: lang })}</Text>
            </Box>
          );
        } catch {
          return (
            <Box
              key={i}
              marginY={1}
              paddingX={1}
              borderStyle="single"
              borderColor={LOBSTER_PALETTE.muted}
            >
              <Text>{code}</Text>
            </Box>
          );
        }
      }
    }
    return <Text key={i}>{part}</Text>;
  });
}
