import { useCallback, useEffect, useState } from "react";

interface BaseTab {
  id: string;
  url: string;
  title: string;
}

export function useTabs() {
  const [tabs, setTabs] = useState<BaseTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial tabs
  useEffect(() => {
    const loadTabs = async () => {
      try {
        const result = await window.electronAPI.tabs.getAll();
        setTabs(result.tabs);
        setActiveTabId(result.activeTabId);
      } catch (error) {
        console.error("Failed to load tabs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTabs();
  }, []);

  // Setup event listeners
  useEffect(() => {
    // Tab created event
    window.electronAPI.onTabCreated((data) => {
      setTabs((prevTabs) => [
        ...prevTabs,
        {
          id: data.id,
          url: data.url,
          title: data.title,
        },
      ]);
    });

    // Tab switched event
    window.electronAPI.onTabSwitched((data) => {
      setActiveTabId(data.activeTabId);
    });

    // Tab closed event
    window.electronAPI.onTabClosed((data) => {
      setTabs((prev) => prev.filter((t) => t.id !== data.closedTabId));
      setActiveTabId(data.activeTabId);
    });

    // Tab navigated event
    window.electronAPI.onTabNavigated((data) => {
      setTabs((prevTabs) =>
        prevTabs.map((tab) =>
          tab.id === data.tabId ? { ...tab, url: data.url } : tab,
        ),
      );
    });

    // Cleanup event listeners
    return () => {
      window.electronAPI.removeAllListeners("tabs:created");
      window.electronAPI.removeAllListeners("tabs:switched");
      window.electronAPI.removeAllListeners("tabs:closed");
      window.electronAPI.removeAllListeners("tabs:navigated");
    };
  }, []);

  // Create new tab
  const createTab = useCallback(async (url?: string) => {
    try {
      await window.electronAPI.tabs.create(url);
    } catch (error) {
      console.error("Failed to create tab:", error);
    }
  }, []);

  // Switch tab
  const switchTab = useCallback(async (id: string) => {
    try {
      await window.electronAPI.tabs.switch(id);
    } catch (error) {
      console.error("Failed to switch tab:", error);
    }
  }, []);

  // Close tab
  const closeTab = useCallback(async (id: string) => {
    try {
      await window.electronAPI.tabs.close(id);
    } catch (error) {
      console.error("Failed to close tab:", error);
    }
  }, []);

  // Navigate tab
  const navigateTab = useCallback(async (id: string, url: string) => {
    try {
      await window.electronAPI.tabs.navigate(id, url);
    } catch (error) {
      console.error("Failed to navigate tab:", error);
    }
  }, []);

  return {
    tabs: tabs.map((t) => ({ ...t, isActive: t.id === activeTabId })),
    activeTabId,
    isLoading,
    createTab,
    switchTab,
    closeTab,
    navigateTab,
  };
}
