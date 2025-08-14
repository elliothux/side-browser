import { Plus, X } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";

interface Tab {
  id: string;
  url: string;
  title: string;
  isActive: boolean;
}

interface TabBarProps {
  tabs: Tab[];
  onTabSwitch: (id: string) => void;
  onTabClose: (id: string) => void;
  onTabCreate: () => void;
}

export function TabBar({
  tabs,
  onTabSwitch,
  onTabClose,
  onTabCreate,
}: TabBarProps) {
  const handleTabClick = (id: string) => {
    onTabSwitch(id);
  };

  const handleTabClose = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onTabClose(id);
  };

  const handleNewTab = () => {
    onTabCreate();
  };

  const truncateTitle = (title: string, maxLength: number = 20) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + "...";
  };

  return (
    <div className="flex h-12 items-center gap-1 border-b border-gray-200 bg-white px-2">
      {/* Tab list */}
      <div className="flex flex-1 items-center gap-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`group flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-t-lg border border-transparent px-3 py-2 transition-all hover:bg-gray-50 ${
              tab.isActive
                ? "border-gray-300 bg-white shadow-sm"
                : "hover:border-gray-200"
            }`}
            onClick={() => handleTabClick(tab.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleTabClick(tab.id);
              }
            }}
          >
            {/* Tab title */}
            <span
              className={`min-w-0 flex-1 truncate text-sm font-medium ${
                tab.isActive ? "text-gray-900" : "text-gray-600"
              }`}
              title={tab.title}
            >
              {truncateTitle(tab.title)}
            </span>

            {/* Close button */}
            <button
              type="button"
              className={`opacity-0 transition-opacity group-hover:opacity-100 ${
                tab.isActive ? "opacity-100" : ""
              }`}
              onClick={(e) => handleTabClose(e, tab.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleTabClose(e as any, tab.id);
                }
              }}
              title="Close tab"
            >
              <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </button>
          </button>
        ))}
      </div>

      {/* New tab button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleNewTab}
        className="h-8 w-8 p-0 hover:bg-gray-100"
        title="New tab"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
