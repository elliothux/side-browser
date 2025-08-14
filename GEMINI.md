# Gemini Project Configuration

This document outlines the key decisions and principles for this project, as directed by the user.

## 1. Package Manager

- **Tool**: `bun` will be used for all package management operations (installing, running scripts, etc.).

## 2. Technology Stack

- **Framework**: Electron with Vite
- **Language**: TypeScript
- **UI Library**: React
- **Styling**: Tailwind CSS
- **Component Library**: shadcn/ui
- **Icons**: @heroicons/react
- **State Management / Data Fetching**: TanStack (React Query)
- **Routing**: TanStack (React Router)

## 3. Development Principles

- **KISS (Keep It Simple, Stupid)**: Prioritize simplicity and avoid unnecessary complexity.
- **MVP First**: Focus on delivering a Minimum Viable Product before adding extensive features.
- **No Over-abstraction**: Avoid premature or overly complex architectural patterns.
- **Maintainability**: Write code that is simple, direct, and easy to maintain.

## 4. Code Style

- use kebab-case style filenames
- don't use default export
- don't use barrel files for exporting
