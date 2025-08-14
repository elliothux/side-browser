# Side Browser

A modern side browser application built with Electron, React, and TypeScript. This application provides a browser-like experience with multiple tabs that can be switched between, similar to traditional web browsers.

## Features

- **Multiple Browser Instances**: Create and manage multiple web browser windows as tabs
- **Tab Management**: Switch between tabs, close tabs, and create new tabs
- **Modern UI**: Clean and intuitive interface with Tailwind CSS
- **Always-on-Top**: Browser windows stay on top of other applications
- **Responsive Design**: Adapts to different screen sizes

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Project Setup

### Install

```bash
$ npm install
```

### Development

```bash
$ npm run dev
```

### Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```

## Architecture

### Main Process

- **TabManager**: Manages multiple browser window instances
- **Window Management**: Handles base window and web window positioning
- **IPC Communication**: Provides APIs for renderer process

### Renderer Process

- **TabBar Component**: Displays and manages tab list
- **useTabs Hook**: React hook for tab state management
- **Modern UI**: Built with React and Tailwind CSS

### Key Components

- `src/main/tab-manager.ts`: Core tab management logic
- `src/main/database.ts`: Lowdb JSON database for tab persistence
- `src/main/window.ts`: Window creation and IPC handlers
- `src/renderer/src/components/tab-bar.tsx`: Tab bar UI component
- `src/renderer/src/lib/use-tabs.ts`: React hook for tab management

## Usage

1. **Create New Tab**: Click the "+" button in the tab bar
2. **Switch Tabs**: Click on any tab to switch to it
3. **Close Tab**: Click the "X" button on any tab
4. **Multiple Windows**: Each tab is a separate browser window instance

## Technical Details

- **Electron**: Desktop application framework
- **React**: UI library with TypeScript
- **Tailwind CSS**: Utility-first CSS framework
- **IPC**: Inter-process communication for tab management
- **BrowserWindow**: Electron's web content container
- **Lowdb**: Lightweight local JSON database for tab persistence
