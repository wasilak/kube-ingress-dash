# Design: Real-Time Ingress Updates

## Overview
Use Kubernetes watch/stream API to receive ingress events and update the dashboard in real time. Ensure frontend reflects changes instantly.

## Key Components
- Backend: Watch ingresses via Kubernetes API
- Frontend: Subscribe to updates (WebSocket/EventSource)
- State management for ingress list

## Flow
1. Backend watches ingress resources
2. On event, backend pushes update to frontend
3. Frontend updates UI immediately

## Considerations
- Handle add, update, delete events
- Error handling for stream interruptions
- Efficient state updates
