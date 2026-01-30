import React, { useState, useEffect, useMemo } from "react";
import { Box, Text, useInput, useApp, useStdout } from "ink";
import Spinner from "ink-spinner";
import { GatewayProvider, useGateway } from "./context/GatewayContext.js";
import { SettingsProvider, useSettings } from "./context/SettingsContext.js";
import { useChat } from "./hooks/useChat.js";
import { useCommands } from "./hooks/useCommands.js";
import { MessageView } from "./components/MessageView.js";
import { InputBar } from "./components/InputBar.js";
import { Selector } from "./components/Selector.js";
import type { TuiOptions } from "../tui/tui-types.js";
import { formatContextUsageLine } from "../tui/tui-formatters.js";
import { LOBSTER_PALETTE } from "../terminal/palette.js";

type AppProps = {
  options: TuiOptions;
};

const ChatApp: React.FC<{ options: TuiOptions }> = ({ options }) => {
  const { exit } = useApp();
  const { stdout } = useStdout();
  const gateway = useGateway();
  const { showThinking, setShowThinking } = useSettings();
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("connecting");
  const [error, setError] = useState<string | null>(null);
  const [overlay, setOverlay] = useState<{ type: "model" | "agent"; items: any[] } | null>(null);

  const {
    messages,
    status,
    sendMessage,
    addMessage,
    sessionInfo,
    sessionKey,
    refreshSessionInfo,
    loadHistory,
  } = useChat(options.session || "main");

  const { handleLocalShell, handleSlashCommand } = useCommands(
    sessionKey,
    addMessage,
    refreshSessionInfo,
  );

  const [scrollTop, setScrollTop] = useState(0);
  const [isAutoScroll, setIsAutoScroll] = useState(true);

  useEffect(() => {
    if (isAutoScroll) {
      setScrollTop(Math.max(0, messages.length - 1));
    }
  }, [messages.length, isAutoScroll]);

  useEffect(() => {
    gateway.onConnected = () => {
      setConnectionStatus("connected");
      setError(null);
      void loadHistory();
    };

    gateway.onDisconnected = (reason) => {
      setConnectionStatus("disconnected");
      setError(reason || "Connection closed");
    };

    gateway.start();

    return () => {
      gateway.stop();
    };
  }, [gateway, loadHistory]);

  const handleSubmit = async (value: string) => {
    if (value.startsWith("!")) {
      await handleLocalShell(value);
    } else if (value.startsWith("/")) {
      if (value === "/model") {
        const models = await gateway.listModels();
        setOverlay({
          type: "model",
          items: models.map((m) => ({
            label: `${m.provider}/${m.id}`,
            value: `${m.provider}/${m.id}`,
          })),
        });
      } else {
        await handleSlashCommand(value);
      }
    } else {
      await sendMessage(value);
    }
    setIsAutoScroll(true);
  };

  useInput((input, key) => {
    if (key.ctrl && input === "c") {
      exit();
    }
    if (key.escape && overlay) {
      setOverlay(null);
    }
    if (key.ctrl && input === "t") {
      setShowThinking(!showThinking);
    }
    if (key.pageUp) {
      setScrollTop((prev) => Math.max(0, prev - 5));
      setIsAutoScroll(false);
    }
    if (key.pageDown) {
      setScrollTop((prev) => Math.min(messages.length - 1, prev + 5));
      if (scrollTop >= messages.length - 6) setIsAutoScroll(true);
    }
  });

  const usageLine = formatContextUsageLine({
    total: sessionInfo.totalTokens,
    context: sessionInfo.contextTokens,
    remaining: (sessionInfo.contextTokens ?? 0) - (sessionInfo.totalTokens ?? 0),
    percent:
      sessionInfo.totalTokens && sessionInfo.contextTokens
        ? (sessionInfo.totalTokens / sessionInfo.contextTokens) * 100
        : null,
  });

  const visibleMessages = useMemo(() => {
    const windowSize = Math.max(5, stdout.rows - 12);
    const start = Math.max(0, Math.min(scrollTop, messages.length - windowSize));
    return messages.slice(start, start + windowSize);
  }, [messages, scrollTop, stdout.rows]);

  return (
    <Box flexDirection="column" padding={1} width="100%" height={stdout.rows}>
      <Box borderStyle="round" borderColor={LOBSTER_PALETTE.accent} paddingX={1} marginBottom={0}>
        <Text bold color="white">
          🦞 MOLTBOT MTUI
        </Text>
        <Box flexGrow={1} />
        <Box paddingX={2}>
          <Text color={LOBSTER_PALETTE.muted}>{sessionInfo.model || "no model"}</Text>
        </Box>
        <Text
          color={
            connectionStatus === "connected"
              ? LOBSTER_PALETTE.success
              : connectionStatus === "connecting"
                ? LOBSTER_PALETTE.warn
                : LOBSTER_PALETTE.error
          }
        >
          {connectionStatus === "connecting" && <Spinner type="dots" />} {connectionStatus}
        </Text>
      </Box>

      <Box flexGrow={1} flexDirection="column" marginY={1}>
        {overlay ? (
          <Box flexGrow={1} justifyContent="center" alignItems="center">
            <Selector
              title={`Select ${overlay.type}`}
              items={overlay.items}
              onSelect={async (item) => {
                if (overlay.type === "model") {
                  await gateway.patchSession({ key: sessionKey, model: item.value });
                  addMessage({
                    id: Math.random().toString(),
                    role: "system",
                    content: `Model set to ${item.value}`,
                  });
                  await refreshSessionInfo();
                }
                setOverlay(null);
              }}
              onCancel={() => setOverlay(null)}
            />
          </Box>
        ) : (
          <Box flexDirection="column" flexGrow={1}>
            {messages.length === 0 && connectionStatus === "connected" && (
              <Box flexGrow={1} justifyContent="center" alignItems="center">
                <Text color={LOBSTER_PALETTE.muted}>No messages. Start a conversation!</Text>
              </Box>
            )}
            {visibleMessages.map((msg, i) => (
              <MessageView key={msg.id || i} message={msg} />
            ))}
            {!isAutoScroll && (
              <Box justifyContent="center">
                <Text color={LOBSTER_PALETTE.warn}>[ Scrolling Up - Press PageDown to end ]</Text>
              </Box>
            )}
          </Box>
        )}
      </Box>

      {status === "running" && !overlay && (
        <Box paddingX={1} marginBottom={0}>
          <Text color={LOBSTER_PALETTE.warn}>
            <Spinner type="dots" /> assistant is thinking...
          </Text>
        </Box>
      )}

      {error && !overlay && (
        <Box paddingX={1} marginBottom={0}>
          <Text color={LOBSTER_PALETTE.error}>error: {error}</Text>
        </Box>
      )}

      {!overlay && (
        <Box flexDirection="column">
          <Box paddingX={1}>
            <Text color={LOBSTER_PALETTE.muted}>{usageLine}</Text>
          </Box>

          <InputBar onSubmit={handleSubmit} status={status} model={sessionInfo.model} />

          <Box paddingX={1} marginTop={0}>
            <Text color={LOBSTER_PALETTE.muted}>
              Ctrl+C exit | Ctrl+T think | PgUp/PgDn scroll | /model | /reset | !bash
            </Text>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export const App: React.FC<AppProps> = ({ options }) => {
  return (
    <SettingsProvider>
      <GatewayProvider options={options}>
        <ChatApp options={options} />
      </GatewayProvider>
    </SettingsProvider>
  );
};
