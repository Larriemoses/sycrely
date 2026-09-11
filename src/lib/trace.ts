export type TraceMessage<TDelivery = unknown> = {
  id: string;
  role: "user" | "assistant";
  protectedText?: string;
  delivery?: TDelivery;
  status?: "error";
};

export function resolveTraceContext<T extends TraceMessage>(messages: T[], selectedId: string | null) {
  const protectedMessages = messages.filter((message) => message.role === "user" && message.protectedText);
  const selected = (selectedId ? protectedMessages.find((message) => message.id === selectedId) : undefined)
    ?? protectedMessages.at(-1);
  if (!selected) return { selected: undefined, assistant: undefined, position: 0, total: 0 };

  const selectedIndex = messages.findIndex((message) => message.id === selected.id);
  const nextUserOffset = messages.slice(selectedIndex + 1).findIndex((message) => message.role === "user");
  const endIndex = nextUserOffset === -1 ? messages.length : selectedIndex + 1 + nextUserOffset;
  const assistant = messages.slice(selectedIndex + 1, endIndex).find((message) => message.role === "assistant");

  return {
    selected,
    assistant,
    position: protectedMessages.findIndex((message) => message.id === selected.id) + 1,
    total: protectedMessages.length,
  };
}
