import type { DoingData } from "./doing-store";

type DoingListener = (data: DoingData) => void;

type DoingChannelState = {
  listeners: Set<DoingListener>;
};

const globalState = globalThis as typeof globalThis & {
  __nblogDoingChannel?: DoingChannelState;
};

const getState = (): DoingChannelState => {
  if (!globalState.__nblogDoingChannel) {
    globalState.__nblogDoingChannel = {
      listeners: new Set<DoingListener>(),
    };
  }
  return globalState.__nblogDoingChannel;
};

export const subscribeDoing = (listener: DoingListener) => {
  const state = getState();
  state.listeners.add(listener);
  return () => {
    state.listeners.delete(listener);
  };
};

export const publishDoing = (data: DoingData) => {
  const state = getState();
  for (const listener of state.listeners) {
    listener(data);
  }
};
