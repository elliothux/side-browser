import { Button } from "@/components/ui/button";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";

interface Tab {
  id: number;
  title: string;
  url: string;
}

export function TabBar() {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<number | null>(null);

  useEffect(() => {
    const cleanup = window.api.onTabsUpdated((updatedTabs) => {
      setTabs(updatedTabs);

      setActiveTabId((currentActiveTab) => {
        const activeTabExists = updatedTabs.some(
          (tab) => tab.id === currentActiveTab,
        );

        if (activeTabExists) {
          return currentActiveTab; // Active tab still exists, no change
        }
        if (updatedTabs.length > 0) {
          const newActiveId = updatedTabs[0].id;
          window.api.switchTab(newActiveId); // Tell main process to switch view
          return newActiveId; // Switch to the first available tab
        }
        return null; // No tabs left
      });
    });

    return () => {
      cleanup();
    };
  }, []); // Empty dependency array ensures this runs only once

  const handleNewTab = () => {
    const url = prompt("Enter URL for new tab:", "https://github.com");
    if (url) {
      window.api.createTab(url);
    }
  };

  const handleSwitchTab = (id: number) => {
    setActiveTabId(id);
    window.api.switchTab(id);
  };

  const handleCloseTab = (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); // Prevent switchTab from firing
    window.api.closeTab(id);
  };

  return (
    <div
      className="flex h-12 w-full items-center space-x-2 bg-gray-100 p-2 select-none dark:bg-gray-800"
      style={{ WebkitAppRegion: "drag" }}
    >
      <div className="flex items-center space-x-1 overflow-x-auto">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTabId === tab.id ? "secondary" : "ghost"}
            size="sm"
            onClick={() => handleSwitchTab(tab.id)}
            className="h-8 flex-shrink-0 px-2 text-xs"
            style={{ WebkitAppRegion: "no-drag" }}
          >
            <span className="max-w-28 truncate">
              {tab.title || "Loading..."}
            </span>
            <XMarkIcon
              className="ml-2 h-4 w-4 flex-shrink-0 rounded-full p-0.5 hover:bg-red-500/20"
              onClick={(e) => handleCloseTab(e, tab.id)}
            />
          </Button>
        ))}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 flex-shrink-0"
        onClick={handleNewTab}
        style={{ WebkitAppRegion: "no-drag" }}
      >
        <PlusIcon className="h-4 w-4" />
      </Button>
    </div>
  );
}
