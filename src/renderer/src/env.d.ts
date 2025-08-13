/// <reference types="vite/client" />

declare global {
  interface Window {
    api: {
      createTab: (url: string) => void;
      switchTab: (id: number) => void;
      closeTab: (id: number) => void;
      onTabsUpdated: (callback: (tabs: any[]) => void) => () => void;
    };
  }
}
