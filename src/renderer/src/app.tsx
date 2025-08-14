import { TabBar } from "./components/tab-bar";
import { useTabs } from "./lib/use-tabs";

{
  /* <main className="flex h-screen flex-row items-stretch justify-between bg-neutral-200">
<div className="w-12"></div>
<div className="flex flex-1 flex-col items-stretch justify-between">
  <div className="h-12"></div>
  <div className="flex-1 rounded-lg border border-gray-300"></div>
</div>
</main> */
}

export function App() {
  const { tabs, isLoading, createTab, switchTab, closeTab } = useTabs();

  const handleTabSwitch = (id: string) => {
    switchTab(id);
  };

  const handleTabClose = (id: string) => {
    closeTab(id);
  };

  const handleTabCreate = () => {
    createTab();
  };

  if (isLoading) {
    return (
      <main className="flex h-screen flex-row items-stretch justify-between bg-neutral-200">
        <div className="w-12"></div>
        <div className="flex flex-1 flex-col items-stretch justify-between">
          <div className="flex h-12 items-center justify-center">
            <div className="text-sm text-gray-500">Loading...</div>
          </div>
          <div className="flex-1 rounded-lg border border-gray-300"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-screen flex-row items-stretch justify-between bg-neutral-200">
      {/* Sidebar */}
      <div className="w-12 border-r border-gray-200 bg-white"></div>

      {/* Main content */}
      <div className="flex flex-1 flex-col items-stretch justify-between">
        {/* Tab bar */}
        <TabBar
          tabs={tabs}
          onTabSwitch={handleTabSwitch}
          onTabClose={handleTabClose}
          onTabCreate={handleTabCreate}
        />

        {/* Content area */}
        <div className="m-2 flex-1 rounded-lg border border-gray-300 bg-white">
          {tabs.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mb-2 text-lg font-medium text-gray-900">
                  No tabs open
                </div>
                <div className="mb-4 text-sm text-gray-500">
                  Click the + button to create a new tab
                </div>
                <button
                  type="button"
                  onClick={handleTabCreate}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                >
                  Create New Tab
                </button>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="mb-2 text-lg font-medium">
                  {tabs.find((tab) => tab.isActive)?.title || "Loading..."}
                </div>
                <div className="text-sm">
                  {tabs.find((tab) => tab.isActive)?.url || ""}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
