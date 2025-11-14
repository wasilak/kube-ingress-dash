# Design: Namespace Filter UI

## Overview
Add a namespace filter component next to the theme selector. Support "All" and multiselect. Update API and UI to filter ingresses by selected namespaces.

## Key Components
- NamespaceFilter component (UI)
- API: Accept namespace filter parameter
- State management for selected namespaces

## Flow
1. User selects namespaces in filter
2. App fetches and displays ingresses for selected namespaces
3. UI updates in real time

## Considerations
- Accessibility and usability
- Performance with many namespaces
- Default to "All" on load
