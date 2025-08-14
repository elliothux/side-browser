# Side Browser Demo

This document demonstrates the multi-tab browser functionality implemented in the Side Browser application.

## Features Demonstrated

### 1. Multiple Browser Instances

- Each tab represents a separate `BrowserWindow` instance
- Tabs can load different websites simultaneously
- Each tab maintains its own browsing session

### 2. Tab Management

- **Create New Tab**: Click the "+" button to create a new tab
- **Switch Between Tabs**: Click on any tab to activate it
- **Close Tabs**: Click the "X" button on any tab to close it
- **Tab State**: Each tab remembers its URL and title

### 3. Window Management

- **Always-on-Top**: All browser windows stay on top of other applications
- **Positioning**: Web windows are positioned relative to the base window
- **Responsive**: Windows adjust when the base window is moved or resized

## How It Works

### Main Process (Electron)

```typescript
// TabManager class manages multiple BrowserWindow instances
class TabManager {
  createTab(url: string): string; // Creates new browser window
  switchTab(id: string): void; // Shows/hides windows
  closeTab(id: string): void; // Destroys window
  getActiveTab(): Tab | null; // Returns current active tab
}
```

### Renderer Process (React)

```typescript
// useTabs hook manages tab state
const { tabs, createTab, switchTab, closeTab } = useTabs();

// TabBar component displays tab list
<TabBar
  tabs={tabs}
  onTabSwitch={switchTab}
  onTabClose={closeTab}
  onTabCreate={createTab}
/>
```

### IPC Communication

- **Main → Renderer**: Tab events (created, switched, closed, navigated)
- **Renderer → Main**: Tab actions (create, switch, close, navigate)

## Usage Examples

### Creating Multiple Tabs

1. Start the application
2. Click the "+" button to create new tabs
3. Each tab loads Google by default
4. You can navigate to different websites in each tab

### Switching Between Tabs

1. Click on any tab in the tab bar
2. The selected tab becomes active
3. Other tabs are hidden but remain loaded
4. Tab titles update automatically

### Closing Tabs

1. Hover over any tab to see the close button
2. Click the "X" to close the tab
3. If the active tab is closed, the last tab becomes active
4. If no tabs remain, a "Create New Tab" button appears

## Technical Implementation

### Window Structure

```
┌─────────────────────────────────────┐
│ Base Window (48px width)            │
│ ┌─────────────────────────────────┐ │
│ │ Tab Bar (48px height)          │ │
│ │ [Tab1] [Tab2] [Tab3] [+]       │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ Content Area                    │ │
│ │ (Shows active tab info)         │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Browser Windows

- Each tab creates a separate `BrowserWindow`
- Windows are positioned at `baseX + 48, baseY + 48`
- Windows are sized to `baseWidth - 48, baseHeight - 48`
- All windows are children of the base window

### State Management

- Tab state is managed in the main process
- UI state is synchronized via IPC events
- React components update automatically when tabs change

## Benefits

1. **True Multi-Instance**: Each tab is a real browser window
2. **Performance**: Tabs can run independently
3. **Isolation**: Crashes in one tab don't affect others
4. **Flexibility**: Easy to add features like tab-specific settings
5. **Scalability**: Can handle many tabs efficiently
